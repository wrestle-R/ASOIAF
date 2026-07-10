import { getWikiEntity } from "@/lib/wiki-database"
import { wikiEntityTypes, type WikiApiError, type WikiEntityType } from "@/lib/wiki-types"

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const routeParams = await params
  const type = routeParams.type.trim().toLowerCase()
  const id = routeParams.id.trim()

  if (!wikiEntityTypes.includes(type as WikiEntityType)) {
    return errorResponse("INVALID_REQUEST", "The entity type is not valid.", 400)
  }
  if (!id || id.length > 200) {
    return errorResponse("INVALID_REQUEST", "The entity id is not valid.", 400)
  }

  try {
    const response = await getWikiEntity(type as WikiEntityType, id)
    if (!response) {
      return errorResponse("NOT_FOUND", "That archive record does not exist.", 404)
    }
    return Response.json(response, { headers: { "Cache-Control": SUCCESS_CACHE } })
  } catch (error) {
    console.error("[wiki] Unable to read an archive entity", error)
    return errorResponse(
      "ARCHIVE_UNAVAILABLE",
      "The archive is temporarily unavailable. Please try again.",
      503,
    )
  }
}
