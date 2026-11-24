import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { PageTitle, Panel, Pill, Progress, Stat } from "@/components/ui";
import { allObjectives, jadenPath, student } from "@/lib/sample-data";

const mastery: Record<string, number> = { o1: 92, o2: 85, o3: 78, o7: 46, o8: 0, o4: 0, o10: 0, o11: 0, o12: 0 };

export default function ProgressPage() {
  const byId = new Map(allObjectives.map(o => [o.id, o]));
  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Progress" title="Jaden · CSEC Mathematics" intro="Placed after an 8-question test. Objectives he already knew were marked done." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Mastered" value="3 objectives" hint="of 9 on his path so far" />
        <Stat label="This week" value={`${student.minutesThisWeek} min`} hint={`${student.streak}-day streak`} />
        <Stat label="Needs help with" value="Profit %" hint="Asked the tutor twice" />
      </div>
      <Panel>
        <h2 className="font-extrabold">His path</h2>
        <ol className="mt-4 space-y-3">
          {jadenPath.map(s => {
            const o = byId.get(s.objective)!, m = mastery[s.objective] ?? 0;
            return (
              <li key={s.objective} className="flex items-center gap-3">
                {s.status === "done" ? <CheckCircle2 className="h-5 w-5 shrink-0 text-leaf" /> : s.status === "current" ? <CircleDot className="h-5 w-5 shrink-0 text-accent" /> : <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="font-semibold">{o.code} {o.title}</span>{s.status === "current" ? <Pill tone="info">Learning now</Pill> : s.status === "done" ? <span className="text-muted-foreground">{m}%</span> : null}</div>
                  {s.status !== "later" && s.status !== "next" && <Progress value={m} className="mt-1.5" tone={m > 70 ? "leaf" : "accent"} />}
                </div>
              </li>
            );
          })}
        </ol>
      </Panel>
    </div>
  );
}
