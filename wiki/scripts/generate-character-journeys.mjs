import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const GOT_SCENE_SOURCE = "https://raw.githubusercontent.com/jeffreylancaster/game-of-thrones/master/data/episodes.json";
const GOT_SCENE_EVIDENCE = "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json";
const KNIGHT_SYNOPSIS_SOURCE = "https://press.wbd.com/na/property/knight-seven-kingdoms/synopses";
const databasePath = fileURLToPath(new URL("../../dataset/asoiaf.sqlite", import.meta.url));
const charactersRoot = fileURLToPath(new URL("../src/data/journeys/characters/", import.meta.url));
const catalogPath = fileURLToPath(new URL("../src/data/journeys/journeyCatalog.js", import.meta.url));
const placesPath = fileURLToPath(new URL("../src/data/journeys/places.js", import.meta.url));
const backlogPath = fileURLToPath(new URL("../../md/CHARACTER_JOURNEY_MAPPINGS.md", import.meta.url));
const auditPath = fileURLToPath(new URL("../../md/CHARACTER_JOURNEY_AUDIT.md", import.meta.url));
const AUDIT_DATE = "2026-07-18";
const REVIEWER = "ASOIAF map audit";

// Publication is deliberately narrower than the raw scene index. These are
// meaningful destinations with an explicit on-screen place label and a usable
// reviewed map anchor. Everything else remains a candidate in the ledger.
const ACCEPTED_PLACE_IDS = new Set([
  "ashford-meadow", "astapor", "bear-island", "blackwater-bay", "blackwater-rush",
  "castle-black", "castle-stokeworth", "casterly-rock", "crasters-keep",
  "crossroads-inn", "deepwood-motte", "dragonstone", "eastwatch", "eyrie", "hardhome",
  "harrenhal", "highgarden", "hollow-hill", "horn-hill", "kings-landing", "kingswood",
  "lands-of-always-winter", "last-hearth", "lhazar", "meereen", "moat-cailin",
  "moles-town", "nightfort", "oldtown", "oxcross", "pentos", "pyke", "qarth",
  "red-waste", "riverrun", "runestone", "storms-end", "tarth", "the-dreadfort",
  "the-fist", "the-frostfangs", "the-twins", "three-eyed-raven-cave", "tower-of-joy",
  "vaes-dothrak", "water-gardens", "winter-town", "winterfell",
  "yunkai",
]);

const BROAD_OR_TRANSIT_PLACE_IDS = new Set([
  "beyond-the-wall", "dorne", "dothraki-sea", "dothraki-sea-camp", "haunted-forest",
  "kingsroad", "lannister-camp", "narrow-sea", "north-road", "outside-castle-black",
  "outside-kings-landing", "outside-winterfell", "red-fork", "riverlands", "shivering-sea",
  "stormlands", "summer-sea", "sunset-sea", "the-gift", "the-neck", "vale", "vale-road",
  "westerlands-road", "wildling-camp", "wolfswood",
]);

const MANUAL_ACCEPTED_CANDIDATES = new Set([
  // Plot-critical local departure and return explicitly requested in the audit.
  "game-of-thrones/theon-greyjoy|2|outside-winterfell",
]);

const MAJOR_CITY_AUDIT = Object.freeze([
  ["King's Landing", "kings-landing", "accepted", "Printed anchor on the immutable map artwork"],
  ["Oldtown", "oldtown", "accepted", "Printed anchor on the immutable map artwork"],
  ["Lannisport", "—", "unresolved", "No printed anchor on the current artwork"],
  ["Gulltown", "—", "unresolved", "No printed anchor on the current artwork"],
  ["White Harbor", "—", "unresolved", "No printed anchor on the current artwork"],
  ["Braavos", "—", "unresolved", "Existing overlay was an unsourced visual estimate"],
  ["Lorath", "—", "unresolved", "Outside the labelled extent of the current artwork"],
  ["Lys", "—", "unresolved", "No printed anchor on the current artwork"],
  ["Myr", "—", "unresolved", "No printed anchor on the current artwork"],
  ["Norvos", "—", "unresolved", "No printed anchor on the current artwork"],
  ["Pentos", "pentos", "accepted", "Printed anchor on the immutable map artwork"],
  ["Qohor", "—", "unresolved", "No printed anchor on the current artwork"],
  ["Tyrosh", "—", "unresolved", "No printed anchor on the current artwork"],
  ["Volantis", "—", "unresolved", "Existing overlay was an unsourced visual estimate"],
  ["Astapor", "astapor", "accepted", "Printed anchor on the immutable map artwork"],
  ["Yunkai", "yunkai", "accepted", "Printed anchor on the immutable map artwork"],
  ["Meereen", "meereen", "accepted", "Printed anchor on the immutable map artwork"],
  ["Qarth", "qarth", "accepted", "Printed anchor on the immutable map artwork"],
  ["Vaes Dothrak", "vaes-dothrak", "accepted", "Printed anchor on the immutable map artwork"],
]);

