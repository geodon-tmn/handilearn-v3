"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, ChevronDown, ChevronRight, FileText, Loader2, Pencil, Rocket, Trash2, Upload } from "lucide-react";
import { Button, ButtonLink, Notice, PageTitle, Panel, Pill, Progress } from "@/components/ui";
import { csecMaths, sampleSyllabus, type Objective } from "@/lib/sample-data";
import { cn } from "@/lib/utils";

const STEPS = ["Reading 38 pages", "Splitting at the syllabus's own sections", "Breaking down 3 sections at a time", "Checking every numbered objective is covered", "Building the outline"];

export default function ReviewPage() {
  const [stage, setStage] = useState<"upload" | "processing" | "review" | "live">("upload");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (stage !== "processing") return;
    const t = setInterval(() => setProgress(p => { if (p >= 100) { clearInterval(t); setStage("review"); return 100; } return p + 4; }), 120);
    return () => clearInterval(t);
  }, [stage]);

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Upload and review" title={stage === "upload" ? "Load a syllabus" : "CSEC Mathematics"}
        intro={stage === "upload" ? "Upload a syllabus and HandiLearn breaks it into modules, topics, lessons and objectives for you to check." : "Check the outline against the syllabus, fix anything, approve each module, then set it live."} />
      {stage === "upload" && <UploadStep onStart={() => { setProgress(0); setStage("processing"); }} onOpen={() => setStage("review")} />}
      {stage === "processing" && <Processing progress={progress} />}
      {stage === "review" && <Review onLive={() => setStage("live")} />}
      {stage === "live" && (
        <Panel tone="sun" className="text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-leaf" />
          <h2 className="mt-3 text-2xl font-extrabold">CSEC Mathematics is live</h2>
          <p className="mt-1 text-muted-foreground">The learning path has been built from the syllabus and AI suggestions. Students can enrol now.</p>
          <div className="mt-5 flex justify-center gap-2"><ButtonLink href="/admin/map">See the learning path</ButtonLink><Button variant="outline" onClick={() => setStage("upload")}>Load another</Button></div>
        </Panel>
      )}
    </div>
  );
}

function UploadStep({ onStart, onOpen }: { onStart: () => void; onOpen: () => void }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel>
        <h2 className="font-extrabold">1. Choose the curriculum</h2>
        <select className="mt-3 w-full rounded-2xl border border-input bg-card px-4 py-2.5 text-sm"><option>CSEC · Mathematics</option><option>CSEC · English A</option><option>BB-PRI · Science</option></select>
        <h2 className="mt-6 font-extrabold">2. Upload the syllabus</h2>
        <button onClick={onStart} className="mt-3 flex w-full flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-input bg-sky-soft/40 px-6 py-10 text-center hover:border-accent">
          <Upload className="h-8 w-8 text-accent" />
          <span className="font-semibold">Drop a PDF or Word file here</span>
          <span className="text-sm text-muted-foreground">or tap to use the sample: CSEC-Mathematics-Syllabus.pdf</span>
        </button>
        <p className="mt-3 text-xs text-muted-foreground">Processing runs in the background. You can leave this page and come back.</p>
      </Panel>
      <Panel tone="sky">
        <h2 className="font-extrabold">Ready to review</h2>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-accent" /><div><p className="font-semibold">CSEC Mathematics</p><p className="text-xs text-muted-foreground">Processed today · 13 objectives in this preview · 2 to check</p></div></div>
          <Button size="sm" variant="ink" onClick={onOpen}>Review</Button>
        </div>
        <h2 className="mt-6 font-extrabold">Processing</h2>
        <div className="mt-3 rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between"><p className="flex items-center gap-2 font-semibold"><Loader2 className="h-4 w-4 animate-spin text-accent" /> CSEC English A</p><Pill tone="info">62%</Pill></div>
          <Progress value={62} className="mt-3" />
        </div>
        <p className="mt-6 text-sm text-muted-foreground">What happens: the syllabus is read page by page, split at its own sections, broken down three sections at a time, and checked so every numbered objective is covered. You review the outline, not a list of warnings.</p>
      </Panel>
    </div>
  );
}

function Processing({ progress }: { progress: number }) {
  const step = Math.min(STEPS.length - 1, Math.floor(progress / (100 / STEPS.length)));
  return (
    <Panel className="mx-auto max-w-xl">
      <div className="flex items-center justify-between"><p className="font-extrabold">Processing CSEC-Mathematics-Syllabus.pdf</p><Pill tone="info">{progress}%</Pill></div>
      <Progress value={progress} className="mt-4" />
      <ol className="mt-5 space-y-2 text-sm">
        {STEPS.map((s, i) => <li key={s} className={cn("flex items-center gap-2", i > step && "text-muted-foreground")}>{i < step ? <Check className="h-4 w-4 text-leaf" /> : i === step ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : <span className="h-4 w-4" />}{s}</li>)}
      </ol>
    </Panel>
  );
}

