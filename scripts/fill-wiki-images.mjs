#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const dryRun = process.argv.includes("--dry-run")
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="))
const limit = limitArg ? Number(limitArg.split("=")[1]) : Number.POSITIVE_INFINITY
const accessed = "2026-07-10"
const userAgent = "asiof-dataset-image-resolver/1.0"
const folders = {
  character: "characters",
  dragon: "dragons",
  house: "houses",
}
const files = [
  ["charachters.json", "character"],
  ["dragons.json", "dragon"],
  ["houses.json", "house"],
]
const providerLabels = {
  "awoiaf.westeros.org": "A Wiki of Ice and Fire",
  "iceandfire.fandom.com": "A Song of Ice and Fire Wiki",
  "gameofthrones.fandom.com": "Wiki of Westeros",
}

const readJson = async (file) => JSON.parse(await readFile(path.join(root, "datasets", file), "utf8"))
const writeJson = async (file, rows) => writeFile(path.join(root, "datasets", file), `${JSON.stringify(rows, null, 2)}\n`)
const isFallback = (record) => record.imageSource?.kind === "fallback" || record.imageSource?.uncertain === true || /fallback/i.test(record.image ?? "")
const cleanTitle = (value = "") => value.replace(/\s+/g, " ").trim()
const titlePath = (title) => encodeURIComponent(cleanTitle(title).replaceAll(" ", "_")).replaceAll("%27", "'")
const unique = (values) => [...new Set(values.filter(Boolean))]
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function extFromContentType(contentType = "", url = "") {
  if (contentType.includes("png")) return "png"
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg"
  if (contentType.includes("webp")) return "webp"
  if (contentType.includes("gif")) return "gif"
  if (contentType.includes("svg")) return "svg"
  const clean = url.split("?")[0].toLowerCase()
  const match = clean.match(/\.([a-z0-9]+)$/)
  return match?.[1] && ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(match[1]) ? match[1].replace("jpeg", "jpg") : "jpg"
}

function imageLooksGeneric(url = "") {
  return /FandomFireLogo|wiki-wordmark|community-header|placeholder|default|Question_mark/i.test(url)
}

function sourceUrls(record) {
  return unique([
    record.imageSource?.url,
    ...(record.sources ?? []).map((source) => source.url),
  ]).filter((url) => /awoiaf\.westeros\.org|iceandfire\.fandom\.com|gameofthrones\.fandom\.com/.test(url))
}

function candidateTitles(record) {
  const aliases = (record.aliases ?? [])
    .filter((alias) => alias.length > 3)
    .filter((alias) => !/^the$/i.test(alias))
  return unique([record.name, ...aliases])
}

function candidatePages(record) {
  const pages = []
  for (const url of sourceUrls(record)) pages.push({ url, certainty: "source_page" })
  for (const title of candidateTitles(record)) {
    const encoded = titlePath(title)
    pages.push({ url: `https://awoiaf.westeros.org/index.php/${encoded}`, certainty: title === record.name ? "exact_title" : "alias_title" })
    pages.push({ url: `https://iceandfire.fandom.com/wiki/${encoded}`, certainty: title === record.name ? "exact_title" : "alias_title" })
    pages.push({ url: `https://gameofthrones.fandom.com/wiki/${encoded}`, certainty: title === record.name ? "exact_title" : "alias_title" })
  }
  return unique(pages.map((page) => `${page.url}\u0000${page.certainty}`)).map((value) => {
    const [url, certainty] = value.split("\u0000")
    return { url, certainty }
  })
}

