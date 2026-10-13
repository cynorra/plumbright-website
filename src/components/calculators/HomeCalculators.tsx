import * as React from "react";
import { ArrowRightIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "motion/react";
import ConcreteCalculator from "./ConcreteCalculator";
import TileCalculator from "./TileCalculator";
import PaintCalculator from "./PaintCalculator";

const TOOLS = [
  { key: "concrete", label: "Concrete", href: "/concrete-calculator/", C: ConcreteCalculator },
  { key: "tile", label: "Tile", href: "/tile-calculator/", C: TileCalculator },
  { key: "paint", label: "Paint", href: "/paint-calculator/", C: PaintCalculator },
] as const;

/** The homepage hero: all three calculators, working, in one card. */
export default function HomeCalculators() {
  const [tab, setTab] = React.useState<string>("concrete");
  const active = TOOLS.find((t) => t.key === tab)!;
  const reduce = useReducedMotion();
  return (
    <Tabs value={tab} onValueChange={setTab} className="bg-card gap-0 rounded-xl border shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3 md:px-6">
        <TabsList aria-label="Choose a calculator">
          {TOOLS.map((t) => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              className="relative px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-transparent"
            >
              {tab === t.key && (
                <motion.span
                  layoutId="home-tab"
                  className="bg-background dark:bg-input/50 absolute inset-0 rounded-md shadow-sm"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                  aria-hidden="true"
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <Button asChild variant="link" size="sm" className="px-0">
          <a href={active.href}>
            Full {active.label.toLowerCase()} calculator <ArrowRightIcon />
          </a>
        </Button>
      </div>
      {TOOLS.map(({ key, C }) => (
        <TabsContent key={key} value={key}>
          <C compact />
        </TabsContent>
      ))}
    </Tabs>
  );
}
