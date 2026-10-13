import * as React from "react";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

type Link = { href: string; label: string };

export default function MobileNav({ nav, secondary, siteName }: { nav: Link[]; secondary: Link[]; siteName: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle className="font-display text-lg font-extrabold">{siteName}</SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col px-2">
          {nav.map((l) => (
            <a key={l.href} href={l.href} className="text-foreground hover:bg-accent rounded-md px-3 py-2.5 text-base font-medium no-underline">
              {l.label}
            </a>
          ))}
          <Separator className="my-3" />
          {secondary.map((l) => (
            <a key={l.href} href={l.href} className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm no-underline">
              {l.label}
            </a>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
