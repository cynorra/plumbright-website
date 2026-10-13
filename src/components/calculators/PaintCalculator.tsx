import * as React from "react";
import { roomArea, paintEstimate, DOOR_SQFT, WINDOW_SQFT, DEFAULT_COVERAGE } from "@/lib/calc/paint.js";
import { num, fmt } from "@/lib/calc/util.js";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { NumField, ResultPanel, BigResult, Breakdown, ErrorNote, useUrlState, ToolActions, safe } from "./parts";
import { cn } from "@/lib/utils";

const DEFAULTS = {
  l: "12", w: "12", h: "8",
  doors: "1", windows: "1", coats: "2",
  cov: String(DEFAULT_COVERAGE),
  ceiling: "0", primer: "0",
};

export const buyText = (p: { gallons: number; quarts: number }) =>
  [p.gallons ? `${p.gallons} gal` : "", p.quarts ? `${p.quarts} qt` : ""].filter(Boolean).join(" + ") || "–";

export default function PaintCalculator({ compact = false }: { compact?: boolean }) {
  const [s, set, reset] = useUrlState(DEFAULTS, !compact);

  const { result, error } = safe(() => {
    const a = roomArea({
      lengthFt: num(s.l),
      widthFt: num(s.w),
      heightFt: num(s.h),
      doors: num(s.doors) || 0,
      windows: num(s.windows) || 0,
      includeCeiling: s.ceiling === "1",
    });
    const p = paintEstimate({ areaSqFt: a.total, coats: num(s.coats), coverageSqFtPerGal: num(s.cov), primer: s.primer === "1" });
    return { a, p };
  });

  const field = (key: keyof typeof DEFAULTS, label: string, unit?: string, hint?: string) => (
    <NumField id={`pc-${key}`} label={label} unit={unit} hint={hint} value={s[key]} onChange={(v) => set(key, v)} />
  );

  return (
    <div className={cn("grid md:grid-cols-[minmax(0,1fr)_minmax(0,21rem)]", compact && "md:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]")}>
      <form className="flex min-w-0 flex-col gap-6 p-5 md:p-6" onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="grid gap-4 sm:grid-cols-3">
          {field("l", "Room length", "ft")}
          {field("w", "Room width", "ft")}
          {field("h", "Wall height", "ft")}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {field("doors", "Doors", "pcs", `${DOOR_SQFT} sq ft each`)}
          {field("windows", "Windows", "pcs", `${WINDOW_SQFT} sq ft each`)}
          {field("coats", "Coats", "×")}
        </div>
        {!compact && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">{field("cov", "Coverage", "sq ft/gal", "Check your paint's label")}</div>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <div className="flex items-center gap-3">
                <Switch id="pc-ceiling" checked={s.ceiling === "1"} onCheckedChange={(c) => set("ceiling", c ? "1" : "0")} />
                <Label htmlFor="pc-ceiling">Include the ceiling</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="pc-primer" checked={s.primer === "1"} onCheckedChange={(c) => set("primer", c ? "1" : "0")} />
                <Label htmlFor="pc-primer">Add primer (1 coat)</Label>
              </div>
            </div>
          </>
        )}
        <ErrorNote message={error} />
        {!compact && <ToolActions onReset={reset} />}
      </form>

      <ResultPanel className={compact ? "md:rounded-r-xl" : "rounded-b-xl md:rounded-bl-none md:rounded-r-xl"}>
        <BigResult
          label="Paint"
          value={result ? result.p.paintGallons : null}
          decimals={1}
          unit="gallons"
          sub={result ? <>Buy <strong className="text-foreground">{buyText(result.p.paintToBuy)}</strong></> : undefined}
        />
        {result && s.primer === "1" && (
          <p className="text-sm">
            Primer: <span className="num">{fmt(result.p.primerGallons, 1)} gal</span> · buy{" "}
            <strong className="num">{buyText(result.p.primerToBuy)}</strong>
          </p>
        )}
        <Separator />
        <Breakdown
          rows={[
            ["Walls", result ? `${fmt(result.a.grossWalls)} sq ft` : "–"],
            ["Doors and windows", result ? `− ${fmt(result.a.openings)} sq ft` : "–"],
            ["Ceiling", result ? `${fmt(result.a.ceiling)} sq ft` : "–"],
            ["To paint", result ? `${fmt(result.a.total)} sq ft` : "–"],
          ]}
        />
        {!compact && <p className="text-muted-foreground text-xs">Ceiling paint is usually a different product. Buy it separately.</p>}
      </ResultPanel>
    </div>
  );
}