const SERIES = Object.freeze({
  "gameofthrone.json": Object.freeze({
    slug: "game-of-thrones",
    name: "Game of Thrones",
    totalSeasons: 8,
    journeyStatus: "published",
    coverage: Object.freeze({
      throughEpisode: "S8E6",
      throughDate: "2019-05-19",
      completionReason: "series-complete",
    }),
  }),
  "houseofthedragon.json": Object.freeze({
    slug: "house-of-the-dragon",
    name: "House of the Dragon",
    totalSeasons: 4,
    journeyStatus: "deferred",
    coverage: Object.freeze({
      throughEpisode: "S3E4",
      throughDate: "2026-07-12",
      completionReason: "awaiting-season-finale",
    }),
  }),
  "knightofthesevenkingdoms.json": Object.freeze({
    slug: "a-knight-of-the-seven-kingdoms",
    name: "A Knight of the Seven Kingdoms",
    totalSeasons: 1,
    journeyStatus: "published",
    coverage: Object.freeze({
      throughEpisode: "S1E6",
      throughDate: "2026-02-22",
      completionReason: "season-complete",
    }),
  }),
});

const GOT_CHARACTER_ALIASES = Object.freeze({
  "Brandon Stark": "Bran Stark",
  Drogo: "Khal Drogo",
  "Gendry Baratheon": "Gendry",
  "Night King": "The Night King",
  Pycelle: "Grand Maester Pycelle",
  "Ramsay Bolton": "Ramsay Snow",
  "Talisa Stark": "Talisa Maegyr",
  Varys: "Lord Varys",
});

const KNIGHT_EPISODES = Object.freeze({
  "The Hedge Knight": Object.freeze({ number: 1, title: "The Hedge Knight" }),
  "Hard Salt Beef": Object.freeze({ number: 2, title: "Hard Salt Beef" }),
  "The Squire": Object.freeze({ number: 3, title: "The Squire" }),
  Seven: Object.freeze({ number: 4, title: "Seven" }),
  "In the Name of the Mother": Object.freeze({ number: 5, title: "In the Name of the Mother" }),
  "The Morrow": Object.freeze({ number: 6, title: "The Morrow" }),
});

