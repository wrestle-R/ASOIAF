#!/usr/bin/env node

import { createHash } from "node:crypto"
import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const datasetsDir = path.join(root, "datasets")
// Full upstream rows are build inputs, not public release data. Keep them with
// the build scripts so datasets/ contains TV-scoped outputs only.
const sourceDir = path.join(root, "scripts", "source-data")
const legacyPublicSourceDir = path.join(datasetsDir, "source")
const dryRun = process.argv.includes("--dry-run")

const files = {
  character: "charachters.json",
  dragon: "dragons.json",
  house: "houses.json",
}
const expectedSourceCounts = {
  character: 2146,
  dragon: 29,
  house: 408,
}
const selectedShows = [
  "game-of-thrones",
  "house-of-the-dragon",
  "a-knight-of-the-seven-kingdoms",
]
const selectedShowSet = new Set(selectedShows)
const aegonAllowlist = new Set([
  "aegon-i",
  "aegon-ii",
  "aegon-iii",
  "aegon-iv",
  "aegon-v",
  "api-character-42",
])
const characterMerges = new Map([
  ["api-character-208", "bran-stark"],
  ["api-character-901", "robert-baratheon"],
  ["api-character-150", "yara-greyjoy"],
  ["api-character-784", "olenna-tyrell"],
])
const characterDisambiguation = new Map([
  ["rhaenys-i", "Rhaenys Targaryen (rider of Meraxes)"],
  ["rhaenys-targaryen", "Rhaenys Targaryen (the Queen Who Never Was)"],
  ["daeron-targaryen", "Daeron Targaryen (the Daring)"],
  ["daeron-the-drunken", "Daeron Targaryen (the Drunken)"],
  ["api-character-585", "Greatjon Umber"],
  ["api-character-586", "Smalljon Umber"],
])

const fail = (message) => {
  throw new Error(message)
}
const sha256 = (value) => createHash("sha256").update(value).digest("hex")
const normalize = (value = "") =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
const clone = (value) => JSON.parse(JSON.stringify(value))
const present = (value) => value !== null && value !== undefined && value !== ""
const union = (...groups) => [...new Set(groups.flat().filter(present))]
const unionNormalized = (...groups) => {
  const seen = new Set()
  const result = []
  for (const value of groups.flat().filter(present)) {
    const signature = normalize(String(value))
    if (!signature || seen.has(signature)) continue
    seen.add(signature)
    result.push(value)
  }
  return result
}
const selectedRecordShows = (record) =>
  union(record.show ?? []).filter((show) => selectedShowSet.has(show))
const selectedPresence = (record) =>
  (record.presence ?? []).filter((item) => selectedShowSet.has(item?.show))

async function loadSources() {
  const currentTexts = Object.fromEntries(
    await Promise.all(
      Object.entries(files).map(async ([type, file]) => [
        type,
        await readFile(path.join(datasetsDir, file), "utf8"),
      ]),
    ),
  )
  const readSourceDirectory = async (directory) => {
    const texts = {}
    let count = 0
    for (const [type, file] of Object.entries(files)) {
      try {
        texts[type] = await readFile(path.join(directory, file), "utf8")
        count += 1
      } catch (error) {
        if (error?.code !== "ENOENT") throw error
      }
    }
    if (count !== 0 && count !== Object.keys(files).length) {
      fail(`${path.relative(root, directory)} is incomplete; restore all three source JSON files`)
    }
    return { texts, count }
  }
  const buildSources = await readSourceDirectory(sourceDir)
  const legacyPublicSources = buildSources.count
    ? { texts: {}, count: 0 }
    : await readSourceDirectory(legacyPublicSourceDir)
  const existingSources = buildSources.count ? buildSources : legacyPublicSources
  const texts = existingSources.count ? existingSources.texts : currentTexts
  const records = Object.fromEntries(
    Object.entries(texts).map(([type, text]) => [type, JSON.parse(text)]),
  )
  for (const [type, expected] of Object.entries(expectedSourceCounts)) {
    if (!Array.isArray(records[type]) || records[type].length !== expected) {
      fail(
        `${type} source must contain exactly ${expected} rows; found ${records[type]?.length ?? "invalid JSON"}`,
      )
    }
  }

  if (!buildSources.count && !dryRun) {
    await mkdir(sourceDir, { recursive: true })
    await Promise.all(
      Object.entries(files).map(([type, file]) =>
        writeFile(path.join(sourceDir, file), texts[type]),
      ),
    )
    if (legacyPublicSources.count) await rm(legacyPublicSourceDir, { recursive: true })
  }

  return {
    records,
    hashes: Object.fromEntries(Object.entries(texts).map(([type, text]) => [type, sha256(text)])),
  }
}

