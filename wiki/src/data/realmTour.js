import { maps } from "./blobAssets.json";

export const REALM_MAPS = Object.freeze({
  desktop: Object.freeze({
    width: 1484,
    height: 1060,
    image: maps.world.url,
  }),
  mobile: Object.freeze({
    width: 941,
    height: 1671,
    image: maps.mobile.url,
  }),
});

const realm = ({ order, id, name, houseId, house, seat, color, desktop, mobile, capital, sigil }) =>
  Object.freeze({
    order,
    id,
    name,
    houseId,
    house,
    seat,
    color,
    duration: 3000,
    camera: Object.freeze({
      desktop: Object.freeze(desktop),
      mobile: Object.freeze(mobile),
    }),
    capital: Object.freeze({
      desktop: Object.freeze(capital.desktop),
      mobile: Object.freeze(capital.mobile),
    }),
    sigil: Object.freeze({
      desktop: Object.freeze(sigil.desktop),
      mobile: Object.freeze(sigil.mobile),
    }),
  });

export const REALM_TOUR = Object.freeze([
  realm({
    order: 1,
    id: "north",
    name: "The North",
    houseId: "house-stark",
    house: "House Stark",
    seat: "Winterfell",
    color: "#8b949b",
    desktop: { x: 20, y: 24.5, scale: 1.66, radius: 8.8 },
    mobile: { x: 47, y: 24, scale: 1.34, radius: 10.5 },
    capital: { desktop: { x: 19.9, y: 25.3 }, mobile: { x: 47, y: 23.5 } },
    sigil: { desktop: { x: 30.5, y: 25.5 }, mobile: { x: 70, y: 23.5 } },
  }),
  realm({
    order: 2,
    id: "vale",
    name: "The Vale",
    houseId: "house-arryn",
    house: "House Arryn",
    seat: "The Eyrie",
    color: "#7599bb",
    desktop: { x: 22.7, y: 37.3, scale: 1.85, radius: 6.8 },
    mobile: { x: 73, y: 35.3, scale: 1.42, radius: 8.5 },
    capital: { desktop: { x: 22.3, y: 36.8 }, mobile: { x: 73, y: 35.3 } },
    sigil: { desktop: { x: 18.7, y: 38.2 }, mobile: { x: 94, y: 34 } },
  }),
  realm({
    order: 3,
    id: "riverlands",
    name: "The Riverlands",
    houseId: "house-tully",
    house: "House Tully",
    seat: "Riverrun",
    color: "#506f9d",
    desktop: { x: 18, y: 47.2, scale: 1.82, radius: 6.8 },
    mobile: { x: 47, y: 47, scale: 1.42, radius: 8.5 },
    capital: { desktop: { x: 17.6, y: 46.9 }, mobile: { x: 47, y: 47 } },
    sigil: { desktop: { x: 14.4, y: 49.3 }, mobile: { x: 70, y: 48 } },
  }),
  realm({
    order: 4,
    id: "iron-islands",
    name: "Iron Islands",
    houseId: "house-greyjoy",
    house: "House Greyjoy",
    seat: "Pyke",
    color: "#ad9941",
    desktop: { x: 7.5, y: 49, scale: 1.9, radius: 5.8 },
    mobile: { x: 15, y: 49, scale: 1.48, radius: 7.5 },
    capital: { desktop: { x: 7.1, y: 48.4 }, mobile: { x: 15, y: 49 } },
    sigil: { desktop: { x: 4.4, y: 51.2 }, mobile: { x: 8, y: 47 } },
  }),
  realm({
    order: 5,
    id: "westerlands",
    name: "The Westerlands",
    houseId: "house-lannister",
    house: "House Lannister",
    seat: "Casterly Rock",
    color: "#ae3436",
    desktop: { x: 5, y: 63, scale: 1.88, radius: 6.8 },
    mobile: { x: 14, y: 63.5, scale: 1.43, radius: 8.5 },
    capital: { desktop: { x: 5.2, y: 62.5 }, mobile: { x: 14, y: 63.5 } },
    sigil: { desktop: { x: 3.3, y: 65.7 }, mobile: { x: 7, y: 61.5 } },
  }),
  realm({
    order: 6,
    id: "crownlands",
    name: "The Crownlands",
    houseId: "house-targaryen",
    house: "House Targaryen",
    seat: "Dragonstone / King’s Landing",
    color: "#8f2528",
    desktop: { x: 35, y: 61, scale: 2.08, radius: 9 },
    mobile: { x: 53, y: 66, scale: 1.5, radius: 8 },
    capital: { desktop: { x: 40, y: 56.3 }, mobile: { x: 53, y: 66 } },
    sigil: { desktop: { x: 43.2, y: 54.2 }, mobile: { x: 63, y: 70 } },
  }),
  realm({
    order: 7,
    id: "stormlands",
    name: "The Stormlands",
    houseId: "house-baratheon",
    house: "House Baratheon",
    seat: "Storm’s End",
    color: "#d0a934",
    desktop: { x: 29.5, y: 70, scale: 1.86, radius: 6.8 },
    mobile: { x: 82, y: 72, scale: 1.42, radius: 8.5 },
    capital: { desktop: { x: 30.3, y: 70.6 }, mobile: { x: 82, y: 72 } },
    sigil: { desktop: { x: 34, y: 72.3 }, mobile: { x: 90, y: 70 } },
  }),
  realm({
    order: 8,
    id: "reach",
    name: "The Reach",
    houseId: "house-tyrell",
    house: "House Tyrell",
    seat: "Highgarden",
    color: "#789348",
    desktop: { x: 8.4, y: 76.4, scale: 1.82, radius: 7.4 },
    mobile: { x: 24, y: 80, scale: 1.4, radius: 9 },
    capital: { desktop: { x: 8.1, y: 77.4 }, mobile: { x: 24, y: 80 } },
    sigil: { desktop: { x: 4.8, y: 79.5 }, mobile: { x: 13, y: 78 } },
  }),
  realm({
    order: 9,
    id: "dorne",
    name: "Dorne",
    houseId: "house-martell",
    house: "House Martell",
    seat: "Sunspear",
    color: "#cf6a32",
    desktop: { x: 31.8, y: 85.3, scale: 1.78, radius: 7.4 },
    mobile: { x: 57, y: 91, scale: 1.36, radius: 9 },
    capital: { desktop: { x: 31.2, y: 85.2 }, mobile: { x: 57, y: 91 } },
    sigil: { desktop: { x: 35, y: 87.5 }, mobile: { x: 85, y: 89.5 } },
  }),
]);

