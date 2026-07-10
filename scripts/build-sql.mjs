#!/usr/bin/env node

import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { readFile, stat, unlink, writeFile } from "node:fs/promises"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const datasetsDir = path.join(root, "datasets")
const outputSql = path.join(datasetsDir, "asiof.sql")
const outputDb = path.join(datasetsDir, "asiof.sqlite")
const outputManifest = path.join(datasetsDir, "asiof-manifest.json")
const outputChecksums = path.join(datasetsDir, "SHA256SUMS")
const datasetVersion = "1.0.0"
const schemaVersion = 2
const selectedShows = [
  "game-of-thrones",
  "house-of-the-dragon",
  "a-knight-of-the-seven-kingdoms",
]
const selectedShowSet = new Set(selectedShows)
const generatedAt = process.env.SOURCE_DATE_EPOCH
  ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
  : "2026-07-10T00:00:00.000Z"

const files = {
  character: "charachters.json",
  dragon: "dragons.json",
  house: "houses.json",
}
const [characters, dragons, houses, audit] = await Promise.all([
  ...Object.values(files).map(async (file) =>
    JSON.parse(await readFile(path.join(datasetsDir, file), "utf8")),
  ),
  readFile(path.join(datasetsDir, "audit-report.json"), "utf8").then(JSON.parse),
])

const fail = (message) => {
  throw new Error(message)
}
const normalize = (value = "") =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
const quote = (value) =>
  value === null || value === undefined
    ? "NULL"
    : `'${String(value).replaceAll("'", "''").replaceAll("\u0000", "")}'`
const integer = (value) => (Number.isFinite(value) ? String(value) : "NULL")
const json = (value) => quote(JSON.stringify(value ?? null))
const key = (type, id) => `${type}:${id}`
const sha256 = (value) => createHash("sha256").update(value).digest("hex")
const union = (...groups) => [
  ...new Set(groups.flat().filter((value) => value !== null && value !== undefined && value !== "")),
]

const recordsByType = { character: characters, dragon: dragons, house: houses }
const idsByType = Object.fromEntries(
  Object.entries(recordsByType).map(([type, records]) => [
    type,
    new Set(records.map((record) => record.id)),
  ]),
)
const knownEntityKeys = new Set(
  Object.entries(recordsByType).flatMap(([type, records]) =>
    records.map((record) => key(type, record.id)),
  ),
)

function assertReferences(owner, values, targetType) {
  for (const id of values.filter(Boolean)) {
    if (!idsByType[targetType].has(id)) fail(`${owner} has dangling ${targetType} reference ${id}`)
  }
}

function validateInput() {
  for (const [type, records] of Object.entries(recordsByType)) {
    if (!Array.isArray(records) || !records.length) fail(`${type} dataset must be a non-empty array`)
    if (idsByType[type].size !== records.length) fail(`${type} dataset contains duplicate IDs`)
    const names = new Map()
    for (const record of records) {
      if (!record.id?.trim() || !record.name?.trim()) fail(`${type} contains an empty ID or name`)
      if (!Array.isArray(record.show) || !record.show.every((show) => selectedShowSet.has(show))) {
        fail(`${type}:${record.id} contains an invalid show marker`)
      }
      if (type !== "character" && record.show.length === 0) {
        fail(`${type}:${record.id} has no selected-series evidence`)
      }
      if (type === "character" && record.show.length === 0 && record.id !== "api-character-42") {
        fail(`character:${record.id} has no selected-series evidence`)
      }
      if (!record.image?.trim()) fail(`${type}:${record.id} has no local image path or fallback`)
      const normalizedName = normalize(record.name)
      if (names.has(normalizedName)) {
        fail(`${type} has an undisambiguated name: ${record.name}`)
      }
      names.set(normalizedName, record.id)
    }
  }

  for (const record of characters) {
    assertReferences(
      `character:${record.id}`,
      [
        ...(record.parents ?? []),
        ...(record.children ?? []),
        ...(record.spouses ?? []),
        record.father,
        record.mother,
        record.spouse,
      ],
      "character",
    )
    assertReferences(
      `character:${record.id}`,
      union(record.houses ?? [], record.house ? [record.house] : []),
      "house",
    )
    assertReferences(`character:${record.id}`, [record.dragon], "dragon")
  }
  for (const record of dragons) {
    assertReferences(`dragon:${record.id}`, record.riders ?? [], "character")
  }
  for (const record of houses) {
    assertReferences(
      `house:${record.id}`,
      [record.currentLord, record.heir, record.founder, ...(record.swornMembers ?? [])],
      "character",
    )
    assertReferences(
      `house:${record.id}`,
      [record.overlord, ...(record.cadetBranches ?? [])],
      "house",
    )
  }

  const searchableAegons = characters
    .filter((record) =>
      [record.name, ...(record.aliases ?? [])].some((label) => /\baegon\b/i.test(label)),
    )
    .map((record) => record.id)
    .sort()
  const expectedAegons = [
    "aegon-i",
    "aegon-ii",
    "aegon-iii",
    "aegon-iv",
    "aegon-v",
    "api-character-42",
  ].sort()
  if (JSON.stringify(searchableAegons) !== JSON.stringify(expectedAegons)) {
    fail(`exact Aegon rule failed: ${searchableAegons.join(", ")}`)
  }

  const sourceRows = Object.values(audit.source?.rowCounts ?? {}).reduce(
    (sum, count) => sum + count,
    0,
  )
  if (sourceRows !== 2583 || audit.records?.length !== sourceRows) {
    fail(`audit must cover all 2,583 source rows; found ${audit.records?.length ?? 0}`)
  }
  const expectedOutput = audit.output?.rowCounts ?? {}
  for (const [type, records] of Object.entries(recordsByType)) {
    if (expectedOutput[type] !== records.length) {
      fail(`audit/output mismatch for ${type}: ${expectedOutput[type]} vs ${records.length}`)
    }
  }
}