function mergeCharacter(primary, duplicate) {
  const merged = { ...clone(duplicate), ...clone(primary) }
  const normalizedArrayFields = ["aliases", "actor", "playedBy"]
  const arrayFields = [
    "titles",
    "houses",
    "parents",
    "children",
    "spouses",
    "show",
    "books",
    "povBooks",
  ]
  for (const field of normalizedArrayFields) {
    merged[field] = unionNormalized(primary[field] ?? [], duplicate[field] ?? [])
  }
  merged.aliases = unionNormalized(
    merged.aliases,
    normalize(primary.name) === normalize(duplicate.name) ? [] : [duplicate.name],
  )
  for (const field of arrayFields) {
    if (field === "aliases") continue
    merged[field] = union(primary[field] ?? [], duplicate[field] ?? [])
  }
  merged.presence = [
    ...new Map(
      [...(primary.presence ?? []), ...(duplicate.presence ?? [])].map((item) => [
        `${item.show}:${item.kind ?? ""}:${item.first ?? ""}:${item.last ?? ""}`,
        item,
      ]),
    ).values(),
  ]
  merged.sources = [
    ...new Map(
      [...(primary.sources ?? []), ...(duplicate.sources ?? [])]
        .filter((item) => item?.url)
        .map((item) => [item.url, item]),
    ).values(),
  ]
  merged.apiId = primary.apiId ?? duplicate.apiId ?? null
  merged.legacyIds = union(primary.legacyIds ?? [], duplicate.legacyIds ?? [], duplicate.id)
  for (const field of ["father", "mother", "spouse", "dragon", "house"]) {
    merged[field] = primary[field] ?? duplicate[field] ?? null
  }
  return merged
}

function auditDecision(type, record) {
  const scopedShows = selectedRecordShows(record)
  if (type === "character" && characterMerges.has(record.id)) {
    return {
      decision: "merge",
      finalId: characterMerges.get(record.id),
      reason: "confirmed_duplicate",
      evidence: { shows: scopedShows },
    }
  }
  if (type === "character" && /\baegon\b/i.test(record.name ?? "") && !aegonAllowlist.has(record.id)) {
    return {
      decision: "drop",
      finalId: null,
      reason: "not_in_exact_aegon_allowlist",
      evidence: { shows: scopedShows },
    }
  }
  if (scopedShows.length) {
    return {
      decision: "keep",
      finalId: record.id,
      reason: "selected_series_evidence",
      evidence: { shows: scopedShows },
    }
  }
  if (type === "character" && record.id === "api-character-42") {
    return {
      decision: "keep",
      finalId: record.id,
      reason: "user_supplied_aegon_vi_exception",
      evidence: {
        shows: [],
        reference: "https://awoiaf.westeros.org/index.php/Aegon_Targaryen_(Young_Griff)",
      },
    }
  }
  return {
    decision: "drop",
    finalId: null,
    reason: "no_selected_series_evidence",
    evidence: { shows: [] },
  }
}

