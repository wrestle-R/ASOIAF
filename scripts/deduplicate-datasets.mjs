#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const datasetsDir = path.join(root, "datasets")
const dryRun = process.argv.includes("--dry-run")
const readJson = async (name) => JSON.parse(await readFile(path.join(datasetsDir, name), "utf8"))
const normalize = (value = "") => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
const usefulLabels = (record) => new Set([record.name, ...(record.aliases ?? [])].map(normalize).filter((value) => value.length >= 4))
const union = (...values) => [...new Set(values.flat().filter((value) => value !== null && value !== undefined && value !== ""))]
const isFallback = (record) => record.imageSource?.uncertain === true || record.imageSource?.kind === "fallback"
const source = (label, url) => ({
  label,
  url,
  provider: "A Wiki of Ice and Fire",
  kind: "reference_page",
  accessed: "2026-07-10",
})
const knownHouseBranchNames = new Map(
  Object.entries({
    "api-house-6": "House Arryn of Gulltown",
    "api-house-7": "House Arryn of the Eyrie",
    "api-house-15": "House Baratheon of Dragonstone",
    "api-house-16": "House Baratheon of King's Landing",
    "api-house-17": "House Baratheon of Storm's End",
    "api-house-98": "House Dayne of High Hermitage",
    "api-house-99": "House Dayne of Starfall",
    "api-house-129": "House Flint of the mountains",
    "api-house-130": "House Flint of Breakstone Hill",
    "api-house-131": "House Flint of Flint's Finger",
    "api-house-132": "House Flint of Widow's Watch",
    "api-house-139": "House Fossoway of Cider Hall",
    "api-house-140": "House Fossoway of New Barrel",
    "api-house-142": "House Frey of Riverrun",
    "api-house-143": "House Frey of the Crossing",
    "api-house-152": "House Goodbrother of Corpse Lake",
    "api-house-153": "House Goodbrother of Crow Spike Keep",
    "api-house-154": "House Goodbrother of Downdelving",
    "api-house-155": "House Goodbrother of Hammerhorn",
    "api-house-156": "House Goodbrother of Orkmont",
    "api-house-157": "House Goodbrother of Shatterstone",
    "api-house-177": "House Harlaw of Grey Garden",
    "api-house-178": "House Harlaw of Harlaw",
    "api-house-179": "House Harlaw of Harlaw Hall",
    "api-house-180": "House Harlaw of Harridan Hill",
    "api-house-181": "House Harlaw of the Tower of Glimmering",
    "api-house-229": "House Lannister of Casterly Rock",
    "api-house-230": "House Lannister of Darry",
    "api-house-231": "House Lannister of Lannisport",
    "api-house-290": "House Osgrey of Leafy Lake",
    "api-house-291": "House Osgrey of Standfast",
    "api-house-328": "House Royce of Runestone",
    "api-house-329": "House Royce of the Gates of the Moon",
    "api-house-397": "House Tyrell of Brightwater Keep",
    "api-house-398": "House Tyrell of Highgarden",
  }),
)
const forcedCharacterMatches = new Map([
  ["api-character-39", "aegon-ii"],
  ["api-character-40", "aegon-iii"],
])

function canonicalHouseName(name = "") {
  const match = name.match(/^(House\s+.+?)\s+of\s+.+$/i)
  return match ? match[1].trim() : name
}

function addSource(record, nextSource) {
  return {
    ...record,
    sources: [...new Map([...(record.sources ?? []), nextSource].filter((item) => item?.url).map((item) => [item.url, item])).values()],
  }
}

function addAliases(record, aliases) {
  return { ...record, aliases: union(record.aliases ?? [], aliases) }
}

function normalizeHouseRecord(record) {
  const canonicalName = canonicalHouseName(record.name)
  const sourceIds = union(record.id, record.legacyIds ?? [])
  const knownBranches = sourceIds.map((id) => knownHouseBranchNames.get(id)).filter(Boolean)
  if (canonicalName === record.name && !knownBranches.length) return record
  const branchNames = union(record.branchNames ?? [], canonicalName !== record.name ? record.name : [], knownBranches)
  return {
    ...record,
    name: canonicalName,
    canonicalName,
    aliases: union(record.aliases ?? [], branchNames.filter((name) => name !== canonicalName)),
    branchNames,
  }
}