validateInput()

const statements = []
const insert = (table, columns, values) =>
  statements.push(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")});`)

statements.push(`-- ASOIAF TV-only dataset — generated from audited datasets/*.json
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = DELETE;
PRAGMA synchronous = FULL;
PRAGMA page_size = 4096;
PRAGMA auto_vacuum = NONE;
BEGIN IMMEDIATE;

CREATE TABLE metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE entities (
  entity_key TEXT PRIMARY KEY,
  id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('character', 'dragon', 'house')),
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  description TEXT,
  status TEXT,
  verification TEXT,
  raw_json TEXT NOT NULL CHECK (json_valid(raw_json)),
  UNIQUE (type, id)
);
CREATE INDEX entities_type_name_idx ON entities(type, name COLLATE NOCASE);

CREATE TABLE characters (
  entity_key TEXT PRIMARY KEY REFERENCES entities(entity_key) ON DELETE CASCADE,
  gender TEXT,
  culture TEXT,
  born TEXT,
  died TEXT,
  actor_json TEXT NOT NULL CHECK (json_valid(actor_json)),
  titles_json TEXT NOT NULL CHECK (json_valid(titles_json)),
  era INTEGER
);

CREATE TABLE dragons (
  entity_key TEXT PRIMARY KEY REFERENCES entities(entity_key) ON DELETE CASCADE,
  color TEXT,
  era INTEGER
);

CREATE TABLE houses (
  entity_key TEXT PRIMARY KEY REFERENCES entities(entity_key) ON DELETE CASCADE,
  region TEXT,
  words TEXT,
  coat_of_arms TEXT,
  seats_json TEXT NOT NULL CHECK (json_valid(seats_json)),
  color TEXT
);

CREATE TABLE aliases (
  entity_key TEXT NOT NULL REFERENCES entities(entity_key) ON DELETE CASCADE,
  alias TEXT NOT NULL CHECK (length(trim(alias)) > 0),
  PRIMARY KEY (entity_key, alias)
);
CREATE INDEX aliases_name_idx ON aliases(alias COLLATE NOCASE);

CREATE TABLE appearances (
  id INTEGER PRIMARY KEY,
  entity_key TEXT NOT NULL REFERENCES entities(entity_key) ON DELETE CASCADE,
  show_id TEXT NOT NULL CHECK (show_id IN ('game-of-thrones', 'house-of-the-dragon', 'a-knight-of-the-seven-kingdoms')),
  presence_kind TEXT NOT NULL CHECK (length(trim(presence_kind)) > 0),
  first_reference TEXT,
  details_json TEXT NOT NULL CHECK (json_valid(details_json)),
  UNIQUE (entity_key, show_id)
);
CREATE INDEX appearances_entity_idx ON appearances(entity_key);
CREATE INDEX appearances_show_idx ON appearances(show_id);

CREATE TABLE relationships (
  source_key TEXT NOT NULL REFERENCES entities(entity_key) ON DELETE CASCADE,
  target_key TEXT NOT NULL REFERENCES entities(entity_key) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'parent', 'child', 'spouse', 'father', 'mother', 'dragon_rider', 'allegiance',
    'rider', 'current_lord', 'heir', 'overlord', 'founder', 'cadet_branch', 'sworn_member'
  )),
  details_json TEXT NOT NULL CHECK (json_valid(details_json)),
  PRIMARY KEY (source_key, target_key, relationship_type)
);
CREATE INDEX relationships_target_idx ON relationships(target_key);

CREATE TABLE sources (
  id INTEGER PRIMARY KEY,
  entity_key TEXT NOT NULL REFERENCES entities(entity_key) ON DELETE CASCADE,
  label TEXT,
  url TEXT,
  provider TEXT,
  source_kind TEXT,
  accessed TEXT
);
CREATE INDEX sources_entity_idx ON sources(entity_key);

CREATE TABLE media (
  entity_key TEXT PRIMARY KEY REFERENCES entities(entity_key) ON DELETE CASCADE,
  local_path TEXT NOT NULL CHECK (length(trim(local_path)) > 0),
  provider TEXT,
  source_page TEXT,
  asset_url TEXT,
  media_kind TEXT,
  uncertain INTEGER NOT NULL CHECK (uncertain IN (0, 1)),
  metadata_json TEXT NOT NULL CHECK (json_valid(metadata_json))
);

CREATE VIRTUAL TABLE entities_fts USING fts5(
  entity_key UNINDEXED,
  name,
  aliases,
  type UNINDEXED,
  tokenize = 'unicode61 remove_diacritics 2'
);
`)

const metadata = {
  schema_version: String(schemaVersion),
  dataset_version: datasetVersion,
  generated_at: generatedAt,
  audit_version: String(audit.auditVersion),
  source_row_count: String(audit.records.length),
  selected_shows: JSON.stringify(selectedShows),
  character_count: String(characters.length),
  dragon_count: String(dragons.length),
  house_count: String(houses.length),
}
for (const [metadataKey, value] of Object.entries(metadata)) {
  insert("metadata", ["key", "value"], [quote(metadataKey), quote(value)])
}

function common(record, type) {
  const entityKey = key(type, record.id)
  insert(
    "entities",
    ["entity_key", "id", "type", "name", "description", "status", "verification", "raw_json"],
    [
      quote(entityKey),
      quote(record.id),
      quote(type),
      quote(record.name),
      quote(record.biography ?? record.coatOfArms ?? null),
      quote(record.status ?? null),
      quote(record.verification ?? null),
      json(record),
    ],
  )
  for (const alias of union(record.aliases ?? [])) {
    insert("aliases", ["entity_key", "alias"], [quote(entityKey), quote(alias)])
  }
  const presenceByShow = new Map((record.presence ?? []).map((item) => [item.show, item]))
  for (const show of record.show) {
    const presence = presenceByShow.get(show) ?? { show, kind: "listed" }
    insert(
      "appearances",
      ["entity_key", "show_id", "presence_kind", "first_reference", "details_json"],
      [
        quote(entityKey),
        quote(show),
        quote(presence.kind ?? "listed"),
        quote(presence.first ?? null),
        json(presence),
      ],
    )
  }
  for (const source of record.sources ?? []) {
    insert(
      "sources",
      ["entity_key", "label", "url", "provider", "source_kind", "accessed"],
      [
        quote(entityKey),
        quote(source.label),
        quote(source.url),
        quote(source.provider),
        quote(source.kind),
        quote(source.accessed),
      ],
    )
  }
  const imageSource = record.imageSource ?? {}
  insert(
    "media",
    [
      "entity_key",
      "local_path",
      "provider",
      "source_page",
      "asset_url",
      "media_kind",
      "uncertain",
      "metadata_json",
    ],
    [
      quote(entityKey),
      quote(record.image),
      quote(imageSource.provider),
      quote(imageSource.url),
      quote(imageSource.assetUrl),
      quote(imageSource.kind),
      imageSource.uncertain ? "1" : "0",
      json(imageSource),
    ],
  )
  insert(
    "entities_fts",
    ["entity_key", "name", "aliases", "type"],
    [quote(entityKey), quote(record.name), quote((record.aliases ?? []).join(" ")), quote(type)],
  )
  return entityKey
}

// Insert every entity before relationships so both relationship foreign keys are enforced.
for (const record of characters) {
  const entityKey = common(record, "character")
  insert(
    "characters",
    ["entity_key", "gender", "culture", "born", "died", "actor_json", "titles_json", "era"],
    [
      quote(entityKey),
      quote(record.gender),
      quote(record.culture),
      quote(record.born),
      quote(record.died),
      json(record.actor ?? record.playedBy ?? []),
      json(record.titles ?? []),
      integer(record.era),
    ],
  )
}
for (const record of dragons) {
  const entityKey = common(record, "dragon")
  insert(
    "dragons",
    ["entity_key", "color", "era"],
    [quote(entityKey), quote(record.color), integer(record.era)],
  )
}
for (const record of houses) {
  const entityKey = common(record, "house")
  insert(
    "houses",
    ["entity_key", "region", "words", "coat_of_arms", "seats_json", "color"],
    [
      quote(entityKey),
      quote(record.region),
      quote(record.words),
      quote(record.coatOfArms),
      json(record.seats ?? (record.seat ? [record.seat] : [])),
      quote(record.color),
    ],
  )
}

const relationshipSet = new Set()
function relationship(sourceType, sourceId, targetType, targetId, type, details = {}) {
  if (!targetId) return
  const sourceKey = key(sourceType, sourceId)
  const targetKey = key(targetType, targetId)
  if (!knownEntityKeys.has(sourceKey)) fail(`relationship has unknown source ${sourceKey}`)
  if (!knownEntityKeys.has(targetKey)) fail(`relationship has unknown target ${targetKey}`)
  const signature = `${sourceKey}\u0000${targetKey}\u0000${type}`
  if (relationshipSet.has(signature)) return
  relationshipSet.add(signature)
  insert(
    "relationships",
    ["source_key", "target_key", "relationship_type", "details_json"],
    [quote(sourceKey), quote(targetKey), quote(type), json(details)],
  )
}

for (const record of characters) {
  for (const id of record.parents ?? []) relationship("character", record.id, "character", id, "parent")
  for (const id of record.children ?? []) relationship("character", record.id, "character", id, "child")
  for (const id of record.spouses ?? []) relationship("character", record.id, "character", id, "spouse")
  relationship("character", record.id, "character", record.father, "father")
  relationship("character", record.id, "character", record.mother, "mother")
  relationship("character", record.id, "character", record.spouse, "spouse")
  relationship("character", record.id, "dragon", record.dragon, "dragon_rider")
  for (const id of union(record.houses ?? [], record.house ? [record.house] : [])) {
    relationship("character", record.id, "house", id, "allegiance")
  }
}
for (const record of dragons) {
  for (const id of record.riders ?? []) relationship("dragon", record.id, "character", id, "rider")
}
for (const record of houses) {
  relationship("house", record.id, "character", record.currentLord, "current_lord")
  relationship("house", record.id, "character", record.heir, "heir")
  relationship("house", record.id, "house", record.overlord, "overlord")
  relationship("house", record.id, "character", record.founder, "founder")
  for (const id of record.cadetBranches ?? []) {
    relationship("house", record.id, "house", id, "cadet_branch")
  }
  for (const id of record.swornMembers ?? []) {
    relationship("house", record.id, "character", id, "sworn_member")
  }
}

statements.push(`PRAGMA user_version = ${schemaVersion};\nCOMMIT;\n`)
const sqlText = `${statements.join("\n")}\n`
await writeFile(outputSql, sqlText)
await unlink(outputDb).catch((error) => {
  if (error?.code !== "ENOENT") throw error
})
execFileSync("sqlite3", [outputDb], { input: sqlText })
execFileSync("sqlite3", [outputDb, "VACUUM;"])

const sqlite = (query, options = []) =>
  execFileSync("sqlite3", [...options, outputDb, query], { encoding: "utf8" })
const integrity = sqlite("PRAGMA integrity_check;").trim()
if (integrity !== "ok") fail(`SQLite integrity_check failed: ${integrity}`)
const foreignKeyErrors = sqlite("PRAGMA foreign_key_check;").trim()
if (foreignKeyErrors) fail(`SQLite foreign_key_check failed:\n${foreignKeyErrors}`)
const userVersion = Number(sqlite("PRAGMA user_version;").trim())
if (userVersion !== schemaVersion) fail(`SQLite user_version is ${userVersion}, expected ${schemaVersion}`)

const databaseCounts = Object.fromEntries(
  sqlite("SELECT type || '|' || count(*) FROM entities GROUP BY type ORDER BY type;")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [type, count] = line.split("|")
      return [type, Number(count)]
    }),
)
for (const [type, records] of Object.entries(recordsByType)) {
  if (databaseCounts[type] !== records.length) {
    fail(`SQLite/JSON count mismatch for ${type}: ${databaseCounts[type]} vs ${records.length}`)
  }
}

