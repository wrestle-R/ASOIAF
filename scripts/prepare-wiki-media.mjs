#!/usr/bin/env node

import { createHash, randomUUID } from "node:crypto"
import { execFile as execFileCallback } from "node:child_process"
import {
  access,
  lstat,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises"
import path from "node:path"
import { promisify } from "node:util"

const execFile = promisify(execFileCallback)
const root = path.resolve(import.meta.dirname, "..")
const datasetsDir = path.join(root, "datasets")
const sourceImagesDir = path.join(root, "images")
const publicImagesDir = path.join(root, "wiki", "public", "images")
const explicitManifestPath = path.join(import.meta.dirname, "media-sources.json")
const publicManifestPath = path.join(publicImagesDir, "media-manifest.json")
const dryRun = process.argv.includes("--dry-run")
const validateOnly = process.argv.includes("--validate-only")
const offline = process.argv.includes("--offline")
const limitArgument = process.argv.find((argument) => argument.startsWith("--limit="))
const limit = limitArgument ? Number(limitArgument.split("=")[1]) : Number.POSITIVE_INFINITY
const onlyArgument = process.argv.find((argument) => argument.startsWith("--only="))
const onlyKeys = new Set(onlyArgument ? onlyArgument.split("=")[1].split(",").filter(Boolean) : [])
const accessed = new Date().toISOString().slice(0, 10)
const userAgent = "asiof-wiki-media/2.0 (exact-page archive curation)"
const timeoutMs = 20_000

const datasetSpecs = [
  { file: "charachters.json", type: "character", folder: "characters" },
  { file: "dragons.json", type: "dragon", folder: "dragons" },
  { file: "houses.json", type: "house", folder: "houses" },
]

const providerByHost = {
  "awoiaf.westeros.org": "A Wiki of Ice and Fire",
  "iceandfire.fandom.com": "A Song of Ice and Fire Wiki",
  "gameofthrones.fandom.com": "Wiki of Westeros",
  "thronesapi.com": "ThronesAPI",
}

const fallbackLabels = {
  character: "NO VERIFIED PORTRAIT",
  dragon: "NO VERIFIED DRAGON IMAGE",
  house: "VERIFIED SIGIL UNAVAILABLE",
}

const fallbackSymbols = {
  character:
    '<circle cx="600" cy="325" r="126" fill="#352b23"/><path d="M330 770c34-206 137-309 270-309s236 103 270 309" fill="#352b23"/>',
  dragon:
    '<path d="M300 690c112-50 146-167 116-319 104 53 152-51 144-194 60 111 179 149 289 91-58 88-125 133-199 136 93 87 117 199 64 336-64-121-142-182-235-184-45 73-105 118-179 134Z" fill="#722023" stroke="#b28b4e" stroke-width="7"/>',
  house:
    '<path d="M390 112h420v365c0 173-111 278-210 333-99-55-210-160-210-333Z" fill="#332b22" stroke="#a98245" stroke-width="9"/><path d="m600 242 39 119 125-1-101 73 39 119-102-74-102 74 39-119-101-73 125 1Z" fill="#8f1d21"/>',
}

function fallbackSvg(type, canvas) {
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${fallbackLabels[type]}" viewBox="0 0 ${canvas.width} ${canvas.height}"><rect width="${canvas.width}" height="${canvas.height}" fill="${canvas.matte}"/>${fallbackSymbols[type]}<path d="M135 82h930M135 818h930" stroke="#a98245" stroke-width="3"/><text x="600" y="858" text-anchor="middle" fill="#c8b891" font-family="serif" font-size="24" letter-spacing="7">${fallbackLabels[type]}</text></svg>\n`
}

function normalizeTitle(value = "") {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function decodeHtml(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex")
}

function isMentionedOnly(record) {
  const presence = record.presence ?? []
  return presence.length > 0 && !presence.some((entry) => entry.kind === "depicted")
}

function exactExpectedTitles(record) {
  return [...new Set([record.name, record.canonicalName, ...(record.aliases ?? [])].filter(Boolean))]
}

function exactTitleMatches(actualTitle, expectedTitles) {
  const actual = normalizeTitle(actualTitle)
  return expectedTitles.some((title) => normalizeTitle(title) === actual)
}

function cleanPageTitle(value = "") {
  return decodeHtml(value)
    .replace(/\s+-\s+(?:A Wiki of Ice and Fire|Wiki of Westeros|A Song of Ice and Fire Wiki).*$/i, "")
    .trim()
}

function housePageMapping(record) {
  const exactTitle = record.name
  const slug = encodeURIComponent(exactTitle.replaceAll(" ", "_")).replaceAll("%27", "'")
  return {
    pageUrl: `https://awoiaf.westeros.org/index.php/${slug}`,
    expectedPageTitle: exactTitle,
    requiredProvider: "awoiaf",
    generatedExactHouseMapping: true,
  }
}

function existingPageMapping(record) {
  const source = record.imageSource
  if (!source || source.kind === "fallback" || source.uncertain !== false || !source.url) return null
  let parsed
  try {
    parsed = new URL(source.url)
  } catch {
    return null
  }
  if (!providerByHost[parsed.hostname]) return null
  return {
    pageUrl: source.url,
    expectedPageTitles: exactExpectedTitles(record),
    existingExactMapping: true,
  }
}

function mappingForRecord(record, type, explicitMappings) {
  const explicit = explicitMappings[`${type}:${record.id}`]
  if (explicit) return { ...explicit, explicit: true }
  if (type === "house") return housePageMapping(record)
  if (isMentionedOnly(record)) return null
  return existingPageMapping(record)
}

function imageLooksGeneric(url = "") {
  return /(?:FandomFireLogo|wiki-wordmark|site-logo|community-header|placeholder|default|Question[_-]?mark|favicon)/i.test(url)
}

function imageLooksLikeWrongEntityType(url, type) {
  if (type === "house") return false
  return /(?:House[_ -][A-Z]|coat[_ -]of[_ -]arms|\bsigil\b)/i.test(decodeURIComponent(url))
}

function absoluteUrl(value, base) {
  return new URL(decodeHtml(value), base).href
}

function selectLargestSrcset(srcset, base) {
  const candidates = decodeHtml(srcset)
    .split(",")
    .map((item) => item.trim().match(/^(\S+)\s+(\d+(?:\.\d+)?)(w|x)$/))
    .filter(Boolean)
    .map((match) => ({ url: absoluteUrl(match[1], base), score: Number(match[2]) * (match[3] === "x" ? 1_000 : 1) }))
    .sort((a, b) => b.score - a.score)
  return candidates[0]?.url ?? null
}

function parseHtmlPage(html, pageUrl) {
  const title = cleanPageTitle(
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1] ??
      html.match(/<title>(.*?)<\/title>/is)?.[1] ??
      "",
  )
  let imageUrl = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)?.[1]
  if (!imageUrl) {
    const infoboxImage = html.match(/<td[^>]+class=["'][^"']*infobox-image[^"']*["'][^>]*>([\s\S]*?)<\/td>/i)?.[1]
    if (infoboxImage) {
      const srcset = infoboxImage.match(/\ssrcset=["']([^"']+)/i)?.[1]
      imageUrl = (srcset && selectLargestSrcset(srcset, pageUrl)) || infoboxImage.match(/\ssrc=["']([^"']+)/i)?.[1]
    }
  }
  return {
    pageTitle: title,
    pageUrl,
    imageUrl: imageUrl ? absoluteUrl(imageUrl, pageUrl) : null,
  }
}

async function fetchWithRetries(url, init = {}, attempts = 3) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...init,
        headers: { "User-Agent": userAgent, ...(init.headers ?? {}) },
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (response.ok || (response.status < 500 && response.status !== 429)) return response
      lastError = new Error(`HTTP ${response.status} for ${url}`)
    } catch (error) {
      lastError = error
    }
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 250))
  }
  throw lastError
}

async function resolveFandomPage(mapping) {
  const parsed = new URL(mapping.pageUrl)
  const title = decodeURIComponent(parsed.pathname.replace(/^\/wiki\//, "")).replaceAll("_", " ")
  const apiUrl = `${parsed.origin}/api.php?action=query&titles=${encodeURIComponent(title)}&redirects=1&prop=pageimages|info&inprop=url&pithumbsize=1600&format=json&origin=*`
  const response = await fetchWithRetries(apiUrl)
  if (!response.ok) throw new Error(`Fandom API returned HTTP ${response.status}`)
  const json = await response.json()
  const page = Object.values(json.query?.pages ?? {})[0]
  if (!page || page.missing !== undefined) throw new Error("Mapped Fandom page does not exist")
  return {
    pageTitle: page.title,
    pageUrl: page.fullurl ?? mapping.pageUrl,
    imageUrl: page.thumbnail?.source ?? null,
  }
}

async function resolveMappedPage(mapping, record, type) {
  const parsed = new URL(mapping.pageUrl)
  const host = parsed.hostname
  if (!providerByHost[host]) throw new Error(`Unsupported image page host: ${host}`)
  if (mapping.requiredProvider === "awoiaf" && host !== "awoiaf.westeros.org") {
    throw new Error("This entity requires an exact AWOIAF page")
  }

  let resolved
  if (host.endsWith(".fandom.com")) {
    resolved = await resolveFandomPage(mapping)
  } else {
    const response = await fetchWithRetries(mapping.pageUrl)
    if (!response.ok) throw new Error(`Mapped page returned HTTP ${response.status}`)
    const html = await response.text()
    resolved = parseHtmlPage(html, response.url)
    if (mapping.assetUrl) {
      const mappedAsset = new URL(mapping.assetUrl)
      const assetAppearsOnPage = html.includes(mapping.assetUrl) || html.includes(decodeURIComponent(mappedAsset.pathname))
      if (!assetAppearsOnPage) throw new Error("Explicit image asset is not present on the mapped exact page")
      resolved.imageUrl = mapping.assetUrl
    }
  }

  const expectedTitles = mapping.expectedPageTitle ? [mapping.expectedPageTitle] : mapping.expectedPageTitles
  if (!resolved.pageTitle || !exactTitleMatches(resolved.pageTitle, expectedTitles ?? [])) {
    throw new Error(`Canonical title mismatch: expected ${JSON.stringify(expectedTitles)}, received ${JSON.stringify(resolved.pageTitle)}`)
  }
  if (!resolved.imageUrl) throw new Error("Exact page has no lead or infobox image")
  if (imageLooksGeneric(resolved.imageUrl)) throw new Error("Exact page returned a generic site image")
  if (imageLooksLikeWrongEntityType(resolved.imageUrl, type)) throw new Error(`Exact page returned a ${type === "house" ? "portrait" : "house/sigil"} image`)
  return resolved
}

async function resolveDirectScreenAsset(mapping, record, type) {
  if (type !== "character" || isMentionedOnly(record)) {
    throw new Error("Direct screen assets are allowed only for depicted characters")
  }
  if (!exactTitleMatches(record.name, [mapping.expectedRecordName])) {
    throw new Error(`Record name mismatch: expected ${JSON.stringify(mapping.expectedRecordName)}, received ${JSON.stringify(record.name)}`)
  }
  const apiResponse = await fetchWithRetries(mapping.apiUrl)
  if (!apiResponse.ok) throw new Error(`Direct-asset API returned HTTP ${apiResponse.status}`)
  const apiRecord = await apiResponse.json()
  if (!exactTitleMatches(apiRecord.fullName, [mapping.expectedApiName])) {
    throw new Error(`Direct-asset API identity mismatch: expected ${JSON.stringify(mapping.expectedApiName)}, received ${JSON.stringify(apiRecord.fullName)}`)
  }
  if (apiRecord.imageUrl !== mapping.assetUrl) {
    throw new Error(`Direct-asset API URL mismatch: expected ${mapping.assetUrl}, received ${apiRecord.imageUrl}`)
  }
  return {
    pageTitle: apiRecord.fullName,
    pageUrl: mapping.apiUrl,
    imageUrl: mapping.assetUrl,
    directScreenAsset: true,
  }
}

function detectImage(bytes) {
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") {
    return { extension: "webp", mime: "image/webp", raster: true }
  }
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { extension: "png", mime: "image/png", raster: true }
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { extension: "jpg", mime: "image/jpeg", raster: true }
  }
  if (bytes.length >= 6 && ["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString("ascii"))) {
    return { extension: "gif", mime: "image/gif", raster: true }
  }
  const prefix = bytes.subarray(0, 512).toString("utf8").replace(/^\uFEFF/, "").trimStart()
  if (/^(?:<\?xml[\s\S]*?\?>\s*)?<svg[\s>]/i.test(prefix)) return { extension: "svg", mime: "image/svg+xml", raster: false }
  return null
}

async function downloadExactImage(imageUrl) {
  const response = await fetchWithRetries(imageUrl)
  if (!response.ok) throw new Error(`Image returned HTTP ${response.status}`)
  const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ?? ""
  if (contentType && !contentType.startsWith("image/") && contentType !== "application/octet-stream") {
    throw new Error(`Asset is not an image (${contentType})`)
  }
  const declaredLength = Number(response.headers.get("content-length") ?? 0)
  if (declaredLength > 25 * 1024 * 1024) throw new Error("Image is larger than the 25 MB source limit")
  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length > 25 * 1024 * 1024) throw new Error("Image is larger than the 25 MB source limit")
  const detected = detectImage(bytes)
  if (!detected) throw new Error("Downloaded asset has an unsupported or invalid image signature")
  if (contentType.startsWith("image/") && contentType !== "image/svg+xml" && contentType !== detected.mime) {
    const jpegAliases = contentType === "image/jpg" && detected.mime === "image/jpeg"
    if (!jpegAliases) throw new Error(`Image MIME mismatch: header ${contentType}, bytes ${detected.mime}`)
  }
  return { bytes, detected, sourceSha256: sha256(bytes) }
}

async function writeVerifiedOriginal(record, type, folder, downloaded) {
  const directory = path.join(sourceImagesDir, "verified", folder)
  const filename = `${record.id}.${downloaded.detected.extension}`
  const absolute = path.join(directory, filename)
  if (!dryRun) {
    await mkdir(directory, { recursive: true })
    let shouldWrite = true
    try {
      shouldWrite = sha256(await readFile(absolute)) !== downloaded.sourceSha256
    } catch {}
    if (shouldWrite) await writeFile(absolute, downloaded.bytes)
  }
  return absolute
}

async function inspectImage(file) {
  const { stdout } = await execFile("magick", ["identify", "-quiet", "-format", "%m %w %h", `${file}[0]`], {
    maxBuffer: 1024 * 1024,
  })
  const [format, width, height] = stdout.trim().split(/\s+/)
  return { format: format.toLowerCase(), width: Number(width), height: Number(height) }
}

async function normalizeToCanvas(input, output, canvas) {
  const tempOutput = path.join(path.dirname(output), `.${path.basename(output)}.${randomUUID()}.tmp.webp`)
  await mkdir(path.dirname(tempOutput), { recursive: true })
  await execFile(
    "magick",
    [
      `${input}[0]`,
      "-auto-orient",
      "-background",
      canvas.matte,
      "-alpha",
      "remove",
      "-alpha",
      "off",
      "-colorspace",
      "sRGB",
      "-filter",
      "Lanczos",
      "-resize",
      `${canvas.width}x${canvas.height}`,
      "-gravity",
      "center",
      "-extent",
      `${canvas.width}x${canvas.height}`,
      "-strip",
      "-quality",
      String(canvas.quality),
      "-define",
      "webp:method=6",
      tempOutput,
    ],
    { maxBuffer: 10 * 1024 * 1024 },
  )
  const outputBytes = await readFile(tempOutput)
  const detected = detectImage(outputBytes)
  const dimensions = await inspectImage(tempOutput)
  if (detected?.extension !== "webp" || dimensions.width !== canvas.width || dimensions.height !== canvas.height) {
    await rm(tempOutput, { force: true })
    throw new Error(`Bad derivative: ${detected?.mime ?? "unknown"} ${dimensions.width}x${dimensions.height}`)
  }
  await rename(tempOutput, output)
  return { derivativeSha256: sha256(outputBytes), dimensions }
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length)
  let cursor = 0
  async function worker() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await mapper(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()))
  return results
}

