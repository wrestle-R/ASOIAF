"use client"

import Image from "next/image"
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { ChevronLeft, ChevronRight, DatabaseIcon, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type {
  EntityDetail,
  EntitySummary,
  WikiDetailResponse,
  WikiEntityFilter,
  WikiEntityType,
  WikiListResponse,
} from "@/lib/wiki-types"

const PAGE_SIZE = 24
const typeLabels: Record<WikiEntityFilter, string> = {
  all: "Everything",
  character: "Characters",
  dragon: "Dragons",
  house: "Houses",
}

const factNames = new Set([
  "gender",
  "culture",
  "born",
  "died",
  "status",
  "color",
  "region",
  "words",
  "seat",
  "seats",
  "verification",
])

function readable(value: string) {
  return value.replaceAll("_", " ").replaceAll("-", " ")
}

function displayFact(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return String(value)
  if (Array.isArray(value)) return value.map(String).join(" · ")
  return null
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error &&
    typeof payload.error.message === "string"
  ) {
    return payload.error.message
  }
  return fallback
}

async function fetchJson<T>(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal })
  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(getErrorMessage(payload, `The archive request failed (${response.status}).`))
  }
  return payload as T
}

function fallbackImage(type: WikiEntityType) {
  return `/images/fallback-${type}.svg`
}

