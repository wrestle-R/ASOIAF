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
  "ashford-meadow": Object.freeze({ name: "Ashford Meadow", x: 214, y: 820 }),
  "road-to-ashford": Object.freeze({ name: "Road to Ashford", x: 238, y: 842 }),
  "bear-island": Object.freeze({ name: "Bear Island", x: 120, y: 230 }),
  "beyond-the-wall": Object.freeze({ name: "Beyond the Wall", x: 304, y: 38 }),
  "blackwater-bay": Object.freeze({ name: "Blackwater Bay", x: 445, y: 708 }),
  "blackwater-rush": Object.freeze({ name: "Blackwater Rush", x: 382, y: 710 }),
  "bloody-gate": Object.freeze({ name: "The Bloody Gate", x: 330, y: 430 }),
  // The northwestern Essos island group is the map's visible Great Lagoon anchor.
  braavos: Object.freeze({ name: "Braavos", x: 720, y: 280 }),
  "castle-black": Object.freeze({ name: "Castle Black", x: 297, y: 92 }),
  "castle-stokeworth": Object.freeze({ name: "Castle Stokeworth", x: 443, y: 681 }),
  "casterly-rock": Object.freeze({ name: "Casterly Rock", x: 78, y: 673 }),
  "crasters-keep": Object.freeze({ name: "Craster's Keep", x: 350, y: 58 }),
  "crossroads-inn": Object.freeze({ name: "The Crossroads Inn", x: 315, y: 520 }),
  "deepwood-motte": Object.freeze({ name: "Deepwood Motte", x: 180, y: 270 }),
  dorne: Object.freeze({ name: "Dorne", x: 365, y: 900 }),
  "the-dreadfort": Object.freeze({ name: "The Dreadfort", x: 405, y: 230 }),
  "dothraki-sea": Object.freeze({ name: "Dothraki Sea", x: 975, y: 430 }),
  "dothraki-sea-camp": Object.freeze({ name: "Dothraki Sea camp", x: 1110, y: 575 }),
  dragonstone: Object.freeze({ name: "Dragonstone", x: 602, y: 605 }),
  eastwatch: Object.freeze({ name: "Eastwatch-by-the-Sea", x: 375, y: 88 }),
  eyrie: Object.freeze({ name: "The Eyrie", x: 336, y: 396 }),
  // Hardhome is on the eastern Shivering Sea peninsula, not the water north of it.
  hardhome: Object.freeze({ name: "Hardhome", x: 465, y: 84 }),
  harrenhal: Object.freeze({ name: "Harrenhal", x: 335, y: 555 }),
  "haunted-forest": Object.freeze({ name: "The Haunted Forest", x: 330, y: 55 }),
  highgarden: Object.freeze({ name: "Highgarden", x: 123, y: 832 }),
  "hollow-hill": Object.freeze({ name: "Hollow Hill", x: 345, y: 590 }),
  "horn-hill": Object.freeze({ name: "Horn Hill", x: 190, y: 845 }),
  "kings-landing": Object.freeze({ name: "King's Landing", x: 403, y: 719 }),
  kingsroad: Object.freeze({ name: "The Kingsroad", x: 340, y: 610 }),
  kingswood: Object.freeze({ name: "The Kingswood", x: 425, y: 750 }),
  "lannister-camp": Object.freeze({ name: "Lannister Camp", x: 235, y: 590 }),
  "lands-of-always-winter": Object.freeze({ name: "Lands of Always Winter", x: 300, y: 31 }),
  "last-hearth": Object.freeze({ name: "Last Hearth", x: 390, y: 190 }),
  lhazar: Object.freeze({ name: "Lhazar", x: 1250, y: 525 }),
  meereen: Object.freeze({ name: "Meereen", x: 1135, y: 730 }),
  "moat-cailin": Object.freeze({ name: "Moat Cailin", x: 282, y: 380 }),
  "moles-town": Object.freeze({ name: "Mole's Town", x: 292, y: 112 }),
  "narrow-sea": Object.freeze({ name: "The Narrow Sea", x: 580, y: 525 }),
  nightfort: Object.freeze({ name: "The Nightfort", x: 260, y: 95 }),
  "north-road": Object.freeze({ name: "The Northern Kingsroad", x: 315, y: 350 }),
  oldtown: Object.freeze({ name: "Oldtown", x: 70, y: 875 }),
  "outside-castle-black": Object.freeze({ name: "Outside Castle Black", x: 306, y: 105 }),
  "outside-kings-landing": Object.freeze({ name: "Outside King's Landing", x: 414, y: 697 }),
  "outside-winterfell": Object.freeze({ name: "Outside Winterfell", x: 315, y: 288 }),
  oxcross: Object.freeze({ name: "Oxcross", x: 180, y: 620 }),
  pentos: Object.freeze({ name: "Pentos", x: 735, y: 486 }),
  pyke: Object.freeze({ name: "Pyke", x: 109, y: 520 }),
  qarth: Object.freeze({ name: "Qarth", x: 1270, y: 915 }),
  "red-fork": Object.freeze({ name: "The Red Fork", x: 245, y: 560 }),
  "red-waste": Object.freeze({ name: "Red Waste", x: 1100, y: 620 }),
  "renlys-camp": Object.freeze({ name: "Renly's camp near Storm's End", x: 452, y: 756 }),
  riverlands: Object.freeze({ name: "The Riverlands", x: 278, y: 515 }),
  riverrun: Object.freeze({ name: "Riverrun", x: 265, y: 504 }),
  roseroad: Object.freeze({ name: "The Roseroad", x: 330, y: 735 }),
  runestone: Object.freeze({ name: "Runestone", x: 405, y: 430 }),
  saltpans: Object.freeze({ name: "Saltpans", x: 392, y: 555 }),
  "storms-end": Object.freeze({ name: "Storm's End", x: 454, y: 759 }),
  stormlands: Object.freeze({ name: "The Stormlands", x: 455, y: 785 }),
  "shivering-sea": Object.freeze({ name: "The Shivering Sea", x: 620, y: 220 }),
  "summer-sea": Object.freeze({ name: "The Summer Sea", x: 650, y: 960 }),
  sunspear: Object.freeze({ name: "Sunspear", x: 470, y: 919 }),
  "sunset-sea": Object.freeze({ name: "The Sunset Sea", x: 28, y: 650 }),
  tarth: Object.freeze({ name: "Tarth", x: 520, y: 770 }),
  "the-fist": Object.freeze({ name: "Fist of the First Men", x: 335, y: 70 }),
  "the-frostfangs": Object.freeze({ name: "The Frostfangs", x: 220, y: 78 }),
  "the-gift": Object.freeze({ name: "The Gift", x: 310, y: 145 }),
  "the-neck": Object.freeze({ name: "The Neck", x: 285, y: 410 }),
  "the-twins": Object.freeze({ name: "The Twins", x: 282, y: 430 }),
  "three-eyed-raven-cave": Object.freeze({ name: "The Three-Eyed Raven's Cave", x: 215, y: 50 }),
  "tower-of-joy": Object.freeze({ name: "The Tower of Joy", x: 340, y: 842 }),
  vale: Object.freeze({ name: "The Vale", x: 340, y: 405 }),
  "vale-road": Object.freeze({ name: "Road through the Vale", x: 360, y: 458 }),
  "vaes-dothrak": Object.freeze({ name: "Vaes Dothrak", x: 1090, y: 468 }),
  // The Doom-shattered peninsula is represented by the southern island group.
  valyria: Object.freeze({ name: "Valyria", x: 1015, y: 975 }),
  // Volantis spans the depicted western river mouth; this point sits on its bank.
  volantis: Object.freeze({ name: "Volantis", x: 910, y: 825 }),
  "water-gardens": Object.freeze({ name: "The Water Gardens", x: 488, y: 900 }),
  "westerlands-road": Object.freeze({ name: "The Westerlands Road", x: 250, y: 665 }),
  "wildling-camp": Object.freeze({ name: "Free Folk Camp", x: 285, y: 68 }),
  "winter-town": Object.freeze({ name: "Winter Town", x: 307, y: 288 }),
  winterfell: Object.freeze({ name: "Winterfell", x: 299, y: 272 }),
  wolfswood: Object.freeze({ name: "The Wolfswood", x: 220, y: 300 }),
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
