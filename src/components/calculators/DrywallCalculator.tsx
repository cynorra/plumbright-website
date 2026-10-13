import * as React from "react";
import { SHEETS, DOOR_SQFT, WINDOW_SQFT, drywallArea, drywallEstimate } from "@/lib/calc/drywall.js";
import { num, fmt } from "@/lib/calc/util.js";
import { Separator } from "@/components/ui/separator";
import { NumField, BigResult, Breakdown, ErrorNote, useUrlState, ToolActions, safe, SegField, SwitchField, SelectField, CalcShell } from "./parts";

const DEFAULTS = {
  mode: "room", l: "12", w: "12", h: "8", doors: "1", windows: "1", ceiling: "1",
  walls: "350", ceil: "0",
  sheet: "4x8", waste: "10", framing: "16",
};

export default function DrywallCalculator({ compact = false }: { compact?: boolean }) {
  const [s, set, reset] = useUrlState(DEFAULTS, !compact);

  const { result, error } = safe(() => {
    let wallSqFt: number, ceilingSqFt: number;
    if (s.mode === "room") {
      const a = drywallArea({
        lengthFt: num(s.l), widthFt: num(s.w), heightFt: num(s.h),
        doors: num(s.doors) || 0, windows: num(s.windows) || 0, includeCeiling: s.ceiling === "1",
      });
      wallSqFt = a.walls;
      ceilingSqFt = a.ceiling;
    } else {
      wallSqFt = num(s.walls) || 0;
      ceilingSqFt = num(s.ceil) || 0;
    }
    const waste = num(s.waste);
    return drywallEstimate({ wallSqFt, ceilingSqFt, sheet: s.sheet, wastePct: Number.isFinite(waste) ? waste : 0, framingIn: num(s.framing) || 16 });
  });

  const field = (key: keyof typeof DEFAULTS, label: string, unit?: string, hint?: string) => (
    <NumField id={`dw-${key}`} label={label} unit={unit} hint={hint} value={s[key]} onChange={(v) => set(key, v)} />
  );

  return (
    <CalcShell
      compact={compact}
      form={
        <>
          <SegField
            id="dw-mode"
            label="What are you covering?"
            value={s.mode}
            onChange={(v) => set("mode", v)}
            options={[
              { value: "room", label: "A room" },
              { value: "area", label: "I know the sq ft" },
            ]}
          />
          {s.mode === "room" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                {field("l", "Room length", "ft")}
                {field("w", "Room width", "ft")}
                {field("h", "Wall height", "ft")}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {field("doors", "Doors", "pcs", `${DOOR_SQFT} sq ft each`)}
                {field("windows", "Windows", "pcs", `${WINDOW_SQFT} sq ft each`)}
              </div>
              <SwitchField id="dw-ceiling" label="Include the ceiling" value={s.ceiling} onChange={(v) => set("ceiling", v)} />
            </>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {field("walls", "Wall area", "sq ft")}
              {field("ceil", "Ceiling area", "sq ft", "0 if none")}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField
              id="dw-sheet"
              label="Sheet size"
              value={s.sheet}
              onChange={(v) => set("sheet", v)}
              options={Object.keys(SHEETS).map((k) => ({ value: k, label: `${k.replace("x", " × ")} ft` }))}
            />
            {!compact && field("waste", "Waste", "%", "10% for most rooms")}
            {!compact && (
              <SelectField
                id="dw-framing"
                label="Framing"
                value={s.framing}
                onChange={(v) => set("framing", v)}
                options={[
                  { value: "16", label: "16 in on center" },
                  { value: "24", label: "24 in on center" },
                ]}
              />
            )}
          </div>
          <ErrorNote message={error} />
          {!compact && <ToolActions onReset={reset} />}
        </>
      }
      result={
        <>
          <BigResult
            label="Buy"
            value={result ? result.sheets : null}
            decimals={0}
            unit="sheets"
            sub={result ? `${result.wallSheets} for walls · ${result.ceilingSheets} for the ceiling` : undefined}
          />
          <Separator />
          <Breakdown
            rows={[
              ["Area", result ? `${fmt(result.areaSqFt)} sq ft` : "–"],
              ["Screws", result ? `about ${fmt(result.screws, 0)}` : "–"],
              ["Joint compound", result ? `${fmt(result.mudGal, 1)} gal · ${result.mudPails} × 4.5 gal pail` : "–"],
              ["Paper tape", result ? `${fmt(result.tapeFt, 0)} ft · ${result.tapeRolls} × 500 ft roll` : "–"],
            ]}
          />
          {!compact && <p className="text-muted-foreground text-xs">Ceiling sheets are counted separately: they need closer screw spacing.</p>}
        </>
      }
    />
  );
}
