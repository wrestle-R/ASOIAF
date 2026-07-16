import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { access, mkdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import manifest from "../database-manifest.json" with { type: "json" };

const execFileAsync = promisify(execFile);

const here = path.dirname(fileURLToPath(import.meta.url));
const wikiRoot = path.resolve(here, "..");
const outputDirectory = path.join(wikiRoot, ".data");
const outputPath = path.join(outputDirectory, manifest.assetName);
const temporaryPath = `${outputPath}.download`;
const localSourcePath = path.resolve(wikiRoot, "../dataset/asoiaf.sqlite");
const buildScriptPath = path.resolve(here, "build-web-database.mjs");
const downloadUrl = process.env.ASOIAF_DB_URL || manifest.url;

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function sha256(filePath) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) hash.update(chunk);
  return hash.digest("hex");
}

async function verify(filePath) {
  const file = await stat(filePath);
  if (file.size !== manifest.size) return false;
  return (await sha256(filePath)) === manifest.sha256;
}

async function download() {
  const response = await fetch(downloadUrl, {
    headers: { "user-agent": "map-of-ice-and-fire-vercel-build/2.0" },
    redirect: "follow",
  });

  if (!response.ok || !response.body) {
    throw new Error(`Database download failed with HTTP ${response.status}`);
  }

  await pipeline(Readable.fromWeb(response.body), createWriteStream(temporaryPath));
  await rename(temporaryPath, outputPath);
}

await mkdir(outputDirectory, { recursive: true });

if (await exists(outputPath)) {
  if (await verify(outputPath)) {
    console.log(`SQLite web database ready: ${outputPath}`);
    process.exit(0);
  }
  await rm(outputPath, { force: true });
}

try {
  if (await exists(localSourcePath)) {
    console.log("Building the metadata-only SQLite database from the local dataset…");
    await execFileAsync(process.execPath, [
      buildScriptPath,
      "--source",
      localSourcePath,
      "--output",
      outputPath,
    ]);
  } else {
    console.log(`Downloading metadata database ${manifest.version} from Vercel Blob…`);
    await download();
  }

  if (!(await verify(outputPath))) {
    throw new Error("Database size or SHA-256 did not match database-manifest.json");
  }

  console.log(`SQLite metadata database verified: ${manifest.sha256}`);
} catch (error) {
  await rm(temporaryPath, { force: true });
  await rm(outputPath, { force: true });
  throw error;
}
