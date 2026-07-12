export const INTRO_HOUSE_IDS = Object.freeze([
  "house-stark",
  "house-lannister",
  "house-baratheon",
  "house-targaryen",
  "house-greyjoy",
  "house-tyrell",
  "house-martell",
  "house-arryn",
  "house-tully",
]);

const HOUSE_DOCUMENT_PATH = "dataset/houses.json";

function optionalText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function mapHouseRow(row) {
  let raw;

  try {
    raw = JSON.parse(row.record_json);
  } catch {
    return null;
  }

  const id = optionalText(row.source_id ?? raw.id ?? raw.slug);
  const name = optionalText(raw.name ?? row.full_name);

  if (!id || !name || !INTRO_HOUSE_IDS.includes(id)) {
    return null;
  }

  return {
    id,
    name,
    region: optionalText(raw.region),
    seat: optionalText(raw.seat) ?? optionalText(raw.seats?.[0]),
    words: optionalText(raw.words),
    coatOfArms: optionalText(raw.coatOfArms),
    color: optionalText(raw.color),
  };
}

export function getIntroHouses(database) {
  const placeholders = INTRO_HOUSE_IDS.map(() => "?").join(", ");
  const rows = database
    .prepare(
      `SELECT r.source_id, r.full_name, r.record_json
       FROM records AS r
       JOIN json_documents AS d ON d.id = r.document_id
       WHERE d.path = ?
         AND r.source_id IN (${placeholders})`,
    )
    .all(HOUSE_DOCUMENT_PATH, ...INTRO_HOUSE_IDS);

  const byId = new Map(
    rows.map(mapHouseRow).filter(Boolean).map((house) => [house.id, house]),
  );

  return INTRO_HOUSE_IDS.map((id) => byId.get(id)).filter(Boolean);
}
