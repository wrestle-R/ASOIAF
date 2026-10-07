import { describe, expect, it } from "vitest";
import { DOC_ARTICLES, searchArticles } from "../src/data/docs.js";

describe("archive search", () => {
  it("returns all guides for whitespace and searches article bodies", () => {
    expect(searchArticles("   ")).toEqual(DOC_ARTICLES);
    expect(searchArticles("KEYBOARD").map((article) => article.slug)).toContain(
      "reading-a-journey",
    );
    expect(searchArticles("sha-256").map((article) => article.slug)).toContain(
      "local-development",
    );
  });
  it("requires every query term within the same article", () => {
    expect(
      searchArticles("database SHA-256").map((article) => article.slug),
    ).toEqual(["local-development"]);
    expect(searchArticles("not-a-real-search-term")).toEqual([]);
  });
});
