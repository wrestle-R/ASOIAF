import { useCallback, useEffect, useState } from "react";
import { fetchIntroHouses } from "../../data/houseApi.js";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import { IntroOverlay } from "./IntroOverlay.jsx";
import { MapLanding } from "./MapLanding.jsx";

const SESSION_KEY = "wiof:introComplete";

function ArchiveState({ error, onRetry }) {
  return (
    <main className="archive-state">
      <div className="archive-state-mark">W</div>
      {error ? (
        <>
          <p className="eyebrow">The archive remains closed</p>
          <h1>We could not open the local record.</h1>
          <p>{error}</p>
          <button type="button" onClick={onRetry}>Try the archive again</button>
        </>
      ) : (
        <>
          <p className="eyebrow">Wiki of Ice and Fire</p>
          <h1>Opening the archive…</h1>
          <span className="ink-loader" aria-label="Loading" />
        </>
      )}
    </main>
  );
}

export function IntroPage() {
  const reducedMotion = useReducedMotion();
  const [houses, setHouses] = useState([]);
  const [error, setError] = useState(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [introActive, setIntroActive] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(SESSION_KEY) !== "true";
  });

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    fetchIntroHouses(controller.signal)
      .then((payload) => setHouses(payload.houses ?? []))
      .catch((reason) => {
        if (reason.name !== "AbortError") setError(reason.message);
      });
    return () => controller.abort();
  }, [requestVersion]);

  const finishIntro = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, "true");
    setIntroActive(false);
  }, []);

  useEffect(() => {
    if (!introActive || reducedMotion || !houses.length) {
      if (reducedMotion && introActive) finishIntro();
      return undefined;
    }
    const timer = window.setTimeout(finishIntro, 7600);
    return () => window.clearTimeout(timer);
  }, [finishIntro, houses.length, introActive, reducedMotion]);

  function replayIntro() {
    if (reducedMotion) return;
    setIntroActive(false);
    requestAnimationFrame(() => setIntroActive(true));
  }

  if (error) {
    return <ArchiveState error={error} onRetry={() => setRequestVersion((v) => v + 1)} />;
  }

  if (!houses.length) return <ArchiveState />;

  return (
    <>
      <MapLanding
        houses={houses}
        introActive={introActive && !reducedMotion}
        onReplay={replayIntro}
        partial={houses.length !== 9}
      />
      {introActive && !reducedMotion && <IntroOverlay onSkip={finishIntro} />}
    </>
  );
}