async function resolveRecord(item, explicitMappings) {
  const { record, type, folder } = item
  const mapping = mappingForRecord(record, type, explicitMappings)
  if (!mapping) {
    return {
      ...item,
      status: "fallback",
      reason: isMentionedOnly(record)
        ? "Mentioned or historical-only entity has no explicit exact AWOIAF mapping."
        : "No exact verified image-page mapping is available.",
    }
  }

  if (offline) {
    return { ...item, status: "fallback", reason: "Offline mode cannot revalidate the mapped canonical page." }
  }

  try {
    const resolved = mapping.directScreenAsset
      ? await resolveDirectScreenAsset(mapping, record, type)
      : await resolveMappedPage(mapping, record, type)
    const downloaded = await downloadExactImage(resolved.imageUrl)
    const inputPath = await writeVerifiedOriginal(record, type, folder, downloaded)
    return { ...item, status: "resolved", mapping, resolved, downloaded, inputPath }
  } catch (error) {
    return { ...item, status: "fallback", reason: error instanceof Error ? error.message : String(error), mapping }
  }
}

function rejectDuplicateSources(results) {
  const byHash = new Map()
  for (const result of results) {
    if (result.status !== "resolved") continue
    const hash = result.downloaded.sourceSha256
    byHash.set(hash, [...(byHash.get(hash) ?? []), result])
  }
  const duplicates = []
  for (const [hash, group] of byHash) {
    if (group.length < 2) continue
    const labels = group.map((result) => `${result.type}:${result.record.id}`).join(", ")
    duplicates.push({ hash, labels })
    for (const result of group) {
      result.status = "fallback"
      result.reason = `Source image duplicates another entity (${labels}); shared hashes require an explicit approval.`
    }
  }
  return duplicates
}

