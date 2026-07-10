import "server-only"

import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import path from "node:path"
import type { BindParams, Database } from "sql.js"

import type {
  ArchiveInfo,
  EntityAppearance,
  EntityCounts,
  EntityDetail,
  EntityRelationship,
  EntitySource,
  EntitySummary,
  HouseMember,
  WikiEntityType,
  WikiListResponse,
} from "@/lib/wiki-types"

const MAX_DATABASE_BYTES = 96 * 1024 * 1024
const SQLITE_HEADER = "SQLite format 3\u0000"

type Archive = {
  database: Database
  info: ArchiveInfo
  counts: EntityCounts
}

type SummaryRow = {
  entity_key: string
  id: string
  type: WikiEntityType
  name: string
  description: string | null
  status: string | null
  verification: string | null
  local_path: string | null
  media_provider: string | null
  media_kind: string | null
  uncertain: number | null
}

type RelationshipRow = SummaryRow & {
  direction: "incoming" | "outgoing"
  relationship_type: string
}

type HouseMemberRow = SummaryRow & {
  relationship_types: string
}

let archivePromise: Promise<Archive> | null = null

export class ArchiveUnavailableError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = "ArchiveUnavailableError"
  }
}

function fallbackImage(type: WikiEntityType) {
  return `/images/fallback-${type}.svg`
}

function normalizeImagePath(value: string | null, type: WikiEntityType) {
  return value?.startsWith("/images/") ? value : fallbackImage(type)
}

function rowToSummary(row: SummaryRow): EntitySummary {
  return {
    entityKey: row.entity_key,
    id: row.id,
    type: row.type,
    name: row.name,
    description: row.description,
    status: row.status,
    verification: row.verification,
    image: {
      src: normalizeImagePath(row.local_path, row.type),
      provider: row.media_provider,
      kind: row.media_kind,
      uncertain: row.uncertain === 1 || row.media_kind === "fallback",
    },
  }
}

function queryRows<T>(database: Database, sql: string, params: BindParams = null) {
  const statement = database.prepare(sql)
  const values: T[] = []

  try {
    if (params) statement.bind(params)
    while (statement.step()) values.push(statement.getAsObject() as unknown as T)
    return values
  } finally {
    statement.free()
  }
}

function queryValue(database: Database, sql: string, params: BindParams = null) {
  const [row] = queryRows<Record<string, number | string | null>>(database, sql, params)
  return row ? Object.values(row)[0] : null
}

