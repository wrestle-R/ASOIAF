import { useEffect, useRef } from "react";
import { SigilIcon } from "../intro/SigilIcon.jsx";

export function WikiEntryPanel({ entry, onClose }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="entry-panel-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        ref={panelRef}
        className="entry-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-panel-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className="icon-button entry-panel-close"
          onClick={onClose}
          aria-label="Close archive entry"
        >
          ×
        </button>
        {entry.media ? (
          <figure
            className="entry-panel-media"
            style={{ aspectRatio: `${entry.media.width || 1}/${entry.media.height || 1}` }}
          >
            <img src={entry.media.url} alt="" />
          </figure>
        ) : (
          <div className="entry-panel-sigil">
            <SigilIcon house={entry} size={112} />
          </div>
        )}
        <div className="entry-panel-content">
          <p className="eyebrow">{entry.collectionLabel}</p>
          <h2 id="entry-panel-title">{entry.name}</h2>
          {entry.title && <p className="entry-panel-title">{entry.title}</p>}
          {entry.words && <blockquote>“{entry.words}”</blockquote>}
          <dl>
            {entry.family && <div><dt>Family</dt><dd>{entry.family}</dd></div>}
            {entry.region && <div><dt>Region</dt><dd>{entry.region}</dd></div>}
            {entry.seat && <div><dt>Seat</dt><dd>{entry.seat}</dd></div>}
            {entry.portrayedBy?.length > 0 && (
              <div><dt>Portrayed by</dt><dd>{entry.portrayedBy.join(", ")}</dd></div>
            )}
          </dl>
          {entry.description && <p className="entry-description">{entry.description}</p>}
          {entry.coatOfArms && (
            <p className="entry-arms"><span>Arms</span>{entry.coatOfArms}</p>
          )}
          {entry.aliases?.length > 0 && (
            <div className="entry-aliases">
              <span>Also known as</span>
              <p>{entry.aliases.join(" · ")}</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