function fallbackMetadata(reason) {
  return {
    provider: "Local archive fallback",
    kind: "fallback",
    match: "none",
    uncertain: false,
    reason,
    url: null,
    assetUrl: null,
  }
}

function exactSourceMetadata(result, derivative) {
  const host = new URL(result.resolved.pageUrl).hostname
  return {
    provider: providerByHost[host],
    kind: result.resolved.directScreenAsset ? "direct_screen_asset" : result.type === "house" ? "wiki_sigil" : "wiki_lead_image",
    match: result.resolved.directScreenAsset ? "exact_api_record" : "exact_page_title",
    uncertain: false,
    url: result.resolved.pageUrl,
    assetUrl: result.resolved.imageUrl,
    accessed,
    originalSha256: result.downloaded.sourceSha256,
    derivativeSha256: derivative.derivativeSha256,
    width: derivative.dimensions.width,
    height: derivative.dimensions.height,
    presentation: "proportional_resize_with_padding",
  }
}

function addReferenceSource(record, result) {
  const host = new URL(result.resolved.pageUrl).hostname
  const provider = providerByHost[host]
  const nextSource = {
    label: `${provider} — ${result.resolved.pageTitle}`,
    url: result.resolved.pageUrl,
    provider,
    kind: "reference_page",
    accessed,
  }
  return [
    ...new Map([...(record.sources ?? []), nextSource].filter((source) => source?.url).map((source) => [source.url, source])).values(),
  ]
}

