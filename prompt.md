# Build Prompt: Wiki of Ice and Fire — Map Intro Experience (v3)

## Product brief

Build the intro and landing screen for an SQLite-backed lore website called
**Wiki of Ice and Fire**.

This task covers only the opening experience. Do not build the full wiki, character
pages, search, timelines, authentication, admin tools, or a complete house browser yet.

The landing screen introduces exactly these nine main houses:

1. House Stark
2. House Lannister
3. House Baratheon
4. House Targaryen
5. House Greyjoy
6. House Tyrell
7. House Martell
8. House Arryn
9. House Tully

The tone is a living archival map: atmospheric, tactile, restrained, and readable.
It should feel like the opening page of a serious fantasy wiki, not a game menu,
streaming-service splash screen, or generic card dashboard.

---

## Supplied map reference — use this composition

The supplied reference image establishes the geographic composition and visual rhythm:

- Westeros occupies the left side of a wide world map.
- Essos occupies the right side and provides scale and atmosphere.
- The Narrow Sea creates valuable negative space through the center.
- North remains at the top.
- Land is warm parchment/ochre; water is deep desaturated blue-charcoal.
- Coastlines, rivers, forests, and mountain marks feel hand-inked and archival.
- The map is a flat atlas, not a globe. Do not add a 3D globe to this task.

Use this spatial composition deliberately:

- Westeros is the interactive area and receives all nine house markers.
- Essos is contextual background only. Dim it slightly so it never competes with the
  interactive Westeros markers.
- Place the **Wiki of Ice and Fire** title in the open upper-center sea area, where the
  supplied image currently contains another title.
- Use the lower-center/right sea as the preferred space for a selected-house detail panel,
  keeping important land and markers visible.
- Preserve geographic breathing room. Do not cover the map with a nine-card grid.

### Important map asset rule

Treat the supplied image as a composition and art-direction reference. It contains a
third-party title treatment and must not be shipped directly as the website background.
Do not reproduce, trace, or crop around that embedded title. Use an original or properly
licensed replacement map with the same broad Westeros-left / Essos-right composition.

If the user later provides a cleared project-ready map asset, place it at
`public/assets/world-map.webp` and preserve its intrinsic aspect ratio. Until then, create
a neutral original placeholder that communicates the same land/sea layout without copying
the reference's line work or labels.

---

## Non-negotiable SQLite data rule

`dataset/asoiaf.sqlite` is the only runtime source for lore facts.

- Query house facts from SQLite at runtime. Do not import source JSON files.
- Do not create `houses.js`, `houses.json`, hard-coded house records, or a second lore
  dataset for the frontend.
- Do not call an external lore API or scrape a wiki at runtime.
- Do not invent missing values. Omit missing fields cleanly.
- A static allowlist may contain only the nine canonical IDs. It must contain no names,
  seats, words, regions, descriptions, colors, or other lore facts.
- Map coordinates and label offsets are presentation metadata, not lore records. They may
  live in a small `mapPositions.js` file keyed only by canonical house ID.
- If SQLite fails, show a useful error state. Never silently fall back to hard-coded data.

### Confirmed database contract

The existing SQLite artifact uses these tables:

- `json_documents`
- `records`
- `images`
- `record_images`

The house dataset is stored as the `json_documents` row whose path is
`dataset/houses.json`. House rows are in `records`, with canonical IDs in `source_id`,
names in `full_name`, and the complete house object in `record_json`.

The nine confirmed IDs are:

```text
house-stark
house-lannister
house-baratheon
house-targaryen
house-greyjoy
house-tyrell
house-martell
house-arryn
house-tully
```

Query by `json_documents.path = 'dataset/houses.json'` and parameterized `source_id`
values. Parse `record_json`, then whitelist the fields the intro is allowed to receive:

```js
{
  id,
  name,
  region,
  seat,
  words,
  coatOfArms,
  color
}
```

The mapper must explicitly drop `image`, `imageSource`, `imageUrl`, `sources`, and all
other unneeded fields so third-party artwork cannot accidentally reach the UI.

Use one parameterized query, conceptually:

```sql
SELECT r.source_id, r.full_name, r.record_json
FROM records AS r
JOIN json_documents AS d ON d.id = r.document_id
WHERE d.path = ?
  AND r.source_id IN (?, ?, ?, ?, ?, ?, ?, ?, ?);
```

Bind every value. Do not interpolate identifiers into SQL strings. Preserve the display
order listed in the product brief after mapping the query result.

---

## Application architecture

Use React, Vite, Tailwind CSS, and plain JavaScript.

The SQLite file is large and contains image BLOBs, so do not download the entire database
into the browser for this intro. Use a small read-only Node server that queries
`dataset/asoiaf.sqlite` and returns only the nine mapped house records.

