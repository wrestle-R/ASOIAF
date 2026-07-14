import { describe, expect, it } from "vitest";
import { INTRO_HOUSE_IDS } from "../server/houseQueries.js";
import {
  getMapCameraFrame,
  MAP_LAYOUTS,
  MAP_POSITIONS,
  withMapPosition,
} from "../src/data/mapPositions.js";

describe("map positions", () => {
  it.each(["desktop", "mobile"])("covers every intro house in the %s layout", (layout) => {
    expect(Object.keys(MAP_POSITIONS[layout]).sort()).toEqual([...INTRO_HOUSE_IDS].sort());
    for (const position of Object.values(MAP_POSITIONS[layout])) {
      expect(position.x).toBeGreaterThan(0);
      expect(position.x).toBeLessThan(100);
      expect(position.y).toBeGreaterThan(0);
      expect(position.y).toBeLessThan(100);
      expect(["top", "right", "bottom", "left"]).toContain(position.labelOffset);
      expect(position.markerScale).toBeGreaterThan(0);
    }
  });

  it("sorts houses north to south for keyboard order", () => {
    const houses = [...INTRO_HOUSE_IDS].reverse().map((id) => ({ id }));
    const positioned = withMapPosition(houses);
    expect(positioned.map((house) => house.position.desktop.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it.each(["desktop", "mobile"])("anchors each %s marker to its canonical seat", (layout) => {
    const seats = Object.fromEntries(
      Object.entries(MAP_POSITIONS[layout]).map(([id, position]) => [id, position.seat]),
    );
    expect(seats).toEqual({
      "house-stark": "Winterfell",
      "house-greyjoy": "Pyke",
      "house-tully": "Riverrun",
      "house-arryn": "The Eyrie",
      "house-lannister": "Casterly Rock",
      "house-targaryen": "King's Landing",
      "house-tyrell": "Highgarden",
      "house-baratheon": "Storm's End",
      "house-martell": "Sunspear",
    });
  });

  it.each([
    { layout: "desktop", viewportWidth: 1440, viewportHeight: 900, focusX: 0.32, focusY: 0.5 },
    { layout: "desktop", viewportWidth: 1024, viewportHeight: 768, focusX: 0.32, focusY: 0.5 },
    { layout: "desktop", viewportWidth: 1920, viewportHeight: 1080, focusX: 0.32, focusY: 0.5 },
    { layout: "mobile", viewportWidth: 430, viewportHeight: 932, focusX: 0.5, focusY: 0.47 },
    { layout: "mobile", viewportWidth: 390, viewportHeight: 844, focusX: 0.5, focusY: 0.47 },
    { layout: "mobile", viewportWidth: 360, viewportHeight: 800, focusX: 0.5, focusY: 0.47 },
  ])("centers a $layout camera stop at $viewportWidth x $viewportHeight", (viewport) => {
    const position = MAP_POSITIONS[viewport.layout]["house-greyjoy"];
    const scale = viewport.layout === "mobile" ? 1.9 * 1.08 : 1.9;
    const frame = getMapCameraFrame({
      ...viewport,
      position,
      scale,
      aspectRatio: MAP_LAYOUTS[viewport.layout].aspectRatio,
    });
    const renderedX = frame.mapLeft + frame.translateX + frame.mapWidth * position.x / 100 * scale;
    const renderedY = frame.mapTop + frame.translateY + frame.mapHeight * position.y / 100 * scale;

    expect(renderedX).toBeCloseTo(viewport.viewportWidth * viewport.focusX, 5);
    expect(renderedY).toBeCloseTo(viewport.viewportHeight * viewport.focusY, 5);
  });
});
