export const MAP_POSITIONS = Object.freeze({
  "house-stark": { x: 18.7, y: 24, labelOffset: "right", order: 1 },
  "house-greyjoy": { x: 6.5, y: 45.5, labelOffset: "right", order: 2 },
  "house-tully": { x: 16.4, y: 49.5, labelOffset: "right", order: 3 },
  "house-arryn": { x: 27.1, y: 45.5, labelOffset: "left", order: 4 },
  "house-lannister": { x: 10.4, y: 59.4, labelOffset: "right", order: 5 },
  "house-targaryen": { x: 31.1, y: 58.5, labelOffset: "left", order: 6 },
  "house-tyrell": { x: 15.3, y: 70.5, labelOffset: "right", order: 7 },
  "house-baratheon": { x: 27.2, y: 68.2, labelOffset: "left", order: 8 },
  "house-martell": { x: 22.3, y: 83, labelOffset: "left", order: 9 },
});

export function withMapPosition(houses) {
  return houses
    .map((house) => ({ ...house, position: MAP_POSITIONS[house.id] }))
    .filter((house) => house.position)
    .sort((a, b) => a.position.order - b.position.order);
}
