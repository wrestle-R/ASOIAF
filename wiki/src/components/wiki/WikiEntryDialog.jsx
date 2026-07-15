import { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { SigilIcon } from "../intro/SigilIcon.jsx";

export function WikiEntryDialog({ entry, onClose, opener, theme }) {
  useEffect(() => () => opener?.focus(), [opener]);

  const hasFacts = entry.family || entry.region || entry.seat || entry.portrayedBy?.length > 0;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`wiki-entry-dialog wiki-theme wiki-theme-${theme}`}>
        <div className="wiki-entry-dialog-layout">
          <div className={cn("wiki-entry-dialog-visual", !entry.media && "is-sigil")}>
            {entry.media ? (
              <figure>
                <img
                  src={entry.media.url}
                  alt={entry.name}
                  width={entry.media.width || 800}
                  height={entry.media.height || 1000}
                />
              </figure>
            ) : (
              <div className="wiki-entry-dialog-sigil">
                <SigilIcon house={entry} size={156} />
              </div>
            )}
            <span className="wiki-entry-dialog-folio">{entry.collectionLabel}</span>
          </div>

          <article className="wiki-entry-dialog-record">
            <DialogHeader className="wiki-entry-dialog-header">
              <p className="eyebrow">Archive record</p>
              <DialogTitle>{entry.name}</DialogTitle>
              <DialogDescription>
                {entry.title || entry.family || entry.region || "A record from the known world"}
              </DialogDescription>
            </DialogHeader>

            <Separator />

            <div className="wiki-entry-dialog-content">
              {entry.words && <blockquote>“{entry.words}”</blockquote>}

              {hasFacts && (
                <dl className="wiki-entry-dialog-facts">
                  {entry.family && <div><dt>Family</dt><dd>{entry.family}</dd></div>}
                  {entry.region && <div><dt>Region</dt><dd>{entry.region}</dd></div>}
                  {entry.seat && <div><dt>Seat</dt><dd>{entry.seat}</dd></div>}
                  {entry.portrayedBy?.length > 0 && (
                    <div><dt>Portrayed by</dt><dd>{entry.portrayedBy.join(", ")}</dd></div>
                  )}
                </dl>
              )}

              {entry.description && <p className="wiki-entry-description">{entry.description}</p>}

              <div className="wiki-entry-dialog-notes">
                {entry.coatOfArms && (
                  <p className="wiki-entry-arms"><span>Coat of arms</span>{entry.coatOfArms}</p>
                )}
                {entry.aliases?.length > 0 && (
                  <div className="wiki-entry-aliases">
                    <span>Also known as</span>
                    <p>{entry.aliases.join(" · ")}</p>
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
      </DialogContent>
    </Dialog>
  );
}
