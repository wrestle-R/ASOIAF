import { applyAccuracyOverride } from "./accuracyOverrides.js";
import { JOURNEY_MAP, PLACES } from "./places.js";

const VALID_COMPLETION_REASONS = new Set([
  "series-complete",
  "season-complete",
  "character-death",
  "awaiting-season-finale",
  "ongoing-character",
  "unresolved-status",
]);

function round(value) {
  return Math.round(value * 10) / 10;
}

function seasonTitle(item) {
  return `Season ${item.season}`;
}

function freezeSource(source, context) {
  if (!source?.title || !source?.url) {
    throw new Error(`${context} requires a titled source URL`);
  }

  return Object.freeze({ title: source.title, url: source.url });
}

function freezeAppearance(appearance, context) {
  if (!/^S\d+E\d+$/.test(appearance?.episode ?? "")) {
    throw new Error(`${context} has an invalid episode identifier`);
  }
  if (!appearance?.scene?.trim()) {
    throw new Error(`${context} requires a scene note`);
  }

  return Object.freeze({
    episode: appearance.episode,
    scene: appearance.scene.trim(),
    source: freezeSource(appearance.source, context),
    evidence: appearance.evidence
      ? freezeSource(appearance.evidence, `${context} secondary evidence`)
      : null,
  });
}

function freezeStop(stop, context) {
  if (!PLACES[stop.placeId]) {
    throw new Error(`${context} uses unknown place ${stop.placeId}`);
  }

  const rawAppearances = stop.appearances?.length
    ? stop.appearances
    : [{
        episode: stop.episode,
        scene: stop.scene,
        source: stop.source,
        evidence: stop.evidence,
      }];
  const appearances = rawAppearances.map((appearance, index) => freezeAppearance(
    appearance,
    `${context} appearance ${index + 1}`,
  ));

  return Object.freeze({
    placeId: stop.placeId,
    episode: appearances[0].episode,
    scene: appearances[0].scene,
    depiction: "depicted",
    source: appearances[0].source,
    evidence: appearances[0].evidence,
    appearances: Object.freeze(appearances),
  });
}

export function schematicPath(placeIds) {
  const points = placeIds.map((placeId) => {
    const place = PLACES[placeId];
    if (!place) throw new Error(`Unknown journey place: ${placeId}`);
    return place;
  });
  const first = points[0];

  if (!first) throw new Error("A route requires at least one place");
  if (points.length === 1) return `M ${first.x} ${first.y}`;

  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const dx = point.x - previous.x;
    const dy = point.y - previous.y;
    const length = Math.max(Math.hypot(dx, dy), 1);
    const bend = Math.min(26, Math.max(7, length * 0.055))
      * (index % 2 === 0 ? 1 : -1);
    const normalX = -dy / length;
    const normalY = dx / length;
    const controlOneX = previous.x + dx * 0.34 + normalX * bend;
    const controlOneY = previous.y + dy * 0.34 + normalY * bend;
    const controlTwoX = previous.x + dx * 0.68 + normalX * bend;
    const controlTwoY = previous.y + dy * 0.68 + normalY * bend;

    return `${path} C ${round(controlOneX)} ${round(controlOneY)} ${round(controlTwoX)} ${round(controlTwoY)} ${point.x} ${point.y}`;
  }, `M ${first.x} ${first.y}`);
}

function cameraFor(placeIds) {
  const points = [...new Set(placeIds)].map((placeId) => PLACES[placeId]);
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spread = Math.max(maxX - minX, maxY - minY);
  const scale = spread > 800
    ? 1.02
    : spread > 550
      ? 1.04
      : spread > 350
        ? 1.07
        : spread > 180
          ? 1.12
          : 1.18;

  return Object.freeze({
    x: round((((minX + maxX) / 2) / JOURNEY_MAP.width) * 100),
    y: round((((minY + maxY) / 2) / JOURNEY_MAP.height) * 100),
    scale,
  });
}

function makeSegment(fromPlaceId, toPlaceId, kind) {
  const stationary = fromPlaceId === toPlaceId;
  const path = schematicPath(stationary ? [fromPlaceId] : [fromPlaceId, toPlaceId]);

  return Object.freeze({
    fromPlaceId,
    toPlaceId,
    path,
    kind: stationary ? "stationary" : kind,
    weight: stationary
      ? 1
      : Math.max(1, Math.hypot(
          PLACES[toPlaceId].x - PLACES[fromPlaceId].x,
          PLACES[toPlaceId].y - PLACES[fromPlaceId].y,
        )),
  });
}

function buildSeason(item, journeyKey) {
  if (!Number.isInteger(item.season) || item.season < 1) {
    throw new Error(`${journeyKey} has an invalid season`);
  }
  if (!item.stops?.length) {
    throw new Error(`${journeyKey} Season ${item.season} requires a depicted stop`);
  }

  const context = `${journeyKey} Season ${item.season}`;
  const correctedStops = applyAccuracyOverride(journeyKey, item.season, item.stops);
  const stops = correctedStops.map((stop, index) => freezeStop(
    stop,
    `${context} stop ${index + 1}`,
  ));
  const firstPlaceId = stops[0].placeId;
  const routeSegments = [];

  for (let index = 1; index < stops.length; index += 1) {
    routeSegments.push(makeSegment(
      stops[index - 1].placeId,
      stops[index].placeId,
      "depicted-route",
    ));
  }

  if (!routeSegments.length) {
    routeSegments.push(makeSegment(firstPlaceId, firstPlaceId, "stationary"));
  }

  const cameraPlaceIds = routeSegments.flatMap((segment) => [
    segment.fromPlaceId,
    segment.toPlaceId,
  ]);

  return Object.freeze({
    season: item.season,
    title: seasonTitle(item),
    summary: "",
    stops: Object.freeze(stops),
    routeSegments: Object.freeze(routeSegments),
    path: schematicPath(stops.map((stop) => stop.placeId)),
    camera: item.camera ? Object.freeze(item.camera) : cameraFor(cameraPlaceIds),
    duration: item.duration
      ?? Math.min(3800, 2100 + Math.max(0, routeSegments.length - 1) * 240),
    continuity: null,
  });
}

export function createJourney(config) {
  const key = `${config.seriesSlug}/${config.characterSlug}`;
  if (!config.characterName || !config.seriesName || !config.seasons?.length) {
    throw new Error(`${key} is missing required journey metadata`);
  }
  if (!VALID_COMPLETION_REASONS.has(config.coverage?.completionReason)) {
    throw new Error(`${key} has invalid coverage metadata`);
  }

  const seasons = [];
  for (const item of config.seasons) {
    seasons.push(buildSeason(item, key));
  }

  return Object.freeze({
    key,
    seriesSlug: config.seriesSlug,
    seriesName: config.seriesName,
    characterSlug: config.characterSlug,
    characterName: config.characterName,
    totalSeasons: config.totalSeasons,
    coverage: Object.freeze({ ...config.coverage }),
    seasons: Object.freeze(seasons),
  });
}
