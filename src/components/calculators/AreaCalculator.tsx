import * as React from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { SHAPES, totalArea, convertArea } from "@/lib/calc/area.js";
import { num, fmt } from "@/lib/calc/util.js";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { NumField, BigResult, Breakdown, ErrorNote, useUrlState, ToolActions, safe, SelectField, SwitchField, CalcShell } from "./parts";

const MAX = 4;
const DEFAULTS = {
  n: "1",
  s1: "rectangle", a1: "12", b1: "10", c1: "", x1: "0",
  s2: "rectangle", a2: "", b2: "", c2: "", x2: "0",
  s3: "rectangle", a3: "", b3: "", c3: "", x3: "0",
  s4: "rectangle", a4: "", b4: "", c4: "", x4: "0",
};
type Key = keyof typeof DEFAULTS;
const shapeOptions = Object.entries(SHAPES).map(([value, s]) => ({ value, label: s.label }));

export default function AreaCalculator({ compact = false }: { compact?: boolean }) {
  const [s, set, reset] = useUrlState(DEFAULTS, !compact);
  const n = Math.min(MAX, Math.max(1, Math.round(num(s.n)) || 1));
  const idx = Array.from({ length: n }, (_, i) => i + 1);
  const k = (name: string, i: number) => `${name}${i}` as Key;

  const { result, error } = safe(() => {
    const t = totalArea(
      idx.map((i) => ({
        shape: s[k("s", i)],
        a: num(s[k("a", i)]),
        b: num(s[k("b", i)]),
        c: num(s[k("c", i)]),
        subtract: s[k("x", i)] === "1",
      })),
    );
    return { t, c: convertArea(t.sqft) };
  });

  function remove(i: number) {
    // Shift later parts up so the list stays contiguous.
    for (let j = i; j < n; j++) {
      for (const f of ["s", "a", "b", "c", "x"]) set(k(f, j), s[k(f, j + 1)]);
    }
    for (const f of ["s", "a", "b", "c", "x"]) set(k(f, n), DEFAULTS[k(f, n)]);
    set("n", String(n - 1));
  }

  return (
    <CalcShell
      compact={compact}
      form={
        <>
          <ol className="grid gap-5">
            {idx.map((i) => {
              const shape = SHAPES[s[k("s", i)] as keyof typeof SHAPES] ?? SHAPES.rectangle;
              return (
                <li key={i} className="grid gap-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">{n > 1 ? `Area ${i}` : "Your area"}</span>
                    {n > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)} aria-label={`Remove area ${i}`}>
                        <XIcon />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <SelectField id={`ac-s${i}`} label="Shape" value={s[k("s", i)]} onChange={(v) => set(k("s", i), v)} options={shapeOptions} />
                    <NumField id={`ac-a${i}`} label={shape.a} unit="ft" value={s[k("a", i)]} onChange={(v) => set(k("a", i), v)} />
                    {shape.b && <NumField id={`ac-b${i}`} label={shape.b} unit="ft" value={s[k("b", i)]} onChange={(v) => set(k("b", i), v)} />}
                    {shape.c && <NumField id={`ac-c${i}`} label={shape.c} unit="ft" value={s[k("c", i)]} onChange={(v) => set(k("c", i), v)} />}
                  </div>
                  {i > 1 && <SwitchField id={`ac-x${i}`} label="Subtract this area (a cut-out)" value={s[k("x", i)]} onChange={(v) => set(k("x", i), v)} />}
                </li>
              );
            })}
          </ol>
          {n < MAX && (
            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => set("n", String(n + 1))}>
              <PlusIcon /> Add another area
            </Button>
          )}
          <p className="text-muted-foreground text-xs">Inches? Divide by 12: 6 in = 0.5 ft, 3 in = 0.25 ft.</p>
          <ErrorNote message={error} />
          {!compact && <ToolActions onReset={reset} />}
        </>
      }
      result={
        <>
          <BigResult label="Total area" value={result ? result.c.sqft : null} decimals={2} unit="sq ft" />
          <Separator />
          <Breakdown
            rows={[
              ["Square yards", result ? `${fmt(result.c.sqyd)} sq yd` : "–"],
              ["Square meters", result ? `${fmt(result.c.sqm)} m²` : "–"],
              ["Acres", result ? fmt(result.c.acres, 4) : "–"],
              ...(result && result.t.rows.length > 1
                ? result.t.rows.map((r: { sqft: number; subtract?: boolean }, i: number) => [`Area ${i + 1}`, `${r.subtract ? "− " : ""}${fmt(r.sqft)} sq ft`] as [string, string])
                : []),
            ]}
          />
          {!compact && <p className="text-muted-foreground text-xs">Flooring and tile are sold by the square foot; carpet often by the square yard.</p>}
        </>
      }
    />
  );
}
