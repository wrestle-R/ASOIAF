export const MAP_ASPECT_RATIO = 1.4;

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

export const MAP_POSITIONS = Object.freeze({
  "house-stark": { x: 18.5, y: 25.4, seat: "Winterfell", labelOffset: "right", order: 1, markerScale: 1 },
  "house-greyjoy": { x: 5.7, y: 48.5, seat: "Pyke", labelOffset: "right", order: 2, markerScale: 0.9 },
  "house-tully": { x: 15.5, y: 51.2, seat: "Riverrun", labelOffset: "right", order: 3, markerScale: 0.9 },
  "house-arryn": { x: 24.2, y: 47.5, seat: "The Eyrie", labelOffset: "left", order: 4, markerScale: 0.9 },
  "house-lannister": { x: 9.6, y: 59.5, seat: "Casterly Rock", labelOffset: "right", order: 5, markerScale: 0.95 },
  "house-targaryen": { x: 24.7, y: 59.2, seat: "King's Landing", labelOffset: "left", order: 6, markerScale: 0.95 },
  "house-tyrell": { x: 13.3, y: 71.4, seat: "Highgarden", labelOffset: "right", order: 7, markerScale: 0.9 },
  "house-baratheon": { x: 26.5, y: 69.5, seat: "Storm's End", labelOffset: "left", order: 8, markerScale: 0.9 },
  "house-martell": { x: 24.4, y: 82.7, seat: "Sunspear", labelOffset: "left", order: 9, markerScale: 0.9 },
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
  focusX = 0.32,
  focusY = 0.5,
}) {
  const mapWidth = Math.min(viewportWidth, viewportHeight * MAP_ASPECT_RATIO);
  const mapHeight = mapWidth / MAP_ASPECT_RATIO;
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
    .map((house) => ({ ...house, position: MAP_POSITIONS[house.id] }))
    .filter((house) => house.position)
    .sort((a, b) => a.position.order - b.position.order);
}
