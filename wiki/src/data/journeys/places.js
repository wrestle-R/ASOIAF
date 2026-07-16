import { maps } from "../blobAssets.json";

export const JOURNEY_MAP = Object.freeze({
  width: 1484,
  height: 1060,
  image: maps.world.url,
});

// Coordinates are presentation anchors on the illustrated 1484 x 1060 map.
// Paths that connect them are schematic and do not claim an exact road or sea lane.
export const PLACES = Object.freeze({
  astapor: Object.freeze({ name: "Astapor", x: 980, y: 775 }),
  "beyond-the-wall": Object.freeze({ name: "Beyond the Wall", x: 304, y: 38 }),
  "bloody-gate": Object.freeze({ name: "The Bloody Gate", x: 330, y: 430 }),
  braavos: Object.freeze({ name: "Braavos", x: 748, y: 315 }),
  "castle-black": Object.freeze({ name: "Castle Black", x: 297, y: 92 }),
  "crasters-keep": Object.freeze({ name: "Craster's Keep", x: 350, y: 58 }),
  "dothraki-sea": Object.freeze({ name: "Dothraki Sea", x: 975, y: 430 }),
  "dothraki-sea-camp": Object.freeze({ name: "Dothraki Sea", x: 1110, y: 575 }),
  dragonstone: Object.freeze({ name: "Dragonstone", x: 604, y: 625 }),
  eastwatch: Object.freeze({ name: "Eastwatch-by-the-Sea", x: 375, y: 88 }),
  eyrie: Object.freeze({ name: "The Eyrie", x: 335, y: 395 }),
  hardhome: Object.freeze({ name: "Hardhome", x: 248, y: 28 }),
  harrenhal: Object.freeze({ name: "Harrenhal", x: 335, y: 555 }),
  "kings-landing": Object.freeze({ name: "King's Landing", x: 405, y: 717 }),
  kingsroad: Object.freeze({ name: "The Kingsroad", x: 340, y: 610 }),
  lhazar: Object.freeze({ name: "Lhazar", x: 1250, y: 525 }),
  meereen: Object.freeze({ name: "Meereen", x: 1135, y: 730 }),
  pentos: Object.freeze({ name: "Pentos", x: 735, y: 486 }),
  qarth: Object.freeze({ name: "Qarth", x: 1270, y: 915 }),
  "red-waste": Object.freeze({ name: "Red Waste", x: 1100, y: 620 }),
  "renlys-camp": Object.freeze({ name: "Renly's camp near Storm's End", x: 452, y: 756 }),
  riverlands: Object.freeze({ name: "The Riverlands", x: 278, y: 515 }),
  riverrun: Object.freeze({ name: "Riverrun", x: 267, y: 535 }),
  roseroad: Object.freeze({ name: "The Roseroad", x: 330, y: 735 }),
  saltpans: Object.freeze({ name: "Saltpans", x: 392, y: 555 }),
  "the-twins": Object.freeze({ name: "The Twins", x: 282, y: 430 }),
  vale: Object.freeze({ name: "The Vale", x: 340, y: 405 }),
  "vaes-dothrak": Object.freeze({ name: "Vaes Dothrak", x: 1090, y: 468 }),
  valyria: Object.freeze({ name: "Valyria", x: 875, y: 920 }),
  volantis: Object.freeze({ name: "Volantis", x: 735, y: 885 }),
  winterfell: Object.freeze({ name: "Winterfell", x: 297, y: 255 }),
  yunkai: Object.freeze({ name: "Yunkai", x: 1050, y: 742 }),
});

export function getSeasonWaypoints(season) {
  return season.stops.map((stop) => PLACES[stop.placeId]);
}
