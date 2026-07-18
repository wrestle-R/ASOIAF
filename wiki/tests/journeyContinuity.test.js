import { beforeAll, describe, expect, it } from "vitest";
import { loadAllPublishedJourneys } from "../src/data/journeys/publishedJourneys.js";

let journeys;

beforeAll(async () => {
  journeys = await loadAllPublishedJourneys();
});

describe("published journey path continuity", () => {
  it("uses one consecutive SVG subpath per season", () => {
    for (const journey of journeys) {
      for (const season of journey.seasons) {
        expect.soft(
          season.path.match(/\bM\b/g),
          `${journey.characterName}: season ${season.season}`,
        ).toHaveLength(1);
      }
    }
  });
});
