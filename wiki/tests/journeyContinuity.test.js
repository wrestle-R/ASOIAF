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

  it("carries every season endpoint into the next season origin", () => {
    for (const journey of journeys) {
      for (let index = 1; index < journey.seasons.length; index += 1) {
        const previous = journey.seasons[index - 1];
        const current = journey.seasons[index];
        expect.soft(
          current.continuity?.originPlaceId,
          `${journey.characterName}: seasons ${previous.season}-${current.season}`,
        ).toBe(previous.stops.at(-1).placeId);
      }
    }
  });
});
