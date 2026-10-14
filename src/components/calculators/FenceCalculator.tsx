import * as React from "react";
import { fenceEstimate } from "@/lib/calc/fence.js";
import { num, fmt } from "@/lib/calc/util.js";
import { Separator } from "@/components/ui/separator";
import { NumField, BigResult, Breakdown, ErrorNote, useUrlState, ToolActions, safe, SelectField, CalcShell } from "./parts";

const DEFAULTS = { len: "100", h: "6", sp: "8", gates: "1", gw: "4", pw: "5.5", gap: "0", hole: "10", depth: "30" };

export default function FenceCalculator({ compact = false }: { compact?: boolean }) {
  const [s, set, reset] = useUrlState(DEFAULTS, !compact);
  const { result, error } = safe(() =>
    fenceEstimate({
      lengthFt: num(s.len),
      heightFt: num(s.h),
      spacingFt: num(s.sp),
      gates: num(s.gates) || 0,
      gateWidthFt: num(s.gw) || 0,
      picketWidthIn: num(s.pw),
      gapIn: num(s.gap) || 0,
      holeDiameterIn: num(s.hole),
      holeDepthIn: num(s.depth),
    }),
  );
  const field = (key: keyof typeof DEFAULTS, label: string, unit?: string, hint?: string) => (
    <NumField id={`fc-${key}`} label={label} unit={unit} hint={hint} value={s[key]} onChange={(v) => set(key, v)} />
  );
  return (
    <CalcShell
      compact={compact}
      form={
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {field("len", "Fence length", "ft", "Include the gates")}
            {field("h", "Height", "ft")}
            <SelectField id="fc-sp" label="Post spacing" value={s.sp} onChange={(v) => set("sp", v)} options={[{ value: "6", label: "6 ft on center" }, { value: "8", label: "8 ft on center" }]} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {field("gates", "Gates", "pcs")}
            {field("gw", "Gate width", "ft")}
            {field("pw", "Picket width", "in", "A 1×6 is 5.5 in")}
          </div>
          {!compact && (
            <div className="grid gap-4 sm:grid-cols-3">
              {field("gap", "Gap between pickets", "in", "0 for privacy")}
              {field("hole", "Hole diameter", "in")}
              {field("depth", "Hole depth", "in", "Includes 6 in of gravel")}
            </div>
          )}
          <ErrorNote message={error} />
          {!compact && <ToolActions onReset={reset} />}
        </>
      }
      result={
        <>
          <BigResult label="Posts" value={result ? result.posts : null} decimals={0} unit={result?.postLengthFt ? `× ${result.postLengthFt} ft 4×4` : "posts"} sub={result ? `${result.sections} sections between them` : undefined} />
          <Separator />
          <Breakdown
            rows={[
              ["Rails", result ? `${result.rails} (${result.railsEach} per section)` : "–"],
              ["Pickets", result ? `${fmt(result.pickets, 0)} incl. 5%` : "–"],
              ["Concrete, 80 lb", result ? `${result.bags80} bags` : "–"],
              ["Concrete, 50 lb", result ? `${result.bags50} bags` : "–"],
              ["Picket fasteners", result ? `about ${fmt(result.fasteners, 0)}` : "–"],
            ]}
          />
          {!compact && <p className="text-muted-foreground text-xs">Call 811 before you dig, and check HOA and city height rules.</p>}
        </>
      }
    />
  );
}