```text
src/
  components/
    intro/
      IntroScene.jsx
      MapLanding.jsx
      HouseMarker.jsx
      HouseDetailPanel.jsx
      SigilIcon.jsx
  data/
    houseApi.js
    mapPositions.js
  hooks/
    useReducedMotion.js
  App.jsx
server/
  db.js
  houseQueries.js
  index.js
public/
  assets/
    world-map.webp
```

### Server responsibilities

- Open the existing `dataset/asoiaf.sqlite` in read-only mode.
- Expose one narrow endpoint such as `GET /api/intro/houses`.
- Run the parameterized nine-house query and map/whitelist fields on the server.
- Return a typed database error without exposing stack traces or filesystem details.
- Never write to the SQLite file.
- In production, serve the Vite build and API from the same Node process unless the
  repository already provides an equivalent deployment arrangement.

### Client responsibilities

- Fetch only `/api/intro/houses`.
- Distinguish loading, database failure, empty result, partial result, and success states.
- Require exactly nine unique canonical IDs. If fewer are returned, show the houses that
  loaded plus a restrained partial-data notice; do not fabricate the missing houses.
- Keep the fetched result in memory for intro replay. Replaying animation must not refetch.

---

## Intro sequence

Create one carefully orchestrated 6–8 second sequence. It must be skippable and play once
per browser session.

1. Begin with a near-black textured field and a faint horizontal glint where the map will
   appear.
2. Ice-blue frost lines travel inward from the north-west/left while ember-orange motes
   travel inward from the east/right.
3. Their convergence reveals the original world map as if ink and coastline marks are
   emerging from darkness. Use a mask, clip-path, canvas reveal, or shader; avoid a hard cut.
4. The title **Wiki of Ice and Fire** resolves in the upper-center sea with a small subtitle:
   **An archive of the known world**. This subtitle is interface copy, not a lore claim.
5. Westeros gains a subtle warm lift while Essos settles into lower contrast.
6. The nine house markers appear in a north-to-south stagger, like pins being placed on an
   old chart.

Show **Skip intro** after about one second. Store completion in `sessionStorage` under
`wiof:introComplete`. On reload in the same session, show the completed map immediately.
Provide a small **Replay intro** control after completion; replaying is visual only and
must not clear session state or re-query SQLite.

The intro is silent. Do not add autoplay audio.

### Reduced motion and failure fallback

When `prefers-reduced-motion` is enabled, skip the animated reveal and immediately show
the static completed map. If canvas/WebGL is used and initialization fails, use the same
static fallback. The core landing screen must never depend on WebGL.

---

## Desktop map composition

Use a full-viewport atlas stage with the map centered and rendered using `object-fit:
contain`. Add restrained dark letterboxing when the viewport aspect ratio differs from
the map; never stretch the map.

Layers, back to front:

1. charcoal page background;
2. original/licensed map image;
3. subtle vignette and fine grain;
4. interactive house-marker layer using the same intrinsic map coordinate space;
5. title and small utility controls;
6. selected-house detail panel.

All marker coordinates must be percentages relative to the map's intrinsic width and
height—not viewport coordinates—so they stay attached while the map scales.

Use the following seat anchors as the design intent:

| House ID | Map anchor |
|---|---|
| `house-stark` | Winterfell, northern Westeros |
| `house-greyjoy` | Pyke, Iron Islands off the western coast |
| `house-tully` | Riverrun, central-west Riverlands |
| `house-arryn` | The Eyrie, east-central Vale |
| `house-lannister` | Casterly Rock, western coast |
| `house-tyrell` | Highgarden, south-west Reach |
| `house-baratheon` | Storm's End, south-east Stormlands |
| `house-targaryen` | Dragonstone, island east of King's Landing |
| `house-martell` | Sunspear, far south-east Dorne |

Calibrate exact percentage coordinates against the final `world-map.webp`, then store only
`{ x, y, labelOffset }` under each canonical ID in `mapPositions.js`. Do not guess final
percentages before the real asset is present. Add a development-only marker calibration
overlay that can display the map grid and pointer coordinates; it must not ship enabled.

### Marker design

Each marker is a compact original seal:

- 36–44px on desktop, at least a 44px hit target;
- thin metallic ring, dark center, generated sigil motif;
- short leader line and house name label on focus/hover;
- selected state uses the house's SQLite-backed `color` as a restrained halo;
- labels use collision-aware offsets so Riverlands/Vale/Crownlands markers do not overlap.

Markers must be real `<button>` elements. Avoid generic map pins and giant crests.

### Selection behavior

Selecting a marker must not navigate. It should:

1. gently dim the unselected markers;
2. draw a fine route/leader line from the marker into the open Narrow Sea;
3. reveal `HouseDetailPanel` in the sea area with name, words, region, seat, and full
   coat-of-arms text when present;
