import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../server/app.js";
import {
  CHARACTER_SERIES,
  CharacterQueryError,
  getCharacter,
  getCharacters,
} from "../server/characterQueries.js";
import { getDatabase } from "../server/db.js";

const database = getDatabase();

function getEveryCharacter() {
  const characters = [];

  for (let offset = 0; offset < 203; offset += 60) {
    characters.push(
      ...getCharacters(database, { limit: 60, offset }).characters,
    );
  }

  return characters;
}

describe("character catalogue queries", () => {
  it("returns exactly 203 characters and excludes every house record", () => {
    const result = getCharacters(database, { limit: 60 });
    const characters = getEveryCharacter();

    expect(result.total).toBe(203);
    expect(characters).toHaveLength(203);
    expect(CHARACTER_SERIES.map((series) => series.slug)).toEqual([
      "game-of-thrones",
      "house-of-the-dragon",
      "a-knight-of-the-seven-kingdoms",
    ]);
    expect(
      characters.every((character) =>
        CHARACTER_SERIES.some(
          (series) => series.slug === character.seriesSlug,
        ),
      ),
    ).toBe(true);
    expect(characters.some((character) => character.name === "House Stark")).toBe(
      false,
    );
  });

  it("publishes exactly the six approved journeys and orders them first", () => {
    const result = getCharacters(database, { limit: 60 });

    expect(result.published).toBe(6);
    expect(result.pending).toBe(197);
    expect(
      result.characters.slice(0, 6).map((character) => character.name),
    ).toEqual([
      "Arya Stark",
      "Brienne of Tarth",
      "Cersei Lannister",
      "Daenerys Targaryen",
      "Jon Snow",
      "Tyrion Lannister",
    ]);
    expect(
      result.characters.slice(0, 6).every(
        (character) => character.journeyStatus === "published",
      ),
    ).toBe(true);
  });

  it("filters by series and search before applying pagination", () => {
    const gameOfThrones = getCharacters(database, {
      series: "game-of-thrones",
      limit: 60,
    });
    const houseOfTheDragon = getCharacters(database, {
      series: "house-of-the-dragon",
      limit: 60,
    });
    const knight = getCharacters(database, {
      series: "a-knight-of-the-seven-kingdoms",
      limit: 60,
    });
    const stark = getCharacters(database, { search: "stark", limit: 2 });

    expect(gameOfThrones.total).toBe(100);
    expect(gameOfThrones.published).toBe(6);
    expect(houseOfTheDragon.total).toBe(77);
    expect(houseOfTheDragon.published).toBe(0);
    expect(knight.total).toBe(26);
    expect(knight.published).toBe(0);
    expect(stark.total).toBeGreaterThan(2);
    expect(stark.characters).toHaveLength(2);
    expect(
      stark.characters.every((character) =>
        [character.name, character.family, ...character.aliases]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes("stark")),
      ),
    ).toBe(true);

    const secondPage = getCharacters(database, { limit: 10, offset: 10 });
    expect(secondPage.total).toBe(203);
    expect(secondPage.characters).toHaveLength(10);
    expect(secondPage.characters[0]).toEqual(getEveryCharacter()[10]);
  });

  it("caps page size at 60 and rejects malformed filters", () => {
    expect(getCharacters(database, { limit: 999 }).limit).toBe(60);
    expect(() => getCharacters(database, { series: "unknown-series" })).toThrow(
      CharacterQueryError,
    );
    expect(() => getCharacters(database, { limit: "many" })).toThrow(
      CharacterQueryError,
    );
    expect(() => getCharacters(database, { offset: -1 })).toThrow(
      CharacterQueryError,
    );
  });

  it("creates unique series-scoped routes including both Viserys records", () => {
    const characters = getEveryCharacter();
    const routeKeys = characters.map(
      (character) => `${character.seriesSlug}/${character.characterSlug}`,
    );
    const viserys = characters.filter((character) =>
      character.name.toLowerCase().includes("viserys"),
    );

    expect(new Set(routeKeys).size).toBe(203);
    expect(viserys.map((character) => character.journeyUrl).sort()).toEqual([
      "/journeys/game-of-thrones/viserys-targaryen",
      "/journeys/house-of-the-dragon/viserys-i-targaryen",
      "/journeys/house-of-the-dragon/viserys-targaryen",
    ]);
  });

  it("exposes only the approved public shape for all 203 characters", () => {
    const characters = getEveryCharacter();
    const daenerys = getCharacter(
      database,
      "game-of-thrones",
      "daenerys-targaryen",
    );
    const characterKeys = [
      "recordId",
      "id",
      "seriesSlug",
      "seriesName",
      "characterSlug",
      "name",
      "title",
      "family",
      "aliases",
      "portrait",
      "journeyStatus",
      "journeyUrl",
    ];

    expect(characters.every((character) =>
      JSON.stringify(Object.keys(character)) === JSON.stringify(characterKeys),
    )).toBe(true);
    expect(characters.filter((character) => character.portrait)).toHaveLength(199);
    expect(characters.filter((character) => !character.portrait)).toHaveLength(4);
    expect(Object.keys(daenerys.portrait)).toEqual([
      "id",
      "url",
      "width",
      "height",
    ]);
    expect(daenerys.portrait.url).toMatch(
      /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\/characters\//,
    );
    expect(daenerys.portrait.width).toBeGreaterThan(0);
    expect(daenerys.portrait.height).toBeGreaterThan(0);
    for (const character of characters) {
      expect(character).not.toHaveProperty("image");
      expect(character).not.toHaveProperty("imageUrl");
      expect(character).not.toHaveProperty("imageSource");
      expect(character).not.toHaveProperty("sources");
      expect(character).not.toHaveProperty("record_json");
    }
  });

  it("looks up characters by their series and character slugs", () => {
    const jon = getCharacter(database, "game-of-thrones", "jon-snow");

    expect(jon).toMatchObject({
      name: "Jon Snow",
      journeyStatus: "published",
      journeyUrl: "/journeys/game-of-thrones/jon-snow",
    });
    expect(
      getCharacter(database, "house-of-the-dragon", "jon-snow"),
    ).toBeNull();
    expect(getCharacter(database, "unknown", "jon-snow")).toBeNull();
  });
});

