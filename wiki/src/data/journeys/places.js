import { maps } from "../blobAssets.json";

export const JOURNEY_MAP = Object.freeze({
  width: 1484,
  height: 1060,
  image: maps.world.url,
});

// Coordinates are presentation anchors on the illustrated 1484 x 1060 map.
// Printed realm seats use the centre of the artwork's ring/star symbol. Places
// without a printed symbol are kept on the visible landform that represents
// their sourced geography. Connecting paths remain schematic and do not claim
// an exact road or sea lane.
export const PLACES = Object.freeze({
  astapor: Object.freeze({ name: "Astapor", x: 980, y: 775 }),
  "beyond-the-wall": Object.freeze({ name: "Beyond the Wall", x: 304, y: 38 }),
  "bloody-gate": Object.freeze({ name: "The Bloody Gate", x: 330, y: 430 }),
  // The northwestern Essos island group is the map's visible Great Lagoon anchor.
  braavos: Object.freeze({ name: "Braavos", x: 720, y: 280 }),
  "castle-black": Object.freeze({ name: "Castle Black", x: 297, y: 92 }),
  "casterly-rock": Object.freeze({ name: "Casterly Rock", x: 78, y: 673 }),
  "crasters-keep": Object.freeze({ name: "Craster's Keep", x: 350, y: 58 }),
  "dothraki-sea": Object.freeze({ name: "Dothraki Sea", x: 975, y: 430 }),
  "dothraki-sea-camp": Object.freeze({ name: "Dothraki Sea", x: 1110, y: 575 }),
  dragonstone: Object.freeze({ name: "Dragonstone", x: 602, y: 605 }),
  eastwatch: Object.freeze({ name: "Eastwatch-by-the-Sea", x: 375, y: 88 }),
  eyrie: Object.freeze({ name: "The Eyrie", x: 336, y: 396 }),
  // Hardhome is on the eastern Shivering Sea peninsula, not the water north of it.
  hardhome: Object.freeze({ name: "Hardhome", x: 465, y: 84 }),
  harrenhal: Object.freeze({ name: "Harrenhal", x: 335, y: 555 }),
  highgarden: Object.freeze({ name: "Highgarden", x: 123, y: 832 }),
  "kings-landing": Object.freeze({ name: "King's Landing", x: 403, y: 719 }),
  kingsroad: Object.freeze({ name: "The Kingsroad", x: 340, y: 610 }),
  lhazar: Object.freeze({ name: "Lhazar", x: 1250, y: 525 }),
  meereen: Object.freeze({ name: "Meereen", x: 1135, y: 730 }),
  pentos: Object.freeze({ name: "Pentos", x: 735, y: 486 }),
  pyke: Object.freeze({ name: "Pyke", x: 109, y: 520 }),
  qarth: Object.freeze({ name: "Qarth", x: 1270, y: 915 }),
  "red-waste": Object.freeze({ name: "Red Waste", x: 1100, y: 620 }),
  "renlys-camp": Object.freeze({ name: "Renly's camp near Storm's End", x: 452, y: 756 }),
  riverlands: Object.freeze({ name: "The Riverlands", x: 278, y: 515 }),
  riverrun: Object.freeze({ name: "Riverrun", x: 265, y: 504 }),
  roseroad: Object.freeze({ name: "The Roseroad", x: 330, y: 735 }),
  saltpans: Object.freeze({ name: "Saltpans", x: 392, y: 555 }),
  "storms-end": Object.freeze({ name: "Storm's End", x: 454, y: 759 }),
  sunspear: Object.freeze({ name: "Sunspear", x: 470, y: 919 }),
  "the-twins": Object.freeze({ name: "The Twins", x: 282, y: 430 }),
  vale: Object.freeze({ name: "The Vale", x: 340, y: 405 }),
  "vaes-dothrak": Object.freeze({ name: "Vaes Dothrak", x: 1090, y: 468 }),
  // The Doom-shattered peninsula is represented by the southern island group.
  valyria: Object.freeze({ name: "Valyria", x: 1015, y: 975 }),
  // Volantis spans the depicted western river mouth; this point sits on its bank.
  volantis: Object.freeze({ name: "Volantis", x: 910, y: 825 }),
  winterfell: Object.freeze({ name: "Winterfell", x: 299, y: 272 }),
  yunkai: Object.freeze({ name: "Yunkai", x: 1050, y: 742 }),
});

// Ordered like the nine-realm tour. The Crownlands artwork marks both seats.
export const REALM_SEAT_PLACE_IDS = Object.freeze([
  "winterfell",
  "eyrie",
  "riverrun",
  "pyke",
  "casterly-rock",
  "kings-landing",
  "dragonstone",
  "storms-end",
  "highgarden",
  "sunspear",
]);

export function getSeasonWaypoints(season) {
  return season.stops.map((stop) => PLACES[stop.placeId]);
}

export function getSeasonOrigin(season) {
  const originPlaceId = season.continuity?.originPlaceId ?? season.stops[0]?.placeId;

  return originPlaceId ? PLACES[originPlaceId] : undefined;
}
