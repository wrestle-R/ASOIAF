import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { REALM_MAPS, REALM_TOUR } from "../src/data/realmTour.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mapPath = path.join(root, "public", REALM_MAPS.desktop.image.replace(/^\//, ""));
const outputDirectory = path.join(root, "public", "assets", "nine-realms");
const workDirectory = mkdtempSync(path.join(tmpdir(), "asoiaf-realms-"));

mkdirSync(outputDirectory, { recursive: true });

function overlayFor(realm) {
  const { x, y, radius } = realm.camera.desktop;
  const { x: capitalX, y: capitalY } = realm.capital.desktop;
  const { x: sigilX, y: sigilY } = realm.sigil.desktop;
  const outerRadius = radius * 1.7;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1484" height="1060" viewBox="0 0 1484 1060">
  <defs>
    <radialGradient id="focus" cx="${x}%" cy="${y}%" r="${outerRadius}%">
      <stop offset="0" stop-color="${realm.color}" stop-opacity="0.19"/>
      <stop offset="0.38" stop-color="#e1c68d" stop-opacity="0.09"/>
      <stop offset="1" stop-color="#071012" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="shade" cx="${x}%" cy="${y}%" r="${outerRadius * 1.45}%">
      <stop offset="0" stop-color="#061013" stop-opacity="0"/>
      <stop offset="0.52" stop-color="#061013" stop-opacity="0.08"/>
      <stop offset="1" stop-color="#061013" stop-opacity="0.52"/>
    </radialGradient>
  </defs>
  <rect width="1484" height="1060" fill="#061013" opacity="0.12"/>
  <rect width="1484" height="1060" fill="url(#focus)"/>
  <rect width="1484" height="1060" fill="url(#shade)"/>
  <line x1="${capitalX}%" y1="${capitalY}%" x2="${sigilX}%" y2="${sigilY}%"
    stroke="#dec58f" stroke-opacity="0.78" stroke-width="1.5"/>
</svg>`;
}

try {
  for (const realm of REALM_TOUR) {
    const overlayPath = path.join(workDirectory, `${realm.id}.svg`);
    const outputPath = path.join(root, "public", realm.poster.replace(/^\//, ""));
    const sigilPath = path.join(root, "public", "assets", "houses", `${realm.houseId}.webp`);
    const sigilSize = 67;
    const x = Math.round(REALM_MAPS.desktop.width * realm.sigil.desktop.x / 100 - sigilSize / 2);
    const y = Math.round(REALM_MAPS.desktop.height * realm.sigil.desktop.y / 100 - sigilSize / 2);

    writeFileSync(overlayPath, overlayFor(realm));
    execFileSync("magick", [
      mapPath,
      "(", "-background", "none", overlayPath, ")",
      "-compose", "over",
      "-composite",
      "(", sigilPath, "-resize", `${sigilSize}x${sigilSize}`, ")",
      "-geometry", `+${x}+${y}`,
      "-compose", "over",
      "-composite",
      "-strip",
      "-quality", "88",
      outputPath,
    ]);
    console.log(`Rendered ${path.basename(outputPath)}`);
  }
} finally {
  rmSync(workDirectory, { recursive: true, force: true });
}
