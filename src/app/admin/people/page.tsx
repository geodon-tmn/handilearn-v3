import { ShieldCheck } from "lucide-react";
import { PageTitle, Pill, Table } from "@/components/ui";
import { ROLE_LABEL, type Profile, type Role } from "@/lib/auth";
import { people as sample } from "@/lib/sample-data";
import { supabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { RoleSelect } from "./role-select";

export const metadata = { title: "People" };

export default async function PeoplePage() {
  if (!supabaseConfigured) return <SamplePeople />;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profiles } = await supabase.from("profiles").select("id, email, full_name, role, school_id, territory_code, created_at").order("created_at").returns<(Profile & { created_at: string })[]>();
  // Two-factor status lives in Supabase Auth, readable only with the service key.
  const twoFactor = new Map<string, boolean>();
  try {
    const { data } = await createAdminClient().auth.admin.listUsers({ perPage: 1000 });
    for (const u of data.users) twoFactor.set(u.id, (u.factors ?? []).some(f => f.status === "verified"));
  } catch { /* Without the service key the column shows as unknown. */ }
  const rows = profiles ?? [];
  return (
    <div className="space-y-6">
      <PageTitle eyebrow="People" title="People and roles" intro="Everyone who has signed up. New accounts start as Parent; change the role here. Administrators must use two-factor sign-in, and no one can change their own role." />
      <Table head={["Name", "Email", "Role", "Two-factor", "Joined"]} rows={rows.map(p => [
        <span key="n" className="font-semibold">{p.full_name || "—"}{p.id === user?.id && <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>}</span>,
        p.email,
        p.id === user?.id ? <Pill key="r" tone="info">{ROLE_LABEL[p.role]}</Pill> : <RoleSelect key="r" id={p.id} role={p.role} />,
        !twoFactor.has(p.id) ? <span key="t" className="text-muted-foreground">Unknown</span>
          : twoFactor.get(p.id) ? <span key="t" className="flex items-center gap-1 text-leaf"><ShieldCheck className="h-4 w-4" /> On</span>
          : <span key="t" className={["global_admin", "school_admin"].includes(p.role) ? "font-semibold text-coral" : "text-muted-foreground"}>{["global_admin", "school_admin"].includes(p.role) ? "Required, not set up" : "Off"}</span>,
        new Date(p.created_at).toLocaleDateString("en-BB", { day: "numeric", month: "short", year: "numeric" }),
      ])} />
      {rows.length <= 1 && <p className="text-sm text-muted-foreground">Only you so far. When others sign up at /signup they appear here.</p>}
    </div>
  );
}

function SamplePeople() {
  return (
    <div className="space-y-6">
      <PageTitle preview eyebrow="People" title="People and roles" />
      <Table head={["Name", "Email", "Role", "Can see"]} rows={sample.map(p => [p.name, p.email, p.role, p.scope])} />
    </div>
  );
}

export type { Role };
