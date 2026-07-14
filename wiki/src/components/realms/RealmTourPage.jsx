import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react";
import { SigilIcon } from "../intro/SigilIcon.jsx";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import { getRealmCameraFrame, REALM_MAPS, REALM_TOUR } from "../../data/realmTour.js";

const REALM_HOLD_MS = 420;

function RealmPoster({ index, onSelect }) {
  const realm = REALM_TOUR[index];

  return (
    <main className="realm-tour realm-tour-static">
      <section className="realm-poster" aria-labelledby="realm-poster-title">
        <img
          src={realm.poster}
          alt={`Map focused on ${realm.name}, ${realm.house}, ${realm.seat}`}
          width="1484"
          height="1060"
          style={{ objectPosition: `${realm.camera.desktop.x}% ${realm.camera.desktop.y}%` }}
        />
        <div className="realm-poster-shade" aria-hidden="true" />
        <div className="realm-copy realm-poster-copy">
          <p>Realm {realm.order} of 9</p>
          <h1 id="realm-poster-title">{realm.name}</h1>
          <strong>{realm.house}</strong>
          <span>{realm.seat}</span>
        </div>
        <nav className="realm-picker" aria-label="Choose a realm">
          {REALM_TOUR.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show ${item.name}`}
              aria-current={itemIndex === index ? "step" : undefined}
              onClick={() => onSelect(itemIndex)}
            >
              {item.order}
            </button>
          ))}
        </nav>
      </section>
    </main>
  );
}

export function RealmTourPage() {
  const phone = useMediaQuery("(max-width: 880px)");
  const reducedMotion = useReducedMotion();
  const [realmIndex, setRealmIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const [run, setRun] = useState(0);
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const pausedRef = useRef(false);

  const realm = REALM_TOUR[realmIndex];
  const layout = phone ? "mobile" : "desktop";
  const map = REALM_MAPS[layout];
  const camera = realm.camera[layout];
  const capital = realm.capital[layout];
  const sigilPosition = phone ? capital : realm.posterSigil;

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useLayoutEffect(() => {
    const updateViewport = () => setViewport({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (reducedMotion || complete) return undefined;

    let animationFrame;
    let previousTime;
    let elapsed = 0;
    let cancelled = false;

    const animate = (time) => {
      if (cancelled) return;
      if (previousTime === undefined) previousTime = time;
      const delta = time - previousTime;
      previousTime = time;
      if (!pausedRef.current) elapsed += delta;

      if (elapsed >= realm.duration + REALM_HOLD_MS) {
        if (realmIndex === REALM_TOUR.length - 1) setComplete(true);
        else setRealmIndex((current) => current + 1);
        return;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
    };
  }, [complete, realm.duration, realmIndex, reducedMotion, run]);

  const replay = useCallback(() => {
    setPaused(false);
    setComplete(false);
    setRealmIndex(0);
    setRun((value) => value + 1);
  }, []);

  const frame = useMemo(
    () => getRealmCameraFrame({
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
      map,
      camera,
      phone,
    }),
    [camera, map, phone, viewport.height, viewport.width],
  );

  if (reducedMotion) {
    return <RealmPoster index={realmIndex} onSelect={setRealmIndex} />;
  }

  const frameStyle = {
    width: `${frame.width}px`,
    height: `${frame.height}px`,
    left: `${frame.left}px`,
    top: `${frame.top}px`,
    transform: `translate3d(${frame.translateX}px, ${frame.translateY}px, 0) scale(${frame.scale})`,
  };
  const spotlightStyle = {
    "--realm-color": realm.color,
    "--realm-radius": `${phone ? 5.8 : 3.2}%`,
    left: `${sigilPosition.x}%`,
    top: `${sigilPosition.y}%`,
  };
  const sigilHouse = { id: realm.houseId, name: realm.house, color: realm.color };

  return (
    <main className="realm-tour">
      <section className="realm-stage" aria-labelledby="realm-title">
        <div className="realm-map-frame" style={frameStyle}>
          <img
            className="realm-map-image"
            src={map.image}
            alt="Political map of the nine realms of Westeros"
            width={map.width}
            height={map.height}
            fetchPriority="high"
            draggable="false"
          />
          <div className="realm-map-toning" aria-hidden="true" />
          {!phone && (
            <svg
              className="realm-capital-link"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1={capital.x}
                y1={capital.y}
                x2={sigilPosition.x}
                y2={sigilPosition.y}
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={capital.x}
                cy={capital.y}
                r="0.28"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}
          <div className="realm-spotlight" style={spotlightStyle} key={`spot-${realm.id}`}>
            <SigilIcon
              house={sigilHouse}
              size={(phone ? 42 : 54) / frame.scale}
              className="realm-sigil"
            />
          </div>
        </div>

        <div className="realm-vignette" aria-hidden="true" />
        <div className="realm-copy" key={`copy-${realm.id}`}>
          <p>Realm {realm.order} of 9</p>
          <h1 id="realm-title">{realm.name}</h1>
          <strong>{realm.house}</strong>
          <span>{realm.seat}</span>
        </div>

        <div className="realm-controls">
          {complete ? (
            <button type="button" onClick={replay}>
              <RotateCcwIcon aria-hidden="true" />
              Replay
            </button>
          ) : (
            <button type="button" onClick={() => setPaused((value) => !value)}>
              {paused ? <PlayIcon aria-hidden="true" /> : <PauseIcon aria-hidden="true" />}
              {paused ? "Continue" : "Pause"}
            </button>
          )}
        </div>

        <div className="realm-progress" aria-hidden="true">
          {REALM_TOUR.map((item, index) => (
            <span
              key={item.id}
              className={index < realmIndex ? "is-past" : index === realmIndex ? "is-current" : ""}
            />
          ))}
        </div>

        <p className="sr-only" aria-live="polite">
          Realm {realm.order}: {realm.name}, {realm.house}, {realm.seat}
        </p>
      </section>
    </main>
  );
}
