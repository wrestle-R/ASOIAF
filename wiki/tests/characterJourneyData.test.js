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
        expect(item.title).not.toMatch(/mapped|mapping/i);
        expect(item.path).toMatch(/^M\s/);
        expect(item.summary).toBe("");
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

  it("applies the manually reviewed Jon S1 and Theon S2 routes", async () => {
    const jon = await loadJourney("game-of-thrones", "jon-snow");
    const theon = await loadJourney("game-of-thrones", "theon-greyjoy");

    expect(jon.seasons.find((season) => season.season === 1).stops.map((stop) => stop.placeId))
      .toEqual(["winterfell", "castle-black"]);
    expect(theon.seasons.find((season) => season.season === 2).stops.map((stop) => stop.placeId))
      .toEqual(["pyke", "winterfell", "outside-winterfell", "winterfell"]);
  });
});
