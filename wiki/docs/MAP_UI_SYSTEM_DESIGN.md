# Map of Ice and Fire UI system

## Product structure

The experience has three connected surfaces:

- `/` is the autoplaying nine-realm map tour.
- `/home` is the canonical catalogue for all 203 characters.
- `/journeys/:seriesSlug/:characterSlug` is the permanent destination for one character.

The catalogue contains characters only. Houses remain part of the realm-map presentation
and are not mixed into the character index.

## Shared cartography

The realm tour and character journeys use the same original map family. Desktop uses the
`1484 × 1060` world map, while the realm tour uses a dedicated `941 × 1671` portrait map on
phone-sized viewports. Both maps and the nine house sigils are immutable Vercel Blob objects
read from `src/data/blobAssets.json`; no runtime map artwork is shipped from `public/`.

Journey coordinates and SVG curves are presentation overlays. They preserve the underlying
cartography, and the data layer labels the connecting curves as schematic rather than exact
roads or sea lanes.

## Journey states

The six published journeys share one React engine and one visual contract: map camera,
dotted route reveal, moving marker, vignette, season copy, pause/replay, completion overview,
and Back to Home action. Reduced-motion users receive the full map plus explicit season
selection instead of autoplay animation.

Characters whose routes have not yet been sourced still receive their permanent URL. Their
page shows the shared map and an honest charting state without inventing locations or route
segments.

## Responsive behavior

Journey and realm-tour pages are locked to the dynamic viewport on phone-sized screens, with
overscroll disabled and safe-area-aware controls. Edge-touch progression is available without
adding instructional copy over the map. Desktop progression remains keyboard-accessible.

The catalogue is intentionally scrollable and uses a two-column phone grid, fluid desktop
columns, URL-backed search and series filters, and a persistent light/dark preference.

## Verification

With the development server running:

- `npm run verify:map` checks the realm tour, mobile viewport lock, completion, replay, and 404.
- `npm run verify:catalog` checks all 203 unique cards, filters, themes, and responsive layout.
- `npm run verify:journeys` opens all 203 destinations and exercises every published journey
  on desktop, phone, and reduced-motion settings.

Unit tests also enforce the 203/199 database shape, the exact six published characters,
source metadata for every depicted stop, map bounds, and collision-safe canonical URLs.
