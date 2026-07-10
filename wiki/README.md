# ASOIAF Television Wiki

A minimal, read-only Next.js wiki for the curated characters, dragons, and houses SQLite archive. The browser requests small same-origin JSON responses; SQLite and `sql.js` run only inside the Node.js server runtime.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Without environment variables, development reads `../datasets/asiof.sqlite` directly from the repository. The database and SQL runtime are never exposed from `public/`.

## Vercel and GitHub Releases

Set both server-only variables in Vercel:

```bash
ASOIAF_DATABASE_URL=https://github.com/wrestle-R/ASOIAF/releases/download/v1.0.0/asiof.sqlite
ASOIAF_DATABASE_SHA256=<the 64-character checksum from SHA256SUMS>
```

The URL must point to an immutable release asset. The server downloads it once per warm instance, verifies its SHA-256 checksum before opening it, and clears the in-memory initialization cache after a failure so a later request can retry. Production deliberately refuses to start the archive without both values.

The public API is:

- `GET /api/wiki/entities?type=&q=&page=&pageSize=` — filtered summaries, counts, and pagination. `pageSize` is capped at 48.
- `GET /api/wiki/entities/{type}/{id}` — one complete record with resolved relationships, sources, appearances, and a deduplicated house-member list.

Successful responses include CDN cache headers. Validation errors return `400`, unknown records return `404`, and archive/download failures return `503`.

## Verify

```bash
npm run typecheck
npm run lint
npm run build
```

## Rebuild the database

From the repository root:

```bash
node scripts/build-sql.mjs
```

This regenerates the JSON-derived SQL and SQLite release artifacts.