async function readPublicManifest() {
  try {
    return JSON.parse(await readFile(publicManifestPath, "utf8"))
  } catch {
    return null
  }
}

async function ensurePhysicalPublicDirectory() {
  try {
    const info = await lstat(publicImagesDir)
    if (info.isSymbolicLink()) {
      await unlink(publicImagesDir)
      await mkdir(publicImagesDir, { recursive: true })
    } else if (!info.isDirectory()) {
      throw new Error(`${publicImagesDir} exists but is not a directory`)
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error
    await mkdir(publicImagesDir, { recursive: true })
  }
}

async function directorySize(directory) {
  let total = 0
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) total += await directorySize(absolute)
    else if (entry.isFile()) total += (await stat(absolute)).size
  }
  return total
}

async function validatePublishedMedia(datasets, canvas) {
  const errors = []
  const successfulHashes = new Map()
  let fallbackCount = 0
  let exactCount = 0
  for (const dataset of datasets) {
    for (const record of dataset.rows) {
      if (!record.image?.startsWith("/images/")) {
        errors.push(`${dataset.type}:${record.id} has a non-public image path`)
        continue
      }
      const relative = record.image.slice("/images/".length)
      const absolute = path.resolve(publicImagesDir, relative)
      if (!absolute.startsWith(`${publicImagesDir}${path.sep}`)) {
        errors.push(`${dataset.type}:${record.id} image escapes the public image directory`)
        continue
      }
      try {
        await access(absolute)
      } catch {
        errors.push(`${dataset.type}:${record.id} is missing ${record.image}`)
        continue
      }
      const bytes = await readFile(absolute)
      const detected = detectImage(bytes)
      const extension = path.extname(absolute).slice(1).toLowerCase()
      if (!detected || detected.extension !== extension) errors.push(`${dataset.type}:${record.id} has a MIME/extension mismatch`)

      if (record.imageSource?.kind === "fallback") {
        fallbackCount += 1
        if (extension !== "svg") errors.push(`${dataset.type}:${record.id} fallback is not SVG`)
        continue
      }

      exactCount += 1
      const expectedMatch = record.imageSource?.kind === "direct_screen_asset" ? "exact_api_record" : "exact_page_title"
      if (record.imageSource?.uncertain !== false || record.imageSource?.match !== expectedMatch) {
        errors.push(`${dataset.type}:${record.id} is not marked as an exact canonical-page match`)
      }
      if (record.imageSource?.kind === "direct_screen_asset" && (dataset.type !== "character" || isMentionedOnly(record))) {
        errors.push(`${dataset.type}:${record.id} uses a direct screen asset outside the depicted-character policy`)
      }
      if (isMentionedOnly(record) && record.imageSource?.provider !== "A Wiki of Ice and Fire") {
        errors.push(`${dataset.type}:${record.id} is mentioned-only but does not use AWOIAF`)
      }
      if (dataset.type === "house" && record.imageSource?.provider !== "A Wiki of Ice and Fire") {
        errors.push(`${dataset.type}:${record.id} sigil does not use AWOIAF`)
      }
      if (extension !== "webp") errors.push(`${dataset.type}:${record.id} raster derivative is not WebP`)
      try {
        const dimensions = await inspectImage(absolute)
        if (dimensions.width !== canvas.width || dimensions.height !== canvas.height) {
          errors.push(`${dataset.type}:${record.id} is ${dimensions.width}x${dimensions.height}, expected ${canvas.width}x${canvas.height}`)
        }
      } catch (error) {
        errors.push(`${dataset.type}:${record.id} cannot be decoded: ${error.message}`)
      }
      const sourceHash = record.imageSource?.originalSha256
      if (sourceHash) successfulHashes.set(sourceHash, [...(successfulHashes.get(sourceHash) ?? []), `${dataset.type}:${record.id}`])
    }
  }
  for (const [hash, records] of successfulHashes) {
    if (records.length > 1) errors.push(`Unapproved shared source hash ${hash}: ${records.join(", ")}`)
  }
  const bytes = await directorySize(publicImagesDir)
  if (bytes >= 90 * 1024 * 1024) errors.push(`Public images are ${(bytes / 1024 / 1024).toFixed(1)} MB (must stay below 90 MB)`)
  if (errors.length) throw new Error(`Media validation failed:\n- ${errors.join("\n- ")}`)
  return { exactCount, fallbackCount, bytes }
}

