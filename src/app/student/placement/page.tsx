"use client";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button, ButtonLink, PageTitle, Panel, Pill, Progress } from "@/components/ui";
import { allObjectives, placementBank } from "@/lib/sample-data";
import { cn } from "@/lib/utils";

/*
 * Adaptive placement: start on the first 3 objectives; if the student does
 * well, move further along the learning path; stop at the first gap or after
 * 10 questions. Stretches follow the learning-path order.
 */
const STRETCHES = [["q1", "q3", "q5"], ["q7", "q8"], ["q9", "q10", "q11"]];
const MAX = 10;
const byQ = new Map(placementBank.map(q => [q.id, q]));
const byO = new Map(allObjectives.map(o => [o.id, o]));

type Result = { placedAt: string | null; known: string[]; asked: number };

export default function PlacementPage() {
  const [phase, setPhase] = useState<"ask" | "test" | "fresh" | "done">("ask");
  const [stretch, setStretch] = useState(0);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const asked = Object.keys(answers).length;
  const qid = STRETCHES[stretch]?.[index];
  const q = qid ? byQ.get(qid) : undefined;

  const next = () => {
    if (!q || picked === null) return;
    const all = { ...answers, [q.id]: picked === q.answer };
    setAnswers(all); setPicked(null);
    const ids = STRETCHES[stretch]!;
    if (index + 1 < ids.length && Object.keys(all).length < MAX) { setIndex(index + 1); return; }
    // End of a stretch: move on if mostly correct, otherwise place at the first gap.
    const right = ids.filter(id => all[id]).length;
    const known = Object.entries(all).filter(([, ok]) => ok).map(([id]) => byQ.get(id)!.objective);
    if (right / ids.length >= 0.66 && stretch + 1 < STRETCHES.length && Object.keys(all).length < MAX) { setStretch(stretch + 1); setIndex(0); return; }
    const gap = ids.find(id => !all[id]);
    setResult({ placedAt: gap ? byQ.get(gap)!.objective : null, known, asked: Object.keys(all).length });
    setPhase("done");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageTitle eyebrow="Placement test" title="CSEC Mathematics" intro="A few questions so you start in the right place. It's not graded." />

      {phase === "ask" && (
        <Panel className="text-center">
          <Sparkles className="mx-auto h-8 w-8 text-[hsl(38_85%_40%)]" />
          <h2 className="mt-3 text-xl font-extrabold">Have you studied CSEC Mathematics before?</h2>
          <div className="mt-5 flex justify-center gap-3"><Button size="lg" onClick={() => setPhase("test")}>Yes</Button><Button size="lg" variant="outline" onClick={() => setPhase("fresh")}>No</Button></div>
        </Panel>
      )}

      {phase === "fresh" && (
        <Panel className="text-center">
          <h2 className="text-xl font-extrabold">No problem, you’ll start at the beginning</h2>
          <p className="mt-2 text-muted-foreground">Your first lesson is “{byO.get("o1")!.title}”.</p>
          <ButtonLink href="/student/lesson" className="mt-5">Start learning <ArrowRight /></ButtonLink>
        </Panel>
      )}

      {phase === "test" && q && (
        <Panel>
          <div className="flex items-center justify-between text-sm"><span className="font-semibold">Question {asked + 1}</span><span className="text-muted-foreground">at most {MAX}</span></div>
          <Progress value={(asked / MAX) * 100} className="mt-2" tone="sun" />
          <p className="mt-2 text-xs text-muted-foreground">{byO.get(q.objective)!.title} · difficulty {q.difficulty} of 5</p>
          <h2 className="mt-5 text-2xl font-extrabold">{q.prompt}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {q.options.map((o, i) => (
              <button key={o} onClick={() => setPicked(i)} className={cn("rounded-2xl border-2 px-4 py-3 text-left font-semibold transition-colors", picked === i ? "border-accent bg-sky-soft" : "border-input bg-card hover:border-accent")}>{o}</button>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <button className="text-sm font-semibold text-muted-foreground hover:text-foreground" onClick={() => setPhase("fresh")}>Skip the test</button>
            <Button onClick={next} disabled={picked === null}>Next <ArrowRight /></Button>
          </div>
        </Panel>
      )}

      {phase === "done" && result && (
        <Panel tone="sun">
          <CheckCircle2 className="h-9 w-9 text-leaf" />
          <h2 className="mt-3 text-2xl font-extrabold">{result.placedAt ? `You’ll start at “${byO.get(result.placedAt)!.title}”` : "You know everything we tested!"}</h2>
          <p className="mt-2 text-muted-foreground">{result.asked} questions. {result.known.length} objectives marked as already known, so your path skips them.</p>
          {result.known.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{result.known.map(o => <Pill key={o} tone="good">{byO.get(o)!.title}</Pill>)}</div>}
          <div className="mt-6 flex gap-2"><ButtonLink href="/student/lesson">Start my first lesson <ArrowRight /></ButtonLink><Button variant="outline" onClick={() => { setPhase("ask"); setStretch(0); setIndex(0); setAnswers({}); setResult(null); }}>Try again</Button></div>
        </Panel>
      )}
    </div>
  );
}
