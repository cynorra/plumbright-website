import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Segmented control: Radix ToggleGroup for keyboard and screen-reader
 * behaviour, with a highlight that slides between options (shared layout
 * animation). Falls back to an instant switch under reduced motion.
 */
export function Segmented({
  value,
  onChange,
  options,
  labelledBy,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  labelledBy?: string;
  className?: string;
}) {
  const id = React.useId();
  const reduce = useReducedMotion();
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v)}
      aria-labelledby={labelledBy}
      className={cn("bg-muted inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-lg p-1", className)}
    >
      {options.map((o) => (
        <ToggleGroupPrimitive.Item
          key={o.value}
          value={o.value}
          className="text-muted-foreground hover:text-foreground data-[state=on]:text-foreground focus-visible:ring-ring/50 relative inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px]"
        >
          {value === o.value && (
            <motion.span
              layoutId={`seg-${id}`}
              className="bg-background dark:bg-input/50 absolute inset-0 rounded-md shadow-sm"
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
              aria-hidden="true"
            />
          )}
          <span className="relative z-10">{o.label}</span>
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  );
}
