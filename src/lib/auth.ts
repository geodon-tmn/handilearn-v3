import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";

export type Role = "global_admin" | "school_admin" | "teacher" | "parent" | "student";
export const ROLE_LABEL: Record<Role, string> = {
  global_admin: "Global Administrator", school_admin: "School Administrator", teacher: "Teacher", parent: "Parent", student: "Student",
};
export type Profile = { id: string; email: string | null; full_name: string; role: Role; school_id: string | null; territory_code: string | null };

/** The signed-in person, their profile and two-factor state, or null. */
export async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("id, email, full_name, role, school_id, territory_code").eq("id", user.id).single<Profile>();
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return { supabase, user, profile, aal: aal?.currentLevel ?? "aal1", mfaEnrolled: aal?.nextLevel === "aal2" };
}

/** The first Global Administrator is whoever signs in with BOOTSTRAP_ADMIN_EMAIL
 *  while no Global Administrator exists yet. Returns true if it promoted them. */
export async function ensureBootstrapAdmin(email: string | undefined, id: string) {
  const wanted = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  if (!wanted || !email || email.toLowerCase() !== wanted) return false;
  let admin;
  try { admin = createAdminClient(); } catch (e) { console.error("bootstrap:", e instanceof Error ? e.message : e); return false; }
  const { count } = await admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "global_admin");
  if (count) return false;
  const { error } = await admin.from("profiles").update({ role: "global_admin" }).eq("id", id);
  if (error) return false;
  await admin.from("audit_log").insert({ actor_id: id, action: "Became the first Global Administrator", target: email });
  return true;
}

/** Gate for the admin area: signed in, Global Administrator, two-factor verified. */
export async function requireGlobalAdmin(next = "/admin") {
  const s = await getSession();
  if (!s) redirect(`/login?next=${encodeURIComponent(next)}`);
  let role = s.profile?.role;
  if (role !== "global_admin" && await ensureBootstrapAdmin(s.user.email, s.user.id)) role = "global_admin";
  if (role !== "global_admin") redirect("/account?denied=admin");
  if (!s.mfaEnrolled) redirect(`/account/security?required=1&next=${encodeURIComponent(next)}`);
  if (s.aal !== "aal2") redirect(`/account/verify?next=${encodeURIComponent(next)}`);
  return { ...s, profile: { ...s.profile!, role } };
}
