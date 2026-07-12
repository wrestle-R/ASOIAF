import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { SigilIcon } from "./SigilIcon.jsx";

export function HouseDetailPanel({ house, onClose, opener }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll(
        'button, a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      opener?.focus();
    };
  }, [onClose, opener]);

  return (
    <aside
      ref={panelRef}
      className="house-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="house-panel-title"
    >
      <div className="house-panel-rule" />
      <button
        ref={closeRef}
        type="button"
        className="icon-button panel-close"
        onClick={onClose}
        aria-label="Close house details"
      >
        ×
      </button>
      <div className="house-panel-heading">
        <SigilIcon house={house} size={64} />
        <div>
          <p className="eyebrow">A great house of Westeros</p>
          <h2 id="house-panel-title">{house.name}</h2>
          {house.words && <blockquote>“{house.words}”</blockquote>}
        </div>
      </div>
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
      <Link className="archive-link" to={`/wiki?search=${encodeURIComponent(house.name)}`}>
        Search this house in the archive <span aria-hidden="true">↗</span>
      </Link>
    </aside>
  );
}
