import { list, put } from "@vercel/blob";
import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import {
  access,
  mkdir,
  readFile,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const wikiRoot = path.resolve(here, "..");
const sourcePath = path.resolve(wikiRoot, "../dataset/asoiaf.sqlite");
const assetsRoot = path.resolve(
  process.env.ASOIAF_STATIC_ASSET_ROOT || path.resolve(wikiRoot, "public/assets"),
);
const manifestPath = path.resolve(wikiRoot, "src/data/blobAssets.json");
const databasePath = path.resolve(wikiRoot, ".data/asoiaf.sqlite");
const databaseManifestPath = path.resolve(wikiRoot, "database-manifest.json");
const envPath = path.resolve(wikiRoot, ".env.local");
const cacheSeconds = 365 * 24 * 60 * 60;

let previousAssetManifest = null;
try {
  previousAssetManifest = JSON.parse(await readFile(manifestPath, "utf8"));
} catch {
  // The first sync requires local map and sigil sources. Later syncs can reuse
  // the immutable objects recorded by the tracked manifest.
}

try {
  await access(envPath);
  if (!process.env.BLOB_READ_WRITE_TOKEN) process.loadEnvFile(envPath);
} catch {
  // CI can provide BLOB_READ_WRITE_TOKEN directly without a local env file.
}

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  throw new Error(
    "BLOB_READ_WRITE_TOKEN is required. Pull it into wiki/.env.local first.",
  );
}

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

function slug(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function existingBlobs() {
  const blobs = new Map();
  let cursor;

  do {
    const page = await list({ cursor, limit: 1000, token });
    for (const blob of page.blobs) blobs.set(blob.pathname, blob);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return blobs;
}

async function uploadAssets(assets, existing) {
  const results = new Map();
  let nextIndex = 0;
  let uploaded = 0;
  let reused = 0;

  async function worker() {
    while (nextIndex < assets.length) {
      const asset = assets[nextIndex];
      nextIndex += 1;
      const current = existing.get(asset.pathname);

      if (current) {
        if (current.size !== asset.bytes) {
          throw new Error(
            `Blob size mismatch for immutable key ${asset.pathname}`,
          );
        }
        results.set(asset.pathname, current);
        reused += 1;
        continue;
      }

      const body = await asset.body();
      const uploadedBlob = await put(asset.pathname, body, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: false,
        cacheControlMaxAge: cacheSeconds,
        contentType: asset.mimeType,
        token,
      });
      results.set(asset.pathname, { ...uploadedBlob, size: asset.bytes });
      uploaded += 1;
      if (uploaded % 20 === 0) {
        console.log(`Uploaded ${uploaded} new immutable assets…`);
      }
    }
  }

  await Promise.all(Array.from({ length: 3 }, () => worker()));
  console.log(`Blob sync complete: ${uploaded} uploaded, ${reused} reused.`);
  return results;
}

const SERIES_BY_DOCUMENT = new Map([
  ["gameofthrone.json", "game-of-thrones"],
  ["houseofthedragon.json", "house-of-the-dragon"],
  ["knightofthesevenkingdoms.json", "a-knight-of-the-seven-kingdoms"],
]);

const database = new Database(sourcePath, { readonly: true, fileMustExist: true });
database.pragma("query_only = ON");

const portraitRows = database
  .prepare(`
    SELECT r.id AS record_id,
           r.source_id,
           r.full_name,
           r.record_json,
           d.path AS document_path,
           i.id AS image_id,
           i.mime_type,
           i.byte_size,
           i.sha256
    FROM records AS r
    JOIN json_documents AS d ON d.id = r.document_id
    JOIN record_images AS ri
      ON ri.record_id = r.id AND ri.json_path = '$.image'
    JOIN images AS i ON i.id = ri.image_id
    WHERE d.path IN (
      'gameofthrone.json',
      'houseofthedragon.json',
      'knightofthesevenkingdoms.json'
    )
    ORDER BY r.id
  `)
  .all();

if (portraitRows.length !== 199) {
  database.close();
  throw new Error(`Expected 199 sourced portraits, found ${portraitRows.length}`);
}

const usedSlugs = new Map();
const portraitAssets = portraitRows.map((row) => {
  const seriesSlug = SERIES_BY_DOCUMENT.get(row.document_path);
  const raw = JSON.parse(row.record_json);
  const name = raw.fullName ?? raw.name ?? row.full_name;
  const seriesSlugs = usedSlugs.get(seriesSlug) ?? new Set();
  const baseSlug = slug(name) || `character-${row.record_id}`;
  let characterSlug = baseSlug;
  if (seriesSlugs.has(characterSlug)) {
    const suffix = slug(raw.id ?? row.source_id) || row.record_id;
    characterSlug = `${baseSlug}-${suffix}`;
    let collision = 2;
    while (seriesSlugs.has(characterSlug)) {
      characterSlug = `${baseSlug}-${suffix}-${collision}`;
      collision += 1;
    }
  }
  seriesSlugs.add(characterSlug);
  usedSlugs.set(seriesSlug, seriesSlugs);

  const width = Number(raw.imageSource?.outputWidth);
  const height = Number(raw.imageSource?.outputHeight);
  if (!(width > 0 && height > 0)) {
    throw new Error(`Portrait dimensions are missing for record ${row.record_id}`);
  }

  const pathname = `characters/${seriesSlug}/${characterSlug}/${row.sha256.slice(0, 16)}.webp`;
  return {
    kind: "character",
    key: `${seriesSlug}/${characterSlug}`,
    pathname,
    recordId: row.record_id,
    imageId: row.image_id,
    width,
    height,
    mimeType: row.mime_type || "image/webp",
    bytes: row.byte_size,
    sha256: row.sha256,
    body: async () =>
      database.prepare("SELECT data FROM images WHERE id = ?").pluck().get(row.image_id),
  };
});

const staticSpecs = [
  {
    kind: "map",
    key: "world",
    source: "world-map-houses.webp",
    prefix: "maps/world",
    width: 1484,
    height: 1060,
  },
  {
    kind: "map",
    key: "mobile",
    source: "world-map-realms-mobile-capitals.webp",
    prefix: "maps/mobile",
    width: 941,
    height: 1671,
  },
  ...[
    "house-stark",
    "house-arryn",
    "house-tully",
    "house-greyjoy",
    "house-lannister",
    "house-tyrell",
    "house-baratheon",
    "house-martell",
    "house-targaryen",
  ].map((key) => ({
    kind: "sigil",
    key,
    source: `houses/${key}.webp`,
    prefix: `sigils/${key}`,
    width: 1200,
    height: 1320,
  })),
];

const staticAssets = await Promise.all(
  staticSpecs.map(async (spec) => {
    const sourcePathname = path.resolve(assetsRoot, spec.source);
    let data;
    try {
      data = await readFile(sourcePathname);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;

      const section = spec.kind === "map" ? "maps" : "sigils";
      const previous = previousAssetManifest?.[section]?.[spec.key];
      if (!previous?.pathname || !previous?.sha256 || !previous?.bytes) {
        throw new Error(
          `Static source is missing and no published manifest entry exists: ${sourcePathname}`,
        );
      }

      return {
        ...spec,
        pathname: previous.pathname,
        mimeType: previous.mimeType || "image/webp",
        bytes: previous.bytes,
        sha256: previous.sha256,
        width: previous.width || spec.width,
        height: previous.height || spec.height,
        body: async () => {
          throw new Error(`Published static asset is missing from Blob: ${previous.pathname}`);
        },
      };
    }

    const digest = sha256(data);
    return {
      ...spec,
      pathname: `${spec.prefix}/${digest.slice(0, 16)}.webp`,
      mimeType: "image/webp",
      bytes: data.byteLength,
      sha256: digest,
      body: async () => data,
    };
  }),
);

const existing = await existingBlobs();
const assets = [...portraitAssets, ...staticAssets];
const uploaded = await uploadAssets(assets, existing);

const publicAsset = (asset) => {
  const blob = uploaded.get(asset.pathname);
  return {
    url: blob.url,
    pathname: asset.pathname,
    sha256: asset.sha256,
    width: asset.width,
    height: asset.height,
    mimeType: asset.mimeType,
    bytes: asset.bytes,
    ...(asset.recordId
      ? { recordId: asset.recordId, imageId: asset.imageId }
      : {}),
  };
};

const assetManifest = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  maps: Object.fromEntries(
    staticAssets
      .filter((asset) => asset.kind === "map")
      .map((asset) => [asset.key, publicAsset(asset)]),
  ),
  sigils: Object.fromEntries(
    staticAssets
      .filter((asset) => asset.kind === "sigil")
      .map((asset) => [asset.key, publicAsset(asset)]),
  ),
  characters: Object.fromEntries(
    portraitAssets.map((asset) => [asset.key, publicAsset(asset)]),
  ),
};

