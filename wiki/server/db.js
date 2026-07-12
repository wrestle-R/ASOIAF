import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

function resolveDatabasePath() {
  const candidates = [
    process.env.ASOIAF_DB_PATH,
    path.resolve(here, "../.data/asoiaf.sqlite"),
    path.resolve(here, "../../dataset/asoiaf.sqlite"),
  ].filter(Boolean);

  const databasePath = candidates.find((candidate) => fs.existsSync(candidate));

  if (!databasePath) {
    throw new Error(
      "ASOIAF SQLite database not found. Run `npm run prepare:db` from wiki/.",
    );
  }

  return databasePath;
}

let database;

export function getDatabase() {
  if (!database) {
    database = new Database(resolveDatabasePath(), {
      readonly: true,
      fileMustExist: true,
    });
    database.pragma("query_only = ON");
    database.pragma("foreign_keys = ON");
  }

  return database;
}

export function closeDatabase() {
  if (database) {
    database.close();
    database = undefined;
  }
}
