import { beforeAll, describe, expect, it } from "vitest";
import blobAssets from "../src/data/blobAssets.json";
import { DRAGONS } from "../src/data/journeys/dragons.js";
import {
  getJourneyCatalogEntry,
  getSeasonOrigin,
  getSeasonWaypoints,
  JOURNEY_CATALOG,
  JOURNEY_CATALOG_KEYS,
  JOURNEY_MAP,
  loadAllPublishedJourneys,
  loadJourney,
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
const VISIBLE_GEOGRAPHIC_ANCHORS = Object.freeze({
  braavos: { name: "Braavos", x: 720, y: 280 },
  hardhome: { name: "Hardhome", x: 465, y: 84 },
  valyria: { name: "Valyria", x: 1015, y: 975 },
  volantis: { name: "Volantis", x: 910, y: 825 },
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
    expect(catalog.filter((entry) => entry.journeyStatus === "published")).toHaveLength(126);
    expect(catalog.filter((entry) => entry.journeyStatus === "deferred")).toHaveLength(77);
    expect(catalog.filter((entry) => entry.journeyStatus === "pending")).toHaveLength(0);
    expect(PUBLISHED_JOURNEY_KEYS).toHaveLength(126);
    expect(new Set(PUBLISHED_JOURNEY_KEYS).size).toBe(126);
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
          expect(stop.depiction).toBe("depicted");
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
          expect(["depicted-route", "continuity", "stationary"]).toContain(segment.kind);
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

  it("locks printed seats and formerly water-bound anchors", () => {
    expect(REALM_SEAT_PLACE_IDS).toEqual(Object.keys(REALM_SEAT_ANCHORS));
    for (const [placeId, anchor] of Object.entries(REALM_SEAT_ANCHORS)) {
      expect(PLACES[placeId], placeId).toEqual(anchor);
    }
    for (const [placeId, anchor] of Object.entries(VISIBLE_GEOGRAPHIC_ANCHORS)) {
      expect(PLACES[placeId], placeId).toEqual(anchor);
    }
  });

  it("preserves season continuity without adding inherited origins as evidence", () => {
    for (const journey of journeys) {
      expect(getSeasonOrigin(journey.seasons[0])).toBe(PLACES[journey.seasons[0].stops[0].placeId]);
      for (let index = 1; index < journey.seasons.length; index += 1) {
        const previous = journey.seasons[index - 1];
        const current = journey.seasons[index];
        const originId = previous.stops.at(-1).placeId;
        expect(getSeasonOrigin(current)).toBe(PLACES[originId]);
        expect(current.continuity.originPlaceId).toBe(originId);
        expect(current.stops.every((stop) => stop.episode.startsWith(`S${current.season}E`))).toBe(true);
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

  it("requires independent evidence for every named dragon flight", () => {
    const dragonSegments = journeys.flatMap((journey) => journey.seasons)
      .flatMap((season) => season.routeSegments)
      .filter((segment) => segment.travel?.mode === "dragon");
    expect(dragonSegments.length).toBeGreaterThan(0);
    for (const segment of dragonSegments) {
      expect(DRAGONS[segment.travel.dragonId]?.name).toBe(segment.travel.dragonName);
      expect(segment.kind).toBe("depicted-route");
      expect(segment.travel.episode).toMatch(/^S\d+E\d+$/);
      expect(segment.travel.scene.length).toBeGreaterThan(20);
      expect(segment.travel.source.url).toMatch(/^https:\/\//);
    }
    expect(JOURNEY_CATALOG["house-of-the-dragon/viserys-i-targaryen"]).not.toHaveProperty("dragonId");
  });
});
