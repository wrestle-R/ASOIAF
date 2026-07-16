# Map of Ice and Fire Visual Verification

`npm run verify:map` checks the root nine-realm tour and the editorial 404 experience.
`npm run verify:catalog` checks the responsive character catalogue, and
`npm run verify:journeys` checks every character destination.

- `/` renders one persistent map, no clickable markers, and the correct desktop or portrait artwork.
- Every realm has one connector line and one prominent sigil, without an extra capital endpoint circle.
- Pause freezes the current realm and camera, resume advances the tour, and Dorne transitions to a clean complete map.
- The complete map exposes Replay and Explore Characters; Replay returns to the North.
- Portrait and landscape phone cameras cover the viewport without exposing empty map edges.
- `/map` and other unknown paths remain on their requested URL and render the branded 404.

The catalogue check confirms the 203 unique character cards, six published journeys,
197 pending journey states, series/search filters, persistent theme, canonical links, and
the two-column phone layout.

The journey check opens every character route. It exercises all six mapped journeys on
desktop, phone, and reduced-motion settings; verifies full-route completion, replay, Back
to Home, viewport locking, and edge-touch navigation; then confirms every pending character
renders a source-honest charting state on the shared map.

Screenshots are written below `artifacts/screenshots/` in `map-verification/`,
`catalog-verification/`, and `character-journeys/`.
