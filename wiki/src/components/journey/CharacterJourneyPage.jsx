import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowLeftIcon,
  MinusIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RotateCcwIcon,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchCharacter } from "../../data/characterApi.js";
import {
  getJourneyCatalogEntry,
  getSeasonOrigin,
  getSeasonWaypoints,
  JOURNEY_MAP,
  MAJOR_CITIES,
  loadJourney,
} from "../../data/journeys/publishedJourneys.js";
import { useCinematicViewport } from "../../hooks/useCinematicViewport.js";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import { useCinematicLoadReady } from "../../hooks/usePageLoadReady.js";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";

const SEASON_HOLD_MS = 650;
const MOBILE_CAMERA_QUERY = "(max-width: 880px)";
const MOBILE_CAMERA_EASING_MS = 140;
const MOBILE_OVERVIEW_BASE_SCALE = 0.96;
const OVERVIEW_MIN_SCALE = 1;
const OVERVIEW_MAX_SCALE = 4;
const OVERVIEW_ZOOM_STEP = 0.4;
const OVERVIEW_KEYBOARD_PAN_PX = 56;
const DEFAULT_OVERVIEW_VIEW = Object.freeze({ scale: 1, x: 0, y: 0 });
const CITY_LABEL_OFFSETS = Object.freeze({
  "kings-landing": Object.freeze({ x: 12, y: -12, anchor: "start" }),
  oldtown: Object.freeze({ x: 12, y: -12, anchor: "start" }),
  pentos: Object.freeze({ x: 12, y: 19, anchor: "start" }),
  astapor: Object.freeze({ x: -12, y: -12, anchor: "end" }),
  yunkai: Object.freeze({ x: 13, y: 20, anchor: "start" }),
  meereen: Object.freeze({ x: 13, y: -14, anchor: "start" }),
  qarth: Object.freeze({ x: -12, y: 21, anchor: "end" }),
  "vaes-dothrak": Object.freeze({ x: -13, y: 20, anchor: "end" }),
});

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function pointTransform(point) {
  return point ? `translate(${point.x} ${point.y})` : undefined;
}

function completionCopy(journey) {
  if (journey.coverage.completionReason === "season-complete") {
    return `Season 1 is verified through ${journey.coverage.throughEpisode}. The series is ongoing.`;
  }
  if (journey.coverage.completionReason === "character-death") {
    return `Their television journey is complete and verified through ${journey.coverage.throughEpisode}.`;
  }
  return "Their complete television journey across the known world is ready to explore.";
}

