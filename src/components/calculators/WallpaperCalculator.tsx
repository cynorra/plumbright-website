import * as React from "react";
import { ROLLS, wallpaperEstimate } from "@/lib/calc/wallpaper.js";
import { num, fmt } from "@/lib/calc/util.js";
import { Separator } from "@/components/ui/separator";
import { NumField, BigResult, Breakdown, ErrorNote, useUrlState, ToolActions, safe, SegField, SelectField, CalcShell } from "./parts";

const DEFAULTS = { mode: "room", l: "12", w: "12", wall: "12", h: "8", doors: "1", roll: "usDouble", rw: "20.5", rl: "33", rep: "21", match: "straight" };

export default function WallpaperCalculator({ compact = false }: { compact?: boolean }) {
  const [s, set, reset] = useUrlState(DEFAULTS, !compact);
  const { result, error } = safe(() =>
    wallpaperEstimate({
      wallWidthFt: s.mode === "room" ? 2 * (num(s.l) + num(s.w)) : num(s.wall),
      heightFt: num(s.h),
      rollWidthIn: num(s.rw),
      rollLengthFt: num(s.rl),
      repeatIn: num(s.rep) || 0,
      match: s.match,
      doors: s.mode === "room" ? num(s.doors) || 0 : 0,
    }),
  );
  const field = (key: keyof typeof DEFAULTS, label: string, unit?: string, hint?: string) => (
    <NumField id={`wp-${key}`} label={label} unit={unit} hint={hint} value={s[key]} onChange={(v) => set(key, v)} />
  );
  return (
    <CalcShell
      compact={compact}
      form={
        <>
          <SegField id="wp-mode" label="What are you papering?" value={s.mode} onChange={(v) => set("mode", v)} options={[{ value: "room", label: "A whole room" }, { value: "wall", label: "One wall" }]} />
          <div className="grid gap-4 sm:grid-cols-3">
            {s.mode === "room" ? (
              <>
                {field("l", "Room length", "ft")}
                {field("w", "Room width", "ft")}
              </>
            ) : (
              field("wall", "Wall width", "ft")
            )}
            {field("h", "Wall height", "ft")}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField
              id="wp-roll"
              label="Roll size"
              value={s.roll}
              onChange={(v) => {
                const r = ROLLS[v as keyof typeof ROLLS];
                set("roll", v);
                set("rw", String(r.widthIn));
                set("rl", String(r.lengthFt));
              }}
              options={Object.entries(ROLLS).map(([value, r]) => ({ value, label: r.label }))}
            />
            {field("rep", "Pattern repeat", "in", "0 for no pattern")}
            {s.mode === "room" && field("doors", "Doors", "pcs", "3 ft wide each")}
          </div>
          {!compact && (
            <>
              <SegField id="wp-match" label="Pattern match" value={s.match} onChange={(v) => set("match", v)} options={[{ value: "straight", label: "Straight" }, { value: "half", label: "Half-drop" }]} />
              <div className="grid gap-4 sm:grid-cols-3">
                {field("rw", "Roll width", "in", "From the label")}
                {field("rl", "Roll length", "ft")}
              </div>
            </>
          )}
          <ErrorNote message={error} />
          {!compact && <ToolActions onReset={reset} />}
        </>
      }
      result={
        <>
          <BigResult label="Buy" value={result ? result.rolls : null} decimals={0} unit="rolls" sub={result ? `${result.strips} strips, ${result.stripsPerRoll} per roll` : undefined} />
          <Separator />
          <Breakdown
            rows={[
              ["Wall area", result ? `${fmt(result.wallSqFt)} sq ft` : "–"],
              ["Each strip", result ? `${fmt(result.dropIn, 1)} in` : "–"],
              ["One roll", result ? `${fmt(result.rollSqFt)} sq ft` : "–"],
              ["Paper used on the wall", result ? `${result.usedPct}%` : "–"],
            ]}
          />
          {!compact && <p className="text-muted-foreground text-xs">Buy one extra roll from the same batch for repairs.</p>}
        </>
      }
    />
  );
}
