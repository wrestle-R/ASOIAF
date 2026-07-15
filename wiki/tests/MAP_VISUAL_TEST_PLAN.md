# Nine-Realm Tour Visual Verification

`npm run verify:map` checks the root nine-realm tour and the editorial 404 experience.

- `/` renders one persistent map, no clickable markers, and the correct desktop or portrait artwork.
- Every realm has one connector line and one prominent sigil, without an extra capital endpoint circle.
- Pause freezes the current realm and camera, resume advances the tour, and Dorne transitions to a clean complete map.
- The complete map exposes Replay and Explore the Wiki; Replay returns to the North.
- Portrait and landscape phone cameras cover the viewport without exposing empty map edges.
- `/map` and other unknown paths remain on their requested URL and render the wiki-styled 404.

Screenshots are written to `artifacts/screenshots/map-verification/`.
