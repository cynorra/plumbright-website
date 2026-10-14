import * as React from "react";
import { UNITS, wallArea, masonryEstimate } from "@/lib/calc/masonry.js";
import { num, fmt } from "@/lib/calc/util.js";
import { Separator } from "@/components/ui/separator";
import { NumField, BigResult, Breakdown, ErrorNote, useUrlState, ToolActions, safe, SelectField, CalcShell } from "./parts";

const DEFAULTS = { l: "20", h: "4", doors: "0", windows: "0", unit: "modular", waste: "5" };

export default function BrickCalculator({ compact = false }: { compact?: boolean }) {
  const [s, set, reset] = useUrlState(DEFAULTS, !compact);
  const { result, error } = safe(() => {
    const w = num(s.waste);
    return masonryEstimate({
      areaSqFt: wallArea({ lengthFt: num(s.l), heightFt: num(s.h), doors: num(s.doors) || 0, windows: num(s.windows) || 0 }),
      unit: s.unit,
      wastePct: Number.isFinite(w) ? w : 0,
    });
  });
  const field = (key: keyof typeof DEFAULTS, label: string, unit?: string, hint?: string) => (
    <NumField id={`bk-${key}`} label={label} unit={unit} hint={hint} value={s[key]} onChange={(v) => set(key, v)} />
  );
  const isBlock = s.unit === "block";
  return (
    <CalcShell
      compact={compact}
      form={
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {field("l", "Wall length", "ft")}
            {field("h", "Wall height", "ft")}
            <SelectField id="bk-unit" label="Unit" value={s.unit} onChange={(v) => set("unit", v)} options={Object.entries(UNITS).map(([value, u]) => ({ value, label: u.label }))} />
          </div>
          {!compact && (
            <div className="grid gap-4 sm:grid-cols-3">
              {field("doors", "Doors", "pcs", "21 sq ft each")}
              {field("windows", "Windows", "pcs", "15 sq ft each")}
              {field("waste", "Extra units", "%", "BIA: at least 5%")}
            </div>
          )}
          <ErrorNote message={error} />
          {!compact && <ToolActions onReset={reset} />}
        </>
      }
      result={
        <>
          <BigResult label="Buy" value={result ? result.units : null} decimals={0} unit={isBlock ? "blocks" : "bricks"} sub={result ? `${result.bags} × 80 lb bags of mortar mix` : undefined} />
          <Separator />
          <Breakdown
            rows={[
              ["Wall area", result ? `${fmt(result.areaSqFt)} sq ft` : "–"],
              ["Per sq ft", fmt(UNITS[s.unit as keyof typeof UNITS]?.perSqFt ?? NaN, 3)],
              ["Before extras", result ? fmt(result.netUnits, 0) : "–"],
              ["Mortar", result?.mortarCuFt != null ? `${fmt(result.mortarCuFt)} cu ft` : result ? "13 blocks per bag" : "–"],
            ]}
          />
          {!compact && <p className="text-muted-foreground text-xs">Single wythe, 3/8 in joints. Footings and reinforcement are extra.</p>}
        </>
      }
    />
  );
}
