import { useCallback, useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import {
  DAENERYS_SEASONS,
  getSeasonWaypoints,
  JOURNEY_MAP,
} from "../../data/daenerysJourney.js";

const SEASON_HOLD_MS = 650;

function JourneyPoster({ season, onSelect }) {
  return (
    <main className="journey-page journey-page-static">
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
  const [seasonIndex, setSeasonIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const [run, setRun] = useState(0);
  const pausedRef = useRef(false);
  const pathRef = useRef(null);
  const markerRef = useRef(null);

  const season = DAENERYS_SEASONS[seasonIndex];
  const waypoints = getSeasonWaypoints(season);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (reducedMotion || complete) return undefined;

    const path = pathRef.current;
    const marker = markerRef.current;
    if (!path || !marker) return undefined;

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
    return <JourneyPoster season={season} onSelect={setSeasonIndex} />;
  }

  const cameraStyle = {
    "--camera-x": `${season.camera.x}%`,
    "--camera-y": `${season.camera.y}%`,
    "--camera-scale": season.camera.scale,
  };

  return (
    <main className="journey-page">
      <section className="journey-stage" aria-labelledby="journey-title">
        <div className="journey-camera" style={cameraStyle}>
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
