import { describe, expect, it } from "vitest";
import { INTRO_HOUSE_IDS } from "../server/houseQueries.js";
import { MAP_POSITIONS, withMapPosition } from "../src/data/mapPositions.js";

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
});
