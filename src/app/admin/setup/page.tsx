"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Field, PageTitle, Panel, Pill, Table, inputClass, type Tone } from "@/components/ui";
import { educationSystems as seedSystems, schools as seedSchools, territories as seedTerritories, type School } from "@/lib/sample-data";
import { cn } from "@/lib/utils";

type Tab = "territories" | "systems" | "schools";
const statusTone: Record<School["status"], Tone> = { Listed: "neutral", Claimed: "warn", Subscribed: "good" };

export default function SetupPage() {
  const [tab, setTab] = useState<Tab>("territories");
  const [territories, setTerritories] = useState(seedTerritories);
  const [systems, setSystems] = useState(seedSystems);
  const [schools, setSchools] = useState(seedSchools);
  const [name, setName] = useState("");
  const [extra, setExtra] = useState("");
  const territoryName = (code: string | null) => code ? territories.find(t => t.code === code)?.name ?? code : "All territories (regional)";

  const add = () => {
    if (!name.trim()) return;
    if (tab === "territories") setTerritories([...territories, { code: (extra || name).slice(0, 2).toUpperCase(), name, currency: "XCD", schools: 0, status: "planned" }]);
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

      {tab === "territories" && <Table head={["Territory", "Code", "Currency", "Schools", "Status", ""]} rows={territories.map((t, i) => [
        <span key="n" className="font-semibold">{t.name}</span>, t.code, t.currency, t.schools,
        <Pill key="s" tone={t.status === "live" ? "good" : "neutral"}>{t.status === "live" ? "Live" : "Planned"}</Pill>,
        <DeleteButton key="d" onClick={() => setTerritories(territories.filter((_, j) => j !== i))} />])} />}

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
        <div className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
          <Field label="Name"><input className={inputClass} value={name} onChange={e => setName(e.target.value)} placeholder={tab === "territories" ? "e.g. Grenada" : tab === "systems" ? "e.g. Common Entrance (Jamaica PEP)" : "e.g. Lester Vaughan School"} /></Field>
          <Field label={tab === "schools" ? "Level" : "Code"}><input className={inputClass} value={extra} onChange={e => setExtra(e.target.value)} placeholder={tab === "schools" ? "Primary" : "GD"} /></Field>
          <Button onClick={add}><Plus /> Add</Button>
        </div>
        {tab === "schools" && <p className="mt-3 text-xs text-muted-foreground">A new school starts as Listed: students can pick it, but no one at the school sees their data.</p>}
      </Panel>
    </div>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} aria-label="Delete" className="rounded-full p-2 text-muted-foreground hover:bg-coral-soft hover:text-coral"><Trash2 className="h-4 w-4" /></button>;
}
