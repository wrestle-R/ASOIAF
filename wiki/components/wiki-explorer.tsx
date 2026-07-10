"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useState } from "react"
import initSqlJs, { type Database, type QueryExecResult } from "sql.js"
import { ChevronLeft, ChevronRight, DatabaseIcon, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type EntityType = "all" | "character" | "dragon" | "house"
type Entity = {
  entity_key: string
  id: string
  type: Exclude<EntityType, "all">
  name: string
  description: string | null
  status: string | null
  verification: string | null
  local_path: string
  uncertain: number
}
type Detail = Entity & {
  raw_json: string
  aliases: string | null
  appearances: string | null
  relationships: string | null
  sources: string | null
}

const PAGE_SIZE = 24
const typeLabels: Record<EntityType, string> = {
  all: "Everything",
  character: "Characters",
  dragon: "Dragons",
  house: "Houses",
}

function rows<T>(result: QueryExecResult[]): T[] {
  const first = result[0]
  if (!first) return []
  return first.values.map((values) =>
    Object.fromEntries(first.columns.map((column, index) => [column, values[index]])),
  ) as T[]
}

export function WikiExplorer() {
  const [database, setDatabase] = useState<Database | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [type, setType] = useState<EntityType>("all")
  const [page, setPage] = useState(0)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const SQL = await initSqlJs({ locateFile: () => "/sql-wasm.wasm" })
        const databaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL || "/asiof.sqlite"
        const response = await fetch(databaseUrl)
        if (!response.ok) throw new Error(`Database request failed (${response.status})`)
        const bytes = new Uint8Array(await response.arrayBuffer())
        if (active) setDatabase(new SQL.Database(bytes))
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : "Unable to load the archive")
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    if (!database) return { character: 0, dragon: 0, house: 0 }
    const result = rows<{ type: string; count: number }>(
      database.exec("SELECT type, COUNT(*) AS count FROM entities GROUP BY type"),
    )
    return Object.assign({ character: 0, dragon: 0, house: 0 }, ...result.map((item) => ({ [item.type]: item.count })))
  }, [database])

  const { entities, total } = useMemo(() => {
    if (!database) return { entities: [] as Entity[], total: 0 }
    const filters: string[] = []
    const params: Record<string, string | number> = {}
    if (type !== "all") {
      filters.push("e.type = $type")
      params.$type = type
    }
    if (query.trim()) {
      filters.push("(e.name LIKE $query OR EXISTS (SELECT 1 FROM aliases a WHERE a.entity_key = e.entity_key AND a.alias LIKE $query))")
      params.$query = `%${query.trim()}%`
    }
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : ""
    const countStatement = database.prepare(`SELECT COUNT(*) AS count FROM entities e ${where}`)
    countStatement.bind(params)
    countStatement.step()
    const totalRows = countStatement.getAsObject() as { count: number }
    countStatement.free()
    const statement = database.prepare(`
      SELECT e.entity_key, e.id, e.type, e.name, e.description, e.status,
        e.verification, m.local_path, m.uncertain
      FROM entities e JOIN media m USING (entity_key)
      ${where}
      ORDER BY CASE e.type WHEN 'character' THEN 1 WHEN 'dragon' THEN 2 ELSE 3 END,
        e.name COLLATE NOCASE
      LIMIT $limit OFFSET $offset
    `)
    statement.bind({ ...params, $limit: PAGE_SIZE, $offset: page * PAGE_SIZE })
    const values: Entity[] = []
    while (statement.step()) values.push(statement.getAsObject() as Entity)
    statement.free()
    return { entities: values, total: totalRows.count }
  }, [database, page, query, type])

  const detail = useMemo(() => {
    if (!database || !selectedKey) return null
    const statement = database.prepare(`
      SELECT e.*, m.local_path, m.uncertain,
        (SELECT group_concat(alias, ' · ') FROM aliases WHERE entity_key = e.entity_key) AS aliases,
        (SELECT json_group_array(json_object('show', show_id, 'kind', presence_kind, 'first', first_reference)) FROM appearances WHERE entity_key = e.entity_key) AS appearances,
        (SELECT json_group_array(json_object('target', target_key, 'type', relationship_type)) FROM relationships WHERE source_key = e.entity_key) AS relationships,
        (SELECT json_group_array(json_object('label', label, 'url', url, 'provider', provider)) FROM sources WHERE entity_key = e.entity_key) AS sources
      FROM entities e JOIN media m USING (entity_key) WHERE e.entity_key = $key
    `)
    statement.bind({ $key: selectedKey })
    const value = statement.step() ? (statement.getAsObject() as Detail) : null
    statement.free()
    return value
  }, [database, selectedKey])

  const changeType = useCallback((nextType: EntityType) => {
    setType(nextType)
    setPage(0)
  }, [])
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  if (loadError) {
    return <main className="grid min-h-svh place-items-center p-8"><div className="max-w-lg border border-border bg-card p-8"><p className="archive-kicker">Archive unavailable</p><h1 className="mt-4 font-heading text-4xl">The database could not be opened.</h1><p className="mt-4 text-sm text-muted-foreground">{loadError}</p></div></main>
  }

  return (
    <main className="min-h-svh">
      <header className="archive-header">
        <div className="archive-brand"><span className="archive-seal">A</span><div><strong>A Wiki of Ice &amp; Fire</strong><small>People, dragons &amp; houses</small></div></div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><DatabaseIcon /><span>{database ? "SQLite archive online" : "Opening SQLite archive…"}</span></div>
      </header>

      <section className="archive-intro">
        <p className="archive-kicker">The complete private archive</p>
        <h1>Every name has<br />a <em>story.</em></h1>
        <p>Browse the known people, dragons, and houses of the recorded world. Every page is read directly from the SQLite dataset.</p>
        <dl className="archive-stats">
          <div><dt>Characters</dt><dd>{stats.character.toLocaleString()}</dd></div>
          <div><dt>Dragons</dt><dd>{stats.dragon.toLocaleString()}</dd></div>
          <div><dt>Houses</dt><dd>{stats.house.toLocaleString()}</dd></div>
        </dl>
      </section>

      <section className="archive-browser">
        <aside className="archive-sidebar">
          <p className="archive-kicker">Browse the archive</p>
          <nav aria-label="Entity types">
            {(Object.keys(typeLabels) as EntityType[]).map((item) => (
              <button key={item} className={cn(type === item && "active")} onClick={() => changeType(item)}>
                <span>{typeLabels[item]}</span>
                <b>{item === "all" ? stats.character + stats.dragon + stats.house : stats[item]}</b>
              </button>
            ))}
          </nav>
          <div className="archive-note"><DatabaseIcon /><p>The original record, source links, relationships, appearances, and image confidence are preserved on every page.</p></div>
        </aside>

        <div className="archive-results">
          <label className="archive-search">
            <Search />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(0) }} placeholder="Search names and aliases…" aria-label="Search names and aliases" />
            {query && <button onClick={() => setQuery("")} aria-label="Clear search"><X /></button>}
          </label>
          <div className="archive-result-heading"><div><p className="archive-kicker">{typeLabels[type]}</p><h2>{total.toLocaleString()} entries</h2></div><span>Page {page + 1} of {totalPages}</span></div>

          {!database ? <LoadingGrid /> : entities.length ? (
            <div className="archive-grid">
              {entities.map((entity) => (
                <button className="archive-card" key={entity.entity_key} onClick={() => setSelectedKey(entity.entity_key)}>
                  <span className="archive-image"><Image src={entity.local_path} alt="" fill sizes="(max-width: 700px) 50vw, 220px" unoptimized /></span>
                  <span className="archive-card-copy"><small>{entity.type}{entity.uncertain ? " · image unverified" : ""}</small><strong>{entity.name}</strong><span>{entity.description || entity.status || "Open the record"}</span></span>
                </button>
              ))}
            </div>
          ) : <div className="archive-empty"><Search /><h2>No records found</h2><p>Try a shorter name or browse a different section.</p></div>}

          <div className="archive-pagination">
            <Button variant="outline" disabled={page === 0} onClick={() => setPage((value) => value - 1)}><ChevronLeft data-icon="inline-start" />Previous</Button>
            <span>{Math.min(page * PAGE_SIZE + 1, total)}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}</span>
            <Button variant="outline" disabled={page + 1 >= totalPages} onClick={() => setPage((value) => value + 1)}>Next<ChevronRight data-icon="inline-end" /></Button>
          </div>
        </div>
      </section>

      {detail && <DetailPanel detail={detail} onClose={() => setSelectedKey(null)} />}
    </main>
  )
}

