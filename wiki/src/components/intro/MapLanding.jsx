import { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  MAP_BOUNDARIES,
  MAP_PLACE_LABELS,
  MAP_REGION_LABELS,
} from "../../data/mapAnnotations.js";
import { withMapPosition } from "../../data/mapPositions.js";
import { HouseDetailPanel } from "./HouseDetailPanel.jsx";
import { HouseMarker } from "./HouseMarker.jsx";

export function MapLanding({ houses, introActive, onReplay, partial }) {
  const positionedHouses = useMemo(() => withMapPosition(houses), [houses]);
  const [selected, setSelected] = useState(null);
  const [opener, setOpener] = useState(null);
  const viewportRef = useRef(null);

  const handleSelect = useCallback((house, button) => {
    setSelected(house);
    setOpener(button);
  }, []);

  const closePanel = useCallback(() => setSelected(null), []);

  function resetMap() {
    viewportRef.current?.scrollTo({ left: 0, top: 0, behavior: "smooth" });
  }

  return (
    <main className={`map-page ${introActive ? "intro-is-active" : "intro-is-complete"}`}>
      <header className="map-header">
        <Link to="/" className="brand-lockup" aria-label="Wiki of Ice and Fire home">
          <span className="brand-mark">W</span>
          <span>
            <strong>Wiki of Ice and Fire</strong>
            <small>An archive of the known world</small>
          </span>
        </Link>
        <nav aria-label="Primary navigation">
          <button type="button" className="text-button replay-button" onClick={onReplay}>
            Replay intro
          </button>
          <Link className="enter-archive" to="/wiki">
            Enter the archive <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </header>

      {partial && (
        <p className="partial-notice" role="status">
          {houses.length} of 9 house records are available.
        </p>
      )}

      <section className="map-shell" aria-label="Map of the great houses">
        <div className="map-viewport" ref={viewportRef}>
          <div className="map-stage">
            <img
              className="world-map"
              src="/assets/world-map.webp"
              alt="An original illustrated map with a western and eastern continent separated by a broad sea"
              width="1484"
              height="1060"
              draggable="false"
            />
            <div className="map-toning" aria-hidden="true" />
            <div className="atlas-annotations" aria-hidden="true">
              <svg className="atlas-boundaries" viewBox="0 0 100 100" preserveAspectRatio="none">
                {MAP_BOUNDARIES.map((path) => <path key={path} d={path} />)}
              </svg>
              {MAP_REGION_LABELS.map(({ name, x, y, rotate = 0 }) => (
                <span
                  className="atlas-label atlas-region-label"
                  key={name}
                  style={{ left: `${x}%`, top: `${y}%`, "--label-rotation": `${rotate}deg` }}
                >
                  {name}
                </span>
              ))}
              {MAP_PLACE_LABELS.map(({ name, x, y }) => (
                <span
                  className="atlas-label atlas-place-label"
                  key={name}
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  {name}
                </span>
              ))}
            </div>
            <div className="map-title" aria-hidden="true">
              <span>Wiki of</span>
              <strong>Ice <i>&amp;</i> Fire</strong>
              <small>An archive of the known world</small>
            </div>
            <div className="marker-layer">
              {positionedHouses.map((house) => (
                <HouseMarker
                  key={house.id}
                  house={house}
                  selected={selected?.id === house.id}
                  muted={Boolean(selected && selected.id !== house.id)}
                  onSelect={handleSelect}
                  introActive={introActive}
                />
              ))}
            </div>
            <span className="map-scale" aria-hidden="true">
              <i /> Known world <i />
            </span>
          </div>
        </div>
        <button type="button" className="reset-map" onClick={resetMap}>
          Reset map
        </button>
        {selected && (
          <HouseDetailPanel
            house={selected}
            opener={opener}
            onClose={closePanel}
          />
        )}
      </section>

      <details className="house-index">
        <summary>Houses on this map</summary>
        <div>
          {positionedHouses.map((house) => (
            <button
              type="button"
              key={house.id}
              onClick={(event) => handleSelect(house, event.currentTarget)}
            >
              <span>{house.name}</span>
              <small>{house.region || house.seat}</small>
            </button>
          ))}
        </div>
      </details>
    </main>
  );
}
