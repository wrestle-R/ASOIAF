import compression from "compression";
import express from "express";
import {
  CharacterQueryError,
  getCharacter,
  getCharacters,
} from "./characterQueries.js";
import { getDatabase } from "./db.js";

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

app.get("/api/characters", (request, response) => {
  try {
    response.json(
      getCharacters(getDatabase(), {
        search: request.query.search,
        series: request.query.series,
        limit: request.query.limit,
        offset: request.query.offset,
      }),
    );
  } catch (error) {
    if (error instanceof CharacterQueryError) {
      response.status(400).json({ error: error.code });
      return;
    }

    response.status(503).json({ error: "database-unavailable" });
  }
});

app.get("/api/characters/:seriesSlug/:characterSlug", (request, response) => {
  try {
    const character = getCharacter(
      getDatabase(),
      request.params.seriesSlug,
      request.params.characterSlug,
    );
    if (!character) {
      response.status(404).json({ error: "character-not-found" });
      return;
    }

    response.json({ character });
  } catch {
    response.status(503).json({ error: "database-unavailable" });
  }
});

app.use((error, _request, response, _next) => {
  console.error("Unhandled character request error", error);
  if (!response.headersSent) {
    response.status(500).json({ error: "character-request-failed" });
  }
});

export default app;