function prepareCharacters(originals, decisions) {
  const byId = new Map(originals.map((record) => [record.id, clone(record)]))
  for (const [duplicateId, primaryId] of characterMerges) {
    const duplicate = byId.get(duplicateId)
    const primary = byId.get(primaryId)
    if (!duplicate || !primary) fail(`confirmed merge ${duplicateId} -> ${primaryId} is missing a row`)
    byId.set(primaryId, mergeCharacter(primary, duplicate))
  }

  return originals
    .filter((record) => decisions.get(record.id).decision === "keep")
    .map((record) => {
      const next = byId.get(record.id)
      next.show = selectedRecordShows(next)
      next.presence = selectedPresence(next)
      next.aliases = unionNormalized(next.aliases ?? [])
      if (record.id === "jon-snow") {
        next.aliases = next.aliases.filter((alias) => normalize(alias) !== "aegon targaryen")
      }
      if (record.id === "aegon-v") {
        next.aliases = next.aliases.filter((alias) => alias !== "The Prince Who Was An Eggg")
      }
      if (record.id === "api-character-42") {
        delete next.apiId
        next.name = "Aegon VI Targaryen"
        next.canonicalName = "Aegon VI Targaryen"
        next.aliases = unionNormalized(next.aliases, ["Young Griff", "Aegon VI"])
        next.biography =
          "A young man of Valyrian origin who claims to be the surviving son of Prince Rhaegar Targaryen and Elia Martell."
        next.died = null
        next.status = "alive_as_of_source"
        next.books = []
        next.povBooks = []
        next.sources = (next.sources ?? []).filter((source) =>
          source?.url?.includes("awoiaf.westeros.org/index.php/Aegon_Targaryen_(Young_Griff)"),
        )
        next.verification = "user_supplied_exception"
      }
      const disambiguatedName = characterDisambiguation.get(record.id)
      if (disambiguatedName) {
        next.aliases = unionNormalized(next.aliases, [next.name])
        next.name = disambiguatedName
        next.canonicalName = disambiguatedName
      }
      return next
    })
}

function prepareSimpleRecords(type, originals, decisions) {
  return originals
    .filter((record) => decisions.get(record.id).decision === "keep")
    .map((record) => ({
      ...clone(record),
      aliases: unionNormalized(record.aliases ?? []),
      show: selectedRecordShows(record),
      presence: selectedPresence(record),
    }))
}

function buildReferenceMap(records, explicit = new Map()) {
  const result = new Map(explicit)
  for (const record of records) {
    for (const legacyId of record.legacyIds ?? []) {
      const current = result.get(legacyId)
      if (current && current !== record.id) {
        fail(`legacy ID ${legacyId} maps to both ${current} and ${record.id}`)
      }
      result.set(legacyId, record.id)
    }
  }
  return result
}

function remap(id, map) {
  if (!id) return null
  const visited = new Set()
  let current = id
  while (map.has(current)) {
    if (visited.has(current)) fail(`reference map contains a cycle at ${current}`)
    visited.add(current)
    current = map.get(current)
  }
  return current
}

function remapArray(values, map, allowed) {
  return union((values ?? []).map((id) => remap(id, map))).filter((id) => allowed.has(id))
}

function remapScalar(value, map, allowed) {
  const next = remap(value, map)
  return next && allowed.has(next) ? next : null
}

function cleanReferences(characters, dragons, houses) {
  const characterIds = new Set(characters.map((record) => record.id))
  const dragonIds = new Set(dragons.map((record) => record.id))
  const houseIds = new Set(houses.map((record) => record.id))
  const characterRefs = buildReferenceMap(characters, characterMerges)
  const dragonRefs = buildReferenceMap(dragons)
  const houseRefs = buildReferenceMap(houses)

  for (const record of characters) {
    for (const field of ["parents", "children", "spouses"]) {
      record[field] = remapArray(record[field], characterRefs, characterIds)
    }
    for (const field of ["father", "mother", "spouse"]) {
      record[field] = remapScalar(record[field], characterRefs, characterIds)
    }
    record.houses = remapArray(
      union(record.houses ?? [], record.house ? [record.house] : []),
      houseRefs,
      houseIds,
    )
    record.house = remapScalar(record.house, houseRefs, houseIds)
    record.dragon = remapScalar(record.dragon, dragonRefs, dragonIds)
  }

  for (const record of dragons) {
    record.riders = remapArray(record.riders, characterRefs, characterIds)
  }

  const allegianceByHouse = new Map(houses.map((house) => [house.id, new Set()]))
  for (const character of characters) {
    for (const houseId of union(character.houses ?? [], character.house ? [character.house] : [])) {
      allegianceByHouse.get(houseId)?.add(character.id)
    }
  }
  for (const record of houses) {
    record.currentLord = remapScalar(record.currentLord, characterRefs, characterIds)
    record.heir = remapScalar(record.heir, characterRefs, characterIds)
    record.founder = remapScalar(record.founder, characterRefs, characterIds)
    record.overlord = remapScalar(record.overlord, houseRefs, houseIds)
    record.cadetBranches = remapArray(record.cadetBranches, houseRefs, houseIds).filter(
      (id) => id !== record.id,
    )
    const explicitMembers = remapArray(record.swornMembers, characterRefs, characterIds)
    record.swornMembers = union(
      explicitMembers,
      [...(allegianceByHouse.get(record.id) ?? [])],
      [record.currentLord, record.heir, record.founder],
    ).sort((a, b) => a.localeCompare(b))
    if (record.overlord === record.id) record.overlord = null
  }
}

