import { accessSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getRealmCameraFrame, REALM_MAPS, REALM_TOUR } from "../src/data/realmTour.js";

const expected = [
  ["The North", "House Stark", "Winterfell"],
  ["The Vale", "House Arryn", "The Eyrie"],
  ["The Riverlands", "House Tully", "Riverrun"],
  ["Iron Islands", "House Greyjoy", "Pyke"],
  ["The Westerlands", "House Lannister", "Casterly Rock"],
  ["The Crownlands", "House Targaryen", "Dragonstone / King’s Landing"],
  ["The Stormlands", "House Baratheon", "Storm’s End"],
  ["The Reach", "House Tyrell", "Highgarden"],
  ["Dorne", "House Martell", "Sunspear"],
];

describe("REALM_TOUR", () => {
  it("contains the nine verified realms in order", () => {
    expect(REALM_TOUR).toHaveLength(9);
    expect(REALM_TOUR.map(({ name, house, seat }) => [name, house, seat])).toEqual(expected);
    expect(REALM_TOUR.map(({ order }) => order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("has complete, unique poster and sigil metadata", () => {
    expect(new Set(REALM_TOUR.map(({ poster }) => poster)).size).toBe(9);
    for (const realm of REALM_TOUR) {
      expect(realm.duration).toBeGreaterThan(0);
      expect(realm.poster).toMatch(/^\/assets\/nine-realms\/realm-\d{2}-[a-z-]+\.webp$/);
      expect(realm.houseId).toMatch(/^house-/);
      accessSync(path.resolve("public/assets/houses", `${realm.houseId}.webp`));
    }
  });

  it("keeps every desktop and mobile camera focus in map bounds", () => {
    for (const realm of REALM_TOUR) {
      for (const layout of ["desktop", "mobile"]) {
        const camera = realm.camera[layout];
        expect(camera.x).toBeGreaterThanOrEqual(0);
        expect(camera.x).toBeLessThanOrEqual(100);
        expect(camera.y).toBeGreaterThanOrEqual(0);
        expect(camera.y).toBeLessThanOrEqual(100);
        expect(camera.scale).toBeGreaterThanOrEqual(1);
        expect(camera.radius).toBeGreaterThan(0);
        expect(realm.capital[layout].x).toBeGreaterThanOrEqual(0);
        expect(realm.capital[layout].x).toBeLessThanOrEqual(100);
        expect(realm.capital[layout].y).toBeGreaterThanOrEqual(0);
        expect(realm.capital[layout].y).toBeLessThanOrEqual(100);
        expect(realm.sigil[layout].x).toBeGreaterThanOrEqual(0);
        expect(realm.sigil[layout].x).toBeLessThanOrEqual(100);
        expect(realm.sigil[layout].y).toBeGreaterThanOrEqual(0);
        expect(realm.sigil[layout].y).toBeLessThanOrEqual(100);
        expect(realm.sigil[layout]).not.toEqual(realm.capital[layout]);
      }
    }
  });

  it("produces finite camera frames for desktop and phone viewports", () => {
    for (const [layout, viewport] of Object.entries({
      desktop: { width: 1440, height: 900, phone: false },
      mobile: { width: 390, height: 844, phone: true },
      landscape: { width: 844, height: 390, phone: true },
    })) {
      const mapLayout = layout === "desktop" ? "desktop" : "mobile";
      for (const realm of REALM_TOUR) {
        const frame = getRealmCameraFrame({
          viewportWidth: viewport.width,
          viewportHeight: viewport.height,
          map: REALM_MAPS[mapLayout],
          camera: realm.camera[mapLayout],
          phone: viewport.phone,
        });
        for (const value of Object.values(frame)) expect(Number.isFinite(value)).toBe(true);
        expect(frame.width).toBeGreaterThan(0);
        expect(frame.height).toBeGreaterThan(0);
        const left = frame.left + frame.translateX;
        const top = frame.top + frame.translateY;
        expect(left).toBeLessThanOrEqual(0);
        expect(top).toBeLessThanOrEqual(0);
        expect(left + frame.width * frame.scale).toBeGreaterThanOrEqual(viewport.width);
        expect(top + frame.height * frame.scale).toBeGreaterThanOrEqual(viewport.height);
      }
    }
  });
});