function ArchiveImage({
  entity,
  sizes,
}: {
  entity: EntitySummary
  sizes: string
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const fallback = fallbackImage(entity.type)
  const src = failedSrc === entity.image.src ? fallback : entity.image.src

  return (
    <Image
      src={src}
      alt={entity.name}
      fill
      sizes={sizes}
      unoptimized
      onError={() => {
        if (src !== fallback) setFailedSrc(entity.image.src)
      }}
    />
  )
}

export function WikiExplorer() {
  const [query, setQuery] = useState("")
  const [settledQuery, setSettledQuery] = useState("")
  const [type, setType] = useState<WikiEntityFilter>("all")
  const [page, setPage] = useState(1)
  const [listRetry, setListRetry] = useState(0)
  const [listState, setListState] = useState<{
    key: string
    data: WikiListResponse | null
    error: string | null
  }>({ key: "", data: null, error: null })
  const [selected, setSelected] = useState<EntitySummary | null>(null)
  const [detailRetry, setDetailRetry] = useState(0)
  const [detailState, setDetailState] = useState<{
    key: string
    data: EntityDetail | null
    error: string | null
  }>({ key: "", data: null, error: null })
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const listUrl = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
    if (type !== "all") params.set("type", type)
    if (settledQuery) params.set("q", settledQuery)
    return `/api/wiki/entities?${params}`
  }, [page, settledQuery, type])
  const listRequestKey = `${listUrl}#${listRetry}`
  const detailUrl = selected
    ? `/api/wiki/entities/${encodeURIComponent(selected.type)}/${encodeURIComponent(selected.id)}`
    : null
  const detailRequestKey = selected ? `${selected.entityKey}#${detailRetry}` : ""

  useEffect(() => {
    const timeout = window.setTimeout(() => setSettledQuery(query.trim()), 250)
    return () => window.clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    const controller = new AbortController()
    fetchJson<WikiListResponse>(listUrl, controller.signal)
      .then((data) => setListState({ key: listRequestKey, data, error: null }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setListState({
          key: listRequestKey,
          data: null,
          error: error instanceof Error ? error.message : "The archive could not be loaded.",
        })
      })

    return () => controller.abort()
  }, [listRequestKey, listUrl])

  useEffect(() => {
    if (!detailUrl) return

    const controller = new AbortController()
    fetchJson<WikiDetailResponse>(detailUrl, controller.signal)
      .then((response) => setDetailState({ key: detailRequestKey, data: response.entity, error: null }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setDetailState({
          key: detailRequestKey,
          data: null,
          error: error instanceof Error ? error.message : "The record could not be loaded.",
        })
      })

    return () => controller.abort()
  }, [detailRequestKey, detailUrl])

  const closeDetail = useCallback(() => setSelected(null), [])
  const dialogOpen = selected !== null

  useEffect(() => {
    if (!dialogOpen) return

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.requestAnimationFrame(() => closeRef.current?.focus())

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        closeDetail()
        return
      }
      if (event.key !== "Tab" || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("hidden"))
      if (!focusable.length) {
        event.preventDefault()
        dialogRef.current.focus()
        return
      }

      const first = focusable[0]
      const last = focusable.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = originalOverflow
      previouslyFocused?.focus()
    }
  }, [closeDetail, dialogOpen])

  const list = listState.data
  const listLoading = listState.key !== listRequestKey
  const listError = listState.key === listRequestKey ? listState.error : null
  const detail = detailState.key === detailRequestKey ? detailState.data : null
  const detailLoading = Boolean(selected) && detailState.key !== detailRequestKey
  const detailError = detailState.key === detailRequestKey ? detailState.error : null
  const stats = list?.counts ?? { character: 0, dragon: 0, house: 0 }
  const total = list?.pagination.total ?? 0
  const totalPages = list?.pagination.totalPages ?? 1
  const entriesStart = total ? (page - 1) * PAGE_SIZE + 1 : 0
  const entriesEnd = Math.min(page * PAGE_SIZE, total)

  const changeType = useCallback((nextType: WikiEntityFilter) => {
    setType(nextType)
    setPage(1)
  }, [])

  const statusLabel = listError
    ? "Archive unavailable"
    : list
      ? "Archive API online"
      : "Connecting to archive…"

  return (
    <main className="archive-shell">
      <header className="archive-header">
        <a className="archive-brand" href="#top" aria-label="A Wiki of Ice and Fire home">
          <span className="archive-seal" aria-hidden="true">A</span>
          <span>
            <strong>A Wiki of Ice &amp; Fire</strong>
            <small>Television archive</small>
          </span>
        </a>
        <div className={cn("archive-status", listError && "is-error")}>
          <DatabaseIcon aria-hidden="true" />
          <span>{statusLabel}</span>
        </div>
      </header>

      <section className="archive-intro" id="top">
        <div>
          <p className="archive-kicker">A television-only index</p>
          <h1>People, dragons,<br />and the houses they shaped.</h1>
          <p className="archive-lede">
            Search the curated archive, open a record, and follow its verified relationships and sources.
          </p>
        </div>
        <dl className="archive-stats" aria-label="Archive totals">
          <div><dt>Characters</dt><dd>{list ? stats.character.toLocaleString() : "—"}</dd></div>
          <div><dt>Dragons</dt><dd>{list ? stats.dragon.toLocaleString() : "—"}</dd></div>
          <div><dt>Houses</dt><dd>{list ? stats.house.toLocaleString() : "—"}</dd></div>
        </dl>
      </section>

      <section className="archive-browser" aria-label="Browse the archive">
        <aside className="archive-sidebar">
          <p className="archive-kicker">Browse</p>
          <nav aria-label="Entity types">
            {(Object.keys(typeLabels) as WikiEntityFilter[]).map((item) => (
              <button
                type="button"
                key={item}
                className={cn(type === item && "active")}
                onClick={() => changeType(item)}
                aria-pressed={type === item}
              >
                <span>{typeLabels[item]}</span>
                <b>{item === "all" ? stats.character + stats.dragon + stats.house : stats[item]}</b>
              </button>
            ))}
          </nav>
          <p className="archive-note">
            Images are shown in a uniform 4:3 frame at their full original proportion—never cropped or stretched.
          </p>
        </aside>

        <div className="archive-results">
          <label className="archive-search">
            <Search aria-hidden="true" />
            <input
              value={query}
              maxLength={100}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              placeholder="Search names and aliases"
              aria-label="Search names and aliases"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setPage(1)
                }}
                aria-label="Clear search"
              >
                <X aria-hidden="true" />
              </button>
            )}
          </label>

          <div className="archive-result-heading">
            <div>
              <p className="archive-kicker">{typeLabels[type]}</p>
              <h2>{listLoading && !list ? "Opening the archive" : `${total.toLocaleString()} entries`}</h2>
            </div>
            {list && <span>Page {page} of {totalPages}</span>}
          </div>

          {listLoading ? (
            <LoadingGrid />
          ) : listError ? (
            <ErrorState message={listError} onRetry={() => setListRetry((value) => value + 1)} />
          ) : list?.items.length ? (
            <div className="archive-grid">
              {list.items.map((entity) => (
                <EntityCard key={entity.entityKey} entity={entity} onSelect={setSelected} />
              ))}
            </div>
          ) : (
            <div className="archive-empty">
              <Search aria-hidden="true" />
              <h2>No records found</h2>
              <p>Try a shorter name or browse another section.</p>
            </div>
          )}

          {list && !listError && (
            <div className="archive-pagination" aria-label="Pagination">
              <Button
                variant="outline"
                disabled={page === 1 || listLoading}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                <ChevronLeft data-icon="inline-start" />Previous
              </Button>
              <span>{entriesStart}–{entriesEnd} of {total}</span>
              <Button
                variant="outline"
                disabled={page >= totalPages || listLoading}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                Next<ChevronRight data-icon="inline-end" />
              </Button>
            </div>
          )}
        </div>
      </section>

      <footer className="archive-footer">Made with love by Russel.</footer>

      {selected && (
        <DetailPanel
          selected={selected}
          detail={detail}
          loading={detailLoading}
          error={detailError}
          dialogRef={dialogRef}
          closeRef={closeRef}
          onClose={closeDetail}
          onRetry={() => setDetailRetry((value) => value + 1)}
          onSelect={setSelected}
        />
      )}
    </main>
  )
}