function parseJsonObject(value: string | null) {
  if (!value) return {}

  try {
    const parsed: unknown = JSON.parse(value)
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

function readMetadata(database: Database): ArchiveInfo {
  const rows = queryRows<{ key: string; value: string }>(
    database,
    "SELECT key, value FROM metadata WHERE key IN ('schema_version', 'generated_at')",
  )
  const metadata = Object.fromEntries(rows.map((row) => [row.key, row.value]))

  return {
    schemaVersion: metadata.schema_version ?? "unknown",
    generatedAt: metadata.generated_at ?? null,
  }
}

function readCounts(database: Database): EntityCounts {
  const counts: EntityCounts = { character: 0, dragon: 0, house: 0 }
  const rows = queryRows<{ type: WikiEntityType; count: number }>(
    database,
    "SELECT type, COUNT(*) AS count FROM entities GROUP BY type",
  )

  for (const row of rows) counts[row.type] = Number(row.count)
  return counts
}

function validateChecksum(bytes: Uint8Array, expectedChecksum: string | undefined) {
  if (!expectedChecksum) return

  const expected = expectedChecksum.trim().toLowerCase()
  if (!/^[a-f0-9]{64}$/.test(expected)) {
    throw new ArchiveUnavailableError("ASOIAF_DATABASE_SHA256 must be a 64-character SHA-256 value.")
  }

  const actual = createHash("sha256").update(bytes).digest("hex")
  if (actual !== expected) {
    throw new ArchiveUnavailableError("The downloaded archive did not match ASOIAF_DATABASE_SHA256.")
  }
}

function validateDatabaseBytes(bytes: Uint8Array) {
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_DATABASE_BYTES) {
    throw new ArchiveUnavailableError("The archive file is empty or exceeds the supported size.")
  }

  const header = new TextDecoder().decode(bytes.subarray(0, SQLITE_HEADER.length))
  if (header !== SQLITE_HEADER) {
    throw new ArchiveUnavailableError("The archive file is not a valid SQLite database.")
  }
}

async function loadDatabaseBytes() {
  const databaseUrl = process.env.ASOIAF_DATABASE_URL?.trim()
  const expectedChecksum = process.env.ASOIAF_DATABASE_SHA256?.trim()

  let bytes: Uint8Array
  if (databaseUrl) {
    if (!expectedChecksum) {
      throw new ArchiveUnavailableError(
        "ASOIAF_DATABASE_SHA256 is required when ASOIAF_DATABASE_URL is configured.",
      )
    }

    let response: Response
    try {
      response = await fetch(databaseUrl, {
        cache: "no-store",
        headers: { Accept: "application/octet-stream" },
        signal: AbortSignal.timeout(30_000),
      })
    } catch (error) {
      throw new ArchiveUnavailableError("The remote archive could not be downloaded.", { cause: error })
    }

    if (!response.ok) {
      throw new ArchiveUnavailableError(`The remote archive returned HTTP ${response.status}.`)
    }
    bytes = new Uint8Array(await response.arrayBuffer())
  } else {
    if (process.env.NODE_ENV === "production") {
      throw new ArchiveUnavailableError("ASOIAF_DATABASE_URL is required in production.")
    }

    const localPath = path.resolve(process.cwd(), "../datasets/asiof.sqlite")
    try {
      bytes = new Uint8Array(await readFile(localPath))
    } catch (error) {
      throw new ArchiveUnavailableError(`The local archive could not be read at ${localPath}.`, {
        cause: error,
      })
    }
  }

  validateDatabaseBytes(bytes)
  validateChecksum(bytes, expectedChecksum)
  return bytes
}

async function initializeArchive(): Promise<Archive> {
  const bytes = await loadDatabaseBytes()
  const { default: initSqlJs } = await import("sql.js/dist/sql-asm.js")
  const SQL = await initSqlJs()

  let database: Database | null = null
  try {
    database = new SQL.Database(bytes)
    const integrity = queryValue(database, "PRAGMA quick_check")
    if (integrity !== "ok") throw new Error(`SQLite quick_check returned ${String(integrity)}`)

    return {
      database,
      info: readMetadata(database),
      counts: readCounts(database),
    }
  } catch (error) {
    database?.close()
    throw new ArchiveUnavailableError("The SQLite archive could not be opened safely.", { cause: error })
  }
}

async function getArchive() {
  if (!archivePromise) {
    archivePromise = initializeArchive().catch((error: unknown) => {
      archivePromise = null
      throw error instanceof ArchiveUnavailableError
        ? error
        : new ArchiveUnavailableError("The archive could not be initialized.", { cause: error })
    })
  }

  return archivePromise
}

function escapeLike(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_")
}

const SUMMARY_COLUMNS = `
  e.entity_key, e.id, e.type, e.name, e.description, e.status, e.verification,
  m.local_path, m.provider AS media_provider, m.media_kind, m.uncertain
`

export async function listWikiEntities(options: {
  type: WikiEntityType | null
  query: string
  page: number
  pageSize: number
}): Promise<WikiListResponse> {
  const archive = await getArchive()
  const filters: string[] = []
  const params: Record<string, string | number> = {}

  if (options.type) {
    filters.push("e.type = $type")
    params.$type = options.type
  }

  if (options.query) {
    filters.push(`(
      e.name LIKE $query ESCAPE '\\' COLLATE NOCASE
      OR EXISTS (
        SELECT 1 FROM aliases a
        WHERE a.entity_key = e.entity_key
          AND a.alias LIKE $query ESCAPE '\\' COLLATE NOCASE
      )
    )`)
    params.$query = `%${escapeLike(options.query)}%`
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : ""
  const total = Number(
    queryValue(archive.database, `SELECT COUNT(*) FROM entities e ${where}`, params),
  )
  const offset = (options.page - 1) * options.pageSize
  const rows = queryRows<SummaryRow>(
    archive.database,
    `
      SELECT ${SUMMARY_COLUMNS}
      FROM entities e
      LEFT JOIN media m ON m.entity_key = e.entity_key
      ${where}
      ORDER BY
        CASE e.type WHEN 'character' THEN 1 WHEN 'dragon' THEN 2 ELSE 3 END,
        e.name COLLATE NOCASE,
        e.id COLLATE NOCASE
      LIMIT $limit OFFSET $offset
    `,
    { ...params, $limit: options.pageSize, $offset: offset },
  )

  return {
    archive: archive.info,
    counts: archive.counts,
    items: rows.map(rowToSummary),
    pagination: {
      page: options.page,
      pageSize: options.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / options.pageSize)),
    },
  }
}

function readAliases(database: Database, entityKey: string) {
  return queryRows<{ alias: string }>(
    database,
    "SELECT alias FROM aliases WHERE entity_key = $key ORDER BY alias COLLATE NOCASE",
    { $key: entityKey },
  ).map((row) => row.alias)
}

