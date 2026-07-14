# Map Visual Verification Plan

## Element meanings

- Capital-city points are baked into the desktop and mobile map images.
- Interactive HTML markers contain house sigils only; they never render another point or pin.
- A sigil identifies a house's realm. Its hover or tap label supplies the house name and capital.

## Playwright viewport matrix

Run `npm run verify:map` against the local Vite application. The script covers ultrawide, wide, standard, tall, breakpoint, tablet, modern-phone, and small-phone viewports from 2560×1080 down to 320×568.

For every viewport, capture the default map and all nine individual house states. Also capture desktop and phone cinematic frames, a late Targaryen phone frame, and reduced-motion behavior.

## Automated acceptance checks

- The browser selects the expected desktop or mobile map asset.
- No `.marker-pulse` element exists.
- Every sigil stays inside the visible map stage.
- Every opened label stays inside the viewport and does not overlap its sigil.
- The page emits no browser or console errors.
- Reduced-motion mode skips the cinematic intro.

## Screenshot correction loop

1. Run the complete Playwright matrix.
2. Build desktop and mobile contact sheets from the generated screenshots.
3. Inspect every sigil against baked realm names, capital points, borders, and coastlines.
4. Adjust only the affected layout's percentage coordinate or label direction.
5. Rerun the full matrix after every adjustment; never validate only the corrected viewport.
6. Finish with `npm test` and `npm run build`.

Screenshots are written to `artifacts/screenshots/map-verification/`, which remains ignored by Git.
