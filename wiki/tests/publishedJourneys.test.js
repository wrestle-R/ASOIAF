import { beforeAll, describe, expect, it } from "vitest";
import blobAssets from "../src/data/blobAssets.json";
import {
  getJourneyCatalogEntry,
  getSeasonOrigin,
  getSeasonWaypoints,
  JOURNEY_CATALOG,
  JOURNEY_CATALOG_KEYS,
  JOURNEY_MAP,
  loadAllPublishedJourneys,
  loadJourney,
  MAJOR_CITIES,
  MAJOR_CITY_PLACE_IDS,
  PLACE_COORDINATE_AUDIT,
  PLACES,
  PUBLISHED_JOURNEY_KEYS,
  REALM_SEAT_PLACE_IDS,
} from "../src/data/journeys/publishedJourneys.js";

const STOP_RADIUS = 13;
const AUDITED_WORLD_MAP_SHA256 = "a542e54376945bcb94670d8d2d20b79ee557fbe270df61653948a6905b98c025";
const REALM_SEAT_ANCHORS = Object.freeze({
  winterfell: { name: "Winterfell", x: 299, y: 272 },
  eyrie: { name: "The Eyrie", x: 336, y: 396 },
  riverrun: { name: "Riverrun", x: 265, y: 504 },
  pyke: { name: "Pyke", x: 109, y: 520 },
  "casterly-rock": { name: "Casterly Rock", x: 78, y: 673 },
  "kings-landing": { name: "King's Landing", x: 403, y: 719 },
  dragonstone: { name: "Dragonstone", x: 602, y: 605 },
  "storms-end": { name: "Storm's End", x: 454, y: 759 },
  highgarden: { name: "Highgarden", x: 123, y: 832 },
  sunspear: { name: "Sunspear", x: 470, y: 919 },
});
const REVIEWED_GEOGRAPHIC_ANCHORS = Object.freeze({
  hardhome: { name: "Hardhome", x: 465, y: 84 },
});

let journeys;

function pathCoordinates(path) {
  const numbers = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  return Array.from({ length: numbers.length / 2 }, (_, index) => ({
    x: numbers[index * 2],
    y: numbers[index * 2 + 1],
  }));
}

beforeAll(async () => {
  journeys = await loadAllPublishedJourneys();
});

