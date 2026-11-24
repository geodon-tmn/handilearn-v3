import { CheckCircle2, XCircle } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const metadata = { title: "Setup check" };

/** Setup check: shows whether each setting is present and working. Never shows values. */
export default async function StatusPage() {
  const has = (k: string) => Boolean(process.env[k]?.trim());
  const urlOk = /^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(supabaseUrl);
  let db: { ok: boolean; detail: string } = { ok: false, detail: "Not checked" };
  if (urlOk && supabaseAnonKey) {
    try {
      const res = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/territories?select=code&limit=1`, { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` }, cache: "no-store" });
      db = res.ok ? { ok: true, detail: "Connected; tables found" } : { ok: false, detail: `Supabase answered ${res.status}${res.status === 401 ? " (check the anon key)" : res.status === 404 ? " (tables missing)" : ""}` };
    } catch (e) { db = { ok: false, detail: e instanceof Error ? e.message : "Could not reach Supabase" }; }
  }
  const rows: [string, boolean, string][] = [
    ["NEXT_PUBLIC_SUPABASE_URL", urlOk, supabaseUrl ? (urlOk ? "Looks right" : "Should look like https://xxxx.supabase.co (nothing after .co)") : "Missing"],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", Boolean(supabaseAnonKey), supabaseAnonKey ? "Present" : "Missing"],
    ["SUPABASE_SERVICE_ROLE_KEY", has("SUPABASE_SERVICE_ROLE_KEY"), has("SUPABASE_SERVICE_ROLE_KEY") ? "Present" : "Missing"],
    ["BOOTSTRAP_ADMIN_EMAIL", has("BOOTSTRAP_ADMIN_EMAIL"), has("BOOTSTRAP_ADMIN_EMAIL") ? "Present" : "Missing (needed for the first administrator)"],
    ["Database", db.ok, db.detail],
  ];
  return (
    <AuthShell title="Setup check" intro="Which settings this deployment can see. Values are never shown.">
      <ul className="space-y-3 text-sm">
        {rows.map(([name, ok, detail]) => (
          <li key={name} className="flex items-start gap-3">
            {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leaf" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-coral" />}
            <div><p className="font-mono text-xs font-semibold">{name}</p><p className="text-muted-foreground">{detail}</p></div>
          </li>
        ))}
      </ul>
    </AuthShell>
  );
}
