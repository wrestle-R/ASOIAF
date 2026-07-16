# Map of Ice and Fire

An atmospheric, map-led React experience for exploring character journeys across the
known world. `/` is the autoplaying nine-realm tour, `/home` is the character catalogue,
and `/journeys/:seriesSlug/:characterSlug` opens an individual journey. Compatibility
routes redirect older links to their canonical destinations.

## Run locally

From the repository root:

```bash
cd wiki
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. The Vite development server proxies `/api` to the read-only
character service on port `4174`.

For a production build:

```bash
npm run build
NODE_ENV=production npm start
```

## Character data and media

For local development, the build can derive a web database from `../dataset/asoiaf.sqlite`.
Hosted builds prepare the verified metadata-only database in the ignored `.data/` directory.
The server opens that file with `readonly` and `fileMustExist` enabled, then enables SQLite's
`query_only` pragma. Character records remain server-side.

Character portraits, maps, and sigils use content-addressed public objects in Vercel Blob.
The tracked asset manifest connects stable character and map keys to immutable object URLs;
the web database stores media metadata and URLs, never image bytes. The database manifest
records the hosted database URL, expected file size, and SHA-256 so preparation fails on a
mismatch.

The current manifest covers 199 source-backed portraits, two responsive maps, and nine
house sigils. The compact v3 SQLite artifact contains all 203 character records and 199
`media_assets` rows, with no image or BLOB table.

The source SQLite dataset stays local and is never included in the frontend bundle or hosted
function.

## Deploy on Vercel

1. Import `wrestle-R/ASOIAF` into Vercel.
2. Set the project **Root Directory** to `wiki`.
3. Keep the detected framework as Vite and deploy.
4. Deploy. The build downloads the verified metadata database from its public Blob URL.

The prepared database is included only in the Node API function, not in the static site or
browser bundle. `vercel.json` includes the verified `.data/asoiaf.sqlite` artifact. Browser
media loads directly from Vercel Blob rather than passing through the API function.

To test the hosted build process locally:

```bash
cd wiki
npm run prepare:db
npm run check
```

## Image and aspect-ratio policy

- The original generated map is `1484 × 1060` (`1.40:1`) and is rendered with a fixed
  intrinsic aspect ratio. It is never stretched.
- Character images were audited before layout work: the source data contains square,
  portrait, and landscape files. Cards preserve recorded dimensions, use a consistent
  portrait crop, and fall back to a monogram when no source-backed portrait exists.
- The realm tour reuses the canonical Blob-hosted house sigils and never changes map geography.
- The supplied reference map was used only for broad composition. The project map is an
  original generated asset without copied labels, logos, or line work.

## Asset updates

Realm metadata and camera framing live in `src/data/realmTour.js`. When source portraits,
maps, or sigils change, pull `BLOB_READ_WRITE_TOKEN` into the ignored `.env.local` file and
run `npm run sync:blob`. Deployment reads the tracked content-addressed manifest and does not
need the write token.

Portrait sources come from the local dataset. To publish replacement map or sigil artwork,
point `ASOIAF_STATIC_ASSET_ROOT` at a local directory containing the same `world-map-*.webp`
and `houses/house-*.webp` layout. When those files are absent, sync safely reuses the immutable
objects already recorded in the manifest.

```bash
npm run sync:blob
npm run build:web-db
npm run prepare:db
```

## Checks

```bash
npm run check
```

This runs the unit tests and production Vite build. With the development server running,
`npm run verify:map`, `npm run verify:catalog`, and `npm run verify:journeys` exercise the
realm tour, all-character catalogue, and character journey experiences.
