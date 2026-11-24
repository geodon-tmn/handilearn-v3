"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, ButtonLink, Field, PageTitle, Panel, Pill, Table, inputClass, type Tone } from "@/components/ui";
import { curricula as seed, educationSystems, schools, type Curriculum } from "@/lib/sample-data";

const tone: Record<Curriculum["status"], Tone> = { Draft: "neutral", Processing: "info", "In review": "warn", Live: "good" };

export default function CurriculaPage() {
  const [rows, setRows] = useState(seed);
  const [ownerKind, setOwnerKind] = useState<"system" | "school">("system");
  const [subject, setSubject] = useState("");
  const [owner, setOwner] = useState(educationSystems[0]!.code);
  const [confirm, setConfirm] = useState<string | null>(null);

  const create = () => {
    if (!subject.trim()) return;
    setRows([{ id: subject.toLowerCase().replace(/\W+/g, "-"), subject, owner, ownerKind, level: "—", status: "Draft", objectives: 0, students: 0, updated: "Just now" }, ...rows]);
    setSubject("");
  };

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Curricula" title="Curricula" intro="Each curriculum belongs to one education system or one school." />
      <Table head={["Subject", "Belongs to", "Level", "Status", "Objectives", "Students", ""]} rows={rows.map(c => [
        c.id === "csec-maths" ? <Link key="s" href="/admin/review" className="font-semibold text-accent hover:underline">{c.subject}</Link> : <span key="s" className="font-semibold">{c.subject}</span>,
        <span key="o">{c.owner} <span className="text-xs text-muted-foreground">({c.ownerKind === "system" ? "system" : "school"})</span></span>,
        c.level, <Pill key="st" tone={tone[c.status]}>{c.status}</Pill>, c.objectives || "—", c.students || "—",
        confirm === c.id
          ? <span key="d" className="flex items-center gap-2 text-xs"><span>{c.students ? `${c.students} students enrolled. Can't delete.` : "Delete?"}</span>{!c.students && <Button size="sm" variant="ink" onClick={() => { setRows(rows.filter(r => r.id !== c.id)); setConfirm(null); }}>Yes</Button>}<Button size="sm" variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button></span>
          : <button key="d" onClick={() => setConfirm(c.id)} aria-label={`Delete ${c.subject}`} className="rounded-full p-2 text-muted-foreground hover:bg-coral-soft hover:text-coral"><Trash2 className="h-4 w-4" /></button>,
      ])} />

      <Panel tone="sky">
        <h2 className="font-extrabold">New curriculum</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto] md:items-end">
          <Field label="Subject"><input className={inputClass} value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Principles of Business" /></Field>
          <Field label="Belongs to">
            <div className="flex gap-1 rounded-full border bg-card p-1 text-sm font-semibold">
              {(["system", "school"] as const).map(k => <button key={k} onClick={() => { setOwnerKind(k); setOwner(k === "system" ? educationSystems[0]!.code : schools[0]!.name); }} className={`rounded-full px-3 py-1.5 ${ownerKind === k ? "bg-foreground text-background" : ""}`}>{k === "system" ? "Education system" : "School"}</button>)}
            </div>
          </Field>
          <Field label={ownerKind === "system" ? "Education system" : "School"}>
            <select className={inputClass} value={owner} onChange={e => setOwner(e.target.value)}>
              {ownerKind === "system" ? educationSystems.map(s => <option key={s.code} value={s.code}>{s.code} · {s.name}</option>) : schools.map(s => <option key={s.name}>{s.name}</option>)}
            </select>
          </Field>
          <Button onClick={create}><Plus /> Create</Button>
        </div>
        <div className="mt-4"><ButtonLink href="/admin/review" variant="outline" size="sm">Or upload a syllabus straight away</ButtonLink></div>
      </Panel>
    </div>
  );
}
