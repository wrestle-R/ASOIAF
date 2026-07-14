import { SigilIcon } from "../intro/SigilIcon.jsx";

export function WikiEntryCard({ entry, index, onOpen }) {
  return (
    <article
      className="wiki-entry-card"
      style={{ "--entry-delay": `${Math.min(index, 12) * 45}ms` }}
    >
      <button type="button" onClick={(event) => onOpen(entry, event.currentTarget)}>
        <figure>
          {entry.media ? (
            <img
              src={entry.media.url}
              alt=""
              loading="lazy"
              width={entry.media.width || 800}
              height={entry.media.height || 1000}
            />
          ) : entry.kind === "house" ? (
            <SigilIcon house={entry} size={84} className="wiki-house-sigil" />
          ) : (
            <span className="entry-monogram" aria-hidden="true">
              {entry.name.charAt(0)}
            </span>
          )}
          <figcaption>{entry.collectionLabel}</figcaption>
        </figure>
        <div className="wiki-entry-copy">
          <div>
            <h2>{entry.name}</h2>
            <p>{entry.title || entry.family || entry.region || "Archive record"}</p>
          </div>
          <span className="entry-arrow" aria-hidden="true">View ↗</span>
        </div>
      </button>
    </article>
  );
}
