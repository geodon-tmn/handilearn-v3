import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { ROLE_LABEL, requireGlobalAdmin } from "@/lib/auth";
import { supabaseConfigured } from "@/lib/supabase/env";

// Always rendered per request: it checks who is signed in.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Without Supabase settings (local prototype builds) the admin area stays a preview.
  if (!supabaseConfigured) return <AppShell role="admin" wide>{children}</AppShell>;
  const s = await requireGlobalAdmin();
  const user = { name: s.profile.full_name, email: s.user.email ?? "", roleLabel: ROLE_LABEL[s.profile.role] };
  return <AppShell role="admin" wide preview={false} user={user}>{children}</AppShell>;
}
