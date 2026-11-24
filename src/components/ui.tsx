import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/* Brand building blocks carried over from v2 (see BRAND.md). */

export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return <Image src="/brand/handilearn-book.png" alt="" aria-hidden="true" width={size} height={size} priority className={cn("shrink-0 object-contain", className)} />;
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 rounded-xl", className)}>
      <LogoMark />
      <span className="text-[1.35rem] font-extrabold tracking-tight text-foreground">HandiLearn</span>
    </Link>
  );
}

type Variant = "primary" | "outline" | "ink" | "ghost";
type Size = "sm" | "md" | "lg";
const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground border border-[hsl(38_80%_42%)] shadow-[0_6px_18px_-8px_hsl(42_95%_45%/.7)] hover:bg-[hsl(42_95%_50%)] hover:-translate-y-0.5",
  outline: "border border-input bg-card text-foreground hover:border-accent hover:text-accent",
  ink: "border border-transparent bg-foreground text-background hover:bg-[hsl(197_52%_28%)]",
  ghost: "border border-transparent text-foreground hover:bg-secondary",
};
const sizes: Record<Size, string> = { sm: "h-9 px-4 text-sm", md: "h-11 px-5 text-sm", lg: "h-14 px-7 text-base" };
export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[transform,background-color,color] duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4", variants[variant], sizes[size], className);
}
export function Button({ variant, size, className, ...p }: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button type="button" className={buttonClass(variant, size, className)} {...p} />;
}
export function ButtonLink({ variant, size, className, ...p }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...p} />;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("hl-eyebrow flex items-center gap-3", className)}><span className="h-[3px] w-7 rounded-full bg-primary" aria-hidden="true" />{children}</p>;
}

export function PageTitle({ eyebrow, title, intro, actions, preview }: { eyebrow: ReactNode; title: string; intro?: ReactNode; actions?: ReactNode; preview?: boolean }) {
  return (
    <div className="hl-rise flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-3"><Eyebrow>{eyebrow}</Eyebrow>{preview && <SampleBadge />}</div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
        {intro && <div className="mt-2 max-w-2xl text-muted-foreground">{intro}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ children, className, tone = "card" }: { children: ReactNode; className?: string; tone?: "card" | "sky" | "sun" }) {
  const tones = { card: "bg-card border-card-border", sky: "bg-sky-soft border-[hsl(198_60%_86%)]", sun: "bg-sun-soft border-[hsl(42_80%_80%)]" };
  return <div className={cn("rounded-3xl border p-6 shadow-[0_18px_40px_-28px_hsl(197_52%_22%/.35)]", tones[tone], className)}>{children}</div>;
}

export function IconBubble({ children, tone = "sky", className }: { children: ReactNode; tone?: "sky" | "sun" | "ink" | "leaf"; className?: string }) {
  const t = { sky: "bg-sky-soft text-accent", sun: "bg-sun-soft text-[hsl(38_85%_40%)]", ink: "bg-foreground text-background", leaf: "bg-leaf-soft text-leaf" };
  return <span className={cn("inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full [&_svg]:size-5", t[tone], className)}>{children}</span>;
}

export type Tone = "neutral" | "good" | "warn" | "bad" | "info" | "sun";
const pillTones: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  good: "bg-leaf-soft text-leaf border-[hsl(160_40%_80%)]",
  warn: "bg-sun-soft text-[hsl(32_70%_32%)] border-[hsl(42_70%_78%)]",
  bad: "bg-coral-soft text-coral border-[hsl(8_60%_85%)]",
  info: "bg-sky-soft text-accent border-[hsl(198_60%_84%)]",
  sun: "bg-primary text-primary-foreground border-[hsl(38_80%_42%)]",
};
export function Pill({ children, tone = "neutral", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold", pillTones[tone], className)}><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{children}</span>;
}

export function Notice({ tone = "info", title, children, className }: { tone?: "info" | "warn" | "success" | "locked"; title: string; children?: ReactNode; className?: string }) {
  const icons = { info: Info, warn: AlertTriangle, success: CheckCircle2, locked: Lock };
  const styles = { info: "bg-sky-soft border-[hsl(198_60%_84%)]", warn: "bg-coral-soft border-[hsl(8_60%_86%)]", success: "bg-leaf-soft border-[hsl(160_40%_80%)]", locked: "bg-sun-soft border-[hsl(42_70%_78%)]" };
  const Icon = icons[tone];
  return (
    <div role="status" className={cn("flex gap-3 rounded-2xl border p-4 text-sm", styles[tone], className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div><p className="font-semibold">{title}</p>{children && <div className="mt-1 leading-relaxed text-muted-foreground">{children}</div>}</div>
    </div>
  );
}

export function Stat({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: string; icon?: ReactNode }) {
  return (
    <Panel className="flex items-start gap-4 p-5">
      {icon && <IconBubble>{icon}</IconBubble>}
      <div>
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-extrabold tracking-tight">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </Panel>
  );
}

export function Progress({ value, className, tone = "accent" }: { value: number; className?: string; tone?: "accent" | "sun" | "leaf" }) {
  const t = { accent: "bg-accent", sun: "bg-primary", leaf: "bg-leaf" };
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-muted", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full transition-[width] duration-500", t[tone])} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Table({ head, rows, className }: { head: ReactNode[]; rows: ReactNode[][]; className?: string }) {
  return (
    <div className={cn("overflow-x-auto rounded-3xl border border-card-border bg-card", className)}>
      <table className="w-full text-left text-sm">
        <thead className="bg-sky-soft/60 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>{head.map((h, i) => <th key={i} className="px-4 py-3 font-bold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => <tr key={i} className="border-t">{r.map((c, j) => <td key={j} className="px-4 py-3 align-top">{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}
export const inputClass = "w-full rounded-2xl border border-input bg-card px-4 py-2.5 text-sm font-normal outline-none focus:border-accent";

/** Marks a screen (or part of one) that still shows sample data. */
export function SampleBadge({ label = "Preview · sample data" }: { label?: string }) {
  return <span title="Sample data. This becomes real in a later build stage." className="inline-flex items-center rounded-full border border-[hsl(42_70%_70%)] bg-sun-soft px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[hsl(32_70%_32%)]">{label}</span>;
}
