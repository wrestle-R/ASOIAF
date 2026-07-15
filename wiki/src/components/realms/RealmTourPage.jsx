import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BookOpenIcon, PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { SigilIcon } from "../intro/SigilIcon.jsx";
import { Button, buttonVariants } from "../ui/button.jsx";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import { getRealmCameraFrame, REALM_MAPS, REALM_TOUR } from "../../data/realmTour.js";
import { cn } from "../../lib/utils.js";

const REALM_HOLD_MS = 420;

export function RealmTourPage() {
  const phone = useMediaQuery("(max-width: 880px)");
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
  const sigilPosition = realm.sigil[layout];

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
    if (complete) return undefined;

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
  }, [complete, realm.duration, realmIndex, run]);

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

  const frameStyle = {
    width: `${frame.width}px`,
    height: `${frame.height}px`,
    left: `${frame.left}px`,
    top: `${frame.top}px`,
    transform: complete
      ? "translate3d(0, 0, 0) scale(1)"
      : `translate3d(${frame.translateX}px, ${frame.translateY}px, 0) scale(${frame.scale})`,
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
      <section
        className={cn("realm-stage", complete && "is-complete")}
        aria-labelledby={complete ? undefined : "realm-title"}
        aria-label={complete ? "Complete map of the known world" : undefined}
      >
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
          {!complete && (
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
            </svg>
          )}
          {!complete && (
            <div className="realm-spotlight" style={spotlightStyle} key={`spot-${realm.id}`}>
              <SigilIcon
                house={sigilHouse}
                size={(phone ? 59 : 76) / frame.scale}
                className="realm-sigil"
              />
            </div>
          )}
        </div>

        {!complete && <div className="realm-vignette" aria-hidden="true" />}
        {!complete && (
          <div className="realm-copy" key={`copy-${realm.id}`}>
            <p>Realm {realm.order} of 9</p>
            <h1 id="realm-title">{realm.name}</h1>
            <strong>{realm.house}</strong>
            <span>{realm.seat}</span>
          </div>
        )}

        <div className={cn("realm-controls", complete && "realm-controls-complete")}>
          {complete ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="realm-control"
                onClick={replay}
              >
                <RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
                Replay
              </Button>
              <Link
                to="/wiki"
                className={buttonVariants({ size: "lg", className: "realm-control" })}
              >
                <BookOpenIcon data-icon="inline-start" aria-hidden="true" />
                Explore the Wiki
              </Link>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="realm-control"
              onClick={() => setPaused((value) => !value)}
            >
              {paused
                ? <PlayIcon data-icon="inline-start" aria-hidden="true" />
                : <PauseIcon data-icon="inline-start" aria-hidden="true" />}
              {paused ? "Continue" : "Pause"}
            </Button>
          )}
        </div>

        {!complete && (
          <div className="realm-progress" aria-hidden="true">
            {REALM_TOUR.map((item, index) => (
              <span
                key={item.id}
                className={index < realmIndex ? "is-past" : index === realmIndex ? "is-current" : ""}
              />
            ))}
          </div>
        )}

        <p className="sr-only" aria-live="polite">
          {complete
            ? "Tour complete. The full map is now displayed."
            : `Realm ${realm.order}: ${realm.name}, ${realm.house}, ${realm.seat}`}
        </p>
      </section>
    </main>
  );
}