function Review({ onLive }: { onLive: () => void }) {
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<Set<string>>(new Set(["m1"]));
  const [selected, setSelected] = useState<Objective | null>(null);
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const modules = csecMaths.modules;
  const flags = useMemo(() => modules.flatMap(m => m.topics.flatMap(t => t.lessons.flatMap(l => l.objectives.filter(o => o.flag && !checked.has(o.id) && !removed.has(o.id))))), [modules, checked, removed]);
  const allApproved = modules.every(m => approved.has(m.id));
  const toggle = (set: Set<string>, id: string) => { const n = new Set(set); if (n.has(id)) n.delete(id); else n.add(id); return n; };

  return (
    <>
      {flags.length > 0 ? <Notice tone="locked" title={`${flags.length} items to check`}>Numbered objectives the AI matched loosely. Open them, confirm or fix, and tick them off.</Notice>
        : <Notice tone="success" title="Every numbered syllabus objective is covered">Approve each module, then set the curriculum live.</Notice>}
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Panel className="p-4 sm:p-6">
          <div className="flex items-center justify-between"><h2 className="font-extrabold">Outline</h2><span className="text-xs text-muted-foreground">Subject → module → topic → lesson → objective</span></div>
          <ul className="mt-4 space-y-3">
            {modules.map(m => {
              const isOpen = open.has(m.id), ok = approved.has(m.id);
              return (
                <li key={m.id} className={cn("rounded-2xl border", ok && "border-[hsl(160_40%_75%)] bg-leaf-soft/40")}>
                  <div className="flex items-center justify-between gap-2 p-3">
                    <button onClick={() => setOpen(toggle(open, m.id))} className="flex items-center gap-2 text-left font-bold">{isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}{m.title}</button>
                    <Button size="sm" variant={ok ? "outline" : "ink"} onClick={() => setApproved(toggle(approved, m.id))}>{ok ? <><Check /> Approved</> : "Approve module"}</Button>
                  </div>
                  {isOpen && m.topics.map(t => (
                    <div key={t.id} className="border-t px-3 pb-3 pt-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Topic · {t.title}</p>
                      {t.lessons.map(l => (
                        <div key={l.id} className="mt-2 rounded-xl bg-muted/60 p-2.5">
                          <p className="text-sm font-semibold">Lesson · {l.title}</p>
                          <ul className="mt-1.5 space-y-1">
                            {l.objectives.filter(o => !removed.has(o.id)).map(o => (
                              <li key={o.id} className={cn("group flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm", selected?.id === o.id ? "bg-card ring-2 ring-accent" : "hover:bg-card")}>
                                <button onClick={() => setSelected(o)} className="flex flex-1 items-start gap-2 text-left">
                                  <span className="mt-0.5 font-mono text-xs text-muted-foreground">{o.code}</span>
                                  <span className="flex-1">{o.title}</span>
                                  {o.flag && !checked.has(o.id) && <Pill tone="warn">Please check</Pill>}
                                </button>
                                {o.flag && !checked.has(o.id) && <button aria-label="Mark checked" onClick={() => setChecked(toggle(checked, o.id))} className="rounded-full p-1 text-leaf hover:bg-leaf-soft"><Check className="h-4 w-4" /></button>}
                                <button aria-label="Edit" className="rounded-full p-1 text-muted-foreground opacity-0 hover:bg-secondary group-hover:opacity-100"><Pencil className="h-3.5 w-3.5" /></button>
                                <button aria-label="Delete" onClick={() => setRemoved(toggle(removed, o.id))} className="rounded-full p-1 text-muted-foreground opacity-0 hover:bg-coral-soft hover:text-coral group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ))}
                </li>
              );
            })}
          </ul>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-muted-foreground">{approved.size} of {modules.length} modules approved</p>
            <Button onClick={onLive} disabled={!allApproved || flags.length > 0}><Rocket /> Set live and build learning path</Button>
          </div>
        </Panel>

        <div className="space-y-4 lg:sticky lg:top-36 lg:self-start">
          <Panel tone="sky">
            <h2 className="font-extrabold">{selected ? `Objective ${selected.code}` : "Syllabus text"}</h2>
            {selected ? (
              <div className="mt-3 space-y-3 text-sm">
                <p className="font-semibold">{selected.title}</p>
                <div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expected competency</p><p>{selected.competency}</p></div>
                <div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">From the syllabus</p><blockquote className="mt-1 rounded-xl border-l-4 border-primary bg-card p-3 italic">“{selected.quote}”</blockquote></div>
                {selected.flag && <p className="flex items-center gap-2 text-xs text-[hsl(32_70%_32%)]"><AlertTriangle className="h-3.5 w-3.5" /> The AI reworded this objective. Check it still matches.</p>}
              </div>
            ) : <p className="mt-2 text-sm text-muted-foreground">Select an objective to see the words it came from.</p>}
          </Panel>
          <Panel className="max-h-80 overflow-auto p-4"><pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-muted-foreground">{highlight(sampleSyllabus, selected?.quote)}</pre></Panel>
          <p className="text-xs text-muted-foreground">Want the graph instead? <Link href="/admin/map" className="font-semibold text-accent">Open the learning path</Link></p>
        </div>
      </div>
    </>
  );
}

function highlight(text: string, quote?: string) {
  if (!quote) return text;
  const i = text.indexOf(quote);
  if (i < 0) return text;
  return <>{text.slice(0, i)}<mark className="rounded bg-primary/60 px-0.5 text-foreground">{quote}</mark>{text.slice(i + quote.length)}</>;
}
