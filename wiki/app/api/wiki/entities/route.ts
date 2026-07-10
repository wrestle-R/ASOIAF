import { listWikiEntities } from "@/lib/wiki-database"
import { wikiEntityTypes, type WikiApiError, type WikiEntityType } from "@/lib/wiki-types"

const DEFAULT_PAGE_SIZE = 24
const MAX_PAGE_SIZE = 48
const SUCCESS_CACHE = "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400"
const NO_STORE = { "Cache-Control": "no-store" }

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function errorResponse(
  code: WikiApiError["error"]["code"],
  message: string,
  status: number,
) {
  return Response.json({ error: { code, message } } satisfies WikiApiError, {
    status,
    headers: NO_STORE,
  })
}

function readPositiveInteger(value: string | null, fallback: number) {
  if (value === null) return fallback
  if (!/^\d+$/.test(value)) return null
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const typeValue = searchParams.get("type")?.trim().toLowerCase() ?? "all"
  const query = searchParams.get("q")?.trim() ?? ""
  const page = readPositiveInteger(searchParams.get("page"), 1)
  const pageSize = readPositiveInteger(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE)

  if (typeValue !== "all" && !wikiEntityTypes.includes(typeValue as WikiEntityType)) {
    return errorResponse(
      "INVALID_REQUEST",
      "type must be one of: character, dragon, house, or all.",
      400,
    )
  }
  if (query.length > 100) {
    return errorResponse("INVALID_REQUEST", "q must be 100 characters or fewer.", 400)
  }
  if (page === null) {
    return errorResponse("INVALID_REQUEST", "page must be a positive integer.", 400)
  }
  if (pageSize === null || pageSize > MAX_PAGE_SIZE) {
    return errorResponse(
      "INVALID_REQUEST",
      `pageSize must be an integer between 1 and ${MAX_PAGE_SIZE}.`,
      400,
    )
  }

  try {
    const response = await listWikiEntities({
      type: typeValue === "all" ? null : (typeValue as WikiEntityType),
      query,
      page,
      pageSize,
    })
    return Response.json(response, { headers: { "Cache-Control": SUCCESS_CACHE } })
  } catch (error) {
    console.error("[wiki] Unable to list archive entities", error)
    return errorResponse(
      "ARCHIVE_UNAVAILABLE",
      "The archive is temporarily unavailable. Please try again.",
      503,
    )
  }
}
