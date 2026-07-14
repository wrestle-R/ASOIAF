export const JOURNEY_MAP = Object.freeze({
  width: 1484,
  height: 1060,
  image: "/assets/world-map-houses.webp",
});

export const DAENERYS_PLACES = Object.freeze({
  pentos: Object.freeze({ name: "Pentos", x: 735, y: 486 }),
  "dothraki-sea": Object.freeze({ name: "Dothraki Sea", x: 975, y: 430 }),
  "dothraki-sea-camp": Object.freeze({ name: "Dothraki Sea", x: 1110, y: 575 }),
  "vaes-dothrak": Object.freeze({ name: "Vaes Dothrak", x: 1090, y: 468 }),
  lhazar: Object.freeze({ name: "Lhazar", x: 1250, y: 525 }),
  "red-waste": Object.freeze({ name: "Red Waste", x: 1100, y: 620 }),
  qarth: Object.freeze({ name: "Qarth", x: 1270, y: 915 }),
  astapor: Object.freeze({ name: "Astapor", x: 980, y: 775 }),
  yunkai: Object.freeze({ name: "Yunkai", x: 1050, y: 742 }),
  meereen: Object.freeze({ name: "Meereen", x: 1135, y: 730 }),
  dragonstone: Object.freeze({ name: "Dragonstone", x: 604, y: 625 }),
  roseroad: Object.freeze({ name: "The Roseroad", x: 330, y: 735 }),
  "beyond-wall": Object.freeze({ name: "Beyond the Wall", x: 315, y: 65 }),
  "kings-landing": Object.freeze({ name: "King's Landing", x: 405, y: 717 }),
  winterfell: Object.freeze({ name: "Winterfell", x: 297, y: 255 }),
});

const poster = (season) =>
  `/assets/danerys%20seasons/season-${String(season).padStart(2, "0")}.webp`;

export const DAENERYS_SEASONS = Object.freeze([
  Object.freeze({
    season: 1,
    title: "The birth of dragons",
    route: Object.freeze(["pentos", "dothraki-sea", "vaes-dothrak", "lhazar"]),
    path: "M 735 486 C 820 438 900 420 975 430 S 1045 455 1090 468 S 1190 478 1250 525",
    camera: Object.freeze({ x: 70, y: 47, scale: 1.08 }),
    summary: "From an arranged marriage in Pentos, Daenerys became a khaleesi and emerged from Drogo's funeral pyre with three dragons.",
    duration: 3400,
    poster: poster(1),
  }),
  Object.freeze({
    season: 2,
    title: "Across the Red Waste",
    route: Object.freeze(["lhazar", "red-waste", "qarth"]),
    path: "M 1250 525 C 1190 545 1130 575 1100 620 S 1210 800 1270 915",
    camera: Object.freeze({ x: 78, y: 66, scale: 1.1 }),
    summary: "She led the remains of her khalasar through the Red Waste, entered Qarth, and reclaimed her dragons from the House of the Undying.",
    duration: 3400,
    poster: poster(2),
  }),
  Object.freeze({
    season: 3,
    title: "Breaker of chains",
    route: Object.freeze(["qarth", "astapor", "yunkai"]),
    path: "M 1270 915 C 1190 888 1070 825 980 775 C 1005 758 1030 748 1050 742",
    camera: Object.freeze({ x: 74, y: 77, scale: 1.12 }),
    summary: "Daenerys freed the Unsullied at Astapor, defeated Yunkai's defenders, and was welcomed by the people she liberated.",
    duration: 3400,
    poster: poster(3),
  }),
  Object.freeze({
    season: 4,
    title: "Queen of Meereen",
    route: Object.freeze(["yunkai", "meereen"]),
    path: "M 1050 742 C 1080 740 1110 735 1135 730",
    camera: Object.freeze({ x: 75, y: 69, scale: 1.18 }),
    summary: "She captured Meereen, answered its crucified children with justice, and chose to remain in Slaver's Bay to rule.",
    duration: 3000,
    poster: poster(4),
  }),
  Object.freeze({
    season: 5,
    title: "Flight from the fighting pit",
    route: Object.freeze(["meereen", "dothraki-sea-camp"]),
    path: "M 1135 730 C 1120 675 1095 625 1110 575",
    camera: Object.freeze({ x: 75, y: 61, scale: 1.17 }),
    summary: "After unrest and the attack at Daznak's Pit, Drogon carried Daenerys away from Meereen into the Dothraki Sea.",
    duration: 3000,
    poster: poster(5),
  }),
  Object.freeze({
    season: 6,
    title: "The fleet sails west",
    route: Object.freeze(["dothraki-sea-camp", "vaes-dothrak", "meereen", "dragonstone"]),
    path: "M 1110 575 C 1095 540 1085 500 1090 468 C 1100 550 1120 640 1135 730 C 1040 810 900 850 760 780 S 650 690 604 625",
    camera: Object.freeze({ x: 68, y: 65, scale: 1.05 }),
    summary: "She united the Dothraki at Vaes Dothrak, returned to defend Meereen, and sailed for Westeros with her armies and dragons.",
    duration: 4200,
    poster: poster(6),
  }),
  Object.freeze({
    season: 7,
    title: "The war for Westeros",
    route: Object.freeze(["dragonstone", "roseroad", "dragonstone", "beyond-wall", "kings-landing"]),
    path: "M 604 625 C 520 670 420 720 330 735 C 430 710 535 670 604 625 C 500 430 380 220 315 65 C 345 290 390 570 405 717",
    camera: Object.freeze({ x: 32, y: 48, scale: 1.04 }),
    summary: "Daenerys landed at Dragonstone, struck the Lannister army, rescued Jon beyond the Wall, and faced Cersei at the Dragonpit.",
    duration: 4400,
    poster: poster(7),
  }),
  Object.freeze({
    season: 8,
    title: "Fire at the end",
    route: Object.freeze(["winterfell", "dragonstone", "kings-landing"]),
    path: "M 297 255 C 380 360 505 510 604 625 C 535 655 465 690 405 717",
    camera: Object.freeze({ x: 31, y: 53, scale: 1.09 }),
    summary: "She fought the dead at Winterfell, returned to Dragonstone, conquered King's Landing, and died beneath the Iron Throne.",
    duration: 3600,
    poster: poster(8),
  }),
]);

export function getSeasonWaypoints(season) {
  return season.route.map((placeId) => DAENERYS_PLACES[placeId]);
}
