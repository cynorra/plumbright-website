import * as React from "react";
import { CheckIcon, LinkIcon, RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/motion/animated-number";

/** Number input with its unit shown inside the field ("ft", "in", "%"). */
export function NumField({
  id,
  label,
  unit,
  hint,
  value,
  onChange,
  invalid,
  className,
}: {
  id: string;
  label: string;
  unit?: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  className?: string;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className={cn("grid min-w-0 content-start gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={hintId}
          className={cn("num pr-12 text-base", !unit && "pr-3")}
        />
        {unit && (
          <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm num">
            {unit}
          </span>
        )}
      </div>
      {hint && (
        <p id={hintId} className="text-muted-foreground text-xs leading-snug">
          {hint}
        </p>
      )}
    </div>
  );
}

export function ResultPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "bg-muted/60 flex min-w-0 flex-col gap-4 border-t p-5 md:border-t-0 md:border-l md:p-6 dark:bg-muted/30",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BigResult({ label, value, decimals = 2, unit, sub }: { label: string; value: number | null; decimals?: number; unit: string; sub?: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">{label}</p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
        {value === null ? (
          <span className="num text-muted-foreground text-5xl font-semibold">–</span>
        ) : (
          <AnimatedNumber value={value} decimals={decimals} className="text-brand text-5xl font-semibold tracking-tight" />
        )}
        <span className="text-muted-foreground">{unit}</span>
      </p>
      {sub && <p className="text-muted-foreground num mt-1 text-sm">{sub}</p>}
    </div>
  );
}

export function Breakdown({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-sm">
      {rows.map(([k, v]) => (
        <React.Fragment key={k}>
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="num text-right">{v}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

export function ErrorNote({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-destructive flex items-start gap-2 text-sm">
      <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}

/**
 * Keeps calculator inputs in the URL (?l=10&w=12) so a result can be shared or
 * bookmarked. Reads the URL only after hydration so server and client HTML match.
 */
export function useUrlState<T extends Record<string, string>>(defaults: T, sync = true) {
  const [state, setState] = React.useState<T>(defaults);
  const ready = React.useRef(false);

  React.useEffect(() => {
    if (!sync) return;
    const params = new URLSearchParams(window.location.search);
    const next = { ...defaults };
    let changed = false;
    for (const key of Object.keys(defaults)) {
      const v = params.get(key);
      if (v !== null) {
        (next as Record<string, string>)[key] = v;
        changed = true;
      }
    }
    if (changed) setState(next);
    ready.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!sync || !ready.current) return;
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(state)) if (v !== defaults[k]) params.set(k, v);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [state, defaults, sync]);

  const set = React.useCallback(<K extends keyof T>(key: K, value: T[K]) => setState((s) => ({ ...s, [key]: value })), []);
  const reset = React.useCallback(() => setState(defaults), [defaults]);
  return [state, set, reset] as const;
}

export function ToolActions({ onReset }: { onReset: () => void }) {
  const [copied, setCopied] = React.useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={copy}>
        {copied ? <CheckIcon /> : <LinkIcon />}
        {copied ? "Link copied" : "Copy link to this result"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onReset}>
        <RotateCcwIcon />
        Reset
      </Button>
    </div>
  );
}

/** Run a calculation and turn a thrown RangeError into a message. */
export function safe<T>(fn: () => T): { result: T | null; error: string } {
  try {
    return { result: fn(), error: "" };
  } catch (e) {
    return { result: null, error: e instanceof Error ? e.message : "Check the values you entered." };
  }
}
