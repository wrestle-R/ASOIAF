import { getJourneyCatalogEntry } from "./journeyCatalog.js";

const journeyModules = import.meta.glob("./characters/**/*.js");
const loaders = new Map(
  Object.entries(journeyModules).map(([path, loader]) => {
    const match = path.match(/^\.\/characters\/([^/]+)\/([^/]+)\.js$/);
    if (!match) throw new Error(`Unexpected journey module path: ${path}`);
    return [`${match[1]}/${match[2]}`, loader];
  }),
);

export const PUBLISHED_JOURNEY_KEYS = Object.freeze([...loaders.keys()].sort());

export function hasPublishedJourney(seriesSlug, characterSlug) {
  return loaders.has(`${seriesSlug}/${characterSlug}`);
}

export async function loadJourney(seriesSlug, characterSlug) {
  const key = `${seriesSlug}/${characterSlug}`;
  const catalogEntry = getJourneyCatalogEntry(seriesSlug, characterSlug);
  const loader = loaders.get(key);

  if (catalogEntry?.journeyStatus !== "published" || !loader) return null;

  const module = await loader();
  return module.default ?? null;
}

export async function loadAllPublishedJourneys() {
  return Promise.all(PUBLISHED_JOURNEY_KEYS.map((key) => {
    const [seriesSlug, characterSlug] = key.split("/");
    return loadJourney(seriesSlug, characterSlug);
  }));
}
