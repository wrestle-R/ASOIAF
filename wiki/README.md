# A Map of Ice and Fire

A map-led React experience for character journeys across Westeros and Essos.

- `/` — the nine-realm tour.
- `/home` — the searchable character index, with series and ready-journey filters.
- `/journeys/:seriesSlug/:characterSlug` — a character's published journey or coverage status.
- `/docs` — the archives: six searchable reader and contributor guides.

## Development

From the repository root:

```bash
cd wiki
npm install
npm run dev
```

Vite runs at `http://127.0.0.1:5173` and proxies `/api` to the character service
at port `4174`. Use a Node version supported by the installed Vite and
better-sqlite3 packages (Node 22.12+ satisfies the current Vite 7 requirement).

## Production preview

```bash
npm run build
```

Run `npm start` in one terminal for the API, and `npm run preview` in another
for the built frontend. The Node service serves the API only. On Vercel, set the
project root directory to `wiki`; `vercel.json` configures the static build, API
function, and client-route rewrites.

The build prepares a read-only, metadata-only SQLite database. When the local
source dataset is unavailable, preparation downloads the published database and
verifies its size and SHA-256. Source datasets and media bytes never enter the
browser bundle or the API function. Published media loads from Vercel Blob.

## Checks

```bash
npm run check
```

With the development server running:

```bash
npm run verify:catalog
npm run verify:docs
npm run verify:map
npm run verify:journeys
```

The archive check covers all articles, body search, keyboard access, mobile
navigation, clipboard commands, deep links, missing articles, and both themes at
1440px, 390px, and 320px widths. Screenshots are local ignored artifacts.

## Interface and performance

The character index and archives share Newsreader headings, Geist body text,
parchment/charcoal themes, restrained brass accents, and fine rules. The site name
is **A Map of Ice and Fire** throughout the interface and sharing metadata.

The catalogue includes featured journeys, responsive series filters, filter reset,
and a progress indicator for loaded characters. Cinematic map screens share a
persistent masthead and explicit previous/next controls alongside keyboard and
touch navigation. The archives use numbered guides and section outlines.

The compass emblem combines a frost branch and a flame. Its SVG source lives in
`public/brand-mark.svg`. Run `npm run build:brand` to regenerate the favicon, app
icons, and social card using the installed Playwright Chromium browser. Brand
assets are committed, so production builds do not need a browser.

Page components load on demand. Character journey data remains separately loaded
per character. Only Latin font subsets are bundled; other characters use the
configured system fallback. Above-the-fold character portraits load eagerly;
remaining portraits load lazily.

The API reuses an immutable processed catalogue per read-only database connection.
Successful public responses use `max-age=60`, `s-maxage=300`, and
`stale-while-revalidate=600`. Closing and replacing a connection creates a fresh
catalogue; do not mutate a dataset through an existing connection.

Filter state lives in the URL, including `status=published` for ready journeys.
Obsolete catalogue requests are aborted so late responses cannot replace newer
filter results.

Edit archive content in `src/data/docs.js`. Search indexes article titles,
paragraphs, instructions, lists, and code commands. This curated guide content is
tracked with the app; it does not depend on local ignored files under `md/`.