export function getRealmCameraFrame({ viewportWidth, viewportHeight, map, camera, phone }) {
  const aspectRatio = map.width / map.height;
  const mapWidth = Math.min(viewportWidth, viewportHeight * aspectRatio);
  const mapHeight = mapWidth / aspectRatio;
  const mapLeft = (viewportWidth - mapWidth) / 2;
  const mapTop = (viewportHeight - mapHeight) / 2;
  const focusX = phone ? 0.5 : 0.64;
  const focusY = phone ? 0.42 : 0.5;
  const scale = Math.max(
    camera.scale,
    viewportWidth / mapWidth * 1.01,
    viewportHeight / mapHeight * 1.01,
  );
  const pointX = mapWidth * camera.x / 100;
  const pointY = mapHeight * camera.y / 100;

  const scaledWidth = mapWidth * scale;
  const scaledHeight = mapHeight * scale;
  const desiredOriginX = viewportWidth * focusX - pointX * scale;
  const desiredOriginY = viewportHeight * focusY - pointY * scale;
  const originX = Math.min(0, Math.max(viewportWidth - scaledWidth, desiredOriginX));
  const originY = Math.min(0, Math.max(viewportHeight - scaledHeight, desiredOriginY));

  return Object.freeze({
    width: mapWidth,
    height: mapHeight,
    left: mapLeft,
    top: mapTop,
    scale,
    translateX: originX - mapLeft,
    translateY: originY - mapTop,
  });
}