function fandomApiUrl(pageUrl) {
  const parsed = new URL(pageUrl)
  const title = decodeURIComponent(parsed.pathname.replace(/^\/wiki\//, "")).replaceAll("_", " ")
  return `${parsed.origin}/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages|info&inprop=url&pithumbsize=1000&format=json`
}

async function resolveFandom(pageUrl) {
  const response = await fetch(fandomApiUrl(pageUrl), { headers: { "User-Agent": userAgent } })
  if (!response.ok) return null
  const json = await response.json()
  const page = Object.values(json.query?.pages ?? {})[0]
  const imageUrl = page?.thumbnail?.source
  if (!page || page.missing !== undefined || !imageUrl || imageLooksGeneric(imageUrl)) return null
  return {
    pageTitle: page.title,
    pageUrl: page.fullurl ?? pageUrl,
    imageUrl,
  }
}

async function resolveAwoiaf(pageUrl) {
  const response = await fetch(pageUrl, { headers: { "User-Agent": userAgent } })
  if (!response.ok) return null
  const html = await response.text()
  const imageUrl = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)?.[1]
  const pageTitle = html.match(/<title>(.*?)<\/title>/i)?.[1]?.replace(/\s+-\s+A Wiki of Ice and Fire.*$/, "")
  if (!imageUrl || imageLooksGeneric(imageUrl)) return null
  return {
    pageTitle,
    pageUrl,
    imageUrl,
  }
}

async function resolveImage(page) {
  try {
    if (/awoiaf\.westeros\.org/.test(page.url)) return await resolveAwoiaf(page.url)
    if (/\.fandom\.com/.test(page.url)) return await resolveFandom(page.url)
  } catch {
    return null
  }
  return null
}

async function downloadImage(record, type, resolved) {
  const response = await fetch(resolved.imageUrl, { headers: { "User-Agent": userAgent } })
  if (!response.ok) return null
  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.startsWith("image/")) return null
  const extension = extFromContentType(contentType, resolved.imageUrl)
  const relative = path.join("images", folders[type], `${record.id}.${extension}`)
  const absolute = path.join(root, relative)
  await mkdir(path.dirname(absolute), { recursive: true })
  await writeFile(absolute, Buffer.from(await response.arrayBuffer()))
  return `/${relative}`
}

async function processRecord(record, type) {
  for (const page of candidatePages(record)) {
    const resolved = await resolveImage(page)
    if (!resolved) continue
    const localPath = dryRun ? `/images/${folders[type]}/${record.id}.${extFromContentType("", resolved.imageUrl)}` : await downloadImage(record, type, resolved)
    if (!localPath) continue
    const host = new URL(resolved.pageUrl).hostname
    record.image = localPath
    record.imageSource = {
      provider: providerLabels[host] ?? host,
      kind: "wiki_lead_image",
      match: page.certainty,
      uncertain: page.certainty !== "source_page",
      url: resolved.pageUrl,
      assetUrl: resolved.imageUrl,
      accessed,
    }
    if (!record.sources?.some((source) => source.url === resolved.pageUrl)) {
      record.sources = [
        ...(record.sources ?? []),
        {
          label: `${record.imageSource.provider} — ${resolved.pageTitle ?? record.name}`,
          url: resolved.pageUrl,
          provider: record.imageSource.provider,
          kind: "reference_page",
          accessed,
        },
      ]
    }
    return true
  }
  return false
}

const datasets = await Promise.all(files.map(async ([file, type]) => ({ file, type, rows: await readJson(file) })))
let scanned = 0
let updated = 0

for (const dataset of datasets) {
  for (const record of dataset.rows) {
    if (!isFallback(record)) continue
    if (scanned >= limit) break
    scanned += 1
    const changed = await processRecord(record, dataset.type)
    if (changed) {
      updated += 1
      console.log(`updated ${dataset.type}:${record.id} ${record.name} -> ${record.image}`)
    }
    await sleep(80)
  }
}

if (!dryRun) {
  await Promise.all(datasets.map((dataset) => writeJson(dataset.file, dataset.rows)))
}

console.log(`Scanned fallback records: ${scanned}`)
console.log(`Resolved wiki images: ${updated}`)
if (dryRun) console.log("Dry run only; no files were written.")