await mkdir(path.dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(assetManifest, null, 2)}\n`);
database.close();

await execFileAsync(process.execPath, [
  path.resolve(here, "build-web-database.mjs"),
  "--source",
  sourcePath,
  "--output",
  databasePath,
]);

const databaseData = await readFile(databasePath);
const databaseSha = sha256(databaseData);
const databaseKey = `data/asoiaf-web/${databaseSha.slice(0, 16)}.sqlite`;
const existingDatabaseBlob = existing.get(databaseKey);
if (existingDatabaseBlob && existingDatabaseBlob.size !== databaseData.byteLength) {
  throw new Error(`Blob size mismatch for immutable key ${databaseKey}`);
}
const databaseBlob = existingDatabaseBlob
  ? existingDatabaseBlob
  : await put(databaseKey, databaseData, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: false,
      cacheControlMaxAge: cacheSeconds,
      contentType: "application/vnd.sqlite3",
      token,
    });
const databaseStats = await stat(databasePath);

const databaseManifest = {
  version: "3.0.0",
  assetName: "asoiaf.sqlite",
  url: databaseBlob.url,
  objectKey: databaseKey,
  size: databaseStats.size,
  sha256: databaseSha,
};
await writeFile(
  databaseManifestPath,
  `${JSON.stringify(databaseManifest, null, 2)}\n`,
);

console.log(
  `Published metadata database (${databaseStats.size} bytes, ${databaseSha.slice(0, 12)}…).`,
);
