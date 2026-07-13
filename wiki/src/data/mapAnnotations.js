export const MAP_REGION_LABELS = Object.freeze([
  { name: "The North", x: 16.5, y: 17.5 },
  { name: "Iron Islands", x: 5.6, y: 44.2, rotate: -8 },
  { name: "The Riverlands", x: 16.1, y: 47.7 },
  { name: "The Vale", x: 25.8, y: 43.4, rotate: -8 },
  { name: "The Westerlands", x: 8.8, y: 56.2, rotate: -8 },
  { name: "The Crownlands", x: 26.4, y: 56.7 },
  { name: "The Reach", x: 13.9, y: 66.8 },
  { name: "The Stormlands", x: 27.2, y: 64.8, rotate: -10 },
  { name: "Dorne", x: 18.8, y: 83.7 },
]);

export const MAP_PLACE_LABELS = Object.freeze([
  { name: "The Wall", x: 18.2, y: 10.5 },
  { name: "Castle Black", x: 19.7, y: 12.5 },
  { name: "Winterfell", x: 19.4, y: 25.4 },
  { name: "Pyke", x: 5.7, y: 49.3 },
  { name: "Riverrun", x: 16.2, y: 52.1 },
  { name: "The Eyrie", x: 25.6, y: 48.1 },
  { name: "Casterly Rock", x: 8.9, y: 60.1 },
  { name: "Highgarden", x: 13.1, y: 72.2 },
  { name: "King's Landing", x: 27.2, y: 60.4 },
  { name: "The Red Keep", x: 27.4, y: 62.1 },
  { name: "Storm's End", x: 27.7, y: 69.2 },
  { name: "Sunspear", x: 25.6, y: 83.5 },
]);

// Presentation-only atlas strokes. Their low contrast supplements the geography
// already drawn into the map without claiming survey-level political borders.
export const MAP_BOUNDARIES = Object.freeze([
  "M10.4 37.8 C13.1 39.2 17.4 39.5 21.6 38.6 C23.8 38.1 25.4 38.5 27.1 39.7",
  "M20.6 40.2 C22.1 42.1 22.2 45.2 21.7 48.1 C21.3 50.2 22.3 52.4 24.5 53.7",
  "M8.5 54.3 C11.2 53.2 13.7 53.6 15.5 55.2 C17.3 56.9 20.1 57.4 23.6 56.9",
  "M11.1 64.1 C14.2 63.0 17.2 63.6 19.2 65.1 C21.2 66.7 23.6 66.9 26.8 65.8",
  "M10.4 77.2 C13.4 75.4 16.5 75.7 19.0 77.3 C21.3 78.8 24.0 79.0 27.2 78.0",
]);
