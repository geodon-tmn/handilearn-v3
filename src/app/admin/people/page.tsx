import { ShieldCheck, UserPlus } from "lucide-react";
import { Button, PageTitle, Pill, Table } from "@/components/ui";
import { people } from "@/lib/sample-data";

export default function PeoplePage() {
  return (
    <div className="space-y-6">
      <PageTitle eyebrow="People" title="People and roles" intro="Admin roles must use two-factor sign-in. No one can change their own role."
        actions={<Button><UserPlus /> Invite someone</Button>} />
      <Table head={["Name", "Email", "Role", "Can see", "Two-factor", "Status"]} rows={people.map(p => [
        <span key="n" className="font-semibold">{p.name}</span>, p.email, p.role, p.scope,
        p.twoFactor ? <span key="t" className="flex items-center gap-1 text-leaf"><ShieldCheck className="h-4 w-4" /> On</span> : <span key="t" className="text-muted-foreground">{p.role.includes("Administrator") ? "Required" : "Optional"}</span>,
        <Pill key="s" tone={p.status === "Active" ? "good" : "warn"}>{p.status}</Pill>,
      ])} />
    </div>
  );
}
