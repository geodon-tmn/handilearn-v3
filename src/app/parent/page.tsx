"use client";
import Link from "next/link";
import { useState } from "react";
import { BookOpen, Plus, School, ShieldCheck } from "lucide-react";
import { Button, ButtonLink, Field, Notice, PageTitle, Panel, Pill, Progress, inputClass } from "@/components/ui";
import { children as seed, curricula, schools } from "@/lib/sample-data";

export default function ParentHome() {
  const [kids, setKids] = useState(seed);
  const [enrolFor, setEnrolFor] = useState<string | null>(null);
  const [before, setBefore] = useState<"yes" | "no" | null>(null);
  const [adding, setAdding] = useState(false);
  const [newChild, setNewChild] = useState({ name: "", grade: "", school: schools[0]!.name, consent: false });
  const live = curricula.filter(c => c.status === "Live" || c.status === "In review");

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="My children" title="Hello, Keisha" intro="Enrol your children in subjects and follow their progress."
        actions={<Button variant="outline" onClick={() => setAdding(true)}><Plus /> Add a child</Button>} />

      {kids.some(k => k.sharing === "Asked") && (
        <Notice tone="locked" title="The St. Michael School is asking to see Jaden's progress">
          Mrs. P. Alleyne's school has signed up. You decide. <Link href="/settings/data-sharing" className="font-semibold text-accent">Review the request</Link>
        </Notice>
      )}

      {adding && (
        <Panel tone="sky">
          <h2 className="font-extrabold">Add a child</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="First and last name"><input className={inputClass} value={newChild.name} onChange={e => setNewChild({ ...newChild, name: e.target.value })} /></Field>
            <Field label="Class or form"><input className={inputClass} value={newChild.grade} onChange={e => setNewChild({ ...newChild, grade: e.target.value })} placeholder="e.g. Class 3" /></Field>
            <Field label="School"><select className={inputClass} value={newChild.school} onChange={e => setNewChild({ ...newChild, school: e.target.value })}>{schools.map(s => <option key={s.name}>{s.name}</option>)}</select></Field>
          </div>
          <label className="mt-4 flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 h-4 w-4" checked={newChild.consent} onChange={e => setNewChild({ ...newChild, consent: e.target.checked })} /><span>I am this child's parent or guardian and I agree to HandiLearn storing their name, class, date of birth and learning records to teach them. <span className="text-muted-foreground">Their school will not see anything unless I allow it.</span></span></label>
          <div className="mt-4 flex gap-2">
            <Button disabled={!newChild.name || !newChild.consent} onClick={() => { setKids([...kids, { id: `c${kids.length + 1}`, name: newChild.name, age: 9, grade: newChild.grade || "—", school: newChild.school, schoolStatus: "Listed", sharing: "Not asked", subjects: [] }]); setAdding(false); }}>Add child</Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </Panel>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {kids.map(k => (
          <Panel key={k.id}>
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="text-xl font-extrabold">{k.name}</h2><p className="text-sm text-muted-foreground">{k.grade} · {k.school}</p></div>
              <Pill tone={k.sharing === "Granted" ? "good" : k.sharing === "Asked" ? "warn" : "neutral"}><School className="h-3 w-3" />{k.sharing === "Granted" ? "School can see" : k.sharing === "Asked" ? "School asking" : "Private"}</Pill>
            </div>
            <ul className="mt-5 space-y-4">
              {k.subjects.map(s => (
                <li key={s.name}>
                  <div className="flex items-center justify-between text-sm"><span className="font-semibold">{s.owner} {s.name}</span><span className="text-muted-foreground">{s.mastery}% mastered</span></div>
                  <Progress value={s.mastery} className="mt-1.5" tone={s.mastery > 60 ? "leaf" : "accent"} />
                  <p className="mt-1 text-xs text-muted-foreground">Next: {s.next}</p>
                </li>
              ))}
              {k.subjects.length === 0 && <li className="text-sm text-muted-foreground">Not enrolled in any subjects yet.</li>}
            </ul>
            {enrolFor === k.id ? (
              <div className="mt-5 space-y-3 rounded-2xl border bg-sky-soft/50 p-4">
                <Field label="Subject"><select className={inputClass}>{live.map(c => <option key={c.id}>{c.owner} · {c.subject}</option>)}</select></Field>
                <p className="text-sm font-semibold">Has {k.name.split(" ")[0]} studied this subject before?</p>
                <div className="flex gap-2">
                  <Button size="sm" variant={before === "yes" ? "ink" : "outline"} onClick={() => setBefore("yes")}>Yes</Button>
                  <Button size="sm" variant={before === "no" ? "ink" : "outline"} onClick={() => setBefore("no")}>No</Button>
                </div>
                {before === "yes" && <p className="text-sm text-muted-foreground">They’ll take a short placement test (10 questions at most) so they start in the right place.</p>}
                {before === "no" && <p className="text-sm text-muted-foreground">They’ll start at the beginning of the syllabus.</p>}
                <div className="flex gap-2">
                  {before === "yes" ? <ButtonLink href="/student/placement" size="sm">Enrol and start the test</ButtonLink> : <Button size="sm" disabled={!before} onClick={() => { setEnrolFor(null); setBefore(null); }}>Enrol</Button>}
                  <Button size="sm" variant="ghost" onClick={() => { setEnrolFor(null); setBefore(null); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setEnrolFor(k.id)}><BookOpen /> Enrol in a subject</Button>
                <ButtonLink href="/parent/progress" size="sm" variant="ghost">See progress</ButtonLink>
              </div>
            )}
          </Panel>
        ))}
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Subscriptions are coming soon. Every family gets unlimited use of up to 3 subjects in the entry package.</p>
    </div>
  );
}
