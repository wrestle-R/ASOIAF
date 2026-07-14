import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DAENERYS_SEASONS,
  getSeasonWaypoints,
  JOURNEY_MAP,
} from "../src/data/daenerysJourney.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const mapPath = join(root, "public/assets/world-map-houses.webp");
const outputDir = join(root, "public/assets/danerys seasons");
const tempDir = mkdtempSync(join(tmpdir(), "daenerys-posters-"));

mkdirSync(outputDir, { recursive: true });

try {
  for (const season of DAENERYS_SEASONS) {
    const overlayPath = join(tempDir, `season-${season.season}.svg`);
    const outputPath = join(outputDir, `season-${String(season.season).padStart(2, "0")}.webp`);
    const waypointRings = getSeasonWaypoints(season)
      .map((place) => `
        <circle
          cx="${place.x}"
          cy="${place.y}"
          r="13"
          fill="none"
          stroke="#0d0b09"
          stroke-width="4"
          stroke-dasharray="2 6"
          stroke-linecap="round"
        />`)
      .join("");

    writeFileSync(overlayPath, `
      <svg xmlns="http://www.w3.org/2000/svg" width="${JOURNEY_MAP.width}" height="${JOURNEY_MAP.height}" viewBox="0 0 ${JOURNEY_MAP.width} ${JOURNEY_MAP.height}">
        <path
          d="${season.path}"
          fill="none"
          stroke="#0d0b09"
          stroke-width="5"
          stroke-dasharray="2 11"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        ${waypointRings}
      </svg>
    `);

    execFileSync("magick", [
      mapPath,
      "(", "-background", "none", overlayPath, ")",
      "-compose", "over",
      "-composite",
      "-quality", "90",
      outputPath,
    ]);
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

console.log(`Rendered ${DAENERYS_SEASONS.length} Daenerys season posters.`);
