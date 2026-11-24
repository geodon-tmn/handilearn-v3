"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/auth";

export type ActionResult = { ok: true } | { ok: false, error: string };
const fail = (error: string): ActionResult => ({ ok: false, error });

function friendly(message: string) {
  if (message.includes("duplicate key")) return "That already exists.";
  if (message.includes("violates foreign key") || message.includes("restrict")) return "It's still in use by schools or education systems, so it can't be deleted.";
  if (message.includes("row-level security") || message.includes("permission")) return "You don't have permission to do that. Make sure you signed in with your two-factor code.";
  return message;
}

/* Territories ------------------------------------------------------------ */

export async function addTerritory(input: { code: string; name: string; currency: string }): Promise<ActionResult> {
  const code = input.code.trim().toUpperCase(), name = input.name.trim(), currency = input.currency.trim().toUpperCase() || "XCD";
  if (!/^[A-Z]{2,3}$/.test(code)) return fail("Use a 2 or 3 letter code, e.g. GD.");
  if (!name) return fail("Enter the territory's name.");
  if (!/^[A-Z]{3}$/.test(currency)) return fail("Use a 3 letter currency code, e.g. XCD.");
  const supabase = await createClient();
  const { error } = await supabase.from("territories").insert({ code, name, currency });
  if (error) return fail(friendly(error.message));
  await supabase.rpc("log_action", { p_action: "Added territory", p_target: name, p_details: { code, currency } });
  revalidatePath("/admin/setup");
  return { ok: true };
}

export async function setTerritoryStatus(code: string, status: "planned" | "live"): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("territories").update({ status }).eq("code", code).select("name").single();
  if (error) return fail(friendly(error.message));
  await supabase.rpc("log_action", { p_action: status === "live" ? "Opened territory" : "Set territory to planned", p_target: data.name });
  revalidatePath("/admin/setup");
  return { ok: true };
}

export async function deleteTerritory(code: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("territories").delete().eq("code", code).select("name");
  if (error) return fail(friendly(error.message));
  if (!data?.length) return fail("Nothing was deleted.");
  await supabase.rpc("log_action", { p_action: "Deleted territory", p_target: data[0]!.name });
  revalidatePath("/admin/setup");
  return { ok: true };
}

/* People ----------------------------------------------------------------- */

const ROLES: Role[] = ["global_admin", "school_admin", "teacher", "parent", "student"];
export async function changeRole(id: string, role: Role): Promise<ActionResult> {
  if (!ROLES.includes(role)) return fail("Unknown role.");
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").update({ role }).eq("id", id).select("email, full_name").single();
  if (error) return fail(error.message.includes("own role") ? "You can't change your own role." : friendly(error.message));
  await supabase.rpc("log_action", { p_action: "Changed role", p_target: data.full_name || data.email || id, p_details: { role } });
  revalidatePath("/admin/people");
  return { ok: true };
}