const explicitManifest = JSON.parse(await readFile(explicitManifestPath, "utf8"))
const canvas = explicitManifest.canvas
const datasets = await Promise.all(
  datasetSpecs.map(async (spec) => ({ ...spec, rows: JSON.parse(await readFile(path.join(datasetsDir, spec.file), "utf8")) })),
)

if (validateOnly) {
  const validation = await validatePublishedMedia(datasets, canvas)
  console.log(`Validated ${validation.exactCount} exact images and ${validation.fallbackCount} explicit fallbacks.`)
  console.log(`Physical public image payload: ${(validation.bytes / 1024 / 1024).toFixed(2)} MB.`)
  process.exit(0)
}

const items = datasets.flatMap((dataset) =>
  dataset.rows.map((record) => ({ record, type: dataset.type, folder: dataset.folder, dataset })),
).filter((item) => !onlyKeys.size || onlyKeys.has(`${item.type}:${item.record.id}`)).slice(0, limit)

if (!dryRun && (Number.isFinite(limit) || onlyKeys.size)) {
  throw new Error("--limit and --only are allowed only with --dry-run so a partial run cannot rewrite the archive")
}

let completed = 0
const results = await mapWithConcurrency(items, 6, async (item) => {
  const result = await resolveRecord(item, explicitManifest.entities)
  completed += 1
  if (completed % 25 === 0 || completed === items.length) console.log(`Resolved image mappings: ${completed}/${items.length}`)
  return result
})
const duplicateSources = rejectDuplicateSources(results)

