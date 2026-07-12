import { describe, expect, it } from "vitest";
import { getDatabase } from "../server/db.js";
import { getCollections, getWikiEntries, mapWikiRow } from "../server/wikiQueries.js";

describe("wiki queries", () => {
  it("reports every SQLite collection and record count", () => {
    const collections = getCollections(getDatabase());
    expect(collections).toHaveLength(4);
    expect(collections.reduce((sum, item) => sum + item.count, 0)).toBe(248);
  });

  it("searches the SQLite archive and returns mapped entries", () => {
    const result = getWikiEntries(getDatabase(), { search: "Stark", limit: 12 });
    expect(result.total).toBeGreaterThan(0);
    expect(result.entries.length).toBeGreaterThan(0);
    expect(result.entries.every((entry) => entry.name)).toBe(true);
  });

  it("does not expose raw image paths or source objects", () => {
    const entry = mapWikiRow({
      id: 1,
      source_id: "house-stark",
      full_name: "House Stark",
      document_path: "dataset/houses.json",
      image_id: 42,
      record_json: JSON.stringify({
        name: "House Stark",
        image: "/raw.webp",
        imageSource: { provider: "source" },
        sources: [{ provider: "source" }],
      }),
    });

    expect(entry.media).toBeNull();
    expect(entry).not.toHaveProperty("image");
    expect(entry).not.toHaveProperty("imageSource");
    expect(entry).not.toHaveProperty("sources");
  });
});
