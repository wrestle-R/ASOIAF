import { useEffect } from "react";
import { ArrowUpRightIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SigilIcon } from "./SigilIcon.jsx";

export function HouseDetailPanel({ house, onClose, opener, side = "right" }) {
  useEffect(() => () => opener?.focus(), [opener]);

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="house-sheet" side={side}>
        <SheetHeader className="house-sheet-header">
          <div className="house-sheet-heading">
            <SigilIcon house={house} size={64} />
            <div>
              <p className="eyebrow">Great house of Westeros</p>
              <SheetTitle>{house.name}</SheetTitle>
            </div>
          </div>
          <SheetDescription>
            {house.words ? `“${house.words}”` : `${house.name} in the local archive.`}
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <div className="house-sheet-content">
          <dl className="house-facts">
            {house.region && (
              <div>
                <dt>Region</dt>
                <dd>{house.region}</dd>
              </div>
            )}
            {house.seat && (
              <div>
                <dt>Seat</dt>
                <dd>{house.seat}</dd>
              </div>
            )}
          </dl>

          {house.coatOfArms && (
            <p className="blazon">
              <span>Arms</span>
              {house.coatOfArms}
            </p>
          )}
        </div>

        <SheetFooter>
          <Link
            className={cn(buttonVariants({ variant: "outline" }), "house-archive-link")}
            to={`/wiki?search=${encodeURIComponent(house.name)}`}
          >
            Open in the archive
            <ArrowUpRightIcon data-icon="inline-end" />
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
