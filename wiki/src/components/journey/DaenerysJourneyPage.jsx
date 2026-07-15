import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react";
import { useCinematicViewport } from "../../hooks/useCinematicViewport.js";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import {
  DAENERYS_SEASONS,
  getSeasonWaypoints,
  JOURNEY_MAP,
} from "../../data/daenerysJourney.js";

const SEASON_HOLD_MS = 650;
const MOBILE_CAMERA_QUERY = "(max-width: 880px)";
const MOBILE_CAMERA_EASING_MS = 140;

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function JourneyPoster({ onSelect, pointerHandlers, season }) {
  return (
    <main className="journey-page journey-page-static" {...pointerHandlers}>
      <section className="journey-static-shell" aria-labelledby="journey-static-title">
        <div className="journey-static-copy">
          <p>Season {season.season} of 8</p>
          <h1 id="journey-static-title">{season.title}</h1>
          <p>{season.summary}</p>
        </div>
        <img
          src={season.poster}
          alt={`Season ${season.season} map: ${getSeasonWaypoints(season).map((place) => place.name).join(" to ")}`}
          width={JOURNEY_MAP.width}
          height={JOURNEY_MAP.height}
        />
        <nav className="journey-season-picker" aria-label="Choose a season">
          {DAENERYS_SEASONS.map((item) => (
            <button
              key={item.season}
              type="button"
              aria-current={item.season === season.season ? "step" : undefined}
              onClick={() => onSelect(item.season - 1)}
            >
              {item.season}
            </button>
          ))}
        </nav>
      </section>
    </main>
  );
}

export function DaenerysJourneyPage() {
  const reducedMotion = useReducedMotion();
  const phone = useMediaQuery(MOBILE_CAMERA_QUERY);
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

  const season = DAENERYS_SEASONS[seasonIndex];
  const waypoints = getSeasonWaypoints(season);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const goToNext = useCallback(() => {
    if (
      complete
      || (reducedMotion && seasonIndex === DAENERYS_SEASONS.length - 1)
    ) return;

    if (seasonIndex === DAENERYS_SEASONS.length - 1) setComplete(true);
    else setSeasonIndex((current) => current + 1);
    setRun((value) => value + 1);
  }, [complete, reducedMotion, seasonIndex]);

  const goToPrevious = useCallback(() => {
    if (!complete && seasonIndex === 0) return;

    setComplete(false);
    setSeasonIndex(complete
      ? DAENERYS_SEASONS.length - 1
      : (current) => Math.max(0, current - 1));
    setRun((value) => value + 1);
  }, [complete, seasonIndex]);

  const stagePointerHandlers = useCinematicViewport({
    enabled: phone,
    onNext: goToNext,
    onPrevious: goToPrevious,
  });

  useLayoutEffect(() => {
    const camera = cameraRef.current;
    if (!camera || reducedMotion) return undefined;

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
  }, [reducedMotion]);

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
      ) {
        return;
      }

      if (event.key === "ArrowRight" && !complete) {
        if (seasonIndex === DAENERYS_SEASONS.length - 1 && reducedMotion) return;
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
  }, [complete, goToNext, goToPrevious, reducedMotion, seasonIndex]);

  useEffect(() => {
    if (reducedMotion || complete) return undefined;

    const path = pathRef.current;
    const marker = markerRef.current;
    const camera = cameraRef.current;
    if (!path || !marker || !camera) return undefined;

    const pathLength = path.getTotalLength();
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
        const desiredX = clamp(
          mobileCamera.viewportWidth * 0.5 - pointX,
          minimumX,
          0,
        );
        const desiredY = clamp(
          mobileCamera.viewportHeight * 0.42 - pointY,
          minimumY,
          0,
        );
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
        if (seasonIndex === DAENERYS_SEASONS.length - 1) setComplete(true);
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
  }, [complete, reducedMotion, run, season.duration, seasonIndex]);

  const replay = useCallback(() => {
    setPaused(false);
    setComplete(false);
    setSeasonIndex(0);
    setRun((value) => value + 1);
  }, []);

  if (reducedMotion) {
    return (
      <JourneyPoster
        season={season}
        onSelect={setSeasonIndex}
        pointerHandlers={stagePointerHandlers}
      />
    );
  }

  const cameraStyle = {
    "--camera-x": `${season.camera.x}%`,
    "--camera-y": `${season.camera.y}%`,
    "--camera-scale": season.camera.scale,
  };

  return (
    <main className="journey-page">
      <section
        className="journey-stage"
        aria-labelledby="journey-title"
        {...stagePointerHandlers}
      >
        <div ref={cameraRef} className="journey-camera" style={cameraStyle}>
          <img
            className="journey-map-image"
            src={JOURNEY_MAP.image}
            alt="Illustrated map of Westeros and Essos"
            width={JOURNEY_MAP.width}
            height={JOURNEY_MAP.height}
            draggable="false"
          />
          <svg
            className="journey-route-layer"
            viewBox={`0 0 ${JOURNEY_MAP.width} ${JOURNEY_MAP.height}`}
            aria-hidden="true"
          >
            <defs>
              <mask id={`journey-reveal-${season.season}`}>
                <path ref={pathRef} className="journey-route-reveal" d={season.path} />
              </mask>
            </defs>
            <path
              className="journey-route"
              d={season.path}
              mask={`url(#journey-reveal-${season.season})`}
            />
            {waypoints.map((place, index) => (
              <circle
                className="journey-stop"
                key={`${season.season}-${index}-${place.name}`}
                cx={place.x}
                cy={place.y}
                r="13"
              />
            ))}
            <g ref={markerRef} className="journey-marker">
              <circle r="8" />
            </g>
          </svg>
        </div>

        <div className="journey-vignette" aria-hidden="true" />
        <div className="journey-copy" key={`copy-${season.season}`}>
          <p className="journey-kicker">Season {season.season} of 8</p>
          <h1 id="journey-title">{season.title}</h1>
          <p>{season.summary}</p>
          <ol aria-label={`Season ${season.season} route`}>
            {waypoints.map((place, index) => <li key={`${index}-${place.name}`}>{place.name}</li>)}
          </ol>
        </div>

        <div className="journey-controls">
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

        <div className="journey-progress" aria-hidden="true">
          {DAENERYS_SEASONS.map((item, index) => (
            <span
              key={item.season}
              className={index < seasonIndex ? "is-past" : index === seasonIndex ? "is-current" : ""}
            />
          ))}
        </div>

        <p className="sr-only" aria-live="polite">
          Season {season.season}: {season.summary}
        </p>
      </section>
    </main>
  );
}
