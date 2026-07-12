const COLLECTION_LABELS = Object.freeze({
  "gameofthrone.json": "Game of Thrones",
  "houseofthedragon.json": "House of the Dragon",
  "knightofthesevenkingdoms.json": "A Knight of the Seven Kingdoms",
  "dataset/houses.json": "Houses of Westeros",
});

function cleanText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function cleanDescription(value) {
  const text = cleanText(value);
  if (!text) return null;

  return text
    .replace(/\|\s*[A-Za-z]+\s*=\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function ratioFromRecord(raw, isHouse) {
  if (isHouse) return null;

  const source = raw.imageSource ?? {};
  const width = Number(
    source.outputWidth ?? source.width ?? source.sourceWidth ?? 0,
  );
  const height = Number(
    source.outputHeight ?? source.height ?? source.sourceHeight ?? 0,
  );

  if (width > 0 && height > 0) {
    return { width, height, ratio: width / height };
  }

  return raw.image ? { width: 1, height: 1, ratio: 1 } : null;
}

export function mapWikiRow(row) {
  let raw;

  try {
    raw = JSON.parse(row.record_json);
  } catch {
    return null;
  }

  const isHouse = row.document_path === "dataset/houses.json";
  const id = row.source_id || String(row.id);
  const name = cleanText(raw.name ?? raw.fullName ?? row.full_name);

  if (!name) return null;

  const media = !isHouse && row.image_id
    ? {
        id: row.image_id,
        url: `/api/media/${row.image_id}`,
        ...ratioFromRecord(raw, false),
      }
    : null;

  return {
    id,
    recordId: row.id,
    kind: isHouse ? "house" : "person",
    collection: row.document_path,
    collectionLabel: COLLECTION_LABELS[row.document_path] ?? row.document_path,
    name,
    title: cleanText(raw.title),
    family: cleanText(raw.family),
    region: cleanText(raw.region),
    seat: cleanText(raw.seat) ?? cleanText(raw.seats?.[0]),
    words: cleanText(raw.words),
    coatOfArms: cleanText(raw.coatOfArms),
    color: cleanText(raw.color),
    description: cleanDescription(raw.description),
    portrayedBy: Array.isArray(raw.portrayedBy)
      ? raw.portrayedBy.filter((value) => cleanText(value))
      : [],
    aliases: Array.isArray(raw.aliases)
      ? raw.aliases.filter((value) => cleanText(value)).slice(0, 8)
      : [],
    media,
  };
}

export function getCollections(database) {
  return database
    .prepare(
      `SELECT d.path, COUNT(r.id) AS count
       FROM json_documents AS d
       LEFT JOIN records AS r ON r.document_id = d.id
       GROUP BY d.id, d.path
       ORDER BY d.id`,
    )
    .all()
    .map((row) => ({
      id: row.path,
      label: COLLECTION_LABELS[row.path] ?? row.path,
      count: row.count,
    }));
}

export function getWikiEntries(database, options = {}) {
  const search = cleanText(options.search)?.slice(0, 80) ?? null;
  const collection = cleanText(options.collection);
  const limit = Math.min(Math.max(Number(options.limit) || 18, 1), 48);
  const offset = Math.max(Number(options.offset) || 0, 0);
  const clauses = [];
  const parameters = {};

  if (collection && collection !== "all") {
    clauses.push("d.path = @collection");
    parameters.collection = collection;
  }

  if (search) {
    clauses.push(
      `(LOWER(COALESCE(r.full_name, '')) LIKE @search
       OR LOWER(r.record_json) LIKE @search)`,
    );
    parameters.search = `%${search.toLowerCase()}%`;
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const total = database
    .prepare(
      `SELECT COUNT(*) AS count
       FROM records AS r
       JOIN json_documents AS d ON d.id = r.document_id
       ${where}`,
    )
    .get(parameters).count;

  const rows = database
    .prepare(
      `SELECT r.id, r.source_id, r.full_name, r.record_json,
              d.path AS document_path,
              (
                SELECT ri.image_id
                FROM record_images AS ri
                WHERE ri.record_id = r.id AND ri.json_path = '$.image'
                ORDER BY ri.image_id
                LIMIT 1
              ) AS image_id
       FROM records AS r
       JOIN json_documents AS d ON d.id = r.document_id
       ${where}
       ORDER BY d.id, r.ordinal
       LIMIT @limit OFFSET @offset`,
    )
    .all({ ...parameters, limit, offset });

  return {
    total,
    limit,
    offset,
    entries: rows.map(mapWikiRow).filter(Boolean),
  };
}

export function getWikiEntry(database, recordId) {
  const row = database
    .prepare(
      `SELECT r.id, r.source_id, r.full_name, r.record_json,
              d.path AS document_path,
              (
                SELECT ri.image_id
                FROM record_images AS ri
                WHERE ri.record_id = r.id AND ri.json_path = '$.image'
                ORDER BY ri.image_id
                LIMIT 1
              ) AS image_id
       FROM records AS r
       JOIN json_documents AS d ON d.id = r.document_id
       WHERE r.id = ?`,
    )
    .get(recordId);

  return row ? mapWikiRow(row) : null;
}

export function getMedia(database, imageId) {
  return database
    .prepare(
      `SELECT id, mime_type, byte_size, sha256, data
       FROM images
       WHERE id = ?`,
    )
    .get(imageId);
}
