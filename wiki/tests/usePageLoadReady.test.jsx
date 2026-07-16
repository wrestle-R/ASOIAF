import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  useCinematicLoadReady,
  usePageLoadReady,
} from "../src/hooks/usePageLoadReady.js";

afterEach(() => {
  cleanup();
  delete document.readyState;
});

describe("usePageLoadReady", () => {
  it("is ready immediately when the full page already loaded", () => {
    Object.defineProperty(document, "readyState", {
      configurable: true,
      value: "complete",
    });

    const { result } = renderHook(() => usePageLoadReady());

    expect(result.current).toBe(true);
  });

  it("waits for the window load event while the page is still loading", () => {
    Object.defineProperty(document, "readyState", {
      configurable: true,
      value: "loading",
    });

    const { result } = renderHook(() => usePageLoadReady());
    expect(result.current).toBe(false);

    act(() => window.dispatchEvent(new Event("load")));

    expect(result.current).toBe(true);
  });
});

function CinematicImage({ fallbackSource, source }) {
  const {
    imageRef,
    onImageError,
    onImageLoad,
    ready,
  } = useCinematicLoadReady(source, { fallbackSource });

  return (
    <>
      <span>{ready ? "ready" : "waiting"}</span>
      <img
        ref={imageRef}
        src={source}
        alt="Critical map"
        onError={onImageError}
        onLoad={onImageLoad}
      />
    </>
  );
}

describe("useCinematicLoadReady", () => {
  it("waits for the critical image after the document is complete", () => {
    Object.defineProperty(document, "readyState", {
      configurable: true,
      value: "complete",
    });
    render(<CinematicImage source="/map.webp" />);

    expect(screen.getByText("waiting")).toBeInTheDocument();
    fireEvent.load(screen.getByRole("img", { name: "Critical map" }));
    expect(screen.getByText("ready")).toBeInTheDocument();
  });

  it("waits for a fallback image, then fails open if that fallback also errors", () => {
    Object.defineProperty(document, "readyState", {
      configurable: true,
      value: "complete",
    });
    render(<CinematicImage source="/missing.webp" fallbackSource="/fallback.webp" />);
    const image = screen.getByRole("img", { name: "Critical map" });

    fireEvent.error(image);
    expect(image).toHaveAttribute("src", "/fallback.webp");
    expect(screen.getByText("waiting")).toBeInTheDocument();

    fireEvent.error(image);
    expect(screen.getByText("ready")).toBeInTheDocument();
  });
});
