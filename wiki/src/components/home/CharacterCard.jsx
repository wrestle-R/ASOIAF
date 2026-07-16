import { useState } from "react";
import { Link } from "react-router-dom";

export function CharacterCard({ character, index }) {
  const [imageFailed, setImageFailed] = useState(false);
  const mapped = character.journeyStatus === "published";
  const showImage = character.portrait?.url && !imageFailed;

  return (
    <article
      className="character-card"
      data-journey-status={character.journeyStatus}
      style={{ "--entry-delay": `${Math.min(index, 12) * 45}ms` }}
    >
      <Link to={character.journeyUrl} aria-label={`Open ${character.name}'s season journey`}>
        <figure>
          {showImage ? (
            <img
              src={character.portrait.url}
              alt=""
              loading="lazy"
              width={character.portrait.width || 800}
              height={character.portrait.height || 1000}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className="character-monogram" aria-hidden="true">
              {character.name.charAt(0)}
            </span>
          )}
          <figcaption>{character.seriesName}</figcaption>
          <span className="journey-status" data-status={character.journeyStatus}>
            {mapped ? "Journey mapped" : "Being charted"}
          </span>
        </figure>
        <div className="character-card-copy">
          <div>
            <h2>{character.name}</h2>
            <p>{character.title || character.family || "Season journey"}</p>
          </div>
          <span className="character-card-arrow" aria-hidden="true">
            {mapped ? "Trace ↗" : "Preview ↗"}
          </span>
        </div>
      </Link>
    </article>
  );
}