function EntityCard({
  entity,
  onSelect,
}: {
  entity: EntitySummary
  onSelect: (entity: EntitySummary) => void
}) {
  return (
    <button type="button" className="archive-card" onClick={() => onSelect(entity)}>
      <span className="archive-image">
        <ArchiveImage entity={entity} sizes="(max-width: 640px) 92vw, (max-width: 980px) 44vw, 260px" />
      </span>
      <span className="archive-card-copy">
        <small>{entity.type}{entity.image.uncertain ? " · fallback" : ""}</small>
        <strong>{entity.name}</strong>
        <span>{entity.description || entity.status || "Open the complete record"}</span>
      </span>
    </button>
  )
}

function LoadingGrid() {
  return (
    <div className="archive-grid" aria-label="Loading records" aria-busy="true">
      {Array.from({ length: 8 }, (_, index) => (
        <div className="archive-card archive-card-loading" key={index}>
          <span className="archive-image" />
          <span className="archive-loading-line" />
          <span className="archive-loading-line short" />
        </div>
      ))}
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="archive-empty archive-error" role="alert">
      <DatabaseIcon aria-hidden="true" />
      <h2>The archive is unavailable</h2>
      <p>{message}</p>
      <Button variant="outline" onClick={onRetry}>Try again</Button>
    </div>
  )
}

