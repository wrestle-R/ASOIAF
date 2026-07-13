import { describe, expect, it } from "vitest";
import { INTRO_HOUSE_IDS } from "../server/houseQueries.js";
import {
  getMapCameraFrame,
  MAP_POSITIONS,
  withMapPosition,
} from "../src/data/mapPositions.js";

describe("map positions", () => {
  it("covers every intro house with map-relative percentages", () => {
    expect(Object.keys(MAP_POSITIONS).sort()).toEqual([...INTRO_HOUSE_IDS].sort());
    for (const position of Object.values(MAP_POSITIONS)) {
      expect(position.x).toBeGreaterThan(0);
      expect(position.x).toBeLessThan(100);
      expect(position.y).toBeGreaterThan(0);
      expect(position.y).toBeLessThan(100);
    }
  });

  it("sorts houses north to south for keyboard order", () => {
    const houses = [...INTRO_HOUSE_IDS].reverse().map((id) => ({ id }));
    const positioned = withMapPosition(houses);
    expect(positioned.map((house) => house.position.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("anchors each marker to its canonical seat", () => {
    expect(Object.fromEntries(
      Object.entries(MAP_POSITIONS).map(([id, position]) => [id, position.seat]),
    )).toEqual({
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
    { viewportWidth: 1440, viewportHeight: 900, focusX: 0.32, focusY: 0.5 },
    { viewportWidth: 1024, viewportHeight: 768, focusX: 0.32, focusY: 0.5 },
    { viewportWidth: 1920, viewportHeight: 1080, focusX: 0.32, focusY: 0.5 },
    { viewportWidth: 390, viewportHeight: 844, focusX: 0.5, focusY: 0.47 },
  ])("centers a camera stop at the intended focus for $viewportWidth x $viewportHeight", (viewport) => {
    const position = MAP_POSITIONS["house-greyjoy"];
    const scale = viewport.viewportWidth <= 880 ? 1.9 * 1.52 : 1.9;
    const frame = getMapCameraFrame({ ...viewport, position, scale });
    const renderedX = frame.mapLeft + frame.translateX + frame.mapWidth * position.x / 100 * scale;
    const renderedY = frame.mapTop + frame.translateY + frame.mapHeight * position.y / 100 * scale;

    expect(renderedX).toBeCloseTo(viewport.viewportWidth * viewport.focusX, 5);
    expect(renderedY).toBeCloseTo(viewport.viewportHeight * viewport.focusY, 5);
  });
});
