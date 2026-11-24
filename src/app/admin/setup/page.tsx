import { territories as sample } from "@/lib/sample-data";
import { supabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { SetupClient, type TerritoryRow } from "./setup-client";

export const metadata = { title: "Territories and schools" };

export default async function SetupPage() {
  if (!supabaseConfigured) return <SetupClient live={false} territories={sample} />;
  const supabase = await createClient();
  const [{ data: territories }, { data: schools }] = await Promise.all([
    supabase.from("territories").select("code, name, currency, status").order("status", { ascending: false }).order("name"),
    supabase.from("schools").select("territory_code"),
  ]);
  const rows: TerritoryRow[] = (territories ?? []).map(t => ({ ...t, status: t.status as TerritoryRow["status"], schools: (schools ?? []).filter(s => s.territory_code === t.code).length }));
  return <SetupClient live territories={rows} />;
}
