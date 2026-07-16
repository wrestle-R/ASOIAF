import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ArrowLeftIcon, PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchCharacter } from "../../data/characterApi.js";
import {
  getJourney,
  getSeasonWaypoints,
  JOURNEY_MAP,
} from "../../data/journeys/publishedJourneys.js";
import { useCinematicViewport } from "../../hooks/useCinematicViewport.js";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";

const SEASON_HOLD_MS = 650;
const MOBILE_CAMERA_QUERY = "(max-width: 880px)";
const MOBILE_CAMERA_EASING_MS = 140;

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function PendingJourneyPage({ characterSlug, seriesSlug }) {
  const phone = useMediaQuery(MOBILE_CAMERA_QUERY);
  const [character, setCharacter] = useState(null);
  const [error, setError] = useState(null);

  useCinematicViewport({ enabled: phone });

  useEffect(() => {
    const controller = new AbortController();
    setCharacter(null);
    setError(null);

    fetchCharacter(seriesSlug, characterSlug, controller.signal)
      .then((payload) => setCharacter(payload.character ?? payload))
      .catch((reason) => {
        if (reason.name !== "AbortError") setError(reason.message);
      });

    return () => controller.abort();
  }, [characterSlug, seriesSlug]);

  const name = character?.name ?? titleFromSlug(characterSlug);

  useEffect(() => {
    document.title = `${name} | Map of Ice and Fire`;
  }, [name]);

  return (
    <main className="journey-page pending-journey-page">
      <section className="journey-stage pending-journey-stage" aria-labelledby="pending-journey-title">
        <div className="journey-camera is-overview">
          <img
            className="journey-map-image"
            src={JOURNEY_MAP.image}
            alt="Illustrated map of Westeros and Essos"
            width={JOURNEY_MAP.width}
            height={JOURNEY_MAP.height}
            fetchPriority="high"
            draggable="false"
          />
        </div>
        <div className="journey-vignette" aria-hidden="true" />
        <div className="journey-copy pending-journey-copy">
          <p className="journey-kicker">{character?.seriesName ?? "Character journey"}</p>
          <h1 id="pending-journey-title">{name}</h1>
          <p>
            {error
              ? "This character could not be read from the map room."
              : "This season-by-season journey is being charted from verified appearances."}
          </p>
          <span className="pending-journey-status" role="status" aria-live="polite">
            {error ? "Journey unavailable" : character ? "Journey being charted" : "Opening the map room…"}
          </span>
        </div>
        <div className="journey-controls is-visible">
          <Link
            to="/home"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "journey-control")}
          >
            <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}

