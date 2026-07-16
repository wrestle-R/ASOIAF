import { beforeAll, describe, expect, it } from "vitest";
import { loadAllPublishedJourneys } from "../src/data/journeys/publishedJourneys.js";

const CONTINUITY_TOLERANCE = 1;
let journeys;

function pathEndpoints(path) {
  const numbers = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  return {
    start: { x: numbers[0], y: numbers[1] },
    end: { x: numbers.at(-2), y: numbers.at(-1) },
  };
}

function distance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

beforeAll(async () => {
  journeys = await loadAllPublishedJourneys();
});

describe("published journey season continuity", () => {
  it("starts each active season exactly where the previous active season ended", () => {
    for (const journey of journeys) {
      for (let index = 1; index < journey.seasons.length; index += 1) {
        const previous = journey.seasons[index - 1];
        const current = journey.seasons[index];
        const previousEnd = pathEndpoints(previous.path).end;
        const currentStart = pathEndpoints(current.path).start;

        expect.soft(
          distance(previousEnd, currentStart),
          `${journey.characterName}: season ${previous.season} to season ${current.season}`,
        ).toBeLessThanOrEqual(CONTINUITY_TOLERANCE);
      }
    }
  });
});