function getUniqueSeasonWaypoints(season) {
  const pointsByPlace = new Map();

  getSeasonWaypoints(season).forEach((place, index) => {
    const placeId = season.stops[index]?.placeId ?? `${place.x}:${place.y}`;
    if (!pointsByPlace.has(placeId)) pointsByPlace.set(placeId, {
      ...place,
      id: placeId,
      depiction: season.stops[index]?.depiction ?? "depicted",
    });
  });

  return [...pointsByPlace.values()];
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function JourneyBackLink() {
  return (
    <Link
      to="/home"
      aria-label="Back to Home"
      title="Back to Home"
      className={cn(
        buttonVariants({ variant: "outline", size: "lg" }),
        "journey-back-control",
      )}
    >
      <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
      <span>Back to Home</span>
    </Link>
  );
}

function PendingJourneyPage({ catalogEntry, characterSlug, loadError, loading, onRetry, seriesSlug }) {
  const phone = useMediaQuery(MOBILE_CAMERA_QUERY);
  const [character, setCharacter] = useState(() => catalogEntry ? {
    name: catalogEntry.characterName,
    seriesName: catalogEntry.seriesName,
  } : null);
  const [error, setError] = useState(null);
  const [characterLoadAttempt, setCharacterLoadAttempt] = useState(0);

  useCinematicViewport({ enabled: phone });

  useEffect(() => {
    if (catalogEntry) {
      setCharacter({
        name: catalogEntry.characterName,
        seriesName: catalogEntry.seriesName,
      });
      setError(null);
      return undefined;
    }

    const controller = new AbortController();
    setCharacter(null);
    setError(null);

    fetchCharacter(seriesSlug, characterSlug, controller.signal)
      .then((payload) => setCharacter(payload.character ?? payload))
      .catch((reason) => {
        if (reason.name !== "AbortError") setError(reason.message);
      });

    return () => controller.abort();
  }, [catalogEntry, characterLoadAttempt, characterSlug, seriesSlug]);

  const name = character?.name ?? titleFromSlug(characterSlug);
  const hotdDeferred = catalogEntry?.seriesSlug === "house-of-the-dragon"
    && catalogEntry?.journeyStatus === "deferred";
  const auditedOut = catalogEntry?.journeyStatus === "deferred" && !hotdDeferred;
  const statusCopy = hotdDeferred
    ? `This journey is held until House of the Dragon Season 3 concludes. Status is verified through ${catalogEntry.journeyCoverage.throughEpisode}.`
    : auditedOut
      ? "No route is published because the current evidence does not support a defensible mapped journey."
    : loading
      ? "The verified journey data is loading before the map can begin."
      : "This season-by-season journey is being prepared from verified appearances.";
  const statusLabel = hotdDeferred
    ? "Ongoing Story"
    : auditedOut
      ? "Held by the accuracy audit"
    : loading
      ? "Opening the map room…"
      : "Journey coming soon";

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
            {error || loadError
              ? "This journey could not be opened. Please try again."
              : statusCopy}
          </p>
          <span className="pending-journey-status" role="status" aria-live="polite">
            {error || loadError ? "Journey unavailable" : statusLabel}
          </span>
          {(error || loadError) && (
            <Button
              type="button"
              variant="outline"
              className="journey-retry-control"
              onClick={() => {
                if (loadError && onRetry) onRetry();
                else setCharacterLoadAttempt((attempt) => attempt + 1);
              }}
            >
              Try again
            </Button>
          )}
        </div>
        <JourneyBackLink />
      </section>
    </main>
  );
}

