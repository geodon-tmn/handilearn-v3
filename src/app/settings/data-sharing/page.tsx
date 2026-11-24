"use client";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button, Notice, PageTitle, Panel, Pill } from "@/components/ui";
import { children } from "@/lib/sample-data";

export default function DataSharingPage() {
  const [state, setState] = useState<Record<string, string>>(Object.fromEntries(children.map(c => [c.id, c.sharing])));
  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Settings" title="Data sharing" intro="You decide whether your child's school can see their progress. You can change this at any time." />
      <Notice tone="info" title="How school access works">A school sees a student's progress only when the school has subscribed and you have said yes. Withdrawing stops access straight away.</Notice>
      {children.map(c => {
        const s = state[c.id];
        return (
          <Panel key={c.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="text-lg font-extrabold">{c.name}</h2><p className="text-sm text-muted-foreground">{c.school}</p></div>
              <Pill tone={s === "Granted" ? "good" : s === "Asked" ? "warn" : "neutral"}>{s === "Granted" ? "School can see progress" : s === "Asked" ? "School is asking" : s === "Withdrawn" ? "Withdrawn" : "Private"}</Pill>
            </div>
            {c.schoolStatus === "Listed" && <p className="mt-3 text-sm text-muted-foreground">This school hasn't joined HandiLearn yet, so there's nothing to decide. We'll ask you if it does.</p>}
            {c.schoolStatus !== "Listed" && (
              <div className="mt-4 rounded-2xl border bg-sky-soft/40 p-4 text-sm">
                <p><span className="font-semibold">If you say yes,</span> {c.school}'s teachers and principal can see {c.name.split(" ")[0]}'s subjects, mastery and where they're stuck. They can't see tutor conversations.</p>
                <div className="mt-3 flex gap-2">
                  {s !== "Granted" ? <Button size="sm" onClick={() => setState({ ...state, [c.id]: "Granted" })}><ShieldCheck /> Allow</Button> : <Button size="sm" variant="outline" onClick={() => setState({ ...state, [c.id]: "Withdrawn" })}>Withdraw access</Button>}
                  {s === "Asked" && <Button size="sm" variant="ghost" onClick={() => setState({ ...state, [c.id]: "Withdrawn" })}>Not now</Button>}
                </div>
              </div>
            )}
          </Panel>
        );
      })}
      <p className="text-xs text-muted-foreground">Students aged 18 and over, or as the privacy law of their territory allows, manage this themselves.</p>
    </div>
  );
}
