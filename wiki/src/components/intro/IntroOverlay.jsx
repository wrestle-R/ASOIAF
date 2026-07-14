import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CAMERA_SCALES,
  getMapCameraFrame,
  INTRO_HOUSE_ORDER,
  MAP_LAYOUTS,
  MAP_POSITIONS,
} from "../../data/mapPositions.js";
import { SigilIcon } from "./SigilIcon.jsx";

const TIMELINE = {
  mapReveal: 450,
  houses: 1250,
  houseDuration: 1050,
  kingsLanding: 10700,
  redKeep: 11350,
  orbit: 12250,
  title: 13200,
  pullback: 14400,
  complete: 14950,
};

function useCinematicAudio() {
  const contextRef = useRef(null);
  const gainRef = useRef(null);
  const [status, setStatus] = useState("blocked");
  const [muted, setMuted] = useState(false);

  const createSoundscape = useCallback(async () => {
    if (!contextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;

      const context = new AudioContext();
      const master = context.createGain();
      const drone = context.createOscillator();
      const droneGain = context.createGain();
      const air = context.createBufferSource();
      const airFilter = context.createBiquadFilter();
      const airGain = context.createGain();

      const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let index = 0; index < channel.length; index += 1) {
        channel[index] = Math.random() * 2 - 1;
      }

      drone.type = "sine";
      drone.frequency.value = 49;
      droneGain.gain.value = 0.018;
      air.buffer = buffer;
      air.loop = true;
      airFilter.type = "lowpass";
      airFilter.frequency.value = 420;
      airGain.gain.value = 0.012;
      master.gain.value = 0;

      drone.connect(droneGain).connect(master);
      air.connect(airFilter).connect(airGain).connect(master);
      master.connect(context.destination);
      drone.start();
      air.start();

      contextRef.current = context;
      gainRef.current = master;
    }

    try {
      await contextRef.current.resume();
      const now = contextRef.current.currentTime;
      gainRef.current.gain.cancelScheduledValues(now);
      gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, now);
      gainRef.current.gain.linearRampToValueAtTime(0.8, now + 1.2);
      setStatus(contextRef.current.state === "running" ? "playing" : "blocked");
      return contextRef.current.state === "running";
    } catch {
      setStatus("blocked");
      return false;
    }
  }, []);

  useEffect(() => {
    createSoundscape();
    return () => {
      const context = contextRef.current;
      if (!context) return;
      const now = context.currentTime;
      gainRef.current?.gain.setTargetAtTime(0, now, 0.03);
      window.setTimeout(() => context.close().catch(() => {}), 120);
    };
  }, [createSoundscape]);

  const toggle = useCallback(async () => {
    if (status === "blocked") {
      await createSoundscape();
      setMuted(false);
      return;
    }

    const nextMuted = !muted;
    setMuted(nextMuted);
    const context = contextRef.current;
    const gain = gainRef.current;
    if (context && gain) {
      gain.gain.setTargetAtTime(nextMuted ? 0 : 0.8, context.currentTime, 0.08);
    }
  }, [createSoundscape, muted, status]);

  return { muted, status, toggle };
}