function LoadingGrid() {
  return <div className="archive-grid" aria-label="Loading records">{Array.from({ length: 12 }, (_, index) => <div className="archive-card loading" key={index} />)}</div>
}

function DetailPanel({ detail, onClose }: { detail: Detail; onClose: () => void }) {
  const raw = JSON.parse(detail.raw_json) as Record<string, unknown>
  const appearances = JSON.parse(detail.appearances || "[]") as { show: string; kind: string; first: string | null }[]
  const relationships = JSON.parse(detail.relationships || "[]") as { target: string; type: string }[]
  const sources = JSON.parse(detail.sources || "[]") as { label: string; url: string | null; provider: string }[]
  return <div className="archive-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><article className="archive-detail">
    <Button className="archive-close" variant="outline" size="icon" onClick={onClose} aria-label="Close record"><X /></Button>
    <div className="archive-detail-hero"><Image src={detail.local_path} alt={detail.name} fill sizes="(max-width: 700px) 100vw, 430px" unoptimized /><span>{detail.uncertain ? "Unverified image / fallback" : "Sourced image"}</span></div>
    <div className="archive-detail-body"><p className="archive-kicker">{detail.type} record</p><h2>{detail.name}</h2>{detail.aliases && <p className="archive-aliases">{detail.aliases}</p>}
      {detail.description && <p className="archive-description">{detail.description}</p>}
      <section><h3>At a glance</h3><dl className="archive-facts">{Object.entries(raw).filter(([name, value]) => ["gender","culture","born","died","status","color","region","words","seat","verification"].includes(name) && value).map(([name,value]) => <div key={name}><dt>{name}</dt><dd>{String(value)}</dd></div>)}</dl></section>
      {!!appearances.length && <section><h3>Screen record</h3><ul>{appearances.map((item,index) => <li key={`${item.show}-${index}`}><b>{item.show.replaceAll("-", " ")}</b><span>{item.kind.replaceAll("_", " ")}{item.first ? ` · ${item.first}` : ""}</span></li>)}</ul></section>}
      {!!relationships.length && <section><h3>Relationships</h3><ul>{relationships.map((item,index) => <li key={`${item.target}-${item.type}-${index}`}><b>{item.type.replaceAll("_", " ")}</b><span>{item.target.replace(/^[^:]+:/, "")}</span></li>)}</ul></section>}
      <section><h3>Sources</h3><div className="archive-sources">{sources.map((source,index) => source.url ? <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer"><span>{source.provider}</span>{source.label || source.url}</a> : <p key={index}>No external source URL recorded.</p>)}</div></section>
      <details><summary>Complete original record</summary><pre>{JSON.stringify(raw, null, 2)}</pre></details>
    </div>
  </article></div>
}