const COMBINED_PLACE_IDS = Object.freeze({
  "The Crownlands|Blackwater Bay": "blackwater-bay",
  "The Crownlands|Blackwater Rush": "blackwater-rush",
  "The Crownlands|Castle Stokeworth": "castle-stokeworth",
  "The Crownlands|Dragonstone": "dragonstone",
  "The Crownlands|King's Landing": "kings-landing",
  "The Crownlands|Outside King's Landing": "outside-kings-landing",
  "The Crownlands|The Kingswood": "kingswood",
  "The Dothraki Sea|Dothraki Camp": "dothraki-sea-camp",
  "The Dothraki Sea|Lhazareen Village": "lhazar",
  "The Iron Islands|Lordsport": "pyke",
  "The Iron Islands|Pyke": "pyke",
  "The North|Bear Island": "bear-island",
  "The North|Deepwood Motte": "deepwood-motte",
  "The North|Last Hearth": "last-hearth",
  "The North|Moat Cailin": "moat-cailin",
  "The North|North to the Wall": "north-road",
  "The North|Outside Winterfell": "outside-winterfell",
  "The North|Stannis Baratheon's Camp": "outside-winterfell",
  "The North|The Dreadfort": "the-dreadfort",
  "The North|The Gift": "the-gift",
  "The North|The Kingsroad South to King's Landing": "north-road",
  "The North|The Neck": "the-neck",
  "The North|The Wolfswood": "wolfswood",
  "The North|Winter Town": "winter-town",
  "The North|Winterfell": "winterfell",
  "The Reach|Highgarden": "highgarden",
  "The Reach|Horn Hill": "horn-hill",
  "The Reach|Oldtown": "oldtown",
  "The Reach|To Horn Hill": "horn-hill",
  "The Riverlands|Away from the Twins": "the-twins",
  "The Riverlands|Camp of the North": "riverlands",
  "The Riverlands|Crossroads Inn": "crossroads-inn",
  "The Riverlands|East to King's Landing": "kingsroad",
  "The Riverlands|Harrenhal": "harrenhal",
  "The Riverlands|Hollow Hill": "hollow-hill",
  "The Riverlands|Lannister Camp": "lannister-camp",
  "The Riverlands|North to the Red Fork": "red-fork",
  "The Riverlands|Outside Harrenhal": "harrenhal",
  "The Riverlands|Red Fork": "red-fork",
  "The Riverlands|Riverrun": "riverrun",
  "The Riverlands|South to King's Landing": "kingsroad",
  "The Riverlands|The Kingsroad": "kingsroad",
  "The Riverlands|The Twins": "the-twins",
  "The Riverlands|To Harrenhal": "harrenhal",
  "The Riverlands|To Riverrun": "riverrun",
  "The Riverlands|To The Eyrie": "vale-road",
  "The Riverlands|To The Twins": "the-twins",
  "The Stormlands|Storm's End": "storms-end",
  "The Stormlands|Tarth": "tarth",
  "The Vale|Coast of the Vale": "vale-road",
  "The Vale|Eastern Road": "vale-road",
  "The Vale|Inn": "vale-road",
  "The Vale|Outside the Inn": "vale-road",
  "The Vale|Runestone": "runestone",
  "The Vale|The Eyrie": "eyrie",
  "The Vale|To The Eyrie": "vale-road",
  "The Vale|To The Vale": "vale-road",
  "The Vale|To the Westerlands": "westerlands-road",
  "The Wall|Castle Black": "castle-black",
  "The Wall|Eastwatch": "eastwatch",
  "The Wall|Mole's Town": "moles-town",
  "The Wall|Nightfort": "nightfort",
  "The Wall|Outside Castle Black": "outside-castle-black",
  "The Wall|The Gift": "the-gift",
  "The Wall|Top of the Wall": "castle-black",
  "The Westerlands|Camp of the North": "oxcross",
  "The Westerlands|Casterly Rock": "casterly-rock",
  "The Westerlands|Lannister Camp": "lannister-camp",
  "The Westerlands|Oxcross": "oxcross",
  "The Westerlands|To King's Landing": "westerlands-road",
  "North of the Wall|Cave Outside Wildling Camp": "wildling-camp",
  "North of the Wall|Craster's Keep": "crasters-keep",
  "North of the Wall|Destroyed Cabin": "haunted-forest",
  "North of the Wall|Fist of the First Men": "the-fist",
  "North of the Wall|Frostfang Mountains": "the-frostfangs",
  "North of the Wall|Hardhome": "hardhome",
  "North of the Wall|Near Nightfort": "nightfort",
  "North of the Wall|Nightswatch March South": "beyond-the-wall",
  "North of the Wall|Outside the Three-Eyed Raven": "three-eyed-raven-cave",
  "North of the Wall|South to the Wall": "beyond-the-wall",
  "North of the Wall|The Haunted Forest": "haunted-forest",
  "North of the Wall|The Lands of Always Winter": "lands-of-always-winter",
  "North of the Wall|The Three-Eyed Raven": "three-eyed-raven-cave",
  "North of the Wall|The Wall": "beyond-the-wall",
  "North of the Wall|Wildling Camp": "wildling-camp",
  "North of the Wall|Wildlings March South": "wildling-camp",
  "Dorne|The Water Gardens": "water-gardens",
  "Dorne|Tower of Joy": "tower-of-joy",
});

const LOCATION_PLACE_IDS = Object.freeze({
  Astapor: "astapor",
  Braavos: "braavos",
  Dorne: "dorne",
  Meereen: "meereen",
  "North of the Wall": "beyond-the-wall",
  Pentos: "pentos",
  Qarth: "qarth",
  "The Dothraki Sea": "dothraki-sea",
  "The Narrow Sea": "narrow-sea",
  "The North": "winterfell",
  "The Red Waste": "red-waste",
  "The Riverlands": "riverlands",
  "The Shivering Sea": "shivering-sea",
  "The Stormlands": "stormlands",
  "The Summer Sea": "summer-sea",
  "The Sunset Sea": "sunset-sea",
  "The Vale": "vale",
  "The Wall": "castle-black",
  "The Westerlands": "westerlands-road",
  "Vaes Dothrak": "vaes-dothrak",
  Valyria: "valyria",
  Volantis: "volantis",
  Yunkai: "yunkai",
});

