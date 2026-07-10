#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises"
import { execFileSync } from "node:child_process"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const datasetsDir = path.join(root, "datasets")
const outputSql = path.join(datasetsDir, "asiof.sql")
const outputDb = path.join(datasetsDir, "asiof.sqlite")

const [characters, dragons, houses] = await Promise.all(
  ["charachters.json", "dragons.json", "houses.json"].map(async (file) =>
    JSON.parse(await readFile(path.join(datasetsDir, file), "utf8")),
  ),
)

const quote = (value) =>
  value === null || value === undefined
    ? "NULL"
    : `'${String(value).replaceAll("'", "''").replaceAll("\u0000", "")}'`
const integer = (value) => (Number.isFinite(value) ? String(value) : "NULL")
const json = (value) => quote(JSON.stringify(value ?? null))
const key = (type, id) => `${type}:${id}`
const statements = []
const insert = (table, columns, values) =>
  statements.push(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")});`)

statements.push(`-- ASOIAF complete dataset — generated from datasets/*.json
PRAGMA foreign_keys = OFF;
PRAGMA journal_mode = DELETE;
BEGIN IMMEDIATE;

CREATE TABLE metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE entities (
  entity_key TEXT PRIMARY KEY,
  id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('character', 'dragon', 'house')),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT,
  verification TEXT,
  raw_json TEXT NOT NULL CHECK (json_valid(raw_json))
);
CREATE INDEX entities_type_name_idx ON entities(type, name COLLATE NOCASE);

CREATE TABLE characters (
  entity_key TEXT PRIMARY KEY REFERENCES entities(entity_key),
  gender TEXT,
  culture TEXT,
  born TEXT,
  died TEXT,
  actor_json TEXT NOT NULL CHECK (json_valid(actor_json)),
  titles_json TEXT NOT NULL CHECK (json_valid(titles_json)),
  era INTEGER
);

CREATE TABLE dragons (
  entity_key TEXT PRIMARY KEY REFERENCES entities(entity_key),
  color TEXT,
  era INTEGER
);

CREATE TABLE houses (
  entity_key TEXT PRIMARY KEY REFERENCES entities(entity_key),
  region TEXT,
  words TEXT,
  coat_of_arms TEXT,
  seats_json TEXT NOT NULL CHECK (json_valid(seats_json)),
  color TEXT
);

CREATE TABLE aliases (
  entity_key TEXT NOT NULL REFERENCES entities(entity_key),
  alias TEXT NOT NULL,
  PRIMARY KEY (entity_key, alias)
);
CREATE INDEX aliases_name_idx ON aliases(alias COLLATE NOCASE);

CREATE TABLE appearances (
  id INTEGER PRIMARY KEY,
  entity_key TEXT NOT NULL REFERENCES entities(entity_key),
  show_id TEXT NOT NULL,
  presence_kind TEXT NOT NULL,
  first_reference TEXT,
  details_json TEXT NOT NULL CHECK (json_valid(details_json))
);
CREATE INDEX appearances_entity_idx ON appearances(entity_key);
CREATE INDEX appearances_show_idx ON appearances(show_id);

CREATE TABLE relationships (
  source_key TEXT NOT NULL,
  target_key TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  details_json TEXT NOT NULL CHECK (json_valid(details_json)),
  PRIMARY KEY (source_key, target_key, relationship_type)
);
CREATE INDEX relationships_target_idx ON relationships(target_key);

CREATE TABLE sources (
  id INTEGER PRIMARY KEY,
  entity_key TEXT NOT NULL REFERENCES entities(entity_key),
  label TEXT,
  url TEXT,
  provider TEXT,
  source_kind TEXT,
  accessed TEXT
);
CREATE INDEX sources_entity_idx ON sources(entity_key);

CREATE TABLE media (
  entity_key TEXT PRIMARY KEY REFERENCES entities(entity_key),
  local_path TEXT NOT NULL,
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

insert("metadata", ["key", "value"], [quote("schema_version"), quote("1")])
insert("metadata", ["key", "value"], [quote("generated_at"), quote(new Date().toISOString())])
insert("metadata", ["key", "value"], [quote("character_count"), quote(characters.length)])
insert("metadata", ["key", "value"], [quote("dragon_count"), quote(dragons.length)])
insert("metadata", ["key", "value"], [quote("house_count"), quote(houses.length)])

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
  for (const alias of [...new Set(record.aliases ?? [])].filter(Boolean)) {
    insert("aliases", ["entity_key", "alias"], [quote(entityKey), quote(alias)])
  }
  const presenceByShow = new Map((record.presence ?? []).map((item) => [item.show, item]))
  for (const show of record.show ?? []) {
    const presence = presenceByShow.get(show) ?? { show, kind: "listed" }
    insert(
      "appearances",
      ["entity_key", "show_id", "presence_kind", "first_reference", "details_json"],
      [quote(entityKey), quote(show), quote(presence.kind ?? "listed"), quote(presence.first ?? null), json(presence)],
    )
  }
  for (const source of record.sources ?? []) {
    insert(
      "sources",
      ["entity_key", "label", "url", "provider", "source_kind", "accessed"],
      [quote(entityKey), quote(source.label), quote(source.url), quote(source.provider), quote(source.kind), quote(source.accessed)],
    )
  }
  const imageSource = record.imageSource ?? {}
  insert(
    "media",
    ["entity_key", "local_path", "provider", "source_page", "asset_url", "media_kind", "uncertain", "metadata_json"],
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

const relationshipSet = new Set()
function relationship(sourceType, sourceId, targetType, targetId, type, details = {}) {
  if (!targetId) return
  const values = [key(sourceType, sourceId), key(targetType, targetId), type]
  const signature = values.join("\u0000")
  if (relationshipSet.has(signature)) return
  relationshipSet.add(signature)
  insert(
    "relationships",
    ["source_key", "target_key", "relationship_type", "details_json"],
    [...values.map(quote), json(details)],
  )
}

for (const record of characters) {
  const entityKey = common(record, "character")
  insert(
    "characters",
    ["entity_key", "gender", "culture", "born", "died", "actor_json", "titles_json", "era"],
    [quote(entityKey), quote(record.gender), quote(record.culture), quote(record.born), quote(record.died), json(record.actor ?? record.playedBy ?? []), json(record.titles ?? []), integer(record.era)],
  )
  for (const id of record.parents ?? []) relationship("character", record.id, "character", id, "parent")
  for (const id of record.children ?? []) relationship("character", record.id, "character", id, "child")
  for (const id of record.spouses ?? []) relationship("character", record.id, "character", id, "spouse")
  relationship("character", record.id, "character", record.father, "father")
  relationship("character", record.id, "character", record.mother, "mother")
  relationship("character", record.id, "character", record.spouse, "spouse")
  relationship("character", record.id, "dragon", record.dragon, "dragon_rider")
  for (const id of record.houses ?? (record.house ? [record.house] : [])) relationship("character", record.id, "house", id, "allegiance")
}

for (const record of dragons) {
  const entityKey = common(record, "dragon")
  insert("dragons", ["entity_key", "color", "era"], [quote(entityKey), quote(record.color), integer(record.era)])
  for (const id of record.riders ?? []) relationship("dragon", record.id, "character", id, "rider")
}

for (const record of houses) {
  const entityKey = common(record, "house")
  insert(
    "houses",
    ["entity_key", "region", "words", "coat_of_arms", "seats_json", "color"],
    [quote(entityKey), quote(record.region), quote(record.words), quote(record.coatOfArms), json(record.seats ?? (record.seat ? [record.seat] : [])), quote(record.color)],
  )
  relationship("house", record.id, "character", record.currentLord, "current_lord")
  relationship("house", record.id, "character", record.heir, "heir")
  relationship("house", record.id, "house", record.overlord, "overlord")
  relationship("house", record.id, "character", record.founder, "founder")
  for (const id of record.cadetBranches ?? []) relationship("house", record.id, "house", id, "cadet_branch")
  for (const id of record.swornMembers ?? []) relationship("house", record.id, "character", id, "sworn_member")
}

statements.push("COMMIT;\nPRAGMA foreign_keys = ON;\n")
await mkdir(datasetsDir, { recursive: true })
await writeFile(outputSql, `${statements.join("\n")}\n`)
execFileSync("rm", ["-f", outputDb])
execFileSync("sqlite3", [outputDb], { input: await readFile(outputSql) })
execFileSync("sqlite3", [outputDb, "PRAGMA optimize;"])

console.log(`Wrote ${path.relative(root, outputSql)}`)
console.log(`Wrote ${path.relative(root, outputDb)}`)
