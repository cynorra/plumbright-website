import * as React from "react";
import { BOARD_LENGTHS, deckEstimate } from "@/lib/calc/deck.js";
import { num, fmt } from "@/lib/calc/util.js";
import { Separator } from "@/components/ui/separator";
import { NumField, BigResult, Breakdown, ErrorNote, useUrlState, ToolActions, safe, SelectField, CalcShell } from "./parts";

const DEFAULTS = {
  l: "16", w: "12", bw: "5.5", gap: "0.1875", bl: "16", js: "16", waste: "5",
};

export default function DeckCalculator({ compact = false }: { compact?: boolean }) {
  const [s, set, reset] = useUrlState(DEFAULTS, !compact);

  const { result, error } = safe(() => {
    const waste = num(s.waste);
    return deckEstimate({
      lengthFt: num(s.l),
      widthFt: num(s.w),
      boardWidthIn: num(s.bw),
      gapIn: num(s.gap) || 0,
      boardLengthFt: num(s.bl),
      joistSpacingIn: num(s.js),
      wastePct: Number.isFinite(waste) ? waste : 0,
    });
  });

  const field = (key: keyof typeof DEFAULTS, label: string, unit?: string, hint?: string) => (
    <NumField id={`dk-${key}`} label={label} unit={unit} hint={hint} value={s[key]} onChange={(v) => set(key, v)} />
  );

  return (
    <CalcShell
      compact={compact}
      form={
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("l", "Deck length", "ft", "The direction the boards run")}
            {field("w", "Deck width", "ft", "Across the boards")}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {field("bw", "Board width", "in", "Actual: a 6 in board is 5.5")}
            <SelectField
              id="dk-bl"
              label="Board length"
              value={s.bl}
              onChange={(v) => set("bl", v)}
              options={BOARD_LENGTHS.map((l) => ({ value: String(l), label: `${l} ft` }))}
            />
            <SelectField
              id="dk-js"
              label="Joist spacing"
              value={s.js}
              onChange={(v) => set("js", v)}
              options={[
                { value: "12", label: "12 in on center" },
                { value: "16", label: "16 in on center" },
                { value: "24", label: "24 in on center" },
              ]}
            />
          </div>
          {!compact && (
            <div className="grid gap-4 sm:grid-cols-3">
              {field("gap", "Gap", "in", "3/16 = 0.1875 · 1/8 = 0.125")}
              {field("waste", "Extra boards", "%", "For splits and bad boards")}
            </div>
          )}
          <ErrorNote message={error} />
          {!compact && <ToolActions onReset={reset} />}
        </>
      }
      result={
        <>
          <BigResult label="Buy" value={result ? result.boards : null} decimals={0} unit={`${s.bl} ft boards`} sub={result ? `${fmt(result.linearFt, 0)} linear ft of decking` : undefined} />
          <Separator />
          <Breakdown
            rows={[
              ["Deck area", result ? `${fmt(result.areaSqFt)} sq ft` : "–"],
              ["Rows of boards", result ? fmt(result.rows, 0) : "–"],
              ["Joists", result ? `${result.joists} × ${s.w || "–"} ft` : "–"],
              ["Deck screws", result ? `about ${fmt(result.screws, 0)}` : "–"],
            ]}
          />
          {!compact && <p className="text-muted-foreground text-xs">Joist count excludes rim joists and doubled joists at board seams.</p>}
        </>
      }
    />
  );
}
