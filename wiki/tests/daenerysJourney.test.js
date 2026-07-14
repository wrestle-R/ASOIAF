import { describe, expect, it } from "vitest";
import {
  DAENERYS_PLACES,
  DAENERYS_SEASONS,
  getSeasonWaypoints,
  JOURNEY_MAP,
} from "../src/data/daenerysJourney.js";

describe("Daenerys journey", () => {
  it("contains exactly eight ordered television seasons", () => {
    expect(DAENERYS_SEASONS).toHaveLength(8);
    expect(DAENERYS_SEASONS.map((season) => season.season)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("keeps every waypoint inside the map and resolves every route", () => {
    for (const place of Object.values(DAENERYS_PLACES)) {
      expect(place.x).toBeGreaterThan(0);
      expect(place.x).toBeLessThan(JOURNEY_MAP.width);
      expect(place.y).toBeGreaterThan(0);
      expect(place.y).toBeLessThan(JOURNEY_MAP.height);
    }

    for (const season of DAENERYS_SEASONS) {
      expect(getSeasonWaypoints(season)).toHaveLength(season.route.length);
      expect(season.path).toMatch(/^M /);
      expect(season.summary.length).toBeGreaterThan(40);
      expect(season.duration).toBeGreaterThanOrEqual(3000);
    }
  });

  it("assigns every season a unique encoded fallback poster", () => {
    const posters = DAENERYS_SEASONS.map((season) => season.poster);
    expect(new Set(posters).size).toBe(8);
    for (const poster of posters) {
      expect(poster).toMatch(/^\/assets\/danerys%20seasons\/season-0[1-8]\.webp$/);
    }
  });

  it("ends the Season 6 route at Dragonstone", () => {
    expect(DAENERYS_SEASONS[5].route.at(-1)).toBe("dragonstone");
    expect(DAENERYS_SEASONS[5].path.trim().endsWith("604 625")).toBe(true);
  });
});
