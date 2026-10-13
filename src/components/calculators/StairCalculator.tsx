import * as React from "react";
import { stairLayout, toFraction } from "@/lib/calc/stairs.js";
import { num, fmt } from "@/lib/calc/util.js";
import { Separator } from "@/components/ui/separator";
import { NumField, BigResult, Breakdown, ErrorNote, useUrlState, ToolActions, safe, CheckRow, CalcShell } from "./parts";

const DEFAULTS = { rise: "108", target: "7.5", tread: "10.5", width: "36" };

const ftIn = (inches: number) => {
  const ft = Math.floor(inches / 12);
  return `${ft} ft ${toFraction(inches - ft * 12)} in`;
};

export default function StairCalculator({ compact = false }: { compact?: boolean }) {
  const [s, set, reset] = useUrlState(DEFAULTS, !compact);

  const { result, error } = safe(() =>
    stairLayout({ totalRiseIn: num(s.rise), targetRiserIn: num(s.target), treadIn: num(s.tread), widthIn: num(s.width) }),
  );

  const field = (key: keyof typeof DEFAULTS, label: string, unit?: string, hint?: string) => (
    <NumField id={`st-${key}`} label={label} unit={unit} hint={hint} value={s[key]} onChange={(v) => set(key, v)} />
  );

  return (
    <CalcShell
      compact={compact}
      form={
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("rise", "Total rise", "in", "Finished floor to finished floor")}
            {field("target", "Riser you'd like", "in", "7 to 7.5 in is comfortable")}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("tread", "Tread run", "in", "Nosing to nosing; 10 in minimum")}
            {field("width", "Stair width", "in", "36 in minimum")}
          </div>
          {result && !compact && (
            <ul className="grid gap-2 rounded-lg border p-4" aria-label="Code checks">
              {result.checks.map((c: { ok: boolean; label: string; value: string }) => (
                <CheckRow key={c.label} {...c} />
              ))}
              <CheckRow ok={result.comfortable} label="Comfort: 2 × riser + tread ≈ 24–25 in" value={`${fmt(result.comfort, 2)} in`} />
            </ul>
          )}
          <ErrorNote message={error} />
          {!compact && <ToolActions onReset={reset} />}
        </>
      }
      result={
        <>
          <BigResult label="Risers" value={result ? result.risers : null} decimals={0} unit={result ? `at ${toFraction(result.riserIn)} in` : "risers"} sub={result ? `${result.treads} treads of ${toFraction(result.treadIn)} in` : undefined} />
          <Separator />
          <Breakdown
            rows={[
              ["Total run", result ? ftIn(result.totalRunIn) : "–"],
              ["Stringer length", result ? ftIn(result.stringerIn) : "–"],
              ["Board to buy", result ? (result.boardFt ? `${result.boardFt} ft 2×12` : "longer than 20 ft") : "–"],
              ["Stringers", result ? `${result.stringers} (16 in apart)` : "–"],
              ["Angle", result ? `${fmt(result.angleDeg, 1)}°` : "–"],
            ]}
          />
          {!compact && <p className="text-muted-foreground text-xs">Checked against the IRC. Your local code may differ; confirm before you cut.</p>}
        </>
      }
    />
  );
}