export function IntroOverlay({ houses, onSkip, onComplete }) {
  const [ready, setReady] = useState(false);
  const [scene, setScene] = useState("darkness");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const skipTimerRef = useRef(null);
  const audio = useCinematicAudio();

  const orderedHouses = useMemo(() => {
    const byId = new Map(houses.map((house) => [house.id, house]));
    return INTRO_HOUSE_ORDER.map((id) => byId.get(id)).filter(Boolean);
  }, [houses]);

  const activeHouse = orderedHouses[activeIndex] ?? null;
  const phone = viewport.width <= 880;
  const layoutName = phone ? "mobile" : "desktop";
  const layout = MAP_LAYOUTS[layoutName];
  const cameraPosition = activeHouse ? MAP_POSITIONS[layoutName][activeHouse.id] : null;

  useEffect(() => {
    const handleResize = () => setViewport({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => () => window.clearTimeout(skipTimerRef.current), []);

  const camera = useMemo(() => {
    const position = cameraPosition || { x: 50, y: 50 };
    const baseScale = activeHouse ? CAMERA_SCALES[activeHouse.id] : 1;
    const finaleTightening = scene === "kings-landing" ? 1.1 : 1;
    const scale = baseScale * (phone ? 1.08 : 1) * finaleTightening;
    const frame = getMapCameraFrame({
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
      position,
      scale,
      aspectRatio: layout.aspectRatio,
      focusX: phone ? 0.5 : 0.32,
      focusY: phone ? 0.47 : 0.5,
    });
    return { ...frame, position, scale };
  }, [activeHouse, cameraPosition, layout.aspectRatio, phone, scene, viewport]);

  useEffect(() => {
    let cancelled = false;
    const preload = (source) => new Promise((resolve) => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = resolve;
      image.src = source;
    });
    const fallback = window.setTimeout(() => setReady(true), 2400);
    Promise.all([
      preload("/assets/world-map-houses.webp"),
      preload("/assets/world-map-realms-mobile-capitals.webp"),
      preload("/assets/cinematic/red-keep.webp"),
    ]).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!ready) return undefined;

    const timers = [];
    const schedule = (callback, delay) => {
      timers.push(window.setTimeout(callback, delay));
    };

    schedule(() => setScene("map-reveal"), TIMELINE.mapReveal);
    orderedHouses.forEach((_, index) => {
      schedule(() => {
        setScene("house-journey");
        setActiveIndex(index);
      }, TIMELINE.houses + index * TIMELINE.houseDuration);
    });
    schedule(() => setScene("kings-landing"), TIMELINE.kingsLanding);
    schedule(() => setScene("red-keep"), TIMELINE.redKeep);
    schedule(() => setScene("orbit"), TIMELINE.orbit);
    schedule(() => setScene("title"), TIMELINE.title);
    schedule(() => setScene("pullback"), TIMELINE.pullback);
    schedule(onComplete, TIMELINE.complete);

    return () => timers.forEach(window.clearTimeout);
  }, [onComplete, orderedHouses, ready]);

  const handleSkip = useCallback(() => {
    setScene("skipping");
    skipTimerRef.current = window.setTimeout(onSkip, 320);
  }, [onSkip]);

  const style = {
    "--map-width": `${camera.mapWidth}px`,
    "--map-height": `${camera.mapHeight}px`,
    "--map-left": `${camera.mapLeft}px`,
    "--map-top": `${camera.mapTop}px`,
    "--camera-transform": `translate3d(${camera.translateX}px, ${camera.translateY}px, 0) scale(${camera.scale})`,
    "--camera-x": `${camera.position.x}%`,
    "--camera-y": `${camera.position.y}%`,
    "--house-color": activeHouse?.color || "#c7ad67",
  };

  return (
    <section
      className={`cinematic cinematic-${scene} ${ready ? "is-ready" : "is-preloading"}`}
      style={style}
      aria-label="Opening journey across Westeros"
    >
      <div className="cinematic-map-camera" aria-hidden="true">
        <div className="cinematic-map-stage">
          <picture>
            <source media="(max-width: 880px)" srcSet="/assets/world-map-realms-mobile-capitals.webp" />
            <img src="/assets/world-map-houses.webp" alt="" draggable="false" />
          </picture>
          <span className="cinematic-map-light" />
          <div className="cinematic-marker-layer">
            {orderedHouses.slice(0, activeIndex + 1).map((house) => {
              const position = MAP_POSITIONS[layoutName][house.id];
              return (
                <span
                  className={`cinematic-map-marker ${house.id === activeHouse?.id ? "is-current" : ""}`}
                  key={house.id}
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                >
                  <SigilIcon house={house} size={32} />
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="red-keep-scene" aria-hidden="true">
        <div className="red-keep-plane red-keep-sky" />
        <div className="red-keep-plane red-keep-far" />
        <div className="red-keep-plane red-keep-mid" />
        <div className="red-keep-plane red-keep-near" />
        <div className="red-keep-atmosphere" />
      </div>

      {activeHouse && (
        <div className="cinematic-house" key={activeHouse.id} aria-live="polite">
          <SigilIcon house={activeHouse} size={78} className="cinematic-sigil" />
          <p>{activeHouse.region || activeHouse.seat}</p>
          <h2>{activeHouse.name}</h2>
          {activeHouse.words && <blockquote>“{activeHouse.words}”</blockquote>}
          <span className="cinematic-house-rule" />
        </div>
      )}

      <div className="cinematic-wordmark" aria-hidden={scene !== "title"}>
        <span>A Wiki of</span>
        <strong>Ice <i>&amp;</i> Fire</strong>
        <small>An archive of the known world</small>
      </div>

      <div className="cinematic-controls">
        <button type="button" className="cinematic-sound" onClick={audio.toggle}>
          <span aria-hidden="true">{audio.status === "blocked" ? "◌" : audio.muted ? "×" : "∿"}</span>
          {audio.status === "blocked" ? "Enable sound" : audio.muted ? "Sound off" : "Sound on"}
        </button>
        <button type="button" className="skip-intro" onClick={handleSkip}>
          Skip intro <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className="cinematic-grain" aria-hidden="true" />
      <div className="cinematic-vignette" aria-hidden="true" />
    </section>
  );
}
