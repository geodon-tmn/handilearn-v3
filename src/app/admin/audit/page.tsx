import { Coins, Repeat, Sparkles } from "lucide-react";
import { PageTitle, Pill, Stat, Table } from "@/components/ui";
import { audit as sample } from "@/lib/sample-data";
import { supabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Audit and usage" };
type Row = { id: number; action: string; target: string; created_at: string; ai_provider: string | null; ai_cost_usd: number | null; actor: { full_name: string; email: string | null } | null };

export default async function AuditPage() {
  if (!supabaseConfigured) return <SampleAudit />;
  const supabase = await createClient();
  const { data } = await supabase.from("audit_log").select("id, action, target, created_at, ai_provider, ai_cost_usd, actor:profiles(full_name, email)").order("created_at", { ascending: false }).limit(200).returns<Row[]>();
  const rows = data ?? [];
  const weekAgo = Date.now() - 7 * 864e5;
  const spend = (p: string) => rows.filter(r => r.ai_provider === p && Date.parse(r.created_at) > weekAgo).reduce((n, r) => n + Number(r.ai_cost_usd ?? 0), 0);
  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Audit and usage" title="Who did what, and what AI cost" intro="Every admin action is recorded here. AI costs appear once syllabus processing and the tutor are connected." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<Sparkles />} label="Claude this week" value={`$${spend("claude").toFixed(2)}`} />
        <Stat icon={<Coins />} label="OpenAI this week" value={`$${spend("openai").toFixed(2)}`} />
        <Stat icon={<Repeat />} label="Actions recorded" value={rows.length} hint="Latest 200 shown" />
      </div>
      <Table head={["When", "Who", "Action", "On", "AI"]} rows={rows.map(r => [
        <span key="w" className="whitespace-nowrap">{new Date(r.created_at).toLocaleString("en-BB", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Barbados" })}</span>,
        r.actor?.full_name || r.actor?.email || "System", r.action, r.target,
        r.ai_provider ? <Pill key="a" tone="info">{r.ai_provider} · ${Number(r.ai_cost_usd ?? 0).toFixed(2)}</Pill> : <span key="a" className="text-muted-foreground">—</span>,
      ])} />
      {rows.length === 0 && <p className="text-sm text-muted-foreground">Nothing recorded yet.</p>}
    </div>
  );
}

function SampleAudit() {
  return (
    <div className="space-y-6">
      <PageTitle preview eyebrow="Audit and usage" title="Who did what, and what AI cost" />
      <Table head={["When", "Who", "Action", "On"]} rows={sample.map(a => [a.when, a.who, a.action, a.target])} />
    </div>
  );
}
