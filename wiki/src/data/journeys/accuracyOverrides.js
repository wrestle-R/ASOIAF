function mergeStops(stops, placeId) {
  const matches = stops.filter((stop) => stop.placeId === placeId);
  if (!matches.length) return null;

  return {
    ...matches[0],
    appearances: matches.flatMap((stop) => stop.appearances ?? []),
  };
}

function selectOccurrences(stops, placeIds) {
  const used = new Map();

  return placeIds.map((placeId) => {
    const matches = stops.filter((stop) => stop.placeId === placeId);
    const occurrence = used.get(placeId) ?? 0;
    used.set(placeId, occurrence + 1);
    const match = matches[occurrence];
    if (!match) throw new Error(`Accuracy override is missing ${placeId} occurrence ${occurrence + 1}`);
    return match;
  });
}

/**
 * Manual corrections take precedence over generated scene-label routes.
 * Keep these small and explicit: scene indexes are evidence inputs, not proof
 * that every cutaway label represents a meaningful journey leg.
 */
export function applyAccuracyOverride(journeyKey, seasonNumber, stops) {
  if (journeyKey === "game-of-thrones/jon-snow" && seasonNumber === 1) {
    const route = [
      mergeStops(stops, "winterfell"),
      mergeStops(stops, "castle-black"),
    ];
    if (route.some((stop) => !stop)) throw new Error("Jon Snow Season 1 override is incomplete");
    return route;
  }

  if (journeyKey === "game-of-thrones/theon-greyjoy" && seasonNumber === 2) {
    return selectOccurrences(stops, [
      "pyke",
      "winterfell",
      "outside-winterfell",
      "winterfell",
    ]);
  }

  return stops;
}
