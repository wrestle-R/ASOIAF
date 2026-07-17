import { getJourneyCatalogEntry } from "../src/data/journeys/journeyCatalog.js";

const SERIES = Object.freeze([
  Object.freeze({
    documentPath: "gameofthrone.json",
    slug: "game-of-thrones",
    name: "Game of Thrones",
  }),
  Object.freeze({
    documentPath: "houseofthedragon.json",
    slug: "house-of-the-dragon",
    name: "House of the Dragon",
  }),
  Object.freeze({
    documentPath: "knightofthesevenkingdoms.json",
    slug: "a-knight-of-the-seven-kingdoms",
    name: "A Knight of the Seven Kingdoms",
  }),
]);

export const CHARACTER_SERIES = SERIES;

const SERIES_BY_DOCUMENT = new Map(
  SERIES.map((series) => [series.documentPath, series]),
);
const SERIES_BY_SLUG = new Map(SERIES.map((series) => [series.slug, series]));
const SERIES_PROMINENCE = new Map(SERIES.map((series, index) => [series.slug, index]));

const CHARACTER_SELECT = `
  SELECT r.id,
         r.source_id,
         r.full_name,
         r.record_json,
         d.path AS document_path,
         m.image_id,
         m.url AS image_url,
         m.width AS image_width,
         m.height AS image_height
  FROM records AS r
  JOIN json_documents AS d ON d.id = r.document_id
  LEFT JOIN media_assets AS m ON m.record_id = r.id
  WHERE d.path IN (
    'gameofthrone.json',
    'houseofthedragon.json',
    'knightofthesevenkingdoms.json'
  )
  ORDER BY r.id
`;

const nameCollator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

export class CharacterQueryError extends Error {
  constructor(code) {
    super(code);
    this.name = "CharacterQueryError";
    this.code = code;
  }
}

function cleanText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function cleanAliases(value) {
  if (!Array.isArray(value)) return [];

  return [...new Set(value.map(cleanText).filter(Boolean))];
}

export function toCharacterSlug(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function portraitFromRow(row) {
  if (!row.image_id || !row.image_url) return null;

  return {
    id: row.image_id,
    url: row.image_url,
    width: row.image_width,
    height: row.image_height,
  };
}

function mapCharacterRow(row) {
  const series = SERIES_BY_DOCUMENT.get(row.document_path);
  if (!series) return null;

  let raw;
  try {
    raw = JSON.parse(row.record_json);
  } catch {
    return null;
  }

  const name = cleanText(raw.fullName ?? raw.name ?? row.full_name);
  if (!name) return null;

  return {
    recordId: row.id,
    id: raw.id ?? row.source_id ?? row.id,
    seriesSlug: series.slug,
    seriesName: series.name,
    characterSlug: toCharacterSlug(name),
    name,
    title: cleanText(raw.title),
    family: cleanText(raw.family),
    aliases: cleanAliases(raw.aliases),
    portrait: portraitFromRow(row),
    journeyStatus: "pending",
    journeyCoverage: null,
    journeyUrl: "",
  };
}

function assignCollisionSafeUrls(characters) {
  const usedSlugs = new Map();

  return characters.map((character) => {
    const seriesSlugs = usedSlugs.get(character.seriesSlug) ?? new Set();
    const baseSlug = character.characterSlug || `character-${character.recordId}`;
    let characterSlug = baseSlug;

    if (seriesSlugs.has(characterSlug)) {
      const idSuffix = toCharacterSlug(character.id) || character.recordId;
      characterSlug = `${baseSlug}-${idSuffix}`;
      let collisionIndex = 2;
      while (seriesSlugs.has(characterSlug)) {
        characterSlug = `${baseSlug}-${idSuffix}-${collisionIndex}`;
        collisionIndex += 1;
      }
    }

    seriesSlugs.add(characterSlug);
    usedSlugs.set(character.seriesSlug, seriesSlugs);

    return {
      ...character,
      characterSlug,
      journeyUrl: `/journeys/${character.seriesSlug}/${characterSlug}`,
    };
  });
}

function applyJourneyCatalog(character) {
  const entry = getJourneyCatalogEntry(
    character.seriesSlug,
    character.characterSlug,
  );

  if (!entry) return character;

  return {
    ...character,
    journeyStatus: entry.journeyStatus,
    journeyCoverage: entry.journeyCoverage,
  };
}

function sortCharacters(characters) {
  const statusOrder = Object.freeze({ published: 0, deferred: 1, pending: 2 });

  return characters.sort((left, right) => {
    if (left.journeyStatus !== right.journeyStatus) {
      return statusOrder[left.journeyStatus] - statusOrder[right.journeyStatus];
    }

    const seriesDifference = (
      SERIES_PROMINENCE.get(left.seriesSlug) - SERIES_PROMINENCE.get(right.seriesSlug)
    );
    if (seriesDifference) return seriesDifference;

    const leftRank = Number(left.id);
    const rightRank = Number(right.id);
    if (Number.isFinite(leftRank) && Number.isFinite(rightRank) && leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    return (
      nameCollator.compare(left.name, right.name) || left.recordId - right.recordId
    );
  });
}

function loadCharacters(database) {
  const characters = database
    .prepare(CHARACTER_SELECT)
    .all()
    .map(mapCharacterRow)
    .filter(Boolean);

  return sortCharacters(assignCollisionSafeUrls(characters).map(applyJourneyCatalog));
}

function parseTextFilter(value, name, maxLength) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") {
    throw new CharacterQueryError(`invalid-${name}`);
  }

  const text = value.trim();
  if (!text) return null;
  if (text.length > maxLength) {
    throw new CharacterQueryError(`invalid-${name}`);
  }

  return text;
}

