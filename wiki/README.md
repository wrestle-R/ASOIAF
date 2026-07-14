# Wiki of Ice and Fire

An atmospheric React archive backed directly by the local SQLite artifact. `/` is a quiet
entrance, `/map` is an autoplaying nine-realm tour, `/wiki` is the searchable editorial
archive, and `/danerys` preserves the television journey animation.

## Run locally

From the repository root:

```bash
cd wiki
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. The Vite development server proxies `/api` to the read-only
archive server on port `4174`.

For a production build:

```bash
npm run build
NODE_ENV=production npm start
```

## SQLite access

For local development, the server finds `../dataset/asoiaf.sqlite`. For hosted builds,
`npm run prepare:db` downloads the verified v2.0.0 database from GitHub Releases into the
ignored `wiki/.data/` directory. The server opens that file with `readonly` and
`fileMustExist` enabled, then sets SQLite's `query_only` pragma. Lore data is never copied
into frontend JSON.

The release URL, expected file size, and SHA-256 live in `database-manifest.json`. The build
fails if the downloaded asset does not match the manifest.

The database is deliberately kept server-side because it contains hundreds of image BLOBs.

## Deploy on Vercel

1. Import `wrestle-R/ASOIAF` into Vercel.
2. Set the project **Root Directory** to `wiki`.
3. Keep the detected framework as Vite and deploy.
4. Ensure Fluid Compute is enabled. New projects created after June 30, 2026 are enrolled
   in Large Functions automatically. For an older Vercel project, add
   `VERCEL_SUPPORT_LARGE_FUNCTIONS=1` to the project environment variables and redeploy.

The build downloads:

```text
https://github.com/wrestle-R/ASOIAF/releases/download/v2.0.0/asoiaf.sqlite
```

The database is included only in the Node API function, not in the static site and not in
the browser bundle. `vercel.json` configures the function for a 300-second maximum duration
and includes the verified `.data/asoiaf.sqlite` artifact. Embedded media is sent in chunks
through the function's streaming response path.

To test the hosted build process locally:

```bash
cd wiki
npm run prepare:db
npm run check
```

## Image and aspect-ratio policy

- The original generated map is `1484 × 1060` (`1.40:1`) and is rendered with a fixed
  intrinsic aspect ratio. It is never stretched.
- Embedded database images were audited before layout work: the archive contains square,
  portrait, and landscape files. Cards receive their recorded intrinsic ratio and use
  media-specific `object-fit` behavior.
- The realm tour reuses the retained canonical house sigils and never changes map geography.
- The supplied reference map was used only for broad composition. The project map is an
  original generated asset without copied labels, logos, or line work.

## Realm-tour assets

Realm metadata and camera framing live in `src/data/realmTour.js`. Regenerate all nine
reduced-motion posters deterministically with `npm run render:realm-assets`; each poster
uses the exact map, a restrained parchment spotlight, and the corresponding retained sigil.

## Checks

```bash
npm run check
```

This runs the unit tests and production Vite build. With the development server running,
`npm run verify:map`, `npm run verify:wiki`, and `npm run verify:journey` exercise the three
browser experiences.