if (dryRun) {
  const exact = results.filter((result) => result.status === "resolved")
  const fallback = results.filter((result) => result.status === "fallback")
  console.log(`Dry run: ${exact.length} exact mapped images, ${fallback.length} explicit fallbacks.`)
  for (const result of fallback) console.log(`  fallback ${result.type}:${result.record.id} — ${result.reason}`)
  if (duplicateSources.length) {
    console.log("Rejected duplicate source images:")
    for (const duplicate of duplicateSources) console.log(`  ${duplicate.hash} — ${duplicate.labels}`)
  }
  process.exit(0)
}

const previousPublicManifest = await readPublicManifest()
await ensurePhysicalPublicDirectory()
for (const type of Object.keys(fallbackLabels)) {
  await writeFile(path.join(publicImagesDir, `fallback-${type}.svg`), fallbackSvg(type, canvas))
}

const outputManifestRows = []
const generatedFiles = new Set(Object.keys(fallbackLabels).map((type) => `fallback-${type}.svg`))
for (const result of results) {
  const { record, type, folder } = result
  if (result.status === "fallback") {
    record.image = `/images/fallback-${type}.svg`
    record.imageSource = fallbackMetadata(result.reason)
    outputManifestRows.push({ type, id: record.id, status: "fallback", reason: result.reason })
    continue
  }

  const relativeOutput = path.join(folder, `${record.id}.webp`)
  const absoluteOutput = path.join(publicImagesDir, relativeOutput)
  await mkdir(path.dirname(absoluteOutput), { recursive: true })
  const derivative = await normalizeToCanvas(result.inputPath, absoluteOutput, canvas)
  record.image = `/images/${relativeOutput.split(path.sep).join("/")}`
  record.imageSource = exactSourceMetadata(result, derivative)
  record.sources = addReferenceSource(record, result)
  generatedFiles.add(relativeOutput)
  outputManifestRows.push({
    type,
    id: record.id,
    status: "exact",
    pageTitle: result.resolved.pageTitle,
    pageUrl: result.resolved.pageUrl,
    assetUrl: result.resolved.imageUrl,
    originalSha256: result.downloaded.sourceSha256,
    derivativeSha256: derivative.derivativeSha256,
    output: record.image,
  })
}