function toCharacterSlug(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function episodeCode(season, episode) {
  return `S${season}E${episode}`;
}

function titleSlug(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function gotEpisodeSource(episode) {
  const code = episodeCode(episode.seasonNum, episode.episodeNum);
  return {
    title: `Game of Thrones ${code}: “${episode.episodeTitle}” — HBO`,
    url: `https://www.hbo.com/game-of-thrones/season-${episode.seasonNum}/${episode.episodeNum}-${titleSlug(episode.episodeTitle)}`,
  };
}

function scenePlaceId(scene) {
  const combined = `${scene.location}|${scene.subLocation ?? ""}`;
  const exact = COMBINED_PLACE_IDS[combined];
  if (exact) return exact;

  const broadRiverlands = new Set(["Battlefield", "Forest", "Village"]);
  if (scene.location === "The Riverlands" && broadRiverlands.has(scene.subLocation)) {
    return "riverlands";
  }
  if (scene.location === "The Stormlands" && scene.subLocation === "The Woods") {
    return "stormlands";
  }

  const placeId = LOCATION_PLACE_IDS[scene.location];
  if (!placeId) {
    throw new Error(`Unmapped scene location: ${combined}`);
  }
  return placeId;
}

function sceneNote(scene) {
  const location = scene.subLocation
    ? `${scene.location} — ${scene.subLocation}`
    : scene.location;
  return `${location}; scene begins ${scene.sceneStart}.`;
}

function secondarySceneEvidence(episode) {
  return {
    title: `Scene-level location index for ${episodeCode(episode.seasonNum, episode.episodeNum)}`,
    url: GOT_SCENE_EVIDENCE,
  };
}

function candidateDecision(character, season, stop) {
  const appearance = stop.appearances[0];
  const rawLabel = appearance.scene.split("; scene begins")[0];
  const broadLocation = /^(The North|The Wall|The Riverlands|The Stormlands|The Vale|Dorne)(?:;|$)/.test(rawLabel);
  const transitLabel = /(?: — )?(?:To |North to |South to |East to |Coast of |The Kingsroad|March South|Road|Camp|Outside )/i.test(rawLabel);
  const manualKey = `${character.key}|${season}|${stop.placeId}`;
  const manuallyAccepted = MANUAL_ACCEPTED_CANDIDATES.has(manualKey);
  const accepted = manuallyAccepted || (
    ACCEPTED_PLACE_IDS.has(stop.placeId)
    && !BROAD_OR_TRANSIT_PLACE_IDS.has(stop.placeId)
    && !broadLocation
    && !transitLabel
  );

  return {
    character: character.name,
    characterKey: character.key,
    season,
    episode: appearance.episode,
    rawLabel,
    normalizedPlace: stop.placeId,
    depiction: "depicted",
    evidenceType: "scene-level depiction",
    sources: [appearance.source, appearance.evidence].filter(Boolean),
    reviewStatus: accepted ? "accepted" : "rejected",
    reason: accepted
      ? (manuallyAccepted ? "Plot-critical local departure/return reviewed as meaningful." : "Explicit meaningful destination with reviewed map anchor.")
      : broadLocation
        ? "Broad regional label cannot authorize a specific destination."
        : transitLabel || BROAD_OR_TRANSIT_PLACE_IDS.has(stop.placeId)
          ? "Transit, camp, road, sea, nearby, or incidental label is not a story destination."
          : "Location is not approved for runtime publication.",
    reviewer: REVIEWER,
    auditDate: AUDIT_DATE,
  };
}

function acceptedStop(stop, decision) {
  return {
    ...stop,
    depiction: decision.depiction,
    reviewStatus: decision.reviewStatus,
    evidenceType: decision.evidenceType,
    reviewer: decision.reviewer,
    auditDate: decision.auditDate,
  };
}

function collapseConsecutiveStops(stops) {
  return stops.reduce((collapsed, stop) => {
    const previous = collapsed.at(-1);
    if (previous?.placeId === stop.placeId) {
      previous.appearances.push(...stop.appearances);
      return collapsed;
    }
    collapsed.push({ ...stop, appearances: [...stop.appearances] });
    return collapsed;
  }, []);
}

function buildGotJourney(character, episodes) {
  const sceneName = GOT_CHARACTER_ALIASES[character.name] ?? character.name;
  const seasons = new Map();

  for (const episode of episodes) {
    for (const scene of episode.scenes) {
      if (!scene.characters.some((candidate) => candidate.name === sceneName)) continue;

      const placeId = scenePlaceId(scene);
      const seasonStops = seasons.get(episode.seasonNum) ?? [];
      const previous = seasonStops.at(-1);
      const appearance = {
        episode: episodeCode(episode.seasonNum, episode.episodeNum),
        scene: sceneNote(scene),
        source: gotEpisodeSource(episode),
        evidence: secondarySceneEvidence(episode),
      };

      if (previous?.placeId === placeId) {
        if (previous.appearances.at(-1)?.episode !== appearance.episode) {
          previous.appearances.push(appearance);
        }
      } else {
        seasonStops.push({ placeId, appearances: [appearance] });
      }
      seasons.set(episode.seasonNum, seasonStops);
    }
  }

  if (!seasons.size) {
    throw new Error(`No scene route was found for ${character.name} (${sceneName})`);
  }

  const decisions = [];
  const auditedSeasons = [...seasons.entries()].flatMap(([season, stops]) => {
    const reviewedStops = stops.flatMap((stop) => {
      const decision = candidateDecision(character, season, stop);
      decisions.push(decision);
      return decision.reviewStatus === "accepted" ? [acceptedStop(stop, decision)] : [];
    });
    const collapsedStops = collapseConsecutiveStops(reviewedStops);
    if (!collapsedStops.length) return [];
    return [{ season, title: `Season ${season}`, summary: "", stops: collapsedStops }];
  });

  if (!auditedSeasons.length) {
    return { journey: null, decisions };
  }

  return { journey: {
    seriesSlug: character.seriesSlug,
    seriesName: character.seriesName,
    characterSlug: character.characterSlug,
    characterName: character.name,
    totalSeasons: character.totalSeasons,
    coverage: character.journeyCoverage,
    seasons: auditedSeasons,
  }, decisions };
}

function wikiPageTitle(url) {
  const parsed = new URL(url);
  return decodeURIComponent(parsed.pathname.split("/wiki/")[1] ?? "");
}

async function fetchKnightAppearances(character) {
  const pageTitle = wikiPageTitle(character.wikiSource.url);
  const api = new URL("https://gameofthrones.fandom.com/api.php");
  api.searchParams.set("action", "parse");
  api.searchParams.set("page", pageTitle);
  api.searchParams.set("prop", "wikitext");
  api.searchParams.set("format", "json");
  api.searchParams.set("origin", "*");

  const response = await fetch(api, { headers: { "user-agent": "ASOIAF-journey-builder/1.0" } });
  if (!response.ok) throw new Error(`Fandom returned ${response.status} for ${character.name}`);
  const payload = await response.json();
  const wikitext = payload.parse?.wikitext?.["*"] ?? "";
  const appearanceSection = wikitext.split("==Appearances==")[1]?.split("===Forthcoming===")[0] ?? "";
  const titles = [...appearanceSection.matchAll(/\{\{AKOTSK\|([^}|]+)[^}]*\}\}/g)]
    .map((match) => match[1].trim())
    .filter((title) => KNIGHT_EPISODES[title]);
  const uniqueTitles = [...new Set(titles)];

  if (!uniqueTitles.length) {
    const firstReference = wikitext.match(/AKOTSK10([1-6])/);
    const fallback = Object.values(KNIGHT_EPISODES)
      .find((episode) => episode.number === Number(firstReference?.[1]));
    if (fallback) return [fallback];
    throw new Error(`No Season 1 appearance was found for ${character.name}`);
  }

  return uniqueTitles.map((title) => KNIGHT_EPISODES[title]);
}

