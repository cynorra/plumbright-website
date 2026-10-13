import * as React from "react";
import { MATERIALS, gravelVolume, gravelOrder } from "@/lib/calc/gravel.js";
import { num, fmt } from "@/lib/calc/util.js";
import { Separator } from "@/components/ui/separator";
import { NumField, BigResult, Breakdown, ErrorNote, useUrlState, ToolActions, safe, SegField, SelectField, CalcShell } from "./parts";

const DEFAULTS = {
  shape: "rect", l: "20", w: "10", d: "10", depth: "4",
  mat: "crushed", lb: String(MATERIALS.crushed.lbPerYd), comp: String(MATERIALS.crushed.compactPct),
  bag: "0.5",
};

export default function GravelCalculator({ compact = false }: { compact?: boolean }) {
  const [s, set, reset] = useUrlState(DEFAULTS, !compact);

  const { result, error } = safe(() => {
    const v = gravelVolume({ shape: s.shape, lengthFt: num(s.l), widthFt: num(s.w), diameterFt: num(s.d), depthIn: num(s.depth) });
    const o = gravelOrder({ cuFt: v.cuFt, lbPerYd: num(s.lb), compactPct: num(s.comp) || 0, bagCuFt: num(s.bag) || 0 });
    return { v, o };
  });

  const field = (key: keyof typeof DEFAULTS, label: string, unit?: string, hint?: string) => (
    <NumField id={`gv-${key}`} label={label} unit={unit} hint={hint} value={s[key]} onChange={(v) => set(key, v)} />
  );

  return (
    <CalcShell
      compact={compact}
      form={
        <>
          <SegField
            id="gv-shape"
            label="Area shape"
            value={s.shape}
            onChange={(v) => set("shape", v)}
            options={[
              { value: "rect", label: "Rectangle" },
              { value: "circle", label: "Circle" },
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {s.shape === "rect" ? (
              <>
                {field("l", "Length", "ft")}
                {field("w", "Width", "ft")}
              </>
            ) : (
              field("d", "Diameter", "ft")
            )}
            {field("depth", "Depth", "in")}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField
              id="gv-mat"
              label="Material"
              value={s.mat}
              onChange={(v) => {
                const m = MATERIALS[v as keyof typeof MATERIALS];
                set("mat", v);
                set("lb", String(m.lbPerYd));
                set("comp", String(m.compactPct));
              }}
              options={Object.entries(MATERIALS).map(([value, m]) => ({ value, label: m.label }))}
            />
            {!compact && field("lb", "Weight", "lb/yd³", "Ask your supplier")}
            {!compact && field("comp", "Compaction", "%", "Extra for a compacted base")}
          </div>
          {!compact && <div className="grid gap-4 sm:grid-cols-3">{field("bag", "Bag size", "cu ft", "0.5 cu ft is common")}</div>}
          <ErrorNote message={error} />
          {!compact && <ToolActions onReset={reset} />}
        </>
      }
      result={
        <>
          <BigResult label="Order" value={result ? result.o.cubicYards : null} decimals={2} unit="cubic yards" sub={result ? `about ${fmt(result.o.tons)} tons · round up to ${fmt(result.o.orderYards)} yd³` : undefined} />
          <Separator />
          <Breakdown
            rows={[
              ["Area", result ? `${fmt(result.v.areaSqFt)} sq ft` : "–"],
              ["Volume", result ? `${fmt(result.o.cuFt)} cu ft` : "–"],
              ["Weight", result ? `${fmt(result.o.tons * 2000, 0)} lb` : "–"],
              ["Or in bags", result?.o.bags ? `${fmt(result.o.bags, 0)} bags` : "–"],
            ]}
          />
          {!compact && <p className="text-muted-foreground text-xs">Bulk is cheaper past about one cubic yard. Most yards sell by the ton or half yard.</p>}
        </>
      }
    />
  );
}