4. preserve the map beneath instead of replacing the entire screen.

The panel should resemble an archival annotation: parchment-dark translucent surface,
hairline border, asymmetric spacing, compact metadata rows, and one original sigil. Do
not make it look like a standard SaaS modal or dashboard card.

---

## Mobile map composition

Do not shrink the entire world map until its labels and markers become unusable.

- Use a tall viewport focused on Westeros.
- Render the same map in a pannable/zoomable container or use a controlled Westeros crop
  derived from the same asset.
- Preserve the same percentage coordinate system and marker data.
- Keep pinch zoom optional, but support one-finger pan and a **Reset map** control if zoom
  or pan is enabled.
- Selecting a marker opens the house detail as a bottom sheet, leaving enough of the map
  visible to retain geographic context.
- Do not rely on hover. A first tap selects and opens the panel.
- Keep title treatment compact and outside the marker-dense part of Westeros.

---

## Generated sigils and asset policy

- Do not render the SQLite house `image` or any image BLOB for these house seals.
- Do not copy or trace show/wiki/published sigils, logos, or title typography.
- Generate small original SVG motifs from `color` plus keyword matching against
  `coatOfArms`: wolf, lion, stag, dragon, kraken, rose, sun, trout, and falcon.
- Keep the icon set geometric and stylistically consistent: one-color silhouette or line
  motif, limited detail, consistent stroke width.
- If `coatOfArms` or `color` is absent, use a neutral typographic monogram derived from the
  queried house name. Do not invent heraldry.
- Use a distinctive open display serif and a highly readable book serif or humanist sans
  for metadata. Do not imitate the title visible in the supplied reference.

Suggested palette:

```css
--ink: #101518;
--sea: #24333a;
--sea-deep: #172329;
--parchment: #c7ad67;
--parchment-light: #dfcf9b;
--line: #88754a;
--ice: #a8d8e8;
--ember: #c9673d;
--text: #eee5cf;
--muted: #b9ad94;
```

Use CSS variables and restrained texture/noise. Avoid purple gradients, glassmorphism,
neon effects, oversized rounded cards, and excessive glow.

---

## Accessibility

- Every marker is keyboard focusable with an `aria-label` such as
  `"House Stark, The North"`, using queried values.
- Use visible focus rings with sufficient contrast.
- Enter/Space opens the selected house; Escape closes the panel.
- Trap focus inside the open detail panel and restore focus to the originating marker.
- The visual map is enhanced navigation, not the only access path. Include a visually
  restrained **Houses on this map** disclosure/list that exposes all nine buttons in DOM
  order for screen readers and users who struggle with spatial interfaces.
- Use a logical north-to-south keyboard order independent of absolute CSS positioning.
- Announce database and partial-data errors through an `aria-live` region.
- Maintain WCAG AA contrast for text, controls, focus states, and panel content.

---

## Loading and error states

- Loading: show the empty map frame with a quiet animated ink line and
  **Opening the archive…**.
- Database error: retain the page shell and explain that the local archive could not be
  opened, with a retry control.
- Empty result: explain that no intro house records were returned from SQLite.
- Partial result: render valid returned houses and state how many of nine are available.
- Map asset failure: retain markers in a simplified parchment coordinate field and show a
  non-blocking map-unavailable notice. House data should remain usable.

---

## Testing and verification

Add focused tests for:

- the row mapper with complete and missing optional fields;
- explicit removal of `image`, `imageSource`, and other unapproved fields;
- the parameterized query returning exactly the nine canonical IDs;
- duplicate or unexpected IDs being rejected;
- map-position coverage for every allowed house ID;
- marker keyboard interaction and detail-panel focus restoration;
- reduced-motion behavior and intro session persistence.

Before completion, verify:

- all visible lore facts trace to `dataset/asoiaf.sqlite`;
- exactly nine main-house markers appear;
- marker positions stay attached at desktop and mobile sizes;
- the supplied reference's embedded title and artwork are not shipped;
- no JSON lore import, external lore request, or hard-coded house object exists;
- the SQLite connection is read-only and the browser does not download the full DB;
- loading, error, empty, partial, and map-failure states work;
- keyboard, screen-reader path, mobile interaction, and reduced motion work;
- lint, tests, and production build pass.

---

## Deliverables

1. Working intro and map landing screen for the nine houses.
2. Read-only SQLite API/query layer using `dataset/asoiaf.sqlite`.
3. Responsive desktop map and mobile Westeros view.
4. Original generated SVG house seals.
5. Accessible detail panel plus non-spatial house list.
6. Focused tests and a concise README explaining setup, SQLite access, map asset placement,
   map-coordinate calibration, and troubleshooting.

Do not implement anything beyond this intro scope until a later prompt explicitly asks
for the next wiki section.
