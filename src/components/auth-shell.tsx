import type { ReactNode } from "react";
import { Logo, Panel } from "./ui";

export function AuthShell({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center bg-sky-soft/50 px-5 py-10">
      <Logo />
      <Panel className="hl-rise mt-8 w-full max-w-md">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {intro && <div className="mt-1 text-sm text-muted-foreground">{intro}</div>}
        <div className="mt-6">{children}</div>
      </Panel>
    </div>
  );
}