function knightEpisodeSource(episode) {
  return {
    title: `A Knight of the Seven Kingdoms S1E${episode.number}: “${episode.title}” — HBO`,
    url: KNIGHT_SYNOPSIS_SOURCE,
  };
}

async function buildKnightJourney(character) {
  if (!["Ser Duncan the Tall", "Prince Aegon Targaryen"].includes(character.name)) return null;
  const source = knightEpisodeSource(KNIGHT_EPISODES["The Hedge Knight"]);
  const stops = [{
    placeId: "ashford-meadow",
    depiction: "officially_inferred",
    reviewStatus: "accepted",
    evidenceType: "official synopsis endpoint",
    reviewer: REVIEWER,
    auditDate: AUDIT_DATE,
    appearances: [{
      episode: "S1E1",
      scene: character.name === "Prince Aegon Targaryen"
        ? "The official synopsis places Egg's meeting with Dunk at Ashford."
        : "The official synopsis states that Dunk travels to Ashford for a tournament.",
      source,
      evidence: source,
    }],
  }];

  return {
    seriesSlug: character.seriesSlug,
    seriesName: character.seriesName,
    characterSlug: character.characterSlug,
    characterName: character.name,
    totalSeasons: character.totalSeasons,
    coverage: character.journeyCoverage,
    seasons: [{
      season: 1,
      title: "Season 1 at Ashford",
      summary: "",
      stops,
    }],
  };
}

function moduleSource(config) {
  return `import { createJourney } from "../../builders.js";\n\nexport default createJourney(${JSON.stringify(config, null, 2)});\n`;
}

function catalogSource(entries) {
  return `const entries = ${JSON.stringify(entries, null, 2)};\n\nexport const JOURNEY_CATALOG = Object.freeze(Object.fromEntries(\n  entries.map((entry) => [entry.key, Object.freeze({\n    ...entry,\n    journeyCoverage: Object.freeze(entry.journeyCoverage),\n  })]),\n));\n\nexport const JOURNEY_CATALOG_KEYS = Object.freeze(Object.keys(JOURNEY_CATALOG));\n\nexport function getJourneyCatalogEntry(seriesSlug, characterSlug) {\n  return JOURNEY_CATALOG[\`\${seriesSlug}/\${characterSlug}\`] ?? null;\n}\n`;
}

