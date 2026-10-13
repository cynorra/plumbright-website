import * as React from "react";
import { LAYOUTS, tileEstimate, rectArea } from "@/lib/calc/tile.js";
import { num, fmt } from "@/lib/calc/util.js";
import { Segmented } from "@/components/motion/segmented";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { NumField, ResultPanel, BigResult, Breakdown, ErrorNote, useUrlState, ToolActions, safe } from "./parts";
import { cn } from "@/lib/utils";

const DEFAULTS = {
  area: "dims", l: "10", w: "10", sqft: "100",
  tw: "12", tl: "12", grout: "0.125",
  layout: "straight", waste: "10",
  boxtype: "sqft", perbox: "",
};

export default function TileCalculator({ compact = false }: { compact?: boolean }) {
  const [s, set, reset] = useUrlState(DEFAULTS, !compact);

  const { result, error } = safe(() => {
    const area = s.area === "dims" ? rectArea(num(s.l), num(s.w)) : num(s.sqft);
    const perBox = num(s.perbox);
    const waste = num(s.waste);
    return tileEstimate({
      areaSqFt: area,
      tileWidthIn: num(s.tw),
      tileLengthIn: num(s.tl),
      groutIn: num(s.grout) || 0,
      wastePct: Number.isFinite(waste) ? waste : 0,
      tilesPerBox: s.boxtype === "tiles" ? perBox : undefined,
      sqFtPerBox: s.boxtype === "sqft" ? perBox : undefined,
    });
  });

  const field = (key: keyof typeof DEFAULTS, label: string, unit?: string, hint?: string) => (
    <NumField id={`tc-${key}`} label={label} unit={unit} hint={hint} value={s[key]} onChange={(v) => set(key, v)} />
  );

  return (
    <div className={cn("grid md:grid-cols-[minmax(0,1fr)_minmax(0,21rem)]", compact && "md:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]")}>
      <form className="flex min-w-0 flex-col gap-6 p-5 md:p-6" onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="grid gap-2">
          <span id="tc-area-label" className="text-sm font-medium">Area to tile</span>
          <Segmented
            value={s.area}
            onChange={(v) => set("area", v)}
            labelledBy="tc-area-label"
            options={[
              { value: "dims", label: "Length × width" },
              { value: "sqft", label: "I know the sq ft" },
            ]}
          />
        </div>
        {s.area === "dims" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {field("l", "Length", "ft")}
            {field("w", "Width", "ft")}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">{field("sqft", "Area", "sq ft", "Add rooms; subtract cabinets or a tub")}</div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {field("tw", "Tile width", "in")}
          {field("tl", "Tile length", "in")}
          {field("grout", "Grout joint", "in", "1/8 = 0.125 · 1/16 = 0.0625")}
        </div>

        {!compact && (
          <>
            <div className="grid gap-2">
              <span id="tc-layout-label" className="text-sm font-medium">Layout</span>
              <Segmented
                value={s.layout}
                onChange={(v) => {
                  set("layout", v);
                  set("waste", String(LAYOUTS[v as keyof typeof LAYOUTS].wastePct));
                }}
                labelledBy="tc-layout-label"
                options={Object.entries(LAYOUTS).map(([key, l]) => ({ value: key, label: l.label }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {field("waste", "Waste", "%", "Set by layout; edit if you like")}
              <div className="grid min-w-0 gap-2">
                <Label htmlFor="tc-boxtype">Box label shows</Label>
                <Select value={s.boxtype} onValueChange={(v) => set("boxtype", v)}>
                  <SelectTrigger id="tc-boxtype"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sqft">Sq ft per box</SelectItem>
                    <SelectItem value="tiles">Tiles per box</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {field("perbox", "Per box", s.boxtype === "sqft" ? "sq ft" : "pcs", "Optional")}
            </div>
          </>
        )}
        <ErrorNote message={error} />
        {!compact && <ToolActions onReset={reset} />}
      </form>

      <ResultPanel className={compact ? "md:rounded-r-xl" : "rounded-b-xl md:rounded-bl-none md:rounded-r-xl"}>
        <BigResult
          label="Buy"
          value={result ? result.tiles : null}
          decimals={0}
          unit="tiles"
          sub={result?.boxes != null ? `${fmt(result.boxes, 0)} boxes` : `${s.waste || 0}% waste included`}
        />
        <Separator />
        <Breakdown
          rows={[
            ["Area", result ? `${fmt(result.areaSqFt)} sq ft` : "–"],
            ["With waste", result ? `${fmt(result.areaWithWasteSqFt)} sq ft` : "–"],
            ["One tile covers", result ? `${fmt(result.coveragePerTileSqFt, 3)} sq ft` : "–"],
            ["Before waste", result ? `${fmt(result.netTiles, 1)} tiles` : "–"],
          ]}
        />
        {!compact && <p className="text-muted-foreground text-xs">Buy every box from the same lot number; shade can shift between runs.</p>}
      </ResultPanel>
    </div>
  );
}
