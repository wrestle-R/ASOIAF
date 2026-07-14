# Nine-Realm Tour Visual Verification

`npm run verify:map` checks the minimal landing and the replacement `/map` tour.

- Landing has only its map backdrop, exact title, and `/wiki` and `/map` actions.
- The live tour renders one persistent map, no clickable markers, and the correct desktop or portrait artwork.
- Pause freezes the current realm and camera, resume advances the tour, Dorne ends playback, and Replay returns to the North.
- Portrait and landscape phone cameras cover the viewport without exposing empty map edges.
- Reduced-motion mode removes autoplay and exposes all nine static realm posters through accessible controls.

Screenshots are written to `artifacts/screenshots/map-verification/`.
