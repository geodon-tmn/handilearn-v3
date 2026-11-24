import Link from "next/link";
import { ArrowRight, BookOpen, Coins, Globe2, GraduationCap, Loader2, School, Upload } from "lucide-react";
import { ButtonLink, PageTitle, Panel, Pill, Progress, Stat } from "@/components/ui";
import { audit, curricula, schools, territories } from "@/lib/sample-data";

export default function AdminDashboard() {
  const live = curricula.filter(c => c.status === "Live").length;
  const students = curricula.reduce((n, c) => n + c.students, 0);
  const spend = audit.reduce((n, a) => n + (a.ai?.cost ?? 0), 0);
  return (
    <div className="space-y-8">
      <PageTitle preview eyebrow="Dashboard" title="Good evening" intro="Everything across HandiLearn at a glance."
        actions={<ButtonLink href="/admin/review"><Upload /> Upload a syllabus</ButtonLink>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Globe2 />} label="Territories live" value={`${territories.filter(t => t.status === "live").length} of ${territories.length}`} hint="Barbados live; 3 planned" />
        <Stat icon={<School />} label="Schools" value={schools.length} hint={`${schools.filter(s => s.status === "Subscribed").length} subscribed`} />
        <Stat icon={<BookOpen />} label="Curricula live" value={`${live} of ${curricula.length}`} />
        <Stat icon={<GraduationCap />} label="Students learning" value={students} hint={`AI spend this week: $${spend.toFixed(2)}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <h2 className="text-lg font-extrabold">Needs your attention</h2>
          <ul className="mt-4 space-y-3">
            <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
              <div><p className="font-semibold">CSEC Mathematics is ready to review</p><p className="text-sm text-muted-foreground">24 objectives found · 2 to check</p></div>
              <ButtonLink href="/admin/review" size="sm" variant="ink">Review <ArrowRight /></ButtonLink>
            </li>
            <li className="rounded-2xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3"><p className="flex items-center gap-2 font-semibold"><Loader2 className="h-4 w-4 animate-spin text-accent" /> CSEC English A is processing</p><Pill tone="info">62%</Pill></div>
              <Progress value={62} className="mt-3" />
              <p className="mt-2 text-xs text-muted-foreground">Breaking down section 5 of 8 · about 2 minutes left</p>
            </li>
            <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
              <div><p className="font-semibold">The St. Michael School was claimed</p><p className="text-sm text-muted-foreground">Mrs. P. Alleyne · 9 of 21 families have granted access</p></div>
              <ButtonLink href="/admin/setup" size="sm" variant="outline">View</ButtonLink>
            </li>
          </ul>
        </Panel>
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">Recent activity</h2><Link href="/admin/audit" className="text-sm font-semibold text-accent">All</Link></div>
          <ul className="mt-4 space-y-3 text-sm">
            {audit.slice(0, 5).map((a, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <div><p><span className="font-semibold">{a.who}</span> · {a.action.toLowerCase()}</p><p className="text-xs text-muted-foreground">{a.target} · {a.when}</p></div>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-sun-soft p-3 text-sm"><Coins className="h-4 w-4" /> 1 lesson in 3 now comes from stored content</div>
        </Panel>
      </div>
    </div>
  );
}