function buildBacklog(hotdCharacters) {
  const roster = hotdCharacters.map((character) => {
    const dragons = character.dragons.length ? character.dragons.join(", ") : "—";
    return `| \`${character.key}\` | ${character.name} | Awaiting S3E8 | ${dragons} |`;
  }).join("\n");
  const details = hotdCharacters.map((character) => {
    const dragons = character.dragons.length ? character.dragons.join(", ") : "None recorded";
    return `## ${character.name}\n\n- Stable key: \`${character.key}\`\n- Classification: \`awaiting-season-finale\`\n- Current television cutoff: S3E4, aired 2026-07-12\n- Required classification cutoff: S3E8, airing 2026-08-09\n- Candidate rider associations: ${dragons}\n- Publication trigger: Re-audit after S3E8; publish only if death is explicit on screen or confirmed by HBO.\n\n### Verified Stops\n\n| Order | Episode | Place ID | Coordinates | Scene Evidence | Source |\n|---:|---|---|---|---|---|\n| — | — | — | — | Held until the S3E8 classification audit | — |\n\n### Route Segments\n\n| From | To | Kind | Travel | Dragon | Episode Evidence |\n|---|---|---|---|---|---|\n| — | — | — | — | — | No trip is inferred from a rider association |\n`;
  }).join("\n");

  return `# House of the Dragon Living & Unresolved Journey Backlog\n\nGenerated 2026-07-16. This local, ignored research ledger is not runtime data. Season 3 is still airing, so none of the 77 characters is classified here as living, dead, or unresolved beyond S3E4. The final classification and mappings must be completed after S3E8 airs on 2026-08-09.\n\n## Source Policy\n\nUse aired television scenes first, then HBO/WBD synopses, character descriptions, the official known-world map, and the official dragon index. Wiki of Westeros/AWOIAF may only cross-check screen evidence. Never use book outcomes to predict an unaired route or death. A dragon bond never proves a specific flight.\n\n## Deferred Roster\n\n| Stable Key | Character | State | Candidate Dragon Association |\n|---|---|---|---|\n${roster}\n\n${details}`;
}

function escapeCell(value) {
  return String(value ?? "—").replaceAll("|", "\\|").replaceAll("\n", " ");
}