function readAppearances(database: Database, entityKey: string): EntityAppearance[] {
  return queryRows<{
    show_id: string
    presence_kind: string
    first_reference: string | null
    details_json: string
  }>(
    database,
    `
      SELECT show_id, presence_kind, first_reference, details_json
      FROM appearances
      WHERE entity_key = $key
      ORDER BY show_id COLLATE NOCASE, presence_kind COLLATE NOCASE, first_reference COLLATE NOCASE
    `,
    { $key: entityKey },
  ).map((row) => ({
    showId: row.show_id,
    presenceKind: row.presence_kind,
    firstReference: row.first_reference,
    details: parseJsonObject(row.details_json),
  }))
}

function readRelationships(database: Database, entityKey: string): EntityRelationship[] {
  const rows = queryRows<RelationshipRow>(
    database,
    `
      SELECT
        links.direction,
        links.relationship_type,
        ${SUMMARY_COLUMNS}
      FROM (
        SELECT 'outgoing' AS direction, target_key AS related_key, relationship_type
        FROM relationships
        WHERE source_key = $key
        UNION ALL
        SELECT 'incoming' AS direction, source_key AS related_key, relationship_type
        FROM relationships
        WHERE target_key = $key
      ) links
      JOIN entities e ON e.entity_key = links.related_key
      LEFT JOIN media m ON m.entity_key = e.entity_key
      ORDER BY links.relationship_type COLLATE NOCASE, e.name COLLATE NOCASE, links.direction
    `,
    { $key: entityKey },
  )

  const seen = new Set<string>()
  const relationships: EntityRelationship[] = []
  for (const row of rows) {
    const dedupeKey = `${row.direction}:${row.relationship_type}:${row.entity_key}`
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)
    relationships.push({
      direction: row.direction,
      relationshipType: row.relationship_type,
      entity: rowToSummary(row),
    })
  }
  return relationships
}

function readSources(database: Database, entityKey: string): EntitySource[] {
  return queryRows<{
    label: string | null
    url: string | null
    provider: string | null
    source_kind: string | null
    accessed: string | null
  }>(
    database,
    `
      SELECT label, url, provider, source_kind, accessed
      FROM sources
      WHERE entity_key = $key
      ORDER BY provider COLLATE NOCASE, label COLLATE NOCASE, url COLLATE NOCASE
    `,
    { $key: entityKey },
  ).map((row) => ({
    label: row.label,
    url: row.url,
    provider: row.provider,
    sourceKind: row.source_kind,
    accessed: row.accessed,
  }))
}

function readHouseMembers(database: Database, entityKey: string): HouseMember[] {
  const rows = queryRows<HouseMemberRow>(
    database,
    `
      SELECT
        ${SUMMARY_COLUMNS},
        group_concat(DISTINCT links.relationship_type) AS relationship_types
      FROM (
        SELECT target_key AS character_key, relationship_type
        FROM relationships
        WHERE source_key = $key
          AND relationship_type IN ('sworn_member', 'current_lord', 'heir', 'founder')
        UNION
        SELECT source_key AS character_key, relationship_type
        FROM relationships
        WHERE target_key = $key
          AND relationship_type = 'allegiance'
      ) links
      JOIN entities e ON e.entity_key = links.character_key AND e.type = 'character'
      LEFT JOIN media m ON m.entity_key = e.entity_key
      GROUP BY e.entity_key
      ORDER BY e.name COLLATE NOCASE, e.id COLLATE NOCASE
    `,
    { $key: entityKey },
  )

  return rows.map((row) => ({
    ...rowToSummary(row),
    relationshipTypes: row.relationship_types.split(",").sort((a, b) => a.localeCompare(b)),
  }))
}

export async function getWikiEntity(type: WikiEntityType, id: string) {
  const archive = await getArchive()
  const [row] = queryRows<SummaryRow & { raw_json: string }>(
    archive.database,
    `
      SELECT ${SUMMARY_COLUMNS}, e.raw_json
      FROM entities e
      LEFT JOIN media m ON m.entity_key = e.entity_key
      WHERE e.type = $type AND e.id = $id
      LIMIT 1
    `,
    { $type: type, $id: id },
  )

  if (!row) return null

  const detail: EntityDetail = {
    ...rowToSummary(row),
    aliases: readAliases(archive.database, row.entity_key),
    appearances: readAppearances(archive.database, row.entity_key),
    relationships: readRelationships(archive.database, row.entity_key),
    sources: readSources(archive.database, row.entity_key),
    houseMembers: type === "house" ? readHouseMembers(archive.database, row.entity_key) : [],
    raw: parseJsonObject(row.raw_json),
  }

  return { archive: archive.info, entity: detail }
}
