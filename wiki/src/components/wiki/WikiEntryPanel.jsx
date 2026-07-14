import { useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import { SigilIcon } from "../intro/SigilIcon.jsx";

export function WikiEntryPanel({ entry, onClose, opener, theme }) {
  const phone = useMediaQuery("(max-width: 720px)");

  useEffect(() => () => opener?.focus(), [opener]);

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        className={`wiki-entry-sheet wiki-theme wiki-theme-${theme}`}
        side={phone ? "bottom" : "right"}
      >
        <SheetHeader className="wiki-entry-sheet-header">
          <p className="eyebrow">{entry.collectionLabel}</p>
          <SheetTitle>{entry.name}</SheetTitle>
          <SheetDescription>
            {entry.title || entry.family || entry.region || "Archive record"}
          </SheetDescription>
        </SheetHeader>

        {entry.media ? (
          <figure className="wiki-entry-sheet-media">
            <img
              src={entry.media.url}
              alt={entry.name}
              width={entry.media.width || 800}
              height={entry.media.height || 1000}
            />
          </figure>
        ) : (
          <div className="wiki-entry-sheet-sigil">
            <SigilIcon house={entry} size={112} />
          </div>
        )}

        <Separator />

        <div className="wiki-entry-sheet-content">
          {entry.words && <blockquote>“{entry.words}”</blockquote>}
          <dl>
            {entry.family && <div><dt>Family</dt><dd>{entry.family}</dd></div>}
            {entry.region && <div><dt>Region</dt><dd>{entry.region}</dd></div>}
            {entry.seat && <div><dt>Seat</dt><dd>{entry.seat}</dd></div>}
            {entry.portrayedBy?.length > 0 && (
              <div><dt>Portrayed by</dt><dd>{entry.portrayedBy.join(", ")}</dd></div>
            )}
          </dl>
          {entry.description && <p className="wiki-entry-description">{entry.description}</p>}
          {entry.coatOfArms && (
            <p className="wiki-entry-arms"><span>Arms</span>{entry.coatOfArms}</p>
          )}
          {entry.aliases?.length > 0 && (
            <div className="wiki-entry-aliases">
              <span>Also known as</span>
              <p>{entry.aliases.join(" · ")}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
