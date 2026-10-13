import * as React from "react";
import { ROOF_STYLES, roofEstimate, pitchAngle } from "@/lib/calc/roofing.js";
import { num, fmt } from "@/lib/calc/util.js";
import { Separator } from "@/components/ui/separator";
import { NumField, BigResult, Breakdown, ErrorNote, useUrlState, ToolActions, safe, SegField, SelectField, CalcShell } from "./parts";

const PITCHES = [3, 4, 5, 6, 7, 8, 9, 10, 12];
const DEFAULTS = { l: "40", w: "30", pitch: "6", style: "gable", waste: "10", bps: "3" };

export default function RoofingCalculator({ compact = false }: { compact?: boolean }) {
  const [s, set, reset] = useUrlState(DEFAULTS, !compact);

  const { result, error } = safe(() => {
    const waste = num(s.waste);
    return roofEstimate({
      lengthFt: num(s.l),
      widthFt: num(s.w),
      rise: num(s.pitch),
      style: s.style,
      wastePct: Number.isFinite(waste) ? waste : undefined,
      bundlesPerSquare: num(s.bps),
    });
  });

  const field = (key: keyof typeof DEFAULTS, label: string, unit?: string, hint?: string) => (
    <NumField id={`rf-${key}`} label={label} unit={unit} hint={hint} value={s[key]} onChange={(v) => set(key, v)} />
  );

  return (
    <CalcShell
      compact={compact}
      form={
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {field("l", "Footprint length", "ft", "Include the overhangs")}
            {field("w", "Footprint width", "ft")}
            <SelectField
              id="rf-pitch"
              label="Pitch"
              value={s.pitch}
              onChange={(v) => set("pitch", v)}
              options={PITCHES.map((p) => ({ value: String(p), label: `${p}/12 (${fmt(pitchAngle(p), 1)}°)` }))}
            />
          </div>
          <SegField
            id="rf-style"
            label="Roof style"
            value={s.style}
            onChange={(v) => {
              set("style", v);
              set("waste", String(ROOF_STYLES[v as keyof typeof ROOF_STYLES].wastePct));
            }}
            options={Object.entries(ROOF_STYLES).map(([value, r]) => ({ value, label: r.label }))}
          />
          {!compact && (
            <div className="grid gap-4 sm:grid-cols-3">
              {field("waste", "Waste", "%", "Set by style; edit if you like")}
              {field("bps", "Bundles per square", "×", "3 for most shingles")}
            </div>
          )}
          <ErrorNote message={error} />
          {!compact && <ToolActions onReset={reset} />}
        </>
      }
      result={
        <>
          <BigResult label="Buy" value={result ? result.bundles : null} decimals={0} unit="bundles" sub={result ? `${fmt(result.squaresWithWaste)} squares with waste` : undefined} />
          <Separator />
          <Breakdown
            rows={[
              ["Roof area", result ? `${fmt(result.roofSqFt, 0)} sq ft` : "–"],
              ["Pitch multiplier", result ? `× ${fmt(result.multiplier, 3)}` : "–"],
              ["Ridge cap", result ? `${fmt(result.ridgeCapFt, 0)} ft` : "–"],
              ["Starter strip", result ? `${fmt(result.starterFt, 0)} ft` : "–"],
              ["Drip edge", result ? `${result.dripEdgePieces} × 10 ft` : "–"],
              ["Underlayment", result ? `${result.underlaymentRolls} × 10-square roll` : "–"],
            ]}
          />
          {!compact && <p className="text-muted-foreground text-xs">Measure from the ground. Roof work is dangerous; leave it to a pro if you're unsure.</p>}
        </>
      }
    />
  );
}