function validateDatasets(characters, dragons, houses, audit, originals) {
  const datasets = { character: characters, dragon: dragons, house: houses }
  const ids = Object.fromEntries(
    Object.entries(datasets).map(([type, records]) => [type, new Set(records.map(({ id }) => id))]),
  )
  for (const [type, records] of Object.entries(datasets)) {
    if (ids[type].size !== records.length) fail(`${type} output contains duplicate IDs`)
    const names = new Map()
    for (const record of records) {
      if (!record.id || !record.name?.trim()) fail(`${type} contains a row without an ID or name`)
      if (!record.show.every((show) => selectedShowSet.has(show))) {
        fail(`${type}:${record.id} contains an out-of-scope show`)
      }
      if (type !== "character" && !record.show.length) {
        fail(`${type}:${record.id} has no selected-series evidence`)
      }
      if (type === "character" && !record.show.length && record.id !== "api-character-42") {
        fail(`character:${record.id} has no selected-series evidence`)
      }
      if (!record.presence.every((item) => record.show.includes(item.show))) {
        fail(`${type}:${record.id} has presence outside its show list`)
      }
      const nameKey = normalize(record.name)
      if (names.has(nameKey)) {
        fail(`${type} has an undisambiguated name: ${record.name} (${names.get(nameKey)}, ${record.id})`)
      }
      names.set(nameKey, record.id)
    }
  }

  const characterById = new Map(characters.map((record) => [record.id, record]))
  for (const [duplicateId, primaryId] of characterMerges) {
    if (characterById.has(duplicateId)) fail(`${duplicateId} survived its confirmed merge`)
    if (!(characterById.get(primaryId)?.legacyIds ?? []).includes(duplicateId)) {
      fail(`${primaryId} does not preserve merged legacy ID ${duplicateId}`)
    }
  }
  const searchableAegons = characters
    .filter((record) =>
      [record.name, ...(record.aliases ?? [])].some((label) => /\baegon\b/i.test(label)),
    )
    .map((record) => record.id)
    .sort()
  const expectedAegons = [...aegonAllowlist].sort()
  if (JSON.stringify(searchableAegons) !== JSON.stringify(expectedAegons)) {
    fail(`Aegon search mismatch: expected ${expectedAegons.join(", ")}; got ${searchableAegons.join(", ")}`)
  }
  if ((characterById.get("jon-snow")?.aliases ?? []).some((alias) => normalize(alias) === "aegon targaryen")) {
    fail("Jon Snow still contains the removed Aegon Targaryen alias")
  }

  const assertRefs = (owner, values, allowed) => {
    for (const value of values.filter(Boolean)) {
      if (!allowed.has(value)) fail(`${owner} has dangling reference ${value}`)
    }
  }
  for (const record of characters) {
    assertRefs(`character:${record.id}`, [
      ...(record.parents ?? []),
      ...(record.children ?? []),
      ...(record.spouses ?? []),
      record.father,
      record.mother,
      record.spouse,
    ], ids.character)
    assertRefs(`character:${record.id}`, union(record.houses ?? [], [record.house]), ids.house)
    assertRefs(`character:${record.id}`, [record.dragon], ids.dragon)
    for (const houseId of union(record.houses ?? [], [record.house])) {
      const house = houses.find(({ id }) => id === houseId)
      if (!house?.swornMembers.includes(record.id)) {
        fail(`house:${houseId} is missing allegiance member ${record.id}`)
      }
    }
  }
  for (const record of dragons) {
    assertRefs(`dragon:${record.id}`, record.riders ?? [], ids.character)
  }
  for (const record of houses) {
    assertRefs(
      `house:${record.id}`,
      [record.currentLord, record.heir, record.founder, ...(record.swornMembers ?? [])],
      ids.character,
    )
    assertRefs(`house:${record.id}`, [record.overlord, ...(record.cadetBranches ?? [])], ids.house)
  }

  const sourceCount = Object.values(originals).reduce((sum, records) => sum + records.length, 0)
  if (audit.records.length !== sourceCount) {
    fail(`audit covers ${audit.records.length} of ${sourceCount} source rows`)
  }
  const uniqueAuditRows = new Set(audit.records.map((row) => `${row.entityType}:${row.originalId}`))
  if (uniqueAuditRows.size !== sourceCount) fail("audit contains duplicate or missing source rows")
}

