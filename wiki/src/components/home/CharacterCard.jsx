import { useState } from "react";
import { Link } from "react-router-dom";

export function CharacterCard({ character, index }) {
  const [imageFailed, setImageFailed] = useState(false);
  const available = character.journeyStatus === "published";
  const deferred = character.journeyStatus === "deferred";
  const showImage = character.portrait?.url && !imageFailed;
  const actionLabel = available
    ? `Open ${character.name}'s season journey`
    : deferred
      ? `View ${character.name}'s journey status`
      : `Preview ${character.name}'s journey status`;

  return (
    <article
      className="character-card"
      data-journey-status={character.journeyStatus}
      style={{ "--entry-delay": `${Math.min(index, 12) * 45}ms` }}
    >
      <Link to={character.journeyUrl} aria-label={actionLabel}>
        <figure>
          {showImage ? (
            <img
              src={character.portrait.url}
              alt=""
              loading={index < 4 ? "eager" : "lazy"}
              decoding="async"
              width={character.portrait.width || 800}
              height={character.portrait.height || 1000}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className="character-monogram" aria-hidden="true">
              {character.name.charAt(0)}
            </span>
          )}
          <span className="character-portrait-action" aria-hidden="true">
            ↗
          </span>
          <figcaption>{character.seriesName}</figcaption>
        </figure>
        <div className="character-card-copy">
          <div>
            <h2>{character.name}</h2>
            <p>{character.title || character.family || "Season journey"}</p>
          </div>
          <div className="character-card-footer">
            <span
              className="journey-status"
              data-status={character.journeyStatus}
            >
              {available
                ? `Journey ready · ${character.journeyCoverage?.throughEpisode || "Verified route"}`
                : "Route in progress"}
            </span>
            <span className="character-card-arrow" aria-hidden="true">
              {available
                ? "Explore ↗"
                : deferred
                  ? "View status ↗"
                  : "Preview ↗"}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