function JourneyExperience({ journey }) {
  const reducedMotion = useReducedMotion();
  const phone = useMediaQuery(MOBILE_CAMERA_QUERY);
  const maskId = useId().replaceAll(":", "");
  const [seasonIndex, setSeasonIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const [run, setRun] = useState(0);
  const pausedRef = useRef(false);
  const cameraRef = useRef(null);
  const pathRef = useRef(null);
  const markerRef = useRef(null);
  const mobileCameraRef = useRef({
    cameraHeight: 0,
    cameraWidth: 0,
    initialized: false,
    isMobile: false,
    needsPosition: true,
    viewportHeight: 0,
    viewportWidth: 0,
    x: 0,
    y: 0,
  });

  const season = journey.seasons[seasonIndex];
  const waypoints = getSeasonWaypoints(season);
  const lastWaypoint = waypoints.at(-1) ?? waypoints[0];
  const overviewStops = journey.seasons.flatMap((item) => getSeasonWaypoints(item));

  useEffect(() => {
    document.title = `${journey.characterName}'s Journey | Map of Ice and Fire`;
  }, [journey.characterName]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const goToNext = useCallback(() => {
    if (complete) return;

    if (seasonIndex === journey.seasons.length - 1) setComplete(true);
    else setSeasonIndex((current) => current + 1);
    setRun((value) => value + 1);
  }, [complete, journey.seasons.length, seasonIndex]);

  const goToPrevious = useCallback(() => {
    if (!complete && seasonIndex === 0) return;

    setComplete(false);
    setSeasonIndex(complete
      ? journey.seasons.length - 1
      : (current) => Math.max(0, current - 1));
    setRun((value) => value + 1);
  }, [complete, journey.seasons.length, seasonIndex]);

  const stagePointerHandlers = useCinematicViewport({
    enabled: phone,
    onNext: goToNext,
    onPrevious: goToPrevious,
  });

  useLayoutEffect(() => {
    const camera = cameraRef.current;
    if (!camera || reducedMotion || complete) return undefined;

    const mobileQuery = window.matchMedia(MOBILE_CAMERA_QUERY);
    const cameraState = mobileCameraRef.current;

    const measureCamera = () => {
      cameraState.isMobile = mobileQuery.matches;
      cameraState.viewportWidth = window.innerWidth;
      cameraState.viewportHeight = window.innerHeight;
      cameraState.cameraWidth = camera.offsetWidth;
      cameraState.cameraHeight = camera.offsetHeight;
      cameraState.needsPosition = true;

      if (!cameraState.isMobile) {
        cameraState.initialized = false;
        camera.style.removeProperty("--mobile-camera-scale");
        camera.style.removeProperty("--mobile-camera-x");
        camera.style.removeProperty("--mobile-camera-y");
      }
    };

    measureCamera();
    const resizeObserver = new ResizeObserver(measureCamera);
    resizeObserver.observe(camera);
    window.addEventListener("resize", measureCamera);
    mobileQuery.addEventListener("change", measureCamera);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureCamera);
      mobileQuery.removeEventListener("change", measureCamera);
    };
  }, [complete, reducedMotion]);

  useEffect(() => {
    const handleArrowNavigation = (event) => {
      const target = event.target;
      if (
        window.matchMedia(MOBILE_CAMERA_QUERY).matches
        || event.defaultPrevented
        || event.altKey
        || event.ctrlKey
        || event.metaKey
        || event.shiftKey
        || target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target instanceof HTMLSelectElement
        || target?.isContentEditable
      ) return;

      if (event.key === "ArrowRight" && !complete) {
        event.preventDefault();
        goToNext();
      }

      if (event.key === "ArrowLeft" && (complete || seasonIndex > 0)) {
        event.preventDefault();
        goToPrevious();
      }
    };

    window.addEventListener("keydown", handleArrowNavigation);
    return () => window.removeEventListener("keydown", handleArrowNavigation);
  }, [complete, goToNext, goToPrevious, seasonIndex]);

  useEffect(() => {
    if (reducedMotion || complete) return undefined;

    const path = pathRef.current;
    const marker = markerRef.current;
    const camera = cameraRef.current;
    if (!path || !marker || !camera) return undefined;

    const pathLength = Math.max(path.getTotalLength(), 0.01);
    path.style.strokeDasharray = `${pathLength}`;
    path.style.strokeDashoffset = `${pathLength}`;

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

      const progress = Math.min(elapsed / season.duration, 1);
      const point = path.getPointAtLength(pathLength * progress);
      path.style.strokeDashoffset = `${pathLength * (1 - progress)}`;
      marker.setAttribute("transform", `translate(${point.x} ${point.y})`);

      const mobileCamera = mobileCameraRef.current;
      if (mobileCamera.isMobile && (!pausedRef.current || mobileCamera.needsPosition)) {
        const landscape = mobileCamera.viewportWidth > mobileCamera.viewportHeight;
        const scale = landscape ? 1 : 1.05;
        const scaledWidth = mobileCamera.cameraWidth * scale;
        const scaledHeight = mobileCamera.cameraHeight * scale;
        const pointX = (point.x / JOURNEY_MAP.width) * scaledWidth;
        const pointY = (point.y / JOURNEY_MAP.height) * scaledHeight;
        const minimumX = Math.min(0, mobileCamera.viewportWidth - scaledWidth);
        const minimumY = Math.min(0, mobileCamera.viewportHeight - scaledHeight);
        const desiredX = clamp(mobileCamera.viewportWidth * 0.5 - pointX, minimumX, 0);
        const desiredY = clamp(mobileCamera.viewportHeight * 0.42 - pointY, minimumY, 0);
        const easing = mobileCamera.initialized && !mobileCamera.needsPosition
          ? 1 - Math.exp(-delta / MOBILE_CAMERA_EASING_MS)
          : 1;

        mobileCamera.x += (desiredX - mobileCamera.x) * easing;
        mobileCamera.y += (desiredY - mobileCamera.y) * easing;
        mobileCamera.initialized = true;
        mobileCamera.needsPosition = false;

        camera.style.setProperty("--mobile-camera-scale", scale);
        camera.style.setProperty("--mobile-camera-x", `${mobileCamera.x}px`);
        camera.style.setProperty("--mobile-camera-y", `${mobileCamera.y}px`);
      }

      if (elapsed >= season.duration + SEASON_HOLD_MS) {
        if (seasonIndex === journey.seasons.length - 1) setComplete(true);
        else setSeasonIndex((current) => current + 1);
        return;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
    };
  }, [complete, journey.seasons.length, reducedMotion, run, season.duration, seasonIndex]);

  const replay = useCallback(() => {
    setPaused(false);
    setComplete(false);
    setSeasonIndex(0);
    mobileCameraRef.current.initialized = false;
    mobileCameraRef.current.needsPosition = true;
    setRun((value) => value + 1);
  }, []);

  const selectSeason = useCallback((index) => {
    setPaused(false);
    setComplete(false);
    setSeasonIndex(index);
    setRun((value) => value + 1);
  }, []);

  const cameraStyle = {
    "--camera-x": `${season.camera.x}%`,
    "--camera-y": `${season.camera.y}%`,
    "--camera-scale": season.camera.scale,
  };
  const markerTransform = reducedMotion && lastWaypoint
    ? `translate(${lastWaypoint.x} ${lastWaypoint.y})`
    : undefined;

  return (
    <main className="journey-page">
      <section
        className={cn(
          "journey-stage",
          complete && "is-complete",
          reducedMotion && "is-reduced-motion",
        )}
        aria-labelledby="journey-title"
        {...stagePointerHandlers}
      >
        <div
          ref={cameraRef}
          className={cn("journey-camera", (complete || reducedMotion) && "is-overview")}
          style={cameraStyle}
        >
          <img
            className="journey-map-image"
            src={JOURNEY_MAP.image}
            alt="Illustrated map of Westeros and Essos"
            width={JOURNEY_MAP.width}
            height={JOURNEY_MAP.height}
            fetchPriority="high"
            draggable="false"
          />
          <svg
            className="journey-route-layer"
            viewBox={`0 0 ${JOURNEY_MAP.width} ${JOURNEY_MAP.height}`}
            aria-hidden="true"
          >
            {!complete && !reducedMotion && (
              <defs>
                <mask id={`${maskId}-season-${season.season}`}>
                  <path ref={pathRef} className="journey-route-reveal" d={season.path} />
                </mask>
              </defs>
            )}

            {complete ? journey.seasons.map((item) => (
              <path
                className="journey-route journey-route-complete"
                d={item.path}
                key={`complete-${item.season}`}
              />
            )) : (
              <path
                className="journey-route"
                d={season.path}
                mask={reducedMotion ? undefined : `url(#${maskId}-season-${season.season})`}
              />
            )}

            {(complete ? overviewStops : waypoints).map((place, index) => (
              <circle
                className="journey-stop"
                key={`${complete ? "all" : season.season}-${index}-${place.id ?? place.name}`}
                cx={place.x}
                cy={place.y}
                r="13"
              />
            ))}

            {!complete && (
              <g ref={markerRef} className="journey-marker" transform={markerTransform}>
                <circle r="8" />
              </g>
            )}
          </svg>
        </div>

        <div className="journey-vignette" aria-hidden="true" />
        <div className={cn("journey-copy", complete && "journey-complete-copy")} key={`copy-${complete ? "complete" : season.season}`}>
          <p className="journey-kicker">
            {complete
              ? `${journey.seasons.length} mapped seasons`
              : `Season ${season.season} of ${journey.totalSeasons}`}
          </p>
          <h1 id="journey-title">{complete ? journey.characterName : season.title}</h1>
          <p>{complete ? "Their complete mapped journey across the known world." : season.summary}</p>
          {!complete && (
            <ol aria-label={`Season ${season.season} route`}>
              {waypoints.map((place, index) => (
                <li key={`${index}-${place.id ?? place.name}`}>{place.name}</li>
              ))}
            </ol>
          )}
        </div>

        <div className={cn("journey-controls", complete && "journey-complete-controls")}>
          {complete ? (
            <>
              <Button type="button" variant="outline" size="lg" className="journey-control" onClick={replay}>
                <RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
                Replay
              </Button>
              <Link
                to="/home"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "journey-control")}
              >
                <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
                Back to Home
              </Link>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="journey-control"
              onClick={() => setPaused((value) => !value)}
              disabled={reducedMotion}
            >
              {paused
                ? <PlayIcon data-icon="inline-start" aria-hidden="true" />
                : <PauseIcon data-icon="inline-start" aria-hidden="true" />}
              {reducedMotion ? "Route shown" : paused ? "Continue" : "Pause"}
            </Button>
          )}
        </div>

        <div className="journey-progress" aria-hidden="true">
          {journey.seasons.map((item, index) => (
            <span
              key={item.season}
              className={index < seasonIndex || complete ? "is-past" : index === seasonIndex ? "is-current" : ""}
            />
          ))}
        </div>

        {reducedMotion && !complete && (
          <nav className="journey-season-picker journey-season-picker-overlay" aria-label="Choose a season">
            {journey.seasons.map((item, index) => (
              <button
                key={item.season}
                type="button"
                aria-current={index === seasonIndex ? "step" : undefined}
                aria-label={`Season ${item.season}`}
                onClick={() => selectSeason(index)}
              >
                {item.season}
              </button>
            ))}
            <button type="button" onClick={() => setComplete(true)} aria-label="Show complete journey">
              ∞
            </button>
          </nav>
        )}

        <p className="sr-only" aria-live="polite">
          {complete
            ? `${journey.characterName}'s complete mapped journey is displayed.`
            : `Season ${season.season}: ${season.summary}`}
        </p>
      </section>
    </main>
  );
}

export function CharacterJourneyPage() {
  const { characterSlug = "", seriesSlug = "" } = useParams();
  const journey = getJourney(seriesSlug, characterSlug);

  if (!journey) {
    return <PendingJourneyPage characterSlug={characterSlug} seriesSlug={seriesSlug} />;
  }

  return <JourneyExperience key={journey.key} journey={journey} />;
}