const { records: originals, hashes: sourceHashes } = await loadSources()
const decisions = {}
const auditRows = []
for (const [type, records] of Object.entries(originals)) {
  decisions[type] = new Map()
  records.forEach((record, index) => {
    const decision = auditDecision(type, record)
    decisions[type].set(record.id, decision)
    auditRows.push({
      entityType: type,
      sourceRow: index + 1,
      originalId: record.id,
      originalName: record.name,
      originalShow: record.show ?? [],
      ...decision,
    })
  })
}

const characters = prepareCharacters(originals.character, decisions.character)
const dragons = prepareSimpleRecords("dragon", originals.dragon, decisions.dragon)
const houses = prepareSimpleRecords("house", originals.house, decisions.house)
cleanReferences(characters, dragons, houses)

const decisionCounts = auditRows.reduce(
  (counts, row) => ({ ...counts, [row.decision]: counts[row.decision] + 1 }),
  { keep: 0, merge: 0, drop: 0 },
)
const audit = {
  auditVersion: 1,
  scope: {
    shows: selectedShows,
    exception: {
      type: "character",
      id: "api-character-42",
      reason: "Exact Aegon VI allowlist supplied by the user; no television appearance is claimed.",
    },
  },
  rules: {
    evidence: "Keep rows with a non-empty selected-series show marker.",
    merges: Object.fromEntries(characterMerges),
    aegonAllowlist: [...aegonAllowlist],
    unsupportedRows: "Drop rather than infer television inclusion.",
  },
  source: {
    rowCounts: Object.fromEntries(
      Object.entries(originals).map(([type, records]) => [type, records.length]),
    ),
    sha256: sourceHashes,
  },
  output: {
    rowCounts: {
      character: characters.length,
      dragon: dragons.length,
      house: houses.length,
    },
    decisions: decisionCounts,
  },
  records: auditRows,
}

validateDatasets(characters, dragons, houses, audit, originals)

console.log(
  `Characters: ${originals.character.length} -> ${characters.length} (${characterMerges.size} confirmed merges)`,
)
console.log(`Dragons: ${originals.dragon.length} -> ${dragons.length}`)
console.log(`Houses: ${originals.house.length} -> ${houses.length}`)
console.log(
  `Audit: ${auditRows.length} rows (${decisionCounts.keep} keep, ${decisionCounts.merge} merge, ${decisionCounts.drop} drop)`,
)

if (!dryRun) {
  await Promise.all([
    writeFile(path.join(datasetsDir, files.character), `${JSON.stringify(characters, null, 2)}\n`),
    writeFile(path.join(datasetsDir, files.dragon), `${JSON.stringify(dragons, null, 2)}\n`),
    writeFile(path.join(datasetsDir, files.house), `${JSON.stringify(houses, null, 2)}\n`),
    writeFile(path.join(datasetsDir, "audit-report.json"), `${JSON.stringify(audit, null, 2)}\n`),
  ])
}
