"use client";
import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Field, PageTitle, Panel, Pill, SampleBadge, Table, inputClass, type Tone } from "@/components/ui";
import { addTerritory, deleteTerritory, setTerritoryStatus, type ActionResult } from "../actions";
import { educationSystems as seedSystems, schools as seedSchools, type School } from "@/lib/sample-data";

export type TerritoryRow = { code: string; name: string; currency: string; status: "planned" | "live"; schools: number };
import { cn } from "@/lib/utils";

type Tab = "territories" | "systems" | "schools";
const statusTone: Record<School["status"], Tone> = { Listed: "neutral", Claimed: "warn", Subscribed: "good" };

export function SetupClient({ territories, live }: { territories: TerritoryRow[]; live: boolean }) {
  const [tab, setTab] = useState<Tab>("territories");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (fn: () => Promise<ActionResult>, after?: () => void) => start(async () => {
    setError(null);
    if (!live) { setError("Sign-in isn't connected in this preview, so changes aren't saved."); return; }
    const r = await fn(); if (!r.ok) setError(r.error); else after?.();
  });
  const [systems, setSystems] = useState(seedSystems);
  const [schools, setSchools] = useState(seedSchools);
  const [name, setName] = useState("");
  const [extra, setExtra] = useState("");
  const [currency, setCurrency] = useState("");
  const territoryName = (code: string | null) => code ? territories.find(t => t.code === code)?.name ?? code : "All territories (regional)";

  const add = () => {
    if (!name.trim()) return;
    if (tab === "territories") { run(() => addTerritory({ code: extra, name, currency: currency }), () => { setName(""); setExtra(""); setCurrency(""); }); return; }
    if (tab === "systems") setSystems([...systems, { code: extra || name.slice(0, 6).toUpperCase(), name, level: "Primary", territory: "BB", curricula: 0 }]);
    if (tab === "schools") setSchools([...schools, { name, territory: "BB", level: extra || "Primary", status: "Listed", students: 0, consented: 0 }]);
    setName(""); setExtra("");
  };

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Setup" title="Territories, systems and schools" intro="Every school and national system belongs to a territory. Regional bodies like CXC serve every territory." />
      <div className="flex gap-1 rounded-full border bg-card p-1 text-sm font-semibold w-fit" role="tablist">
        {([["territories", "Territories"], ["systems", "Education systems"], ["schools", "Schools"]] as [Tab, string][]).map(([t, l]) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("rounded-full px-4 py-1.5", tab === t ? "bg-foreground text-background" : "hover:bg-secondary")}>{l}</button>
        ))}
      </div>

      {error && <p role="alert" className="rounded-2xl bg-coral-soft p-3 text-sm font-semibold text-coral">{error}</p>}
      {tab === "territories" && <Table className={pending ? "opacity-60" : ""} head={["Territory", "Code", "Currency", "Schools", "Status", ""]} rows={territories.map(t => [
        <span key="n" className="font-semibold">{t.name}</span>, t.code, t.currency, t.schools,
        <button key="s" title="Change status" onClick={() => run(() => setTerritoryStatus(t.code, t.status === "live" ? "planned" : "live"))}><Pill tone={t.status === "live" ? "good" : "neutral"}>{t.status === "live" ? "Live" : "Planned"}</Pill></button>,
        <DeleteButton key="d" onClick={() => { if (confirm(`Delete ${t.name}?`)) run(() => deleteTerritory(t.code)); }} />])} />}

      {tab !== "territories" && <SampleBadge label="Preview · sample data until stage 2" />}
      {tab === "systems" && <Table head={["Education system", "Code", "Level", "Territory", "Curricula", ""]} rows={systems.map((s, i) => [
        <span key="n" className="font-semibold">{s.name}</span>, s.code, s.level, territoryName(s.territory), s.curricula,
        <DeleteButton key="d" onClick={() => setSystems(systems.filter((_, j) => j !== i))} />])} />}

      {tab === "schools" && <Table head={["School", "Territory", "Level", "Status", "Students", "Family permission", ""]} rows={schools.map((s, i) => [
        <span key="n" className="font-semibold">{s.name}</span>, territoryName(s.territory), s.level,
        <Pill key="s" tone={statusTone[s.status]}>{s.status}</Pill>, s.students,
        s.status === "Listed" ? <span key="c" className="text-muted-foreground">Not asked yet</span> : `${s.consented} of ${s.students}`,
        <DeleteButton key="d" onClick={() => setSchools(schools.filter((_, j) => j !== i))} />])} />}

      <Panel tone="sky">
        <h2 className="font-extrabold">Add {tab === "territories" ? "a territory" : tab === "systems" ? "an education system" : "a school"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
          <Field label="Name"><input className={inputClass} value={name} onChange={e => setName(e.target.value)} placeholder={tab === "territories" ? "e.g. Grenada" : tab === "systems" ? "e.g. Common Entrance (Jamaica PEP)" : "e.g. Lester Vaughan School"} /></Field>
          <Field label={tab === "schools" ? "Level" : "Code"}><input className={inputClass} value={extra} onChange={e => setExtra(e.target.value)} placeholder={tab === "schools" ? "Primary" : "GD"} /></Field>
          {tab === "territories" && <Field label="Currency"><input className={inputClass} value={currency} onChange={e => setCurrency(e.target.value)} placeholder="XCD" /></Field>}
          <Button onClick={add} disabled={pending}><Plus /> Add</Button>
        </div>
        {tab === "schools" && <p className="mt-3 text-xs text-muted-foreground">A new school starts as Listed: students can pick it, but no one at the school sees their data.</p>}
        {tab === "territories" && <p className="mt-3 text-xs text-muted-foreground">Tap a status to switch a territory between Planned and Live. Territories still used by schools or systems can't be deleted.</p>}
      </Panel>
    </div>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} aria-label="Delete" className="rounded-full p-2 text-muted-foreground hover:bg-coral-soft hover:text-coral"><Trash2 className="h-4 w-4" /></button>;
}
