import { Coins, Repeat, Sparkles } from "lucide-react";
import { PageTitle, Pill, Stat, Table } from "@/components/ui";
import { audit } from "@/lib/sample-data";

export default function AuditPage() {
  const claude = audit.filter(a => a.ai?.provider === "Claude").reduce((n, a) => n + a.ai!.cost, 0);
  const openai = audit.filter(a => a.ai?.provider === "OpenAI").reduce((n, a) => n + a.ai!.cost, 0);
  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Audit and usage" title="Who did what, and what AI cost" intro="Every admin action and AI call is recorded and kept for 2 years." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<Sparkles />} label="Claude this week" value={`$${claude.toFixed(2)}`} hint="Syllabi, paths, questions, lessons, tutor" />
        <Stat icon={<Coins />} label="OpenAI this week" value={`$${openai.toFixed(2)}`} hint="Illustrations and voice" />
        <Stat icon={<Repeat />} label="Lessons reused" value="37%" hint="Served from stored content, no AI cost" />
      </div>
      <Table head={["When", "Who", "Action", "On", "AI"]} rows={audit.map(a => [
        <span key="w" className="whitespace-nowrap">{a.when}</span>, a.who, a.action, a.target,
        a.ai ? <Pill key="a" tone={a.ai.provider === "Claude" ? "info" : "sun"}>{a.ai.provider} · ${a.ai.cost.toFixed(2)}</Pill> : <span key="a" className="text-muted-foreground">—</span>,
      ])} />
    </div>
  );
}