function JourneyExperience({ journey }) {
  const reducedMotion = useReducedMotion();
  const phone = useMediaQuery(MOBILE_CAMERA_QUERY);
  const {
    imageRef: mapImageRef,
    onImageError: handleMapImageError,
    onImageLoad: handleMapImageLoad,
    ready: autoplayReady,
  } = useCinematicLoadReady(JOURNEY_MAP.image);
  const maskId = useId().replaceAll(":", "");
  const mapInstructionsId = useId().replaceAll(":", "");
  const [seasonIndex, setSeasonIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [run, setRun] = useState(0);
  const [overviewView, setOverviewView] = useState(DEFAULT_OVERVIEW_VIEW);
  const pausedRef = useRef(false);
  const stageRef = useRef(null);
  const cameraRef = useRef(null);
  const pathRef = useRef(null);
  const markerRef = useRef(null);
  const overviewViewRef = useRef(DEFAULT_OVERVIEW_VIEW);
  const overviewPointersRef = useRef(new Map());
  const overviewGestureRef = useRef(null);
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
  const visibleSeasonStops = getUniqueSeasonWaypoints(season);
  const lastWaypoint = waypoints.at(-1) ?? waypoints[0];
  const overviewStops = [...new Map(
    journey.seasons
      .flatMap((item) => getUniqueSeasonWaypoints(item))
      .map((place) => [place.id, place]),
  ).values()];
  const originSeason = complete ? journey.seasons[0] : season;
  const originPlace = getSeasonOrigin(originSeason);
  const originPlaceId = originSeason.continuity?.originPlaceId
    ?? originSeason.stops[0]?.placeId;

  useEffect(() => {
    document.title = `${journey.characterName}'s Journey | Map of Ice and Fire`;
  }, [journey.characterName]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const constrainOverviewView = useCallback((candidate) => {
    const scale = clamp(
      Number.isFinite(candidate.scale) ? candidate.scale : OVERVIEW_MIN_SCALE,
      OVERVIEW_MIN_SCALE,
      OVERVIEW_MAX_SCALE,
    );
    const camera = cameraRef.current;
    const stage = stageRef.current;

    if (!camera || !stage) {
      return {
        scale,
        x: scale === OVERVIEW_MIN_SCALE ? 0 : (Number.isFinite(candidate.x) ? candidate.x : 0),
        y: scale === OVERVIEW_MIN_SCALE ? 0 : (Number.isFinite(candidate.y) ? candidate.y : 0),
      };
    }

    const baseScale = phone ? MOBILE_OVERVIEW_BASE_SCALE : 1;
    const scaledWidth = camera.offsetWidth * baseScale * scale;
    const scaledHeight = camera.offsetHeight * baseScale * scale;
    const maximumX = Math.max(0, (scaledWidth - stage.clientWidth) / 2);
    const maximumY = Math.max(0, (scaledHeight - stage.clientHeight) / 2);

    return {
      scale,
      x: clamp(Number.isFinite(candidate.x) ? candidate.x : 0, -maximumX, maximumX),
      y: clamp(Number.isFinite(candidate.y) ? candidate.y : 0, -maximumY, maximumY),
    };
  }, [phone]);

  const commitOverviewView = useCallback((candidate) => {
    const next = constrainOverviewView(candidate);
    const current = overviewViewRef.current;

    if (
      Math.abs(next.scale - current.scale) < 0.001
      && Math.abs(next.x - current.x) < 0.1
      && Math.abs(next.y - current.y) < 0.1
    ) return current;

    overviewViewRef.current = next;
    setOverviewView(next);
    return next;
  }, [constrainOverviewView]);

  const resetOverviewView = useCallback(() => {
    overviewPointersRef.current.clear();
    overviewGestureRef.current = null;
    overviewViewRef.current = DEFAULT_OVERVIEW_VIEW;
    setOverviewView(DEFAULT_OVERVIEW_VIEW);
  }, []);

  const setOverviewScale = useCallback((requestedScale, anchor) => {
    const current = overviewViewRef.current;
    const nextScale = clamp(requestedScale, OVERVIEW_MIN_SCALE, OVERVIEW_MAX_SCALE);
    const stage = stageRef.current;

    if (!stage || Math.abs(nextScale - current.scale) < 0.001) return;

    const stageBounds = stage.getBoundingClientRect();
    const stageCenterX = stageBounds.left + stageBounds.width / 2;
    const stageCenterY = stageBounds.top + stageBounds.height / 2;
    const anchorX = anchor?.x ?? stageCenterX;
    const anchorY = anchor?.y ?? stageCenterY;
    const scaleRatio = nextScale / current.scale;

    commitOverviewView({
      scale: nextScale,
      x: current.x + (1 - scaleRatio) * (anchorX - stageCenterX - current.x),
      y: current.y + (1 - scaleRatio) * (anchorY - stageCenterY - current.y),
    });
  }, [commitOverviewView]);

  const seedOverviewGesture = useCallback(() => {
    const pointers = [...overviewPointersRef.current.values()];
    const current = overviewViewRef.current;

    if (pointers.length === 0) {
      overviewGestureRef.current = null;
      return;
    }

    if (pointers.length === 1) {
      overviewGestureRef.current = {
        kind: "pan",
        pointerId: pointers[0].id,
        startPointerX: pointers[0].x,
        startPointerY: pointers[0].y,
        startX: current.x,
        startY: current.y,
      };
      return;
    }

    const [first, second] = pointers;
    overviewGestureRef.current = {
      kind: "pinch",
      startCenterX: (first.x + second.x) / 2,
      startCenterY: (first.y + second.y) / 2,
      startDistance: Math.max(Math.hypot(second.x - first.x, second.y - first.y), 1),
      startScale: current.scale,
      startX: current.x,
      startY: current.y,
    };
  }, []);

  const handleOverviewPointerDown = useCallback((event) => {
    if (!complete || (event.pointerType === "mouse" && event.button !== 0)) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    overviewPointersRef.current.set(event.pointerId, {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    });
    seedOverviewGesture();
  }, [complete, seedOverviewGesture]);

  const handleOverviewPointerMove = useCallback((event) => {
    if (!complete || !overviewPointersRef.current.has(event.pointerId)) return;

    event.preventDefault();
    overviewPointersRef.current.set(event.pointerId, {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    });

    const gesture = overviewGestureRef.current;
    if (!gesture) return;

    if (gesture.kind === "pan") {
      const pointer = overviewPointersRef.current.get(gesture.pointerId);
      if (!pointer) {
        seedOverviewGesture();
        return;
      }

      commitOverviewView({
        scale: overviewViewRef.current.scale,
        x: gesture.startX + pointer.x - gesture.startPointerX,
        y: gesture.startY + pointer.y - gesture.startPointerY,
      });
      return;
    }

    const [first, second] = [...overviewPointersRef.current.values()];
    const stage = stageRef.current;
    if (!first || !second || !stage) return;

    const centerX = (first.x + second.x) / 2;
    const centerY = (first.y + second.y) / 2;
    const distance = Math.max(Math.hypot(second.x - first.x, second.y - first.y), 1);
    const nextScale = clamp(
      gesture.startScale * (distance / gesture.startDistance),
      OVERVIEW_MIN_SCALE,
      OVERVIEW_MAX_SCALE,
    );
    const scaleRatio = nextScale / gesture.startScale;
    const stageBounds = stage.getBoundingClientRect();
    const stageCenterX = stageBounds.left + stageBounds.width / 2;
    const stageCenterY = stageBounds.top + stageBounds.height / 2;

    commitOverviewView({
      scale: nextScale,
      x: centerX - stageCenterX
        - scaleRatio * (gesture.startCenterX - stageCenterX - gesture.startX),
      y: centerY - stageCenterY
        - scaleRatio * (gesture.startCenterY - stageCenterY - gesture.startY),
    });
  }, [commitOverviewView, complete, seedOverviewGesture]);

  const finishOverviewPointer = useCallback((event) => {
    if (!overviewPointersRef.current.has(event.pointerId)) return;

    overviewPointersRef.current.delete(event.pointerId);
    seedOverviewGesture();
  }, [seedOverviewGesture]);

  const handleOverviewWheel = useCallback((event) => {
    if (!complete) return;

    event.preventDefault();
    event.stopPropagation();
    const zoomFactor = Math.exp(-event.deltaY * 0.0015);
    setOverviewScale(overviewViewRef.current.scale * zoomFactor, {
      x: event.clientX,
      y: event.clientY,
    });
  }, [complete, setOverviewScale]);

  const handleOverviewKeyDown = useCallback((event) => {
    if (!complete) return;

    let handled = true;
    const current = overviewViewRef.current;

    switch (event.key) {
      case "+":
      case "=":
        setOverviewScale(current.scale + OVERVIEW_ZOOM_STEP);
        break;
      case "-":
      case "_":
        setOverviewScale(current.scale - OVERVIEW_ZOOM_STEP);
        break;
      case "0":
        resetOverviewView();
        break;
      case "w":
      case "W":
        commitOverviewView({ ...current, y: current.y - OVERVIEW_KEYBOARD_PAN_PX });
        break;
      case "s":
      case "S":
        commitOverviewView({ ...current, y: current.y + OVERVIEW_KEYBOARD_PAN_PX });
        break;
      case "a":
      case "A":
        commitOverviewView({ ...current, x: current.x - OVERVIEW_KEYBOARD_PAN_PX });
        break;
      case "d":
      case "D":
        commitOverviewView({ ...current, x: current.x + OVERVIEW_KEYBOARD_PAN_PX });
        break;
      default:
        handled = false;
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, [commitOverviewView, complete, resetOverviewView, setOverviewScale]);

  const handleOverviewDoubleClick = useCallback((event) => {
    // Repeated edge taps used for phone progression can synthesize a dblclick
    // after the final tap switches the page into its interactive overview.
    // Touch already has explicit pinch controls, so reserve this shortcut for
    // mouse/trackpad input and never let completion inherit an accidental zoom.
    if (phone || !complete || event.nativeEvent.sourceCapabilities?.firesTouchEvents) return;

    event.preventDefault();
    event.stopPropagation();
    setOverviewScale(overviewViewRef.current.scale + OVERVIEW_ZOOM_STEP, {
      x: event.clientX,
      y: event.clientY,
    });
  }, [complete, phone, setOverviewScale]);

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

  useEffect(() => {
    if (complete) return;

    const current = overviewViewRef.current;
    if (
      current.scale !== DEFAULT_OVERVIEW_VIEW.scale
      || current.x !== DEFAULT_OVERVIEW_VIEW.x
      || current.y !== DEFAULT_OVERVIEW_VIEW.y
    ) resetOverviewView();
  }, [complete, resetOverviewView]);

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

  useLayoutEffect(() => {
    const camera = cameraRef.current;
    const stage = stageRef.current;
    if (!complete || !camera || !stage) return undefined;

    const keepMapWithinBounds = () => {
      commitOverviewView(overviewViewRef.current);
    };

    keepMapWithinBounds();
    const resizeObserver = new ResizeObserver(keepMapWithinBounds);
    resizeObserver.observe(camera);
    resizeObserver.observe(stage);
    window.addEventListener("resize", keepMapWithinBounds);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", keepMapWithinBounds);
    };
  }, [commitOverviewView, complete]);

  useEffect(() => {
    const camera = cameraRef.current;
    if (!complete || !camera) return undefined;

    camera.addEventListener("wheel", handleOverviewWheel, { passive: false });
    return () => camera.removeEventListener("wheel", handleOverviewWheel);
  }, [complete, handleOverviewWheel]);

  useLayoutEffect(() => {
    if (autoplayReady || reducedMotion || complete) return;

    const path = pathRef.current;
    if (!path) return;

    const pathLength = Math.max(path.getTotalLength(), 0.01);
    path.style.strokeDasharray = `${pathLength}`;
    path.style.strokeDashoffset = `${pathLength}`;
  }, [autoplayReady, complete, reducedMotion, seasonIndex]);

  useEffect(() => {
    const handleArrowNavigation = (event) => {
      const target = event.target;
      if (
        event.defaultPrevented
        || event.altKey
        || event.ctrlKey
        || event.metaKey
        || event.shiftKey
        || target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target instanceof HTMLSelectElement
        || target?.isContentEditable
      ) return;

      if ((event.key === "ArrowRight" || event.key === "ArrowDown") && !complete) {
        event.preventDefault();
        goToNext();
      }

      if ((event.key === "ArrowLeft" || event.key === "ArrowUp") && (complete || seasonIndex > 0)) {
        event.preventDefault();
        goToPrevious();
      }

      if ((event.key === " " || event.code === "Space") && !complete && !reducedMotion) {
        event.preventDefault();
        setPaused((value) => !value);
      }
    };

    window.addEventListener("keydown", handleArrowNavigation);
    return () => window.removeEventListener("keydown", handleArrowNavigation);
  }, [complete, goToNext, goToPrevious, reducedMotion, seasonIndex]);

  useEffect(() => {
    if (!autoplayReady || reducedMotion || complete) return undefined;

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
  }, [autoplayReady, complete, journey.seasons.length, reducedMotion, run, season, seasonIndex]);

  const replay = useCallback(() => {
    setPaused(false);
    setComplete(false);
    setSeasonIndex(0);
    resetOverviewView();
    mobileCameraRef.current.initialized = false;
    mobileCameraRef.current.needsPosition = true;
    setRun((value) => value + 1);
  }, [resetOverviewView]);

  const selectSeason = useCallback((index) => {
    setPaused(false);
    setComplete(false);
    setSeasonIndex(index);
    resetOverviewView();
    setRun((value) => value + 1);
  }, [resetOverviewView]);

  const cameraStyle = {
    "--camera-x": `${season.camera.x}%`,
    "--camera-y": `${season.camera.y}%`,
    "--camera-scale": season.camera.scale,
    ...(complete ? {
      "--overview-scale": overviewView.scale,
      "--overview-x": `${overviewView.x}px`,
      "--overview-y": `${overviewView.y}px`,
      touchAction: "none",
    } : {}),
  };
  const markerTransform = reducedMotion
    ? pointTransform(lastWaypoint)
    : pointTransform(waypoints[0]);

  return (
    <main className="journey-page">
      <section
        ref={stageRef}
        className={cn(
          "journey-stage",
          complete && "is-complete",
          reducedMotion && "is-reduced-motion",
        )}
        aria-labelledby="journey-title"
        {...(complete ? {} : stagePointerHandlers)}
      >
        <div
          ref={cameraRef}
          className={cn(
            "journey-camera",
            (complete || reducedMotion) && "is-overview",
            complete && "is-zoomable-overview",
          )}
          style={cameraStyle}
          data-map-scale={complete ? overviewView.scale.toFixed(2) : undefined}
          role={complete ? "region" : undefined}
          aria-label={complete ? `${journey.characterName}'s completed journey map` : undefined}
          aria-describedby={complete ? mapInstructionsId : undefined}
          tabIndex={complete ? 0 : undefined}
          onDoubleClick={complete ? handleOverviewDoubleClick : undefined}
          onKeyDown={complete ? handleOverviewKeyDown : undefined}
          onPointerCancel={complete ? finishOverviewPointer : undefined}
          onPointerDown={complete ? handleOverviewPointerDown : undefined}
          onPointerMove={complete ? handleOverviewPointerMove : undefined}
          onPointerUp={complete ? finishOverviewPointer : undefined}
          onLostPointerCapture={complete ? finishOverviewPointer : undefined}
        >
          <img
            ref={mapImageRef}
            className="journey-map-image"
            src={JOURNEY_MAP.image}
            alt="Illustrated map of Westeros and Essos"
            width={JOURNEY_MAP.width}
            height={JOURNEY_MAP.height}
            fetchPriority="high"
            draggable="false"
            onError={handleMapImageError}
            onLoad={(event) => {
              setMapFailed(false);
              handleMapImageLoad(event);
            }}
            onErrorCapture={() => setMapFailed(true)}
          />
          <svg
            className="journey-route-layer"
            viewBox={`0 0 ${JOURNEY_MAP.width} ${JOURNEY_MAP.height}`}
            aria-label="Journey route and major city reference layer"
          >
            <g className="journey-city-layer" aria-label="Major cities">
              {MAJOR_CITIES.map((city) => {
                const label = CITY_LABEL_OFFSETS[city.id];
                return (
                <g
                  className="journey-city"
                  data-city-id={city.id}
                  key={city.id}
                  tabIndex="0"
                  aria-label={city.name}
                >
                  <title>{city.name}</title>
                  <circle cx={city.x} cy={city.y} r="5" />
                  <text
                    x={city.x + label.x}
                    y={city.y + label.y}
                    textAnchor={label.anchor}
                  >
                    {city.name}
                  </text>
                </g>
                );
              })}
            </g>

            {!complete && !reducedMotion && (
              <defs>
                <mask id={`${maskId}-season-${season.season}`}>
                  <path ref={pathRef} className="journey-route-reveal" d={season.path} />
                </mask>
              </defs>
            )}

            {complete ? journey.seasons.flatMap((item) => item.routeSegments.map((segment, index) => (
              <path
                className={cn(
                  "journey-route journey-route-complete",
                  segment.kind === "officially-inferred-route" && "journey-route-inferred",
                )}
                d={segment.path}
                key={`complete-${item.season}-${index}`}
              />
            ))) : (
              <>
                {!reducedMotion && <path className="journey-route-guide" d={season.path} />}
                <path
                  className="journey-route journey-route-trace"
                  d={season.path}
                  mask={reducedMotion ? undefined : `url(#${maskId}-season-${season.season})`}
                />
                {season.routeSegments
                  .filter((segment) => segment.kind === "officially-inferred-route")
                  .map((segment, index) => (
                    <path
                      className="journey-route journey-route-inferred"
                      d={segment.path}
                      key={`inferred-${season.season}-${index}`}
                    />
                  ))}
              </>
            )}

            {(complete ? overviewStops : visibleSeasonStops).map((place, index) => (
              <circle
                className={cn(
                  "journey-stop",
                  place.depiction === "officially_inferred" && "journey-stop-inferred",
                )}
                key={`${complete ? "all" : season.season}-${index}-${place.id ?? place.name}`}
                data-place-id={place.id}
                cx={place.x}
                cy={place.y}
                r="13"
              />
            ))}

            {originPlace && (
              <circle
                className="journey-stop"
                data-journey-origin=""
                data-place-id={originPlaceId}
                cx={originPlace.x}
                cy={originPlace.y}
                r="13"
              />
            )}

            {!complete && (
              <g ref={markerRef} className="journey-marker" transform={markerTransform}>
                <circle r="8" />
              </g>
            )}
          </svg>
        </div>

        <div className="journey-vignette" aria-hidden="true" />
        {mapFailed && (
          <div className="journey-map-error" role="alert">
            <strong>The map artwork did not load.</strong>
            <span>The journey is safe. Refresh the artwork to continue.</span>
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              Refresh map
            </Button>
          </div>
        )}
        <JourneyBackLink />
        <div className={cn("journey-copy", complete && "journey-complete-copy")} key={`copy-${complete ? "complete" : season.season}`}>
          <p className="journey-kicker">
            {complete
              ? `Complete journey · verified through ${journey.coverage.throughEpisode}`
              : `Season ${season.season} of ${journey.totalSeasons}`}
          </p>
          <h1 id="journey-title">{complete ? journey.characterName : season.title}</h1>
          {complete && <p>{completionCopy(journey)}</p>}
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
            <Button type="button" variant="outline" size="lg" className="journey-control" onClick={replay}>
              <RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
              Replay
            </Button>
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

        {complete && (
          <div className="journey-zoom-controls" role="group" aria-label="Map zoom controls">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="journey-zoom-control"
              aria-label="Zoom out"
              title="Zoom out"
              data-map-action="zoom-out"
              disabled={overviewView.scale <= OVERVIEW_MIN_SCALE}
              onClick={() => setOverviewScale(overviewViewRef.current.scale - OVERVIEW_ZOOM_STEP)}
            >
              <MinusIcon aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="journey-zoom-control"
              aria-label="Reset map view"
              title="Reset map view"
              data-map-action="reset"
              disabled={
                overviewView.scale === DEFAULT_OVERVIEW_VIEW.scale
                && overviewView.x === DEFAULT_OVERVIEW_VIEW.x
                && overviewView.y === DEFAULT_OVERVIEW_VIEW.y
              }
              onClick={resetOverviewView}
            >
              <RotateCcwIcon aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="journey-zoom-control"
              aria-label="Zoom in"
              title="Zoom in"
              data-map-action="zoom-in"
              disabled={overviewView.scale >= OVERVIEW_MAX_SCALE}
              onClick={() => setOverviewScale(overviewViewRef.current.scale + OVERVIEW_ZOOM_STEP)}
            >
              <PlusIcon aria-hidden="true" />
            </Button>
          </div>
        )}

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
            ? `${journey.characterName}'s complete journey is displayed. Map zoom ${Math.round(overviewView.scale * 100)} percent.`
            : `Season ${season.season}`}
        </p>
        {complete && (
          <p id={mapInstructionsId} className="sr-only">
            Zoom with the controls, plus and minus keys, a mouse wheel, or a pinch.
            Drag the map or use W, A, S, and D to pan. Press zero to reset the map view.
          </p>
        )}
      </section>
    </main>
  );
}

export function CharacterJourneyPage() {
  const navigate = useNavigate();
  const { characterSlug = "", seriesSlug = "" } = useParams();
  const catalogEntry = getJourneyCatalogEntry(seriesSlug, characterSlug);
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(catalogEntry?.journeyStatus === "published");
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      navigate("/home");
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [navigate]);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setJourney(null);
    setLoadError(null);

    if (catalogEntry?.journeyStatus !== "published") {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    loadJourney(seriesSlug, characterSlug)
      .then((loadedJourney) => {
        if (!active) return;
        if (!loadedJourney) throw new Error("Published journey module is missing");
        setJourney(loadedJourney);
      })
      .catch((reason) => {
        if (active) setLoadError(reason);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [catalogEntry, characterSlug, loadAttempt, seriesSlug]);

  if (!journey) {
    return (
      <PendingJourneyPage
        catalogEntry={catalogEntry}
        characterSlug={characterSlug}
        loadError={loadError}
        loading={loading}
        onRetry={loadError ? () => setLoadAttempt((attempt) => attempt + 1) : undefined}
        seriesSlug={seriesSlug}
      />
    );
  }

  return <JourneyExperience key={journey.key} journey={journey} />;
}
