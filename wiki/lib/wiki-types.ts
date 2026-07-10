export const wikiEntityTypes = ["character", "dragon", "house"] as const

export type WikiEntityType = (typeof wikiEntityTypes)[number]
export type WikiEntityFilter = WikiEntityType | "all"

export type EntityCounts = Record<WikiEntityType, number>

export type ArchiveInfo = {
  schemaVersion: string
  generatedAt: string | null
}

export type EntityImage = {
  src: string
  provider: string | null
  kind: string | null
  uncertain: boolean
}

export type EntitySummary = {
  entityKey: string
  id: string
  type: WikiEntityType
  name: string
  description: string | null
  status: string | null
  verification: string | null
  image: EntityImage
}

export type WikiListResponse = {
  archive: ArchiveInfo
  counts: EntityCounts
  items: EntitySummary[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export type EntityAppearance = {
  showId: string
  presenceKind: string
  firstReference: string | null
  details: Record<string, unknown>
}

export type EntityRelationship = {
  direction: "incoming" | "outgoing"
  relationshipType: string
  entity: EntitySummary
}

export type EntitySource = {
  label: string | null
  url: string | null
  provider: string | null
  sourceKind: string | null
  accessed: string | null
}

export type HouseMember = EntitySummary & {
  relationshipTypes: string[]
}

export type EntityDetail = EntitySummary & {
  aliases: string[]
  appearances: EntityAppearance[]
  relationships: EntityRelationship[]
  sources: EntitySource[]
  houseMembers: HouseMember[]
  raw: Record<string, unknown>
}

export type WikiDetailResponse = {
  archive: ArchiveInfo
  entity: EntityDetail
}

export type WikiApiError = {
  error: {
    code: "ARCHIVE_UNAVAILABLE" | "INVALID_REQUEST" | "NOT_FOUND"
    message: string
  }
}
