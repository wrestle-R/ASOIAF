import compression from "compression";
import express from "express";
import { getDatabase } from "./db.js";
import {
  getCollections,
  getMedia,
  getWikiEntries,
  getWikiEntry,
} from "./wikiQueries.js";

const app = express();

app.disable("x-powered-by");
app.use(compression());
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_request, response) => {
  try {
    const database = getDatabase();
    const integrity = database.pragma("quick_check", { simple: true });
    response.json({ ok: integrity === "ok" });
  } catch {
    response.status(503).json({ error: "database-unavailable" });
  }
});

app.get("/api/wiki/collections", (_request, response) => {
  try {
    response.json({ collections: getCollections(getDatabase()) });
  } catch {
    response.status(503).json({ error: "database-unavailable" });
  }
});

app.get("/api/wiki/entries", (request, response) => {
  try {
    response.json(
      getWikiEntries(getDatabase(), {
        search: request.query.search,
        collection: request.query.collection,
        limit: request.query.limit,
        offset: request.query.offset,
      }),
    );
  } catch {
    response.status(503).json({ error: "database-unavailable" });
  }
});

app.get("/api/wiki/entries/:recordId", (request, response) => {
  const recordId = Number(request.params.recordId);

  if (!Number.isInteger(recordId) || recordId < 1) {
    response.status(400).json({ error: "invalid-record-id" });
    return;
  }

  try {
    const entry = getWikiEntry(getDatabase(), recordId);
    if (!entry) {
      response.status(404).json({ error: "entry-not-found" });
      return;
    }
    response.json({ entry });
  } catch {
    response.status(503).json({ error: "database-unavailable" });
  }
});

app.get("/api/media/:imageId", (request, response) => {
  const imageId = Number(request.params.imageId);

  if (!Number.isInteger(imageId) || imageId < 1) {
    response.status(400).end();
    return;
  }

  try {
    const media = getMedia(getDatabase(), imageId);
    if (!media) {
      response.status(404).end();
      return;
    }

    response.set({
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": media.mime_type || "application/octet-stream",
      ETag: `\"${media.sha256}\"`,
    });

    // Write in chunks so large embedded images use Vercel's streaming response path
    // instead of its buffered response-body path.
    response.flushHeaders();
    const chunkSize = 256 * 1024;
    for (let offset = 0; offset < media.data.length; offset += chunkSize) {
      response.write(media.data.subarray(offset, offset + chunkSize));
    }
    response.end();
  } catch {
    if (!response.headersSent) response.status(503);
    response.end();
  }
});

app.use((error, _request, response, _next) => {
  console.error("Unhandled archive request error", error);
  if (!response.headersSent) {
    response.status(500).json({ error: "archive-request-failed" });
  }
});

export default app;
