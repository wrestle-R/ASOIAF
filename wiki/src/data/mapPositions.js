export const MAP_LAYOUTS = Object.freeze({
  desktop: Object.freeze({
    aspectRatio: 1484 / 1060,
    image: "/assets/world-map-houses.webp",
  }),
  mobile: Object.freeze({
    aspectRatio: 941 / 1671,
    image: "/assets/world-map-realms-mobile-capitals.webp",
  }),
});

export const INTRO_HOUSE_ORDER = Object.freeze([
  "house-stark",
  "house-arryn",
  "house-tully",
  "house-greyjoy",
  "house-lannister",
  "house-tyrell",
  "house-baratheon",
  "house-martell",
  "house-targaryen",
]);

const DESKTOP_POSITIONS = Object.freeze({
  "house-stark": { x: 14.7, y: 27.3, seat: "Winterfell", labelOffset: "left", order: 1, markerScale: 1 },
  "house-greyjoy": { x: 7.0, y: 52.5, seat: "Pyke", labelOffset: "bottom", order: 2, markerScale: 0.9 },
  "house-tully": { x: 20.0, y: 52.8, seat: "Riverrun", labelOffset: "bottom", order: 3, markerScale: 0.9 },
  "house-arryn": { x: 28.5, y: 28.8, seat: "The Eyrie", labelOffset: "right", order: 4, markerScale: 0.9 },
  "house-lannister": { x: 5.0, y: 63.0, seat: "Casterly Rock", labelOffset: "bottom", order: 5, markerScale: 0.95 },
  "house-targaryen": { x: 41.8, y: 57.0, seat: "King's Landing", labelOffset: "right", order: 6, markerScale: 0.95 },
  "house-tyrell": { x: 6.5, y: 76.0, seat: "Highgarden", labelOffset: "right", order: 7, markerScale: 0.9 },
  "house-baratheon": { x: 32.0, y: 72.0, seat: "Storm's End", labelOffset: "right", order: 8, markerScale: 0.9 },
  "house-martell": { x: 27.5, y: 88.5, seat: "Sunspear", labelOffset: "top", order: 9, markerScale: 0.9 },
});

const MOBILE_POSITIONS = Object.freeze({
  "house-stark": { x: 31.0, y: 29.0, seat: "Winterfell", labelOffset: "left", order: 1, markerScale: 0.86 },
  "house-greyjoy": { x: 14.5, y: 49.2, seat: "Pyke", labelOffset: "right", order: 2, markerScale: 0.8 },
  "house-tully": { x: 50.0, y: 35.5, seat: "Riverrun", labelOffset: "left", order: 3, markerScale: 0.8 },
  "house-arryn": { x: 81.0, y: 43.0, seat: "The Eyrie", labelOffset: "left", order: 4, markerScale: 0.82 },
  "house-lannister": { x: 22.0, y: 69.5, seat: "Casterly Rock", labelOffset: "right", order: 5, markerScale: 0.84 },
  "house-targaryen": { x: 62.0, y: 58.0, seat: "King's Landing", labelOffset: "bottom", order: 6, markerScale: 0.84 },
  "house-tyrell": { x: 40.0, y: 85.5, seat: "Highgarden", labelOffset: "left", order: 7, markerScale: 0.82 },
  "house-baratheon": { x: 82.0, y: 72.0, seat: "Storm's End", labelOffset: "left", order: 8, markerScale: 0.82 },
  "house-martell": { x: 72.0, y: 95.0, seat: "Sunspear", labelOffset: "top", order: 9, markerScale: 0.82 },
});

export const MAP_POSITIONS = Object.freeze({
  desktop: DESKTOP_POSITIONS,
  mobile: MOBILE_POSITIONS,
});

export const CAMERA_SCALES = Object.freeze({
  "house-stark": 1.66,
  "house-arryn": 1.85,
  "house-tully": 1.82,
  "house-greyjoy": 1.9,
  "house-lannister": 1.88,
  "house-tyrell": 1.82,
  "house-baratheon": 1.86,
  "house-martell": 1.78,
  "house-targaryen": 2.08,
});

export function getMapCameraFrame({
  viewportWidth,
  viewportHeight,
  position,
  scale,
  aspectRatio = MAP_LAYOUTS.desktop.aspectRatio,
  focusX = 0.32,
  focusY = 0.5,
}) {
  const mapWidth = Math.min(viewportWidth, viewportHeight * aspectRatio);
  const mapHeight = mapWidth / aspectRatio;
  const mapLeft = (viewportWidth - mapWidth) / 2;
  const mapTop = (viewportHeight - mapHeight) / 2;
  const pointX = mapWidth * position.x / 100;
  const pointY = mapHeight * position.y / 100;

  return {
    mapWidth,
    mapHeight,
    mapLeft,
    mapTop,
    translateX: viewportWidth * focusX - mapLeft - pointX * scale,
    translateY: viewportHeight * focusY - mapTop - pointY * scale,
  };
}

export function withMapPosition(houses) {
  return houses
    .map((house) => ({
      ...house,
      position: {
        desktop: MAP_POSITIONS.desktop[house.id],
        mobile: MAP_POSITIONS.mobile[house.id],
      },
    }))
    .filter((house) => house.position.desktop && house.position.mobile)
    .sort((a, b) => a.position.desktop.order - b.position.desktop.order);
}