function buildAuditLedger({ characters, decisions, placeAnchors, publishedKeys }) {
  const published = new Set(publishedKeys);
  const accepted = decisions.filter((item) => item.reviewStatus === "accepted");
  const rejected = decisions.filter((item) => item.reviewStatus === "rejected");
  const inferred = accepted.filter((item) => item.depiction === "officially_inferred");
  const deferred = characters.filter((character) => !published.has(character.key));
  const hotd = characters.filter((character) => character.seriesSlug === "house-of-the-dragon");
  const downgradedKnight = deferred.filter((character) => character.seriesSlug === "a-knight-of-the-seven-kingdoms");
  const unresolvedCities = MAJOR_CITY_AUDIT.filter((item) => item[2] === "unresolved");
  const candidateRows = decisions.map((item) => `| ${escapeCell(item.characterKey)} | ${item.season} | ${escapeCell(item.episode)} | ${escapeCell(item.rawLabel)} | ${escapeCell(item.normalizedPlace)} | ${item.depiction} | ${item.reviewStatus} | ${escapeCell(item.reason)} | ${item.sources.map((source) => `[${escapeCell(source.title)}](${source.url})`).join("; ")} |`).join("\n");
  const characterRows = characters.map((character) => {
    const status = published.has(character.key) ? "audited-runtime" : "ledger-only";
    const reason = character.seriesSlug === "house-of-the-dragon"
      ? "Deferred and unpublished through S3E4"
      : published.has(character.key)
        ? "Has at least one accepted audited stop"
        : "No defensible published route under the fail-closed policy";
    return `| ${escapeCell(character.key)} | ${escapeCell(character.name)} | ${escapeCell(character.journeyCoverage.throughEpisode)} | ${status} | ${reason} |`;
  }).join("\n");
  const cityRows = MAJOR_CITY_AUDIT.map(([name, placeId, status, reason]) => `| ${name} | ${placeId} | ${status} | ${reason} |`).join("\n");
  const coordinateRows = placeAnchors.map((place) => {
    const acceptedCoordinate = ACCEPTED_PLACE_IDS.has(place.id) || place.id === "outside-winterfell";
    const status = acceptedCoordinate ? "accepted" : "unresolved";
    const normalized = acceptedCoordinate
      ? `${(place.x / 1484).toFixed(6)}, ${(place.y / 1060).toFixed(6)}`
      : "—";
    const reason = acceptedCoordinate
      ? "Reviewed overlay anchor retained for an accepted meaningful destination"
      : "Not authorized for runtime; broad, transit, incidental, or unreconciled overlay";
    return `| ${place.id} | ${escapeCell(place.name)} | ${status} | ${acceptedCoordinate ? `${place.x}, ${place.y}` : "—"} | ${normalized} | ${reason} |`;
  }).join("\n");
  const downgradedGot = deferred.filter((character) => character.seriesSlug === "game-of-thrones");

  return `# Character Journey Audit\n\nAudit date: ${AUDIT_DATE}  \nReviewer: ${REVIEWER}  \nMap coordinate space: immutable 1484 x 1060 background\n\nThis is the publication ledger. Raw scene labels are candidates only. A rejected or unresolved record cannot reach runtime. Community scene indexes identify scene candidates; HBO/WBD episode material is the primary episode source. An accepted inferred endpoint never claims an exact road, sea lane, or intermediate stop.\n\n## Frozen Coverage\n\n- Game of Thrones: all 73 episodes, 100 catalogue characters, through S8E6.\n- A Knight of the Seven Kingdoms: 26 catalogue characters, through S1E6.\n- House of the Dragon: 77 catalogue characters, held unpublished through S3E4.\n\n## Totals\n\n| Measure | Total |\n|---|---:|\n| Catalogue characters | ${characters.length} |\n| Audited runtime characters | ${published.size} |\n| Ledger-only characters | ${deferred.length} |\n| Accepted candidate records | ${accepted.length} |\n| Officially inferred records | ${inferred.length + 2} |\n| Rejected candidate records | ${rejected.length} |\n| Unresolved major-city coordinates | ${unresolvedCities.length} |\n| Removed or downgraded published characters | ${downgradedKnight.length + downgradedGot.length} |\n| Deferred House of the Dragon characters | ${hotd.length} |\n\n## Character Review Status\n\n| Stable key | Character | Episode cutoff | Status | Reason |\n|---|---|---|---|---|\n${characterRows}\n\n## Major-City Coordinate Audit\n\nOnly accepted rows appear in the always-visible city layer. Unresolved rows deliberately have no coordinate. The immutable map artwork itself is the coordinate source; accepted dots use the centre of its printed label symbol. Normalized positions are stored with each runtime city record.\n\n| City | Place ID | Status | Reason |\n|---|---|---|---|\n${cityRows}\n\n## All Existing Coordinate Decisions\n\nEvery one of the ${placeAnchors.length} existing overlays is listed below. Accepted rows use the immutable 1484 x 1060 artwork as the source map, reviewer \`${REVIEWER}\`, and audit date ${AUDIT_DATE}. Unresolved rows deliberately expose no normalized runtime coordinate.\n\n| Place ID | Label | Status | Pixel position | Normalized position | Reason |\n|---|---|---|---|---|---|\n${coordinateRows}\n\n## Game of Thrones Candidate Decisions\n\n| Character key | Season | Episode | Raw scene label | Normalized place | Depiction | Decision | Reason | Sources |\n|---|---:|---|---|---|---|---|---|---|\n${candidateRows}\n\n## A Knight of the Seven Kingdoms Review\n\nDunk and Egg receive one \`officially_inferred\` Ashford endpoint because the official WBD synopsis supports that exact endpoint. The other ${downgradedKnight.length} catalogue characters remain ledger-only: community appearance lists cannot independently authorize a map publication. No road geometry or intermediate point is inferred.\n\n## House of the Dragon Deferred Roster\n\nAll ${hotd.length} characters remain unpublished through S3E4. No rider association is treated as evidence of a dragon flight, and dragon flights remain absent from runtime. The character review table above is the master per-character ledger; \`CHARACTER_JOURNEY_MAPPINGS.md\` remains the detailed research template.\n`;
}

async function loadPlaceAnchors() {
  const source = await readFile(placesPath, "utf8");
  const placeBlock = source.split("export const PLACES = Object.freeze({")[1]?.split("\n});")[0] ?? "";
  const pattern = /^\s+(?:"([^"]+)"|([a-z][a-z0-9-]*)): Object\.freeze\(\{ name: "([^"]+)", x: (\d+), y: (\d+) \}\),$/gm;
  const places = [...placeBlock.matchAll(pattern)].map((match) => ({
    id: match[1] ?? match[2],
    name: match[3],
    x: Number(match[4]),
    y: Number(match[5]),
  }));
  if (places.length !== 83) throw new Error(`Expected 83 place anchors, found ${places.length}`);
  return places;
}