function parseIntegerFilter(value, name, fallback, minimum, maximum) {
  if (value === undefined || value === null || value === "") return fallback;
  if (
    (typeof value !== "string" && typeof value !== "number") ||
    !/^\d+$/.test(String(value))
  ) {
    throw new CharacterQueryError(`invalid-${name}`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum) {
    throw new CharacterQueryError(`invalid-${name}`);
  }

  return maximum ? Math.min(parsed, maximum) : parsed;
}

function parseOptions(options) {
  const search = parseTextFilter(options.search, "search", 80);
  const requestedSeries = parseTextFilter(options.series, "series", 64);
  const series = requestedSeries === "all" ? null : requestedSeries;

  if (series && !SERIES_BY_SLUG.has(series)) {
    throw new CharacterQueryError("invalid-series");
  }

  return {
    search: search?.toLocaleLowerCase("en") ?? null,
    series,
    limit: parseIntegerFilter(options.limit, "limit", 24, 1, 60),
    offset: parseIntegerFilter(options.offset, "offset", 0, 0),
  };
}

function matchesSearch(character, search) {
  if (!search) return true;

  return [
    character.name,
    character.title,
    character.family,
    ...character.aliases,
  ].some((value) => value?.toLocaleLowerCase("en").includes(search));
}

export function getCharacters(database, options = {}) {
  const filters = parseOptions(options);
  const characters = loadCharacters(database).filter(
    (character) =>
      (!filters.series || character.seriesSlug === filters.series) &&
      matchesSearch(character, filters.search),
  );
  const published = characters.filter(
    (character) => character.journeyStatus === "published",
  ).length;
  const deferred = characters.filter(
    (character) => character.journeyStatus === "deferred",
  ).length;
  const pending = characters.filter(
    (character) => character.journeyStatus === "pending",
  ).length;

  return {
    total: characters.length,
    published,
    deferred,
    pending,
    limit: filters.limit,
    offset: filters.offset,
    characters: characters.slice(
      filters.offset,
      filters.offset + filters.limit,
    ),
  };
}

export function getCharacter(database, seriesSlug, characterSlug) {
  if (!SERIES_BY_SLUG.has(seriesSlug) || !characterSlug) return null;

  return (
    loadCharacters(database).find(
      (character) =>
        character.seriesSlug === seriesSlug &&
        character.characterSlug === characterSlug,
    ) ?? null
  );
}
