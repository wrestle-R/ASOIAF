import { describe, expect, it } from "vitest";
import { PUBLISHED_JOURNEYS } from "../src/data/journeys/publishedJourneys.js";

const CONTINUITY_TOLERANCE = 1;

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

describe("published journey season continuity", () => {
  it("starts each season exactly where the previous season ended", () => {
    for (const journey of Object.values(PUBLISHED_JOURNEYS)) {
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
