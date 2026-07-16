import { describe, expect, it } from "vitest";
import blobAssets from "../src/data/blobAssets.json";
import {
  getJourney,
  getSeasonWaypoints,
  JOURNEY_MAP,
  PLACES,
  PUBLISHED_JOURNEYS,
  PUBLISHED_JOURNEY_KEYS,
} from "../src/data/journeys/publishedJourneys.js";

const journeys = Object.values(PUBLISHED_JOURNEYS);

function distance(left, right) {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function pathEndpoints(path) {
  const numbers = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];

  return {
    count: numbers.length,
    first: { x: numbers[0], y: numbers[1] },
    last: { x: numbers.at(-2), y: numbers.at(-1) },
  };
}

describe("published character journeys", () => {
  it("publishes exactly the six source-backed pilot characters", () => {
    expect(PUBLISHED_JOURNEY_KEYS).toHaveLength(6);
    expect(new Set(PUBLISHED_JOURNEY_KEYS).size).toBe(6);
    expect([...PUBLISHED_JOURNEY_KEYS].sort()).toEqual([
      "game-of-thrones/arya-stark",
      "game-of-thrones/brienne-of-tarth",
      "game-of-thrones/cersei-lannister",
      "game-of-thrones/daenerys-targaryen",
      "game-of-thrones/jon-snow",
      "game-of-thrones/tyrion-lannister",
    ]);
  });

  it("keeps keys and lookup fields collision-safe and internally consistent", () => {
    for (const journey of journeys) {
      expect(journey.key).toBe(`${journey.seriesSlug}/${journey.characterSlug}`);
      expect(journey.seriesSlug).toBe("game-of-thrones");
      expect(journey.seriesName).toBe("Game of Thrones");
      expect(journey.totalSeasons).toBe(8);
      expect(getJourney(journey.seriesSlug, journey.characterSlug)).toBe(journey);
    }

    expect(getJourney("game-of-thrones", "not-published")).toBeNull();
    expect(getJourney("house-of-the-dragon", "daenerys-targaryen")).toBeNull();
  });

  it("uses ordered, non-duplicated television season numbers", () => {
    for (const journey of journeys) {
      const seasonNumbers = journey.seasons.map((item) => item.season);
      expect(seasonNumbers).toEqual([...seasonNumbers].sort((left, right) => left - right));
      expect(new Set(seasonNumbers).size).toBe(seasonNumbers.length);
      expect(seasonNumbers.every((number) => number >= 1 && number <= 8)).toBe(true);
    }

    expect(getJourney("game-of-thrones", "brienne-of-tarth").seasons.map((item) => item.season)).toEqual([2, 3, 4, 5, 6, 7, 8]);
    expect(getJourney("game-of-thrones", "daenerys-targaryen").seasons.map((item) => item.season)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("attaches episode-level HBO evidence to every depicted stop", () => {
    for (const journey of journeys) {
      for (const item of journey.seasons) {
        expect(item.stops.length).toBeGreaterThan(0);
        expect(item.summary.length).toBeGreaterThan(40);

        for (const stop of item.stops) {
          expect(stop.depiction).toBe("depicted");
          expect(stop.episode).toMatch(/^S[1-8]E(?:[1-9]|10)$/);
          expect(stop.episode.startsWith(`S${item.season}E`)).toBe(true);
          expect(stop.source.title).toContain(stop.episode);
          expect(stop.source.url).toMatch(/^https:\/\/www\.hbo\.com\/game-of-thrones\/season-[1-8]\/(?:[1-9]|10)-[a-z0-9-]+$/);
        }
      }
    }
  });

  it("resolves every stop to a bounded point on the shared map", () => {
    expect(JOURNEY_MAP).toEqual({
      width: 1484,
      height: 1060,
      image: blobAssets.maps.world.url,
    });

    for (const place of Object.values(PLACES)) {
      expect(place.name.length).toBeGreaterThan(1);
      expect(place.x).toBeGreaterThan(0);
      expect(place.x).toBeLessThan(JOURNEY_MAP.width);
      expect(place.y).toBeGreaterThan(0);
      expect(place.y).toBeLessThan(JOURNEY_MAP.height);
    }

    for (const journey of journeys) {
      for (const item of journey.seasons) {
        const waypoints = getSeasonWaypoints(item);
        expect(waypoints).toHaveLength(item.stops.length);
        expect(waypoints.every(Boolean)).toBe(true);
      }
    }
  });

  it("provides valid schematic SVG paths whose endpoints meet their first and last stops", () => {
    for (const journey of journeys) {
      for (const item of journey.seasons) {
        expect(item.path).toMatch(/^M\s+-?\d/);
        expect(item.path).not.toMatch(/(?:NaN|undefined|null)/);
        expect(item.path).toMatch(/^[\d\s.,MCLSQTAHVZ-]+$/i);

        const endpoints = pathEndpoints(item.path);
        const waypoints = getSeasonWaypoints(item);
        expect(endpoints.count).toBeGreaterThanOrEqual(4);
        expect(distance(endpoints.first, waypoints[0])).toBeLessThanOrEqual(1);
        expect(distance(endpoints.last, waypoints.at(-1))).toBeLessThanOrEqual(1);
      }
    }
  });

  it("supplies finite camera and timing values for animated and stationary seasons", () => {
    let stationarySeasonCount = 0;

    for (const journey of journeys) {
      for (const item of journey.seasons) {
        if (item.stops.length === 1) stationarySeasonCount += 1;
        expect(item.camera.x).toBeGreaterThan(0);
        expect(item.camera.x).toBeLessThan(100);
        expect(item.camera.y).toBeGreaterThan(0);
        expect(item.camera.y).toBeLessThan(100);
        expect(item.camera.scale).toBeGreaterThanOrEqual(1);
        expect(item.camera.scale).toBeLessThanOrEqual(1.2);
        expect(item.duration).toBeGreaterThanOrEqual(3000);
        expect(item.duration).toBeLessThanOrEqual(4400);
      }
    }

    expect(stationarySeasonCount).toBeGreaterThan(0);
  });
});
