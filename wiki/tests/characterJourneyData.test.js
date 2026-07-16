import { describe, expect, it } from "vitest";
import blobAssets from "../src/data/blobAssets.json";
import {
  getJourney,
  getSeasonWaypoints,
  JOURNEY_MAP,
  PLACES,
  PUBLISHED_JOURNEYS,
} from "../src/data/journeys/publishedJourneys.js";

const journeys = Object.values(PUBLISHED_JOURNEYS);

describe("shared character journey data", () => {
  it("drives all six published characters through the same map contract", () => {
    expect(journeys).toHaveLength(6);

    for (const journey of journeys) {
      expect(journey.key).toBe(`game-of-thrones/${journey.characterSlug}`);
      expect(getJourney("game-of-thrones", journey.characterSlug)).toBe(journey);
      expect(journey.seasons.length).toBeGreaterThanOrEqual(7);

      for (const item of journey.seasons) {
        expect(item).not.toHaveProperty("poster");
        expect(item).not.toHaveProperty("route");
        expect(item.path).toMatch(/^M\s/);
        expect(item.summary.length).toBeGreaterThan(40);
        expect(getSeasonWaypoints(item)).toHaveLength(item.stops.length);
      }
    }
  });

  it("keeps every shared place strictly inside the illustrated map", () => {
    expect(JOURNEY_MAP.width).toBe(1484);
    expect(JOURNEY_MAP.height).toBe(1060);
    expect(JOURNEY_MAP.image).toBe(blobAssets.maps.world.url);

    for (const place of Object.values(PLACES)) {
      expect(place.x).toBeGreaterThan(0);
      expect(place.x).toBeLessThan(JOURNEY_MAP.width);
      expect(place.y).toBeGreaterThan(0);
      expect(place.y).toBeLessThan(JOURNEY_MAP.height);
    }
  });

  it("keeps the corrected Season 6 journey at depicted locations", () => {
    const journey = getJourney("game-of-thrones", "daenerys-targaryen");
    const seasonSix = journey.seasons.find((item) => item.season === 6);

    expect(seasonSix.stops.at(-1).placeId).toBe("meereen");
    expect(getSeasonWaypoints(seasonSix).at(-1)).toEqual(PLACES.meereen);
  });
});
