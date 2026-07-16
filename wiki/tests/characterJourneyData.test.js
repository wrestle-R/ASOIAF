import { beforeAll, describe, expect, it } from "vitest";
import blobAssets from "../src/data/blobAssets.json";
import {
  getSeasonWaypoints,
  JOURNEY_MAP,
  loadAllPublishedJourneys,
  loadJourney,
  PLACES,
} from "../src/data/journeys/publishedJourneys.js";

let journeys;

beforeAll(async () => {
  journeys = await loadAllPublishedJourneys();
});

describe("shared character journey data", () => {
  it("drives all 126 Stage 1 characters through the shared contract", () => {
    expect(journeys).toHaveLength(126);
    expect(journeys.filter((journey) => journey.seriesSlug === "game-of-thrones")).toHaveLength(100);
    expect(journeys.filter((journey) => journey.seriesSlug === "a-knight-of-the-seven-kingdoms")).toHaveLength(26);

    for (const journey of journeys) {
      expect(journey.key).toBe(`${journey.seriesSlug}/${journey.characterSlug}`);
      expect(journey.seasons.length).toBeGreaterThan(0);

      for (const item of journey.seasons) {
        expect(item.path).toMatch(/^M\s/);
        expect(item.summary.length).toBeGreaterThan(30);
        expect(item.routeSegments.length).toBeGreaterThan(0);
        expect(getSeasonWaypoints(item)).toHaveLength(item.stops.length);
      }
    }
  });

  it("keeps every shared place and marker radius inside the illustrated map", () => {
    expect(JOURNEY_MAP.width).toBe(1484);
    expect(JOURNEY_MAP.height).toBe(1060);
    expect(JOURNEY_MAP.image).toBe(blobAssets.maps.world.url);

    for (const place of Object.values(PLACES)) {
      expect(place.x).toBeGreaterThanOrEqual(13);
      expect(place.x).toBeLessThanOrEqual(JOURNEY_MAP.width - 13);
      expect(place.y).toBeGreaterThanOrEqual(13);
      expect(place.y).toBeLessThanOrEqual(JOURNEY_MAP.height - 13);
    }
  });

  it("keeps Arya's Braavos stops on the audited Great Lagoon anchor", async () => {
    const journey = await loadJourney("game-of-thrones", "arya-stark");
    const braavosStops = journey.seasons
      .flatMap((season) => season.stops)
      .filter((stop) => stop.placeId === "braavos");

    expect(braavosStops.length).toBeGreaterThan(0);
    expect(PLACES.braavos).toEqual({ name: "Braavos", x: 720, y: 280 });
  });
});