async function loadSceneDataset() {
  const sourceArgument = process.argv.find((argument) => argument.startsWith("--got-source="));
  if (sourceArgument) {
    return JSON.parse(await readFile(sourceArgument.slice("--got-source=".length), "utf8"));
  }

  const response = await fetch(GOT_SCENE_SOURCE, {
    headers: { "user-agent": "ASOIAF-journey-builder/1.0" },
  });
  if (!response.ok) throw new Error(`GoT scene source returned ${response.status}`);
  return response.json();
}

function loadCharacters() {
  const database = new Database(databasePath, { readonly: true, fileMustExist: true });
  const rows = database.prepare(`
    SELECT r.id, r.record_json, d.path AS document_path
    FROM records AS r
    JOIN json_documents AS d ON d.id = r.document_id
    WHERE d.path IN (
      'gameofthrone.json',
      'houseofthedragon.json',
      'knightofthesevenkingdoms.json'
    )
    ORDER BY r.id
  `).all();
  database.close();

  return rows.map((row) => {
    const raw = JSON.parse(row.record_json);
    const series = SERIES[row.document_path];
    const name = raw.fullName ?? raw.name;
    const characterSlug = toCharacterSlug(name);
    const sources = Array.isArray(raw.sources) ? raw.sources : [];
    const wikiSource = sources.find((source) => source.provider === "Wiki of Westeros");
    return {
      key: `${series.slug}/${characterSlug}`,
      name,
      characterSlug,
      seriesSlug: series.slug,
      seriesName: series.name,
      totalSeasons: series.totalSeasons,
      journeyStatus: series.journeyStatus,
      journeyCoverage: series.coverage,
      dragons: Array.isArray(raw.dragons) ? raw.dragons.filter(Boolean) : [],
      wikiSource,
    };
  });
}

async function main() {
  const characters = loadCharacters();
  const bySeries = characters.reduce((groups, character) => {
    const group = groups.get(character.seriesSlug) ?? [];
    group.push(character);
    groups.set(character.seriesSlug, group);
    return groups;
  }, new Map());
  const gotCharacters = bySeries.get("game-of-thrones") ?? [];
  const hotdCharacters = bySeries.get("house-of-the-dragon") ?? [];
  const knightCharacters = bySeries.get("a-knight-of-the-seven-kingdoms") ?? [];

  if (characters.length !== 203 || gotCharacters.length !== 100 || hotdCharacters.length !== 77 || knightCharacters.length !== 26) {
    throw new Error("Character inventory changed; review the Stage 1 publication contract before regenerating");
  }

  const sceneDataset = await loadSceneDataset();
  const placeAnchors = await loadPlaceAnchors();
  if (sceneDataset.episodes?.length !== 73) {
    throw new Error("The GoT scene source must contain all 73 aired episodes");
  }

  const journeyConfigs = [];
  const decisions = [];
  for (const character of gotCharacters) {
    const result = buildGotJourney(character, sceneDataset.episodes);
    decisions.push(...result.decisions);
    if (result.journey) journeyConfigs.push(result.journey);
  }
  for (const character of knightCharacters) {
    const journey = await buildKnightJourney(character);
    if (journey) journeyConfigs.push(journey);
  }

  const publishedKeys = new Set(journeyConfigs.map((journey) => `${journey.seriesSlug}/${journey.characterSlug}`));
  const tempCharactersRoot = `${charactersRoot.slice(0, -1)}-audit-tmp/`;
  await rm(tempCharactersRoot, { recursive: true, force: true });
  await mkdir(tempCharactersRoot, { recursive: true });

  for (const journey of journeyConfigs) {
    const directory = `${tempCharactersRoot}${journey.seriesSlug}/`;
    await mkdir(directory, { recursive: true });
    await writeFile(`${directory}${journey.characterSlug}.js`, moduleSource(journey));
  }

  if (publishedKeys.size !== journeyConfigs.length || journeyConfigs.length < 2) {
    throw new Error("Audited journey output failed uniqueness/completeness validation");
  }

  await writeFile(catalogPath, catalogSource(characters.map((character) => ({
    key: character.key,
    seriesSlug: character.seriesSlug,
    seriesName: character.seriesName,
    characterSlug: character.characterSlug,
    characterName: character.name,
    journeyStatus: publishedKeys.has(character.key) ? "published" : "deferred",
    journeyCoverage: character.journeyCoverage,
  }))));

  await rm(charactersRoot, { recursive: true, force: true });
  await rename(tempCharactersRoot, charactersRoot);

  await mkdir(new URL("../../md/", import.meta.url), { recursive: true });
  await writeFile(backlogPath, buildBacklog(hotdCharacters));
  await writeFile(auditPath, buildAuditLedger({
    characters,
    decisions,
    placeAnchors,
    publishedKeys: [...publishedKeys],
  }));

  console.log(`Generated ${publishedKeys.size} audited runtime journeys and ${characters.length - publishedKeys.size} ledger-only records.`);
}

await main();
