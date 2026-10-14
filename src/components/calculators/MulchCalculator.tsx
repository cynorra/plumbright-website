import * as React from "react";
import { bedArea, mulchEstimate } from "@/lib/calc/mulch.js";
import { num, fmt } from "@/lib/calc/util.js";
import { Separator } from "@/components/ui/separator";
import { NumField, BigResult, Breakdown, ErrorNote, useUrlState, ToolActions, safe, SegField, CalcShell } from "./parts";

const DEFAULTS = { shape: "rect", l: "20", w: "10", d: "8", depth: "3", have: "0" };

export default function MulchCalculator({ compact = false }: { compact?: boolean }) {
  const [s, set, reset] = useUrlState(DEFAULTS, !compact);
  const { result, error } = safe(() =>
    mulchEstimate({
      areaSqFt: bedArea({ shape: s.shape, lengthFt: num(s.l), widthFt: num(s.w), diameterFt: num(s.d) }),
      depthIn: num(s.depth),
      existingIn: num(s.have) || 0,
    }),
  );
  const field = (key: keyof typeof DEFAULTS, label: string, unit?: string, hint?: string) => (
    <NumField id={`mu-${key}`} label={label} unit={unit} hint={hint} value={s[key]} onChange={(v) => set(key, v)} />
  );
  return (
    <CalcShell
      compact={compact}
      form={
        <>
          <SegField id="mu-shape" label="Bed shape" value={s.shape} onChange={(v) => set("shape", v)} options={[{ value: "rect", label: "Rectangle" }, { value: "circle", label: "Circle (tree ring)" }]} />
          <div className="grid gap-4 sm:grid-cols-3">
            {s.shape === "rect" ? (
              <>
                {field("l", "Length", "ft")}
                {field("w", "Width", "ft")}
              </>
            ) : (
              field("d", "Diameter", "ft")
            )}
            {field("depth", "Depth", "in", "2–4 in for most beds")}
          </div>
          {!compact && <div className="grid gap-4 sm:grid-cols-3">{field("have", "Already there", "in", "For a top-up; 0 for a new bed")}</div>}
          <ErrorNote message={error} />
          {!compact && <ToolActions onReset={reset} />}
        </>
      }
      result={
        <>
          <BigResult label="You need" value={result ? result.cubicYards : null} decimals={2} unit="cubic yards" sub={result ? `${fmt(result.cuFt)} cu ft · order ${fmt(result.orderYards)} yd³ bulk` : undefined} />
          <Separator />
          <Breakdown
            rows={[
              ["Bed area", result ? `${fmt(result.areaSqFt)} sq ft` : "–"],
              ...((result?.bags ?? [{ size: 1.5 }, { size: 2 }, { size: 3 }]).map((b: { size: number; count?: number }) => [`${b.size} cu ft bags`, b.count != null ? fmt(b.count, 0) : "–"] as [string, string])),
            ]}
          />
          {!compact && <p className="text-muted-foreground text-xs">Keep mulch at least 6 in away from tree trunks.</p>}
        </>
      }
    />
  );
}