function normalizeCharacterRecord(record) {
  let next = record
  switch (record.id) {
    case "aegon-v":
      next = { ...addAliases(record, ["Aegon Targaryen"]), name: "Aegon V Targaryen", canonicalName: "Aegon V Targaryen" }
      break
    case "api-character-42":
      next = addSource(
        { ...addAliases(record, ["Aegon Targaryen", "Aegon VI"]), name: "Aegon VI Targaryen", canonicalName: "Aegon VI Targaryen" },
        source("A Wiki of Ice and Fire — Aegon Targaryen (Young Griff)", "https://awoiaf.westeros.org/index.php/Aegon_Targaryen_(Young_Griff)"),
      )
      break
    case "api-character-43":
      next = addSource(
        { ...addAliases(record, ["Aegon Targaryen", "Aegon the Uncrowned"]), name: "Aegon Targaryen (son of Aenys I)", canonicalName: "Aegon Targaryen (son of Aenys I)" },
        source("A Wiki of Ice and Fire — Aegon Targaryen (son of Aenys I)", "https://awoiaf.westeros.org/index.php/Aegon_Targaryen_(son_of_Aenys_I)"),
      )
      break
    case "api-character-45":
      next = addSource(
        { ...addAliases(record, ["Aegon Targaryen"]), name: "Aegon Targaryen (son of Jaehaerys I)", canonicalName: "Aegon Targaryen (son of Jaehaerys I)" },
        source("A Wiki of Ice and Fire — Aegon Targaryen (son of Jaehaerys I)", "https://awoiaf.westeros.org/index.php/Aegon_Targaryen_(son_of_Jaehaerys_I)"),
      )
      break
    case "api-character-44":
      next = addSource(
        { ...addAliases(record, ["Aegon Targaryen"]), name: "Aegon Targaryen (unidentified API prince)", canonicalName: "Aegon Targaryen (unidentified API prince)" },
        source("A Wiki of Ice and Fire — Aegon Targaryen disambiguation", "https://awoiaf.westeros.org/index.php/Aegon_Targaryen"),
      )
      break
    default:
      break
  }
  return next
}

function characterScore(curated, candidate) {
  const curatedName = normalize(curated.name)
  const candidateName = normalize(candidate.name)
  const curatedAliases = new Set((curated.aliases ?? []).map(normalize))
  const candidateAliases = new Set((candidate.aliases ?? []).map(normalize))
  let score = curatedName === candidateName ? 3 : 0
  if (candidateAliases.has(curatedName) || curatedAliases.has(candidateName)) score += 8
  for (const label of curatedAliases) if (label.length >= 4 && candidateAliases.has(label)) score += 6
  if (curatedName === candidateName && (candidate.show?.length || candidate.playedBy?.length || candidate.actor?.length)) score += 6
  return score
}

function houseScore(curated, candidate) {
  const curatedName = normalize(curated.name)
  const candidateName = normalize(candidate.name)
  if (curatedName === candidateName) return 20
  if (!candidateName.startsWith(`${curatedName} of `)) return 0
  const seats = union(curated.seats ?? [], curated.seat ? curated.seat.split(" / ") : []).map(normalize)
  return seats.some((seat) => seat && candidateName.endsWith(`of ${seat}`)) ? 15 : 4
}

function selectMatches(records, scoreMatch) {
  const curated = records.filter((record) => record.verification !== "upstream_record")
  const upstream = records.filter((record) => record.verification === "upstream_record")
  const matches = new Map()
  const claimed = new Set()
  for (const primary of curated) {
    const ranked = upstream
      .filter((candidate) => !claimed.has(candidate.id))
      .map((candidate) => ({ candidate, score: scoreMatch(primary, candidate) }))
      .filter(({ score }) => score >= 6)
      .sort((a, b) => b.score - a.score)
    if (!ranked.length || (ranked[1] && ranked[0].score === ranked[1].score)) continue
    matches.set(ranked[0].candidate.id, primary.id)
    claimed.add(ranked[0].candidate.id)
  }
  return matches
}

function selectHouseMatches(records) {
  const groups = new Map()
  for (const record of records) {
    const normalizedName = normalize(record.name)
    const baseName = normalizedName.replace(/ of .+$/, "")
    groups.set(baseName, [...(groups.get(baseName) ?? []), record])
  }
  const matches = new Map()
  for (const [baseName, group] of groups) {
    if (group.length < 2) continue
    const canonical = [...group].sort((a, b) => {
      const aGeneric = normalize(a.name) === baseName ? 1 : 0
      const bGeneric = normalize(b.name) === baseName ? 1 : 0
      const aCurated = a.verification !== "upstream_record" ? 1 : 0
      const bCurated = b.verification !== "upstream_record" ? 1 : 0
      return bGeneric - aGeneric || bCurated - aCurated || a.name.length - b.name.length || a.id.localeCompare(b.id)
    })[0]
    for (const duplicate of group) if (duplicate.id !== canonical.id) matches.set(duplicate.id, canonical.id)
  }
  return matches
}

