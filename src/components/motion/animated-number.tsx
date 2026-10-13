import * as React from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * A number that springs to its new value when an input changes.
 * Adapted from Motion Primitives' AnimatedNumber (MIT, ibelick), extended to
 * keep decimals and to render the final value on the server, so the HTML and
 * screen readers always get the real figure.
 */
export function AnimatedNumber({
  value,
  decimals = 2,
  className,
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const spring = useSpring(value, { stiffness: 260, damping: 32, mass: 0.6 });
  const format = React.useCallback(
    (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: decimals }),
    [decimals],
  );
  const display = useTransform(spring, (n) => format(n));

  React.useEffect(() => {
    if (reduce) spring.jump(value);
    else spring.set(value);
  }, [spring, value, reduce]);

  return (
    <span className={cn("num tabular-nums", className)}>
      <span className="sr-only">{format(value)}</span>
      <motion.span aria-hidden="true">{display}</motion.span>
    </span>
  );
}