const databaseAegons = sqlite(`
  SELECT e.id
  FROM entities_fts AS f
  JOIN entities AS e ON e.entity_key = f.entity_key
  WHERE entities_fts MATCH 'Aegon' AND e.type = 'character'
  ORDER BY e.id;
`)
  .trim()
  .split("\n")
  .filter(Boolean)
const expectedAegons = [
  "aegon-i",
  "aegon-ii",
  "aegon-iii",
  "aegon-iv",
  "aegon-v",
  "api-character-42",
].sort()
if (JSON.stringify(databaseAegons) !== JSON.stringify(expectedAegons)) {
  fail(`SQLite Aegon search mismatch: ${databaseAegons.join(", ")}`)
}

const databaseRawRows = JSON.parse(
  sqlite("SELECT entity_key, raw_json FROM entities ORDER BY entity_key;", ["-json"]),
)
const expectedRawRows = new Map(
  Object.entries(recordsByType).flatMap(([type, records]) =>
    records.map((record) => [key(type, record.id), JSON.stringify(record)]),
  ),
)
if (databaseRawRows.length !== expectedRawRows.size) fail("SQLite/JSON raw row count mismatch")
for (const row of databaseRawRows) {
  if (expectedRawRows.get(row.entity_key) !== row.raw_json) {
    fail(`SQLite/JSON raw row mismatch for ${row.entity_key}`)
  }
}

