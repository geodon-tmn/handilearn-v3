import { Lock } from "lucide-react";
import { Notice, PageTitle, Pill, Progress, Stat, Table } from "@/components/ui";
import { classRows } from "@/lib/sample-data";

export default function TeacherPage() {
  const visible = classRows.filter(r => r.sharing);
  const stuck = visible.filter(r => r.stuckOn);
  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Class progress" title="Form 4 · CSEC Mathematics" intro="St. Winifred's School · Mr. D. Clarke" />
      <Notice tone="info" title={`You can see ${visible.length} of ${classRows.length} students`}>A student appears here only when their family has allowed your school to see their progress.</Notice>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Average mastery" value={`${Math.round(visible.reduce((n, r) => n + r.mastery, 0) / visible.length)}%`} />
        <Stat label="Stuck right now" value={stuck.length} hint={stuck.map(s => s.stuckOn).join(" · ")} />
        <Stat label="Active this week" value={visible.filter(r => r.lastActive !== "5 days ago").length} />
      </div>
      <Table head={["Student", "Mastery", "Last active", "Stuck on"]} rows={classRows.map(r => r.sharing ? [
        <span key="n" className="font-semibold">{r.student}</span>,
        <div key="m" className="flex min-w-40 items-center gap-3"><Progress value={r.mastery} tone={r.mastery > 60 ? "leaf" : "accent"} /><span className="w-10 text-right">{r.mastery}%</span></div>,
        r.lastActive, r.stuckOn ? <Pill key="s" tone="warn">{r.stuckOn}</Pill> : <span key="s" className="text-muted-foreground">—</span>,
      ] : [
        <span key="n" className="font-semibold text-muted-foreground">{r.student}</span>,
        <span key="m" className="flex items-center gap-2 text-muted-foreground"><Lock className="h-4 w-4" /> Family hasn’t allowed access</span>, "", "",
      ])} />
    </div>
  );
}
