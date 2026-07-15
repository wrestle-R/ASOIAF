import { useCallback, useLayoutEffect, useRef } from "react";

const INTERACTIVE_TARGETS = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "summary",
  "[contenteditable='true']",
  "[role='button']",
].join(",");
const TAP_SLOP = 16;

function isInteractiveTarget(target) {
  return target instanceof Element && Boolean(target.closest(INTERACTIVE_TARGETS));
}

export function useCinematicViewport({ enabled, onNext, onPrevious }) {
  const pointerStartRef = useRef(null);

  useLayoutEffect(() => {
    if (!enabled) return undefined;

    const root = document.documentElement;
    const body = document.body;
    window.scrollTo(0, 0);
    root.classList.add("cinematic-viewport-active");
    body.classList.add("cinematic-viewport-active");

    return () => {
      root.classList.remove("cinematic-viewport-active");
      body.classList.remove("cinematic-viewport-active");
      window.scrollTo(0, 0);
    };
  }, [enabled]);

  const onPointerDown = useCallback((event) => {
    if (!enabled || event.button > 0 || isInteractiveTarget(event.target)) {
      pointerStartRef.current = null;
      return;
    }

    pointerStartRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  }, [enabled]);

  const onPointerUp = useCallback((event) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;

    if (
      !enabled
      || !start
      || start.id !== event.pointerId
      || isInteractiveTarget(event.target)
      || Math.abs(event.clientX - start.x) > TAP_SLOP
      || Math.abs(event.clientY - start.y) > TAP_SLOP
    ) {
      return;
    }

    if (event.clientX < window.innerWidth / 2) onPrevious();
    else onNext();
  }, [enabled, onNext, onPrevious]);

  const onPointerCancel = useCallback(() => {
    pointerStartRef.current = null;
  }, []);

  return { onPointerCancel, onPointerDown, onPointerUp };
}