function mergeRecord(primary, duplicate) {
  const merged = { ...duplicate, ...primary }
  for (const field of ["aliases", "actor", "playedBy", "titles", "houses", "parents", "children", "spouses", "show", "books", "povBooks", "sources", "presence", "seats", "branchNames", "cadetBranches", "swornMembers", "riders", "ancestralWeapons"]) {
    if (primary[field] || duplicate[field]) {
      const values = [...(duplicate[field] ?? []), ...(primary[field] ?? [])]
      merged[field] = field === "sources"
        ? [...new Map(values.filter((item) => item?.url).map((item) => [item.url, item])).values()]
        : field === "presence"
          ? [...new Map(values.map((item) => [`${item.show}:${item.kind}:${item.first ?? ""}`, item])).values()]
          : union(values)
    }
  }
  merged.apiId = primary.apiId ?? duplicate.apiId ?? null
  merged.legacyIds = union(primary.legacyIds ?? [], duplicate.legacyIds ?? [], duplicate.id)
  if (isFallback(primary) && !isFallback(duplicate)) {
    merged.image = duplicate.image
    merged.imageSource = duplicate.imageSource
  }
  return merged
}

function applyMatches(records, matches) {
  const byId = new Map(records.map((record) => [record.id, record]))
  for (const [duplicateId, primaryId] of matches) byId.set(primaryId, mergeRecord(byId.get(primaryId), byId.get(duplicateId)))
  return records.filter((record) => !matches.has(record.id)).map((record) => byId.get(record.id))
}

function remapValue(value, maps) {
  for (const map of maps) if (map.has(value)) return map.get(value)
  return value
}

function remapReferences(characters, dragons, houses, maps) {
  for (const character of characters) {
    for (const field of ["parents", "children", "spouses", "houses"]) if (character[field]) character[field] = union(character[field].map((id) => remapValue(id, maps)))
    for (const field of ["father", "mother", "spouse", "dragon", "house"]) if (character[field]) character[field] = remapValue(character[field], maps)
  }
  for (const dragon of dragons) if (dragon.riders) dragon.riders = union(dragon.riders.map((id) => remapValue(id, maps)))
  for (const house of houses) {
    for (const field of ["cadetBranches", "swornMembers"]) if (house[field]) house[field] = union(house[field].map((id) => remapValue(id, maps)))
    for (const field of ["currentLord", "heir", "overlord", "founder"]) if (house[field]) house[field] = remapValue(house[field], maps)
    if (house.cadetBranches) house.cadetBranches = house.cadetBranches.filter((id) => id !== house.id)
    if (house.overlord === house.id) house.overlord = null
  }
}

const [charactersInput, dragons, housesInput] = await Promise.all([readJson("charachters.json"), readJson("dragons.json"), readJson("houses.json")])
const normalizedCharactersInput = charactersInput.map(normalizeCharacterRecord)
const normalizedHousesInput = housesInput.map(normalizeHouseRecord)
const characterMatches = selectMatches(normalizedCharactersInput, characterScore)
const normalizedCharacterIds = new Set(normalizedCharactersInput.map((record) => record.id))
for (const [duplicateId, primaryId] of forcedCharacterMatches) {
  if (normalizedCharacterIds.has(duplicateId) && normalizedCharacterIds.has(primaryId)) characterMatches.set(duplicateId, primaryId)
}
const houseMatches = selectHouseMatches(normalizedHousesInput)
const characters = applyMatches(normalizedCharactersInput, characterMatches)
const houses = applyMatches(normalizedHousesInput, houseMatches)
const characterLegacyMap = new Map(characters.flatMap((record) => (record.legacyIds ?? []).map((legacyId) => [legacyId, record.id])))
const houseLegacyMap = new Map(houses.flatMap((record) => (record.legacyIds ?? []).map((legacyId) => [legacyId, record.id])))
remapReferences(characters, dragons, houses, [characterMatches, houseMatches, characterLegacyMap, houseLegacyMap])

console.log(`Characters: ${charactersInput.length} -> ${characters.length} (${characterMatches.size} duplicates merged)`)
for (const [duplicate, primary] of characterMatches) console.log(`  ${duplicate} -> ${primary}`)
console.log(`Houses: ${housesInput.length} -> ${houses.length} (${houseMatches.size} duplicates merged)`)
for (const [duplicate, primary] of houseMatches) console.log(`  ${duplicate} -> ${primary}`)

if (!dryRun) {
  await Promise.all([
    writeFile(path.join(datasetsDir, "charachters.json"), `${JSON.stringify(characters, null, 2)}\n`),
    writeFile(path.join(datasetsDir, "dragons.json"), `${JSON.stringify(dragons, null, 2)}\n`),
    writeFile(path.join(datasetsDir, "houses.json"), `${JSON.stringify(houses, null, 2)}\n`),
  ])
}