describe("character catalogue API", () => {
  let server;
  let origin;

  beforeAll(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, "127.0.0.1", () => {
        const address = server.address();
        origin = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("serves list and lookup endpoints and retires wiki endpoints", async () => {
    const listResponse = await fetch(
      `${origin}/api/characters?series=game-of-thrones&search=jon`,
    );
    const list = await listResponse.json();
    const characterResponse = await fetch(
      `${origin}/api/characters/game-of-thrones/jon-snow`,
    );
    const character = await characterResponse.json();
    const retiredWikiResponse = await fetch(`${origin}/api/wiki/entries`);
    const retiredMediaResponse = await fetch(`${origin}/api/media/1`);

    expect(listResponse.status).toBe(200);
    expect(list.total).toBeGreaterThan(0);
    expect(list.characters.some((entry) => entry.name === "Jon Snow")).toBe(true);
    expect(characterResponse.status).toBe(200);
    expect(character.character.name).toBe("Jon Snow");
    expect(retiredWikiResponse.status).toBe(404);
    expect(retiredMediaResponse.status).toBe(404);
  });

  it("returns useful 400 and 404 responses", async () => {
    const invalid = await fetch(`${origin}/api/characters?series=invalid`);
    const invalidBody = await invalid.json();
    const missing = await fetch(
      `${origin}/api/characters/game-of-thrones/not-a-character`,
    );
    const missingBody = await missing.json();

    expect(invalid.status).toBe(400);
    expect(invalidBody).toEqual({ error: "invalid-series" });
    expect(missing.status).toBe(404);
    expect(missingBody).toEqual({ error: "character-not-found" });
  });
});