const contentTypes = {
  "asiof.sqlite": "application/vnd.sqlite3",
  "asiof.sql": "application/sql",
  "charachters.json": "application/json",
  "dragons.json": "application/json",
  "houses.json": "application/json",
  "audit-report.json": "application/json",
}
const releaseAssetNames = Object.keys(contentTypes).sort()
async function assetInfo(name) {
  const filePath = path.join(datasetsDir, name)
  const [bytes, fileStat] = await Promise.all([readFile(filePath), stat(filePath)])
  return {
    name,
    contentType: contentTypes[name],
    bytes: fileStat.size,
    sha256: sha256(bytes),
  }
}
const releaseAssets = await Promise.all(releaseAssetNames.map(assetInfo))
const manifest = {
  datasetVersion,
  schemaVersion,
  generatedAt,
  scope: {
    shows: selectedShows,
    characterException: "api-character-42",
  },
  counts: {
    characters: characters.length,
    dragons: dragons.length,
    houses: houses.length,
    sourceRowsAudited: audit.records.length,
    relationships: relationshipSet.size,
  },
  audit: {
    file: "audit-report.json",
    decisions: audit.output.decisions,
    sourceSha256: audit.source.sha256,
  },
  assets: releaseAssets,
}
await writeFile(outputManifest, `${JSON.stringify(manifest, null, 2)}\n`)

const checksumNames = [...releaseAssetNames, path.basename(outputManifest)].sort()
const checksumLines = await Promise.all(
  checksumNames.map(async (name) => `${sha256(await readFile(path.join(datasetsDir, name)))}  ${name}`),
)
await writeFile(outputChecksums, `${checksumLines.join("\n")}\n`)

console.log(`Wrote ${path.relative(root, outputSql)}`)
console.log(`Wrote ${path.relative(root, outputDb)}`)
console.log(`Wrote ${path.relative(root, outputManifest)}`)
console.log(`Wrote ${path.relative(root, outputChecksums)}`)
console.log(
  `Verified ${characters.length} characters, ${dragons.length} dragons, ${houses.length} houses, ${relationshipSet.size} relationships`,
)
