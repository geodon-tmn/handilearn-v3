"use client";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Field, PageTitle, Panel, Pill, inputClass } from "@/components/ui";
import { allObjectives, links as seed, type GraphLink, type LinkType } from "@/lib/sample-data";

/* Link styles kept from v2's learning-path map. */
const STYLE: Record<LinkType, { stroke: string; dash?: string; width: number; label: string }> = {
  mandatory: { stroke: "hsl(197 52% 24%)", width: 2.6, label: "Mandatory" },
  recommended: { stroke: "hsl(199 72% 42%)", dash: "8 5", width: 2, label: "Recommended" },
  supporting: { stroke: "hsl(172 50% 36%)", dash: "2 5", width: 2, label: "Supporting" },
};
const NW = 210, NH = 70, GX = 56, GY = 18, PAD = 16;
const MODULE_TINT: Record<string, string> = { "Number Theory and Computation": "hsl(198 80% 95%)", "Consumer Arithmetic": "hsl(45 100% 92%)", Algebra: "hsl(160 50% 93%)" };

/** Prerequisites sit left of what depends on them (longest-path layering). */
function layout(links: GraphLink[]) {
  const depth = new Map(allObjectives.map(o => [o.id, 0]));
  for (let i = 0; i < allObjectives.length; i++) for (const l of links) {
    const d = (depth.get(l.from) ?? 0) + 1;
    if (d > (depth.get(l.to) ?? 0)) depth.set(l.to, d);
  }
  const cols = new Map<number, string[]>();
  for (const o of allObjectives) { const d = depth.get(o.id)!; cols.set(d, [...(cols.get(d) ?? []), o.id]); }
  const pos = new Map<string, { x: number; y: number }>();
  for (const [d, ids] of cols) ids.forEach((id, i) => pos.set(id, { x: PAD + d * (NW + GX), y: PAD + i * (NH + GY) }));
  const w = PAD * 2 + (Math.max(...cols.keys()) + 1) * (NW + GX) - GX;
  const h = PAD * 2 + Math.max(...[...cols.values()].map(c => c.length)) * (NH + GY) - GY;
  return { pos, w, h };
}

/** Splits a title into at most two lines of about `max` characters. */
function wrap(text: string, max: number) {
  const words = text.split(" "), lines = [""];
  for (const w of words) {
    const last = lines[lines.length - 1]!;
    if ((last + " " + w).trim().length <= max) lines[lines.length - 1] = (last + " " + w).trim();
    else if (lines.length < 2) lines.push(w);
    else { lines[1] = (lines[1]! + " " + w).slice(0, max - 1) + "…"; break; }
  }
  return lines;
}

/** True if `to` can already be reached from `from` along existing links. */
function reaches(links: GraphLink[], from: string, to: string): boolean {
  const seen = new Set<string>(), stack = [from];
  while (stack.length) { const n = stack.pop()!; if (n === to) return true; if (seen.has(n)) continue; seen.add(n); for (const l of links) if (l.from === n) stack.push(l.to); }
  return false;
}

