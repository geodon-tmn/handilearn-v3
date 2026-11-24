import Link from "next/link";
import { ArrowRight, Flame, MessageCircle, Play } from "lucide-react";
import { ButtonLink, PageTitle, Panel, Pill, Progress } from "@/components/ui";
import { allObjectives, jadenPath, student } from "@/lib/sample-data";

export default function StudentHome() {
  const byId = new Map(allObjectives.map(o => [o.id, o]));
  const current = byId.get(jadenPath.find(s => s.status === "current")!.objective)!;
  const done = jadenPath.filter(s => s.status === "done").length;
  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Home" title={`Welcome back, ${student.name}`} actions={<Pill tone="sun"><Flame className="h-3 w-3" /> {student.streak}-day streak</Pill>} />
      <Panel tone="sun" className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Continue · CSEC Mathematics</p>
          <h2 className="mt-1 text-2xl font-extrabold">{current.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Lesson: {current.lesson} · about 15 minutes</p>
        </div>
        <ButtonLink href="/student/lesson" size="lg"><Play /> Start lesson</ButtonLink>
      </Panel>
      <div className="grid gap-5 md:grid-cols-2">
        <Panel>
          <div className="flex items-center justify-between"><h2 className="font-extrabold">CSEC Mathematics</h2><span className="text-sm text-muted-foreground">{done} of {jadenPath.length} done</span></div>
          <Progress value={(done / jadenPath.length) * 100} className="mt-3" />
          <ol className="mt-4 space-y-2 text-sm">
            {jadenPath.slice(0, 6).map(s => <li key={s.objective} className={s.status === "done" ? "text-muted-foreground line-through" : s.status === "current" ? "font-bold text-accent" : ""}>{byId.get(s.objective)!.title}</li>)}
          </ol>
        </Panel>
        <Panel>
          <h2 className="font-extrabold">CSEC English A</h2>
          <p className="mt-2 text-sm text-muted-foreground">You said you’ve studied this before. A short test finds where you should start.</p>
          <ButtonLink href="/student/placement" variant="outline" className="mt-4">Take the placement test <ArrowRight /></ButtonLink>
          <Link href="/student/tutor" className="mt-6 flex items-center gap-3 rounded-2xl bg-sky-soft p-4 text-sm font-semibold"><MessageCircle className="h-5 w-5 text-accent" /> Stuck? Ask your tutor</Link>
        </Panel>
      </div>
    </div>
  );
}
