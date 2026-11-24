"use client";
import { useState, useTransition } from "react";
import { changeRole } from "../actions";
import type { Role } from "@/lib/auth";

const OPTIONS: [Role, string][] = [["global_admin", "Global Administrator"], ["school_admin", "School Administrator"], ["teacher", "Teacher"], ["parent", "Parent"], ["student", "Student"]];

export function RoleSelect({ id, role }: { id: string; role: Role }) {
  const [value, setValue] = useState(role);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div>
      <select aria-label="Role" disabled={pending} value={value} className="rounded-full border border-input bg-card px-3 py-1.5 text-sm"
        onChange={e => {
          const next = e.target.value as Role, before = value;
          if (next === "global_admin" && !confirm("Make this person a Global Administrator? They will be able to change everything.")) return;
          setValue(next);
          start(async () => { const r = await changeRole(id, next); if (!r.ok) { setError(r.error); setValue(before); } else setError(null); });
        }}>
        {OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      {error && <p className="mt-1 text-xs font-semibold text-coral">{error}</p>}
    </div>
  );
}
