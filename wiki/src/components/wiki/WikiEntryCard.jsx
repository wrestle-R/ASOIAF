import { SigilIcon } from "../intro/SigilIcon.jsx";

function mediaShape(media) {
  if (!media) return "none";
  if (media.ratio < 0.86) return "portrait";
  if (media.ratio > 1.18) return "landscape";
  return "square";
}

export function WikiEntryCard({ entry, index, onOpen }) {
  const shape = mediaShape(entry.media);
  const aspectRatio = entry.media
    ? `${entry.media.width || 1} / ${entry.media.height || 1}`
    : "4 / 3";

  return (
    <article
      className={`wiki-entry-card media-${shape}`}
      style={{ "--entry-delay": `${Math.min(index, 12) * 45}ms` }}
    >
      <button type="button" onClick={() => onOpen(entry)}>
        <figure style={{ aspectRatio }}>
          {entry.media ? (
            <img
              src={entry.media.url}
              alt=""
              loading="lazy"
              width={entry.media.width || undefined}
              height={entry.media.height || undefined}
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
          <span className="entry-number">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <h2>{entry.name}</h2>
            <p>{entry.title || entry.family || entry.region || "Archive record"}</p>
          </div>
          <span className="entry-arrow" aria-hidden="true">↗</span>
        </div>
      </button>
    </article>
  );
}
