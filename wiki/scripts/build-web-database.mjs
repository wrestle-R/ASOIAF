import Database from "better-sqlite3";
import { access, mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import blobAssets from "../src/data/blobAssets.json" with { type: "json" };

const here = path.dirname(fileURLToPath(import.meta.url));
const wikiRoot = path.resolve(here, "..");

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

const sourcePath = path.resolve(
  process.cwd(),
  argument("--source", path.resolve(wikiRoot, "../dataset/asoiaf.sqlite")),
);
const outputPath = path.resolve(
  process.cwd(),
  argument("--output", path.resolve(wikiRoot, ".data/asoiaf.sqlite")),
);
const temporaryPath = `${outputPath}.build`;

try {
  await access(sourcePath);
} catch {
  throw new Error(`Source SQLite database was not found: ${sourcePath}`);
}

await mkdir(path.dirname(outputPath), { recursive: true });
await rm(temporaryPath, { force: true });

const source = new Database(sourcePath, { readonly: true, fileMustExist: true });
const target = new Database(temporaryPath);

try {
  source.pragma("query_only = ON");
  target.pragma("journal_mode = DELETE");
  target.pragma("synchronous = FULL");
  target.pragma("foreign_keys = ON");

  target.exec(`
    CREATE TABLE json_documents (
      id INTEGER PRIMARY KEY,
      path TEXT NOT NULL UNIQUE,
      sha256 TEXT NOT NULL,
      record_count INTEGER NOT NULL
    );

    CREATE TABLE records (
      id INTEGER PRIMARY KEY,
      document_id INTEGER NOT NULL REFERENCES json_documents(id),
      ordinal INTEGER NOT NULL,
      source_id TEXT,
      full_name TEXT,
      record_json TEXT NOT NULL,
      UNIQUE(document_id, ordinal)
    );

    CREATE INDEX idx_records_document ON records(document_id);
    CREATE INDEX idx_records_full_name ON records(full_name);

    CREATE TABLE media_assets (
      record_id INTEGER PRIMARY KEY REFERENCES records(id),
      image_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      object_key TEXT NOT NULL UNIQUE,
      width INTEGER NOT NULL CHECK(width > 0),
      height INTEGER NOT NULL CHECK(height > 0),
      mime_type TEXT NOT NULL,
      byte_size INTEGER NOT NULL CHECK(byte_size > 0),
      sha256 TEXT NOT NULL
    );

    CREATE INDEX idx_media_assets_image_id ON media_assets(image_id);
  `);

  const documents = source
    .prepare(`
      SELECT id, path, sha256, record_count
      FROM json_documents
      WHERE path IN (
        'gameofthrone.json',
        'houseofthedragon.json',
        'knightofthesevenkingdoms.json'
      )
      ORDER BY id
    `)
    .all();
  const records = source
    .prepare(`
      SELECT r.id,
             r.document_id,
             r.ordinal,
             r.source_id,
             r.full_name,
             r.record_json
      FROM records AS r
      JOIN json_documents AS d ON d.id = r.document_id
      WHERE d.path IN (
        'gameofthrone.json',
        'houseofthedragon.json',
        'knightofthesevenkingdoms.json'
      )
      ORDER BY r.id
    `)
    .all();

  if (documents.length !== 3 || records.length !== 203) {
    throw new Error(
      `Unexpected source shape: ${documents.length} documents and ${records.length} records`,
    );
  }

  const media = Object.values(blobAssets.characters ?? {}).sort(
    (left, right) => left.recordId - right.recordId,
  );
  if (media.length !== 199) {
    throw new Error(`Expected 199 portrait assets, found ${media.length}`);
  }

  const insertDocument = target.prepare(`
    INSERT INTO json_documents (id, path, sha256, record_count)
    VALUES (@id, @path, @sha256, @record_count)
  `);
  const insertRecord = target.prepare(`
    INSERT INTO records (
      id, document_id, ordinal, source_id, full_name, record_json
    ) VALUES (
      @id, @document_id, @ordinal, @source_id, @full_name, @record_json
    )
  `);
  const insertMedia = target.prepare(`
    INSERT INTO media_assets (
      record_id, image_id, url, object_key, width, height,
      mime_type, byte_size, sha256
    ) VALUES (
      @recordId, @imageId, @url, @pathname, @width, @height,
      @mimeType, @bytes, @sha256
    )
  `);

  target.transaction(() => {
    for (const document of documents) insertDocument.run(document);
    for (const record of records) insertRecord.run(record);
    for (const asset of media) insertMedia.run(asset);
  })();

  target.pragma("user_version = 3");
  const integrity = target.pragma("integrity_check", { simple: true });
  if (integrity !== "ok") {
    throw new Error(`Generated database failed integrity_check: ${integrity}`);
  }

  const counts = target
    .prepare(`
      SELECT
        (SELECT COUNT(*) FROM records) AS records,
        (SELECT COUNT(*) FROM media_assets) AS media
    `)
    .get();
  if (counts.records !== 203 || counts.media !== 199) {
    throw new Error(`Generated database has invalid counts: ${JSON.stringify(counts)}`);
  }

  target.exec("VACUUM");
} finally {
  target.close();
  source.close();
}

await rm(outputPath, { force: true });
await rename(temporaryPath, outputPath);
console.log(`Web database ready: ${outputPath}`);