describe("published character journeys", () => {
  it("contains the full 203-character catalog and exact Stage 1 split", () => {
    const catalog = Object.values(JOURNEY_CATALOG);
    expect(JOURNEY_CATALOG_KEYS).toHaveLength(203);
    expect(new Set(JOURNEY_CATALOG_KEYS).size).toBe(203);
    expect(catalog.filter((entry) => entry.journeyStatus === "published")).toHaveLength(101);
    expect(catalog.filter((entry) => entry.journeyStatus === "deferred")).toHaveLength(102);
    expect(catalog.filter((entry) => entry.journeyStatus === "pending")).toHaveLength(0);
    expect(PUBLISHED_JOURNEY_KEYS).toHaveLength(101);
    expect(new Set(PUBLISHED_JOURNEY_KEYS).size).toBe(101);
    expect(PUBLISHED_JOURNEY_KEYS.every((key) => JOURNEY_CATALOG[key]?.journeyStatus === "published")).toBe(true);
  });

  it("loads every published key and no deferred HOTD key", async () => {
    expect(journeys.every(Boolean)).toBe(true);
    for (const journey of journeys) {
      expect(journey.key).toBe(`${journey.seriesSlug}/${journey.characterSlug}`);
      expect(getJourneyCatalogEntry(journey.seriesSlug, journey.characterSlug)?.journeyStatus).toBe("published");
    }
    expect(await loadJourney("house-of-the-dragon", "viserys-i-targaryen")).toBeNull();
    expect(getJourneyCatalogEntry("house-of-the-dragon", "viserys-i-targaryen")).toMatchObject({
      journeyStatus: "deferred",
      journeyCoverage: {
        throughEpisode: "S3E4",
        completionReason: "awaiting-season-finale",
      },
    });
  });

  it("uses ordered, non-duplicated television season numbers and coverage metadata", () => {
    for (const journey of journeys) {
      const seasonNumbers = journey.seasons.map((item) => item.season);
      expect(seasonNumbers).toEqual([...seasonNumbers].sort((left, right) => left - right));
      expect(new Set(seasonNumbers).size).toBe(seasonNumbers.length);
      expect(seasonNumbers.every((number) => number >= 1 && number <= journey.totalSeasons)).toBe(true);
      expect(journey.coverage.throughEpisode).toMatch(/^S\d+E\d+$/);
      expect(journey.coverage.throughDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(["series-complete", "season-complete", "character-death"]).toContain(journey.coverage.completionReason);
    }
  });

  it("attaches episode, scene, primary source, and secondary evidence to every stop", () => {
    for (const journey of journeys) {
      for (const season of journey.seasons) {
        expect(season.stops.length).toBeGreaterThan(0);
        for (const stop of season.stops) {
          expect(["depicted", "officially_inferred"]).toContain(stop.depiction);
          expect(stop.reviewStatus).toBe("accepted");
          expect(stop.auditDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(stop.evidenceType.length).toBeGreaterThan(5);
          expect(stop.reviewer.length).toBeGreaterThan(3);
          expect(PLACE_COORDINATE_AUDIT[stop.placeId]?.status).toBe("accepted");
          expect(stop.episode.startsWith(`S${season.season}E`)).toBe(true);
          expect(stop.scene.length).toBeGreaterThan(10);
          expect(stop.source.title).toContain(stop.episode);
          expect(stop.source.url).toMatch(/^https:\/\//);
          expect(stop.evidence.url).toMatch(/^https:\/\//);
          expect(stop.appearances.length).toBeGreaterThan(0);
          for (const appearance of stop.appearances) {
            expect(appearance.episode.startsWith(`S${season.season}E`)).toBe(true);
            expect(appearance.scene.length).toBeGreaterThan(10);
            expect(appearance.source.url).toMatch(/^https:\/\//);
            expect(appearance.evidence.url).toMatch(/^https:\/\//);
          }
        }
      }
    }
  });

  it("keeps all places, route endpoints, and control points inside map bounds", () => {
    expect(blobAssets.maps.world.sha256).toBe(AUDITED_WORLD_MAP_SHA256);
    expect(JOURNEY_MAP).toEqual({
      width: 1484,
      height: 1060,
      image: blobAssets.maps.world.url,
    });

    for (const place of Object.values(PLACES)) {
      expect(place.name.length).toBeGreaterThan(1);
      expect(place.x).toBeGreaterThanOrEqual(STOP_RADIUS);
      expect(place.x).toBeLessThanOrEqual(JOURNEY_MAP.width - STOP_RADIUS);
      expect(place.y).toBeGreaterThanOrEqual(STOP_RADIUS);
      expect(place.y).toBeLessThanOrEqual(JOURNEY_MAP.height - STOP_RADIUS);
    }

    for (const journey of journeys) {
      for (const season of journey.seasons) {
        expect(getSeasonWaypoints(season).every(Boolean)).toBe(true);
        for (const segment of season.routeSegments) {
          expect(["depicted-route", "officially-inferred-route", "stationary"]).toContain(segment.kind);
          expect(PLACES[segment.fromPlaceId]).toBeTruthy();
          expect(PLACES[segment.toPlaceId]).toBeTruthy();
          for (const point of pathCoordinates(segment.path)) {
            expect(point.x).toBeGreaterThanOrEqual(0);
            expect(point.x).toBeLessThanOrEqual(JOURNEY_MAP.width);
            expect(point.y).toBeGreaterThanOrEqual(0);
            expect(point.y).toBeLessThanOrEqual(JOURNEY_MAP.height);
          }
        }
      }
    }
  });

  it("keeps the fail-closed major-city layer audited and in bounds", () => {
    expect(MAJOR_CITY_PLACE_IDS).toHaveLength(8);
    expect(MAJOR_CITIES.map((city) => city.id)).toEqual(MAJOR_CITY_PLACE_IDS);
    for (const city of MAJOR_CITIES) {
      expect(city.x).toBeGreaterThanOrEqual(STOP_RADIUS);
      expect(city.x).toBeLessThanOrEqual(JOURNEY_MAP.width - STOP_RADIUS);
      expect(city.y).toBeGreaterThanOrEqual(STOP_RADIUS);
      expect(city.y).toBeLessThanOrEqual(JOURNEY_MAP.height - STOP_RADIUS);
      expect(city.coordinateAudit.normalizedPosition.x).toBeCloseTo(city.x / JOURNEY_MAP.width, 5);
      expect(city.coordinateAudit.normalizedPosition.y).toBeCloseTo(city.y / JOURNEY_MAP.height, 5);
    }
    expect(PLACE_COORDINATE_AUDIT.braavos).toBeUndefined();
    expect(PLACE_COORDINATE_AUDIT.volantis).toBeUndefined();
  });

  it("locks printed seats and formerly water-bound anchors", () => {
    expect(REALM_SEAT_PLACE_IDS).toEqual(Object.keys(REALM_SEAT_ANCHORS));
    for (const [placeId, anchor] of Object.entries(REALM_SEAT_ANCHORS)) {
      expect(PLACES[placeId], placeId).toEqual(anchor);
    }
    for (const [placeId, anchor] of Object.entries(REVIEWED_GEOGRAPHIC_ANCHORS)) {
      expect(PLACES[placeId], placeId).toEqual(anchor);
    }
  });

  it("starts each season at its first depicted stop without fabricating an inherited route", () => {
    for (const journey of journeys) {
      expect(getSeasonOrigin(journey.seasons[0])).toBe(PLACES[journey.seasons[0].stops[0].placeId]);
      for (const season of journey.seasons) {
        expect(getSeasonOrigin(season)).toBe(PLACES[season.stops[0].placeId]);
        expect(season.continuity).toBeNull();
        expect(season.path.match(/\bM\b/g)).toHaveLength(1);
        expect(season.stops.every((stop) => stop.episode.startsWith(`S${season.season}E`))).toBe(true);
      }
    }
  });

  it("keeps broad regions and transit candidates out of runtime", () => {
    const forbiddenPlaceIds = new Set([
      "beyond-the-wall", "dorne", "dothraki-sea", "dothraki-sea-camp", "haunted-forest",
      "kingsroad", "lannister-camp", "narrow-sea", "north-road", "outside-castle-black",
      "outside-kings-landing", "red-fork", "riverlands", "shivering-sea", "stormlands",
      "summer-sea", "sunset-sea", "the-gift", "the-neck", "vale", "vale-road",
      "westerlands-road", "wildling-camp", "wolfswood",
    ]);
    const stops = journeys.flatMap((journey) => journey.seasons).flatMap((season) => season.stops);
    expect(stops.every((stop) => !forbiddenPlaceIds.has(stop.placeId))).toBe(true);
    expect(stops.every((stop) => !/^(The North|The Wall);/.test(stop.scene))).toBe(true);
    expect(stops.every((stop) => stop.reviewStatus === "accepted")).toBe(true);
  });

  it("uses one ordered consecutive path with no adjacent duplicate destinations", () => {
    for (const journey of journeys) {
      for (const season of journey.seasons) {
        expect(season.path.match(/\bM\b/g)).toHaveLength(1);
        for (let index = 1; index < season.stops.length; index += 1) {
          expect(season.stops[index].placeId).not.toBe(season.stops[index - 1].placeId);
          expect(season.routeSegments[index - 1]).toMatchObject({
            fromPlaceId: season.stops[index - 1].placeId,
            toPlaceId: season.stops[index].placeId,
          });
        }
      }
    }
  });

  it("uses first-class stationary segments instead of fabricated loop travel", () => {
    const stationary = journeys.flatMap((journey) => journey.seasons)
      .flatMap((season) => season.routeSegments)
      .filter((segment) => segment.kind === "stationary");
    expect(stationary.length).toBeGreaterThan(0);
    expect(stationary.every((segment) => segment.fromPlaceId === segment.toPlaceId)).toBe(true);
    expect(stationary.every((segment) => /^M\s+\d+(?:\.\d+)?\s+\d+(?:\.\d+)?$/.test(segment.path))).toBe(true);
  });

  it("keeps dragon-flight presentation unpublished while the route audit is open", () => {
    const dragonSegments = journeys.flatMap((journey) => journey.seasons)
      .flatMap((season) => season.routeSegments)
      .filter((segment) => segment.travel?.mode === "dragon");
    expect(dragonSegments).toHaveLength(0);
  });
});
