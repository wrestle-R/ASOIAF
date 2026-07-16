import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const GOT_SCENE_SOURCE = "https://raw.githubusercontent.com/jeffreylancaster/game-of-thrones/master/data/episodes.json";
const GOT_SCENE_EVIDENCE = "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json";
const KNIGHT_SYNOPSIS_SOURCE = "https://press.wbd.com/na/property/knight-seven-kingdoms/synopses";
const databasePath = fileURLToPath(new URL("../../dataset/asoiaf.sqlite", import.meta.url));
const charactersRoot = fileURLToPath(new URL("../src/data/journeys/characters/", import.meta.url));
const catalogPath = fileURLToPath(new URL("../src/data/journeys/journeyCatalog.js", import.meta.url));
const backlogPath = fileURLToPath(new URL("../../md/CHARACTER_JOURNEY_MAPPINGS.md", import.meta.url));

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

function annotateKnownDragonFlights(characterName, seasonNumber, stops) {
  if (characterName !== "Daenerys Targaryen" || seasonNumber !== 5) return stops;

  for (let index = 1; index < stops.length; index += 1) {
    const from = stops[index - 1].placeId;
    const to = stops[index].placeId;
    if (from !== "meereen" || !["dothraki-sea", "dothraki-sea-camp"].includes(to)) {
      continue;
    }

    stops[index].travelFromPrevious = {
      mode: "dragon",
      dragonId: "drogon",
      dragonName: "Drogon",
      episode: "S5E9",
      scene: "Drogon carries Daenerys away from Daznak's Pit toward the Dothraki Sea.",
      source: {
        title: "Game of Thrones S5E9: “The Dance of Dragons” — HBO",
        url: "https://www.hbo.com/game-of-thrones/season-5/9-the-dance-of-dragons",
      },
    };
    break;
  }

  return stops;
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

  return {
    seriesSlug: character.seriesSlug,
    seriesName: character.seriesName,
    characterSlug: character.characterSlug,
    characterName: character.name,
    totalSeasons: character.totalSeasons,
    coverage: character.journeyCoverage,
    seasons: [...seasons.entries()].map(([season, stops]) => {
      annotateKnownDragonFlights(character.name, season, stops);
      const movementCount = Math.max(0, stops.length - 1);
      return {
        season,
        title: movementCount ? `Season ${season}: ${movementCount} mapped moves` : `Season ${season}: one verified place`,
        summary: movementCount
          ? `The screen record contains ${stops.length} ordered, source-backed location stops for this season.`
          : "The screen record remains at one verified map location for this season.",
        stops,
      };
    }),
  };
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
  const episodes = await fetchKnightAppearances(character);
  const roadOnly = character.name === "Ser Arlan of Pennytree";
  const appearances = episodes.map((episode) => ({
    episode: `S1E${episode.number}`,
    scene: roadOnly
      ? "Ser Arlan is depicted on the road to Ashford."
      : `${character.name} is depicted at the tourney at Ashford Meadow.`,
    source: knightEpisodeSource(episode),
    evidence: {
      title: `${character.name} — television appearances`,
      url: character.wikiSource.url,
    },
  }));
  const stops = [];

  if (character.name === "Ser Duncan the Tall") {
    stops.push({
      placeId: "road-to-ashford",
      appearances: [{
        episode: "S1E1",
        scene: "Dunk buries Ser Arlan and continues toward Ashford.",
        source: knightEpisodeSource(KNIGHT_EPISODES["The Hedge Knight"]),
        evidence: {
          title: "Ser Duncan the Tall — television biography",
          url: character.wikiSource.url,
        },
      }],
    });
  }
  stops.push({ placeId: roadOnly ? "road-to-ashford" : "ashford-meadow", appearances });

  return {
    seriesSlug: character.seriesSlug,
    seriesName: character.seriesName,
    characterSlug: character.characterSlug,
    characterName: character.name,
    totalSeasons: character.totalSeasons,
    coverage: character.journeyCoverage,
    seasons: [{
      season: 1,
      title: stops.length > 1 ? "The road to Ashford" : "Season 1 at Ashford",
      summary: stops.length > 1
        ? "The depicted route reaches Ashford Meadow and remains centered on the tourney."
        : "The complete Season 1 screen record stays within the Ashford area.",
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
  if (sceneDataset.episodes?.length !== 73) {
    throw new Error("The GoT scene source must contain all 73 aired episodes");
  }

  await rm(charactersRoot, { recursive: true, force: true });
  await mkdir(charactersRoot, { recursive: true });
  await writeFile(catalogPath, catalogSource(characters.map((character) => ({
    key: character.key,
    seriesSlug: character.seriesSlug,
    seriesName: character.seriesName,
    characterSlug: character.characterSlug,
    characterName: character.name,
    journeyStatus: character.journeyStatus,
    journeyCoverage: character.journeyCoverage,
  }))));

  for (const character of gotCharacters) {
    const directory = new URL(`../src/data/journeys/characters/${character.seriesSlug}/`, import.meta.url);
    await mkdir(directory, { recursive: true });
    const journey = buildGotJourney(character, sceneDataset.episodes);
    await writeFile(new URL(`${character.characterSlug}.js`, directory), moduleSource(journey));
  }

  for (const [index, character] of knightCharacters.entries()) {
    if (!character.wikiSource?.url) throw new Error(`${character.name} has no Wiki of Westeros source`);
    const directory = new URL(`../src/data/journeys/characters/${character.seriesSlug}/`, import.meta.url);
    await mkdir(directory, { recursive: true });
    const journey = await buildKnightJourney(character);
    await writeFile(new URL(`${character.characterSlug}.js`, directory), moduleSource(journey));
    if (index < knightCharacters.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
  }

  await mkdir(new URL("../../md/", import.meta.url), { recursive: true });
  await writeFile(backlogPath, buildBacklog(hotdCharacters));

  console.log(`Generated ${gotCharacters.length + knightCharacters.length} published journeys and ${hotdCharacters.length} deferred HOTD records.`);
}

await main();
