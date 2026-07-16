export const DRAGONS = Object.freeze({
  arrax: Object.freeze({ id: "arrax", name: "Arrax" }),
  balerion: Object.freeze({ id: "balerion", name: "Balerion" }),
  caraxes: Object.freeze({ id: "caraxes", name: "Caraxes" }),
  dreamfyre: Object.freeze({ id: "dreamfyre", name: "Dreamfyre" }),
  drogon: Object.freeze({ id: "drogon", name: "Drogon" }),
  meleys: Object.freeze({ id: "meleys", name: "Meleys" }),
  moondancer: Object.freeze({ id: "moondancer", name: "Moondancer" }),
  seasmoke: Object.freeze({ id: "seasmoke", name: "Seasmoke" }),
  sheepstealer: Object.freeze({ id: "sheepstealer", name: "Sheepstealer" }),
  silverwing: Object.freeze({ id: "silverwing", name: "Silverwing" }),
  stormcloud: Object.freeze({ id: "stormcloud", name: "Stormcloud" }),
  sunfyre: Object.freeze({ id: "sunfyre", name: "Sunfyre" }),
  syrax: Object.freeze({ id: "syrax", name: "Syrax" }),
  tessarion: Object.freeze({ id: "tessarion", name: "Tessarion" }),
  tyraxes: Object.freeze({ id: "tyraxes", name: "Tyraxes" }),
  vermax: Object.freeze({ id: "vermax", name: "Vermax" }),
  vermithor: Object.freeze({ id: "vermithor", name: "Vermithor" }),
  vhagar: Object.freeze({ id: "vhagar", name: "Vhagar" }),
});

export function getDragon(dragonId) {
  return DRAGONS[dragonId] ?? null;
}
