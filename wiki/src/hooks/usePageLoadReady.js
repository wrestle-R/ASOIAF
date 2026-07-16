import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

function pageHasLoaded() {
  return typeof document !== "undefined" && document.readyState === "complete";
}

export function usePageLoadReady() {
  const [ready, setReady] = useState(pageHasLoaded);

  useEffect(() => {
    if (ready) return undefined;

    // Recheck inside the effect so a load that lands between the initial
    // render and listener registration cannot leave the cinematic UI waiting.
    if (pageHasLoaded()) {
      setReady(true);
      return undefined;
    }

    const markReady = () => setReady(true);
    window.addEventListener("load", markReady, { once: true });
    return () => window.removeEventListener("load", markReady);
  }, [ready]);

  return ready;
}

function sameAsset(first, second) {
  if (!first || !second) return false;

  try {
    return new URL(first, document.baseURI).href === new URL(second, document.baseURI).href;
  } catch {
    return first === second;
  }
}

export function useCinematicLoadReady(source, { fallbackSource } = {}) {
  const pageReady = usePageLoadReady();
  const imageRef = useRef(null);
  const [imageState, setImageState] = useState(() => ({ ready: false, source }));

  const markImageReady = useCallback(() => {
    setImageState((current) => (
      current.source === source && current.ready
        ? current
        : { ready: true, source }
    ));
  }, [source]);

  const handleImageLoad = useCallback(() => {
    markImageReady();
  }, [markImageReady]);

  const handleImageError = useCallback((event) => {
    const image = event.currentTarget;

    if (fallbackSource && !sameAsset(image.currentSrc || image.src, fallbackSource)) {
      setImageState({ ready: false, source });
      image.src = fallbackSource;
      return;
    }

    // No fallback exists, or the fallback itself failed. At this point there
    // is no remaining asset transition to await, so fail open instead of
    // leaving the controls in a permanently non-progressing state.
    markImageReady();
  }, [fallbackSource, markImageReady, source]);

  useLayoutEffect(() => {
    const image = imageRef.current;
    setImageState((current) => (
      current.source === source && !current.ready
        ? current
        : { ready: false, source }
    ));

    if (!image?.complete) return;

    if (image.naturalWidth > 0) {
      markImageReady();
    } else if (fallbackSource && !sameAsset(image.currentSrc || image.src, fallbackSource)) {
      image.src = fallbackSource;
    } else {
      markImageReady();
    }
  }, [fallbackSource, markImageReady, source]);

  return {
    imageRef,
    onImageError: handleImageError,
    onImageLoad: handleImageLoad,
    ready: pageReady && imageState.source === source && imageState.ready,
  };
}
