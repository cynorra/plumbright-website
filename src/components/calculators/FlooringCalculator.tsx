import * as React from "react";
import { FLOORING_LAYOUTS, flooringEstimate, flooringWaste } from "@/lib/calc/flooring.js";
import { rectArea } from "@/lib/calc/tile.js";
import { num, fmt } from "@/lib/calc/util.js";
import { Separator } from "@/components/ui/separator";
import { NumField, BigResult, Breakdown, ErrorNote, useUrlState, ToolActions, safe, SegField, SwitchField, CalcShell } from "./parts";

const DEFAULTS = {
  area: "dims", l: "15", w: "12", sqft: "180",
  perbox: "22", layout: "straight", complex: "0", waste: "10",
  price: "", roll: "100",
};

export default function FlooringCalculator({ compact = false }: { compact?: boolean }) {
  const [s, set, reset] = useUrlState(DEFAULTS, !compact);

  const { result, error } = safe(() => {
    const area = s.area === "dims" ? rectArea(num(s.l), num(s.w)) : num(s.sqft);
    const waste = num(s.waste);
    return flooringEstimate({
      areaSqFt: area,
      sqFtPerBox: num(s.perbox),
      wastePct: Number.isFinite(waste) ? waste : 0,
      pricePerSqFt: num(s.price),
      underlaymentRollSqFt: num(s.roll),
    });
  });

  const field = (key: keyof typeof DEFAULTS, label: string, unit?: string, hint?: string) => (
    <NumField id={`fl-${key}`} label={label} unit={unit} hint={hint} value={s[key]} onChange={(v) => set(key, v)} />
  );
  const setWaste = (layout: string, complex: string) => set("waste", String(flooringWaste(layout, complex === "1")));

  return (
    <CalcShell
      compact={compact}
      form={
        <>
          <SegField
            id="fl-area"
            label="Floor area"
            value={s.area}
            onChange={(v) => set("area", v)}
            options={[
              { value: "dims", label: "Length × width" },
              { value: "sqft", label: "I know the sq ft" },
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {s.area === "dims" ? (
              <>
                {field("l", "Room length", "ft")}
                {field("w", "Room width", "ft")}
              </>
            ) : (
              field("sqft", "Area", "sq ft", "Add rooms together")
            )}
            {field("perbox", "Box covers", "sq ft", "Printed on the box")}
          </div>
          {!compact && (
            <>
              <SegField
                id="fl-layout"
                label="Layout"
                value={s.layout}
                onChange={(v) => {
                  set("layout", v);
                  setWaste(v, s.complex);
                }}
                options={Object.entries(FLOORING_LAYOUTS).map(([value, l]) => ({ value, label: l.label }))}
              />
              <SwitchField
                id="fl-complex"
                label="Closets, many corners or several doorways (+5%)"
                value={s.complex}
                onChange={(v) => {
                  set("complex", v);
                  setWaste(s.layout, v);
                }}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                {field("waste", "Waste", "%", "Set by layout; edit if you like")}
                {field("price", "Price", "$/sq ft", "Optional")}
                {field("roll", "Underlayment roll", "sq ft", "Blank if pad is attached")}
              </div>
            </>
          )}
          <ErrorNote message={error} />
          {!compact && <ToolActions onReset={reset} />}
        </>
      }
      result={
        <>
          <BigResult label="Buy" value={result ? result.boxes : null} decimals={0} unit="boxes" sub={result ? `${fmt(result.boughtSqFt)} sq ft in those boxes` : undefined} />
          <Separator />
          <Breakdown
            rows={[
              ["Floor area", result ? `${fmt(result.areaSqFt)} sq ft` : "–"],
              ["With waste", result ? `${fmt(result.withWasteSqFt)} sq ft` : "–"],
              ["Left over", result ? `${fmt(result.spareSqFt)} sq ft` : "–"],
              ...(result?.underlaymentRolls ? [["Underlayment", `${result.underlaymentRolls} rolls`] as [string, string]] : []),
              ...(result?.cost != null ? [["Flooring cost", `$${fmt(result.cost, 2)}`] as [string, string]] : []),
            ]}
          />
          {!compact && <p className="text-muted-foreground text-xs">Keep a full box after the job for repairs. Buy every box from the same lot.</p>}
        </>
      }
    />
  );
}
