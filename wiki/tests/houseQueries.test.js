import { describe, expect, it } from "vitest";
import { getDatabase } from "../server/db.js";
import {
  getIntroHouses,
  INTRO_HOUSE_IDS,
  mapHouseRow,
} from "../server/houseQueries.js";

describe("intro house query", () => {
  it("returns exactly the nine canonical houses in display order", () => {
    const houses = getIntroHouses(getDatabase());

    expect(houses).toHaveLength(9);
    expect(houses.map((house) => house.id)).toEqual(INTRO_HOUSE_IDS);
    expect(new Set(houses.map((house) => house.id)).size).toBe(9);
  });

  it("whitelists fields and drops database image metadata", () => {
    const house = mapHouseRow({
      source_id: "house-stark",
      full_name: "House Stark",
      record_json: JSON.stringify({
        name: "House Stark",
        region: "The North",
        image: "/forbidden.webp",
        imageSource: { provider: "third-party" },
        sources: [{ url: "https://example.com" }],
      }),
    });

    expect(house).toEqual({
      id: "house-stark",
      name: "House Stark",
      region: "The North",
      seat: null,
      words: null,
      coatOfArms: null,
      color: null,
    });
    expect(house).not.toHaveProperty("image");
    expect(house).not.toHaveProperty("imageSource");
  });

  it("rejects malformed and unexpected records", () => {
    expect(mapHouseRow({ source_id: "house-stark", record_json: "{" })).toBeNull();
    expect(
      mapHouseRow({
        source_id: "house-unknown",
        record_json: JSON.stringify({ name: "House Unknown" }),
      }),
    ).toBeNull();
  });
});
