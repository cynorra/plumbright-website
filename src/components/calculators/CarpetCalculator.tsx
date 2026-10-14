import * as React from "react";
import { ROLL_WIDTHS, carpetEstimate } from "@/lib/calc/carpet.js";
import { num, fmt } from "@/lib/calc/util.js";
import { Separator } from "@/components/ui/separator";
import { NumField, BigResult, Breakdown, ErrorNote, useUrlState, ToolActions, safe, SelectField, CalcShell } from "./parts";

const DEFAULTS = { l: "14", w: "12", roll: "12", price: "" };

export default function CarpetCalculator({ compact = false }: { compact?: boolean }) {
  const [s, set, reset] = useUrlState(DEFAULTS, !compact);
  const { result, error } = safe(() => carpetEstimate({ lengthFt: num(s.l), widthFt: num(s.w), rollWidthFt: num(s.roll) }));
  const price = num(s.price);
  const field = (key: keyof typeof DEFAULTS, label: string, unit?: string, hint?: string) => (
    <NumField id={`cp-${key}`} label={label} unit={unit} hint={hint} value={s[key]} onChange={(v) => set(key, v)} />
  );
  return (
    <CalcShell
      compact={compact}
      form={
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {field("l", "Room length", "ft")}
            {field("w", "Room width", "ft")}
            <SelectField id="cp-roll" label="Roll width" value={s.roll} onChange={(v) => set("roll", v)} options={ROLL_WIDTHS.map((r) => ({ value: String(r), label: `${r} ft` }))} />
          </div>
          {!compact && <div className="grid gap-4 sm:grid-cols-3">{field("price", "Price", "$/sq yd", "Optional")}</div>}
          <ErrorNote message={error} />
          {!compact && <ToolActions onReset={reset} />}
        </>
      }
      result={
        <>
          <BigResult label="Buy" value={result ? result.buySqYd : null} decimals={2} unit="sq yd" sub={result ? `${result.drops} piece${result.drops > 1 ? "s" : ""} of ${s.roll} × ${fmt(result.cutLengthFt)} ft · ${result.seams} seam${result.seams === 1 ? "" : "s"}` : undefined} />
          <Separator />
          <Breakdown
            rows={[
              ["Room", result ? `${fmt(result.roomSqYd)} sq yd` : "–"],
              ["Waste", result ? `${fmt(result.wastePct, 1)}%` : "–"],
              ["Pad", result ? `${result.padSqYd} sq yd` : "–"],
              ["Tack strip", result ? `${fmt(result.tackStripFt, 0)} ft` : "–"],
              ...(result && Number.isFinite(price) && price > 0 ? [["Carpet cost", `$${fmt(result.buySqYd * price, 2)}`] as [string, string]] : []),
            ]}
          />
          {!compact && <p className="text-muted-foreground text-xs">Pieces run the same direction so the nap matches at seams.</p>}
        </>
      }
    />
  );
}