const publicManifest = {
  version: explicitManifest.version,
  generatedAt: new Date().toISOString(),
  policy: "Exact canonical page mappings only; proportional resize and padding without crop or stretch.",
  canvas,
  generatedFiles: [...generatedFiles].sort(),
  records: outputManifestRows,
}
await writeFile(publicManifestPath, `${JSON.stringify(publicManifest, null, 2)}\n`)

for (const previous of previousPublicManifest?.generatedFiles ?? []) {
  if (generatedFiles.has(previous)) continue
  const absolute = path.resolve(publicImagesDir, previous)
  if (absolute.startsWith(`${publicImagesDir}${path.sep}`)) await rm(absolute, { force: true })
}

await Promise.all(
  datasets.map((dataset) => writeFile(path.join(datasetsDir, dataset.file), `${JSON.stringify(dataset.rows, null, 2)}\n`)),
)

const validation = await validatePublishedMedia(datasets, canvas)
console.log(`Published ${validation.exactCount} exact images and ${validation.fallbackCount} explicit fallbacks.`)
console.log(`Physical public image payload: ${(validation.bytes / 1024 / 1024).toFixed(2)} MB.`)
if (duplicateSources.length) {
  console.log("Rejected duplicate source images:")
  for (const duplicate of duplicateSources) console.log(`  ${duplicate.hash} — ${duplicate.labels}`)
}
