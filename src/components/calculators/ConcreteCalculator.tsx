import * as React from "react";
import { slabVolume, columnVolume, postHoleVolume, concreteOrder } from "@/lib/calc/concrete.js";
import { num, fmt } from "@/lib/calc/util.js";
import { Segmented } from "@/components/motion/segmented";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { Separator } from "@/components/ui/separator";
import { NumField, ResultPanel, BigResult, ErrorNote, useUrlState, ToolActions, safe } from "./parts";
import { cn } from "@/lib/utils";

const DEFAULTS = {
  shape: "slab",
  l: "10", w: "10", t: "4",
  d: "12", h: "4", n: "1",
  holes: "10", hd: "10", depth: "36", gravel: "6", post: "3.5",
  waste: "10",
};

export default function ConcreteCalculator({ compact = false }: { compact?: boolean }) {
  const [s, set, reset] = useUrlState(DEFAULTS, !compact);

  const { result, error } = safe(() => {
    let net: number;
    if (s.shape === "slab") {
      net = slabVolume({ lengthFt: num(s.l), widthFt: num(s.w), thicknessIn: num(s.t) });
    } else if (s.shape === "column") {
      const count = num(s.n);
      if (!Number.isFinite(count) || count < 1) throw new RangeError("Enter how many columns, 1 or more.");
      net = columnVolume({ diameterIn: num(s.d), heightFt: num(s.h) }) * count;
    } else {
      net = postHoleVolume({
        holes: num(s.holes),
        holeDiameterIn: num(s.hd),
        holeDepthIn: num(s.depth),
        gravelBaseIn: num(s.gravel) || 0,
        postWidthIn: num(s.post) || 0,
      });
    }
    const waste = num(s.waste);
    return concreteOrder(net, Number.isFinite(waste) ? waste : 0);
  });

  const field = (key: keyof typeof DEFAULTS, label: string, unit: string, hint?: string) => (
    <NumField id={`cc-${key}`} label={label} unit={unit} hint={hint} value={s[key]} onChange={(v) => set(key, v)} />
  );

  return (
    <div className={cn("grid md:grid-cols-[minmax(0,1fr)_minmax(0,21rem)]", compact && "md:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]")}>
      <form className="flex min-w-0 flex-col gap-6 p-5 md:p-6" onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="grid gap-2">
          <span id="cc-shape-label" className="text-sm font-medium">What are you pouring?</span>
          <Segmented
            value={s.shape}
            onChange={(v) => set("shape", v)}
            labelledBy="cc-shape-label"
            options={[
              { value: "slab", label: "Slab or patio" },
              { value: "column", label: "Round column" },
              { value: "posts", label: "Post holes" },
            ]}
          />
        </div>

        {s.shape === "slab" && (
          <div className="grid gap-4 sm:grid-cols-3">
            {field("l", "Length", "ft")}
            {field("w", "Width", "ft")}
            {field("t", "Thickness", "in", "Patios and walks: 4 in")}
          </div>
        )}
        {s.shape === "column" && (
          <div className="grid gap-4 sm:grid-cols-3">
            {field("d", "Diameter", "in")}
            {field("h", "Height", "ft")}
            {field("n", "How many", "pcs")}
          </div>
        )}
        {s.shape === "posts" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {field("holes", "Number of holes", "pcs")}
            {field("hd", "Hole diameter", "in", "About 3× the post width")}
            {field("depth", "Hole depth", "in")}
            {field("gravel", "Gravel base", "in", "0 if none")}
            {field("post", "Post width", "in", "4×4 = 3.5 in, 6×6 = 5.5 in")}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">{field("waste", "Extra for waste", "%", "5–10% is typical")}</div>
        <ErrorNote message={error} />
        {!compact && <ToolActions onReset={reset} />}
      </form>

      <ResultPanel className={compact ? "md:rounded-r-xl" : "rounded-b-xl md:rounded-bl-none md:rounded-r-xl"}>
        <BigResult
          label="You need"
          value={result ? result.cubicYards : null}
          unit="cubic yards"
          sub={result ? `${fmt(result.totalCuFt)} cu ft including waste` : undefined}
        />
        <Separator />
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">Or in bags</p>
          <ul className="grid grid-cols-2 gap-2">
            {(result?.bags ?? []).map((b) => (
              <li key={b.weight} className="bg-card rounded-md border px-3 py-2">
                <AnimatedNumber value={b.count} decimals={0} className="block text-xl font-semibold" />
                <span className="sr-only"> × </span>
                <span className="text-muted-foreground text-xs">{b.weight} lb bags</span>
              </li>
            ))}
          </ul>
        </div>
        {!compact && <p className="text-muted-foreground text-xs">Standard concrete mix. Check the yield printed on your bag.</p>}
      </ResultPanel>
    </div>
  );
}