export default function MapPage() {
  const [links, setLinks] = useState(seed);
  const [selected, setSelected] = useState<string | null>("o7");
  const [refused, setRefused] = useState(false);
  const [form, setForm] = useState({ from: "o3", to: "o8", type: "recommended" as LinkType });
  const { pos, w, h } = useMemo(() => layout(links), [links]);
  const byId = new Map(allObjectives.map(o => [o.id, o]));
  const sel = selected ? byId.get(selected) : null;
  const related = links.filter(l => l.from === selected || l.to === selected);

  return (
    <div className="space-y-6">
      <PageTitle preview eyebrow="Learning path" title="CSEC Mathematics map" intro="Each arrow means “learn this first”. Prerequisites sit to the left. Tap an objective to see its links." />
      <div className="flex flex-wrap gap-4 text-sm">
        {(Object.keys(STYLE) as LinkType[]).map(t => (
          <span key={t} className="flex items-center gap-2"><svg width="36" height="8"><line x1="0" y1="4" x2="36" y2="4" stroke={STYLE[t].stroke} strokeWidth={STYLE[t].width} strokeDasharray={STYLE[t].dash} /></svg>{STYLE[t].label}</span>
        ))}
        <span className="text-muted-foreground">Only mandatory links block a student’s path.</span>
      </div>

      <Panel className="overflow-x-auto p-3">
        <svg width="100%" style={{ minWidth: 860 }} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Learning path graph for CSEC Mathematics">
          <defs>{(Object.keys(STYLE) as LinkType[]).map(t => <marker key={t} id={`arrow-${t}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill={STYLE[t].stroke} /></marker>)}</defs>
          {links.map((l, i) => {
            const a = pos.get(l.from)!, b = pos.get(l.to)!;
            const x1 = a.x + NW, y1 = a.y + NH / 2, x2 = b.x, y2 = b.y + NH / 2, mx = (x1 + x2) / 2;
            const faded = selected && l.from !== selected && l.to !== selected;
            return <path key={i} d={`M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2 - 2} ${y2}`} fill="none" stroke={STYLE[l.type].stroke} strokeWidth={STYLE[l.type].width} strokeDasharray={STYLE[l.type].dash} markerEnd={`url(#arrow-${l.type})`} opacity={faded ? 0.18 : 1} />;
          })}
          {allObjectives.map(o => {
            const p = pos.get(o.id)!, on = selected === o.id;
            return (
              <g key={o.id} onClick={() => setSelected(on ? null : o.id)} className="cursor-pointer">
                <rect x={p.x} y={p.y} width={NW} height={NH} rx="14" fill={MODULE_TINT[o.module] ?? "white"} stroke={on ? "hsl(199 72% 42%)" : "hsl(200 30% 80%)"} strokeWidth={on ? 3 : 1.25} />
                <text x={p.x + 12} y={p.y + 19} fontSize="11" fontWeight="700" fill="hsl(200 18% 40%)">{o.code}</text>
                {wrap(o.title, 28).map((line, i) => <text key={i} x={p.x + 12} y={p.y + 38 + i * 16} fontSize="13" fontWeight="600" fill="hsl(197 52% 22%)">{line}</text>)}
              </g>
            );
          })}
        </svg>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          {sel ? <>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{sel.module} · {sel.topic}</p>
            <h2 className="mt-1 text-lg font-extrabold">{sel.code} {sel.title}</h2>
            <ul className="mt-4 space-y-2">
              {related.length === 0 && <li className="text-sm text-muted-foreground">No links. Syllabus order decides when it’s taught.</li>}
              {related.map((l, i) => (
                <li key={i} className="flex items-start justify-between gap-3 rounded-2xl border p-3 text-sm">
                  <div>
                    <p className="font-semibold">{l.from === selected ? "Leads to" : "Needs first"}: {byId.get(l.from === selected ? l.to : l.from)!.title}</p>
                    <p className="mt-0.5 text-muted-foreground">{l.reason}</p>
                    <div className="mt-2 flex gap-2"><Pill tone={l.type === "mandatory" ? "info" : "neutral"}>{STYLE[l.type].label}</Pill><Pill tone={l.source === "Syllabus" ? "good" : "warn"}>{l.source === "AI" ? "AI suggested" : `From ${l.source.toLowerCase()}`}</Pill></div>
                  </div>
                  <button aria-label="Remove link" onClick={() => setLinks(links.filter(x => x !== l))} className="rounded-full p-2 text-muted-foreground hover:bg-coral-soft hover:text-coral"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          </> : <p className="text-sm text-muted-foreground">Tap an objective on the map.</p>}
        </Panel>
        <Panel tone="sky">
          <h2 className="font-extrabold">Add a link</h2>
          <div className="mt-4 grid gap-3">
            <Field label="Learn first"><select className={inputClass} value={form.from} onChange={e => setForm({ ...form, from: e.target.value })}>{allObjectives.map(o => <option key={o.id} value={o.id}>{o.code} {o.title}</option>)}</select></Field>
            <Field label="Then"><select className={inputClass} value={form.to} onChange={e => setForm({ ...form, to: e.target.value })}>{allObjectives.map(o => <option key={o.id} value={o.id}>{o.code} {o.title}</option>)}</select></Field>
            <Field label="Type"><select className={inputClass} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as LinkType })}>{(Object.keys(STYLE) as LinkType[]).map(t => <option key={t} value={t}>{STYLE[t].label}</option>)}</select></Field>
            <Button onClick={() => { if (form.from === form.to || reaches(links, form.to, form.from)) { setRefused(true); return; } setRefused(false); setLinks([...links, { ...form, source: "Admin", reason: "Added by an administrator" }]); }}><Plus /> Add link</Button>
            {refused && <p className="text-sm font-semibold text-coral">That link would make a loop, so it wasn't added.</p>}
            <p className="text-xs text-muted-foreground">Saved straight away. Links that would make a loop are refused.</p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