function DetailPanel({
  selected,
  detail,
  loading,
  error,
  dialogRef,
  closeRef,
  onClose,
  onRetry,
  onSelect,
}: {
  selected: EntitySummary
  detail: EntityDetail | null
  loading: boolean
  error: string | null
  dialogRef: RefObject<HTMLDivElement | null>
  closeRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
  onRetry: () => void
  onSelect: (entity: EntitySummary) => void
}) {
  const entity = detail ?? selected
  const facts = useMemo(() => {
    if (!detail) return []
    return Object.entries(detail.raw).flatMap(([name, value]) => {
      if (!factNames.has(name) || value === null || value === "") return []
      const display = displayFact(value)
      return display ? [[name, display] as const] : []
    })
  }, [detail])

  return (
    <div
      className="archive-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="archive-detail"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-detail-title"
        tabIndex={-1}
      >
        <Button
          ref={closeRef}
          className="archive-close"
          variant="outline"
          size="icon"
          onClick={onClose}
          aria-label="Close record"
        >
          <X aria-hidden="true" />
        </Button>

        <figure className="archive-detail-figure">
          <div className="archive-detail-image">
            <ArchiveImage entity={entity} sizes="(max-width: 700px) 100vw, 900px" />
          </div>
          <figcaption>
            {entity.image.uncertain ? "Fallback image" : entity.image.provider || "Archive image"}
            <span>Full image · no crop</span>
          </figcaption>
        </figure>

        <div className="archive-detail-body" aria-busy={loading}>
          <p className="archive-kicker">{entity.type} record</p>
          <h2 id="archive-detail-title">{entity.name}</h2>

          {loading && <DetailSkeleton />}
          {error && <ErrorState message={error} onRetry={onRetry} />}

          {detail && !loading && !error && (
            <>
              {!!detail.aliases.length && <p className="archive-aliases">{detail.aliases.join(" · ")}</p>}
              {detail.description && <p className="archive-description">{detail.description}</p>}

              {!!facts.length && (
                <section>
                  <h3>At a glance</h3>
                  <dl className="archive-facts">
                    {facts.map(([name, value]) => (
                      <div key={name}><dt>{readable(name)}</dt><dd>{value}</dd></div>
                    ))}
                  </dl>
                </section>
              )}

              {!!detail.houseMembers.length && (
                <section>
                  <div className="archive-section-heading">
                    <h3>House members</h3>
                    <span>{detail.houseMembers.length.toLocaleString()} people</span>
                  </div>
                  <div className="archive-member-grid">
                    {detail.houseMembers.map((member) => (
                      <button type="button" key={member.entityKey} onClick={() => onSelect(member)}>
                        <span className="archive-member-image">
                          <ArchiveImage entity={member} sizes="88px" />
                        </span>
                        <span><strong>{member.name}</strong><small>{member.relationshipTypes.map(readable).join(" · ")}</small></span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {!!detail.appearances.length && (
                <section>
                  <h3>Screen record</h3>
                  <ul className="archive-record-list">
                    {detail.appearances.map((item, index) => (
                      <li key={`${item.showId}-${item.presenceKind}-${index}`}>
                        <b>{readable(item.showId)}</b>
                        <span>{readable(item.presenceKind)}{item.firstReference ? ` · ${item.firstReference}` : ""}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {!!detail.relationships.length && (
                <section>
                  <h3>Relationships</h3>
                  <div className="archive-relationship-list">
                    {detail.relationships.map((relationship) => (
                      <button
                        type="button"
                        key={`${relationship.direction}-${relationship.relationshipType}-${relationship.entity.entityKey}`}
                        onClick={() => onSelect(relationship.entity)}
                      >
                        <span><small>{readable(relationship.relationshipType)}</small><strong>{relationship.entity.name}</strong></span>
                        <em>{relationship.direction === "outgoing" ? "View record →" : "← Linked from"}</em>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3>Sources</h3>
                <div className="archive-sources">
                  {detail.sources.length ? detail.sources.map((source, index) =>
                    source.url ? (
                      <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer">
                        <span>{source.provider || "Source"}</span>
                        {source.label || source.url}
                      </a>
                    ) : (
                      <p key={`${source.label}-${index}`}>{source.label || "Source URL not recorded."}</p>
                    ),
                  ) : <p>No external source URL is recorded.</p>}
                </div>
              </section>

              <details>
                <summary>Complete original record</summary>
                <pre>{JSON.stringify(detail.raw, null, 2)}</pre>
              </details>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="archive-detail-skeleton" aria-label="Loading record">
      <span /><span /><span />
    </div>
  )
}
