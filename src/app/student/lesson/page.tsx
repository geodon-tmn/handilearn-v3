"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, MessageCircle, Repeat, XCircle } from "lucide-react";
import { Button, ButtonLink, Panel, Pill } from "@/components/ui";
import { lessonContent as L } from "@/lib/sample-data";
import { cn } from "@/lib/utils";

export default function LessonPage() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const correct = picked === L.practice.answer;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="hl-rise">
        <Link href="/student" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Home</Link>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{L.lesson}</h1>
        <div className="mt-2 flex flex-wrap gap-2"><Pill tone="info">CSEC Mathematics · 3.1</Pill><Pill tone="neutral"><Repeat className="h-3 w-3" /> Stored lesson · used by {L.reused} students like you</Pill></div>
      </div>

      <ol className="flex gap-1.5" aria-label="Lesson steps">
        {L.flow.map((f, i) => (
          <li key={f} className="flex-1">
            <button onClick={() => setStep(i)} className="w-full text-left">
              <span className={cn("block h-2 rounded-full", i < step ? "bg-leaf" : i === step ? "bg-primary" : "bg-muted")} />
              <span className={cn("mt-1.5 hidden text-xs font-semibold sm:block", i === step ? "text-foreground" : "text-muted-foreground")}>{f}</span>
            </button>
          </li>
        ))}
      </ol>

      <Panel className="min-h-72">
        <p className="hl-eyebrow">{L.flow[step]}</p>
        {step === 0 && <p className="mt-4 text-lg">{L.recall}</p>}
        {step === 1 && <div className="mt-4 space-y-4 text-lg">{L.teach.map(t => <p key={t}>{t}</p>)}</div>}
        {step === 2 && (
          <div className="mt-4">
            <p className="text-lg font-semibold">{L.example.problem}</p>
            <ol className="mt-4 space-y-2">{L.example.steps.map((s, i) => <li key={s} className="flex gap-3 rounded-2xl bg-sky-soft p-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">{i + 1}</span>{s}</li>)}</ol>
          </div>
        )}
        {step === 3 && (
          <div className="mt-4">
            <p className="text-lg font-semibold">{L.practice.problem}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              {L.practice.options.map((o, i) => (
                <button key={o} onClick={() => setPicked(i)} className={cn("rounded-2xl border-2 px-4 py-3 font-semibold", picked === i ? (correct ? "border-leaf bg-leaf-soft" : "border-coral bg-coral-soft") : "border-input hover:border-accent")}>{o}</button>
              ))}
            </div>
            {picked !== null && (correct
              ? <p className="mt-4 flex items-center gap-2 font-semibold text-leaf"><CheckCircle2 className="h-5 w-5" /> Yes! $1.50 ÷ $3.00 = 0.5 = 50%.</p>
              : <p className="mt-4 flex items-center gap-2 font-semibold text-coral"><XCircle className="h-5 w-5" /> Not quite. Try again or take a hint.</p>)}
            <button onClick={() => setHint(true)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent"><Lightbulb className="h-4 w-4" /> Hint</button>
            {hint && <p className="mt-2 rounded-2xl bg-sun-soft p-3 text-sm">{L.practice.hint}</p>}
          </div>
        )}
        {step === 4 && (
          <div className="mt-4 space-y-3">
            <p className="text-lg">Three quick questions decide if you’ve mastered this. In the full version they adapt to your answers.</p>
            <div className="rounded-2xl border p-4"><p className="font-semibold">A $40 shirt is sold for $30. What is the percentage loss?</p><p className="mt-1 text-sm text-muted-foreground">Mastery check question 1 of 3</p></div>
          </div>
        )}
        {step === 5 && (
          <div className="mt-4">
            <p className="text-lg font-semibold">How confident do you feel about profit, loss and discount?</p>
            <div className="mt-4 flex flex-wrap gap-2">{["Not yet", "Getting there", "Confident"].map(r => <Button key={r} variant={reflection === r ? "ink" : "outline"} onClick={() => setReflection(r)}>{r}</Button>)}</div>
            {reflection && <p className="mt-4 text-sm text-muted-foreground">Thanks! {reflection === "Confident" ? "Next up: simple and compound interest." : "We’ll bring this back for a quick review tomorrow."}</p>}
          </div>
        )}
      </Panel>

      <div className="flex items-center justify-between">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft /> Back</Button>
        <ButtonLink href="/student/tutor" variant="outline" size="sm"><MessageCircle /> Ask the tutor</ButtonLink>
        {step < L.flow.length - 1 ? <Button onClick={() => setStep(step + 1)}>Next <ArrowRight /></Button> : <ButtonLink href="/student">Finish</ButtonLink>}
      </div>
      <p className="text-center text-xs text-muted-foreground">Matched to your profile: {L.profile}</p>
    </div>
  );
}
