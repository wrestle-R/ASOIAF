# Map-first UI system design

## Product direction

The home route is an atlas, not a landing-page campaign. It should paint the map immediately, keep the interface quiet, and let the cartography and house sigils do the work. There is no hero section, blocking loader, or decorative point marker layered over the map.

## Rendering responsibilities

| Layer | Owns | Must not own |
| --- | --- | --- |
| Map artwork | coastlines, realm boundaries, realm names, capital-city rings | interactive behavior or house state |
| Marker data | one desktop and one mobile percentage coordinate per house | city-point coordinates |
| React map layer | sigils, focus/hover labels, selected-house state | duplicate pins or geographic labels |
| shadcn UI layer | buttons, the responsive details sheet, semantic tokens | map geometry |
| API layer | house names, seats, words, arms, and sigil metadata | first paint of the map |

This split means a slow or failed API request never replaces the atlas with a full-screen loader. The map renders first; house controls appear when the nine house records arrive. Errors stay inside a small status surface with a retry action.

## Responsive model

- Desktop (`881px` and wider) uses `world-map-houses.webp` at `1484:1060`.
- Phone and tablet (`880px` and narrower) use `world-map-realms-mobile-capitals.webp` at `941:1671`.
- Each layout has independent sigil coordinates and label directions. A correction for one map must not silently alter the other.
- The selected-house sheet opens from the right on desktop and from the bottom on phone/tablet.
- The Eyrie uses a desktop-only vertical correction so the falcon clears the embedded House Arryn text at every desktop aspect ratio.

## Interaction and accessibility

- Every sigil is a real button with a house-and-region accessible name.
- Hover and keyboard focus reveal the same compact label on desktop.
- Touch focus reveals the label on mobile; activation opens the house sheet.
- Escape and the sheet close control return focus to the opening sigil.
- Reduced-motion mode removes marker entrance motion.

## Playwright correction plan

The `npm run verify:map` suite checks 18 viewports: ultrawide, wide, standard, tall, breakpoint, tablet, modern phones, and a 320px small phone. For each viewport it captures the default map and all nine focused house states.

Automated checks cover:

1. the correct desktop/mobile source image;
2. absence of legacy HTML point markers;
3. every sigil staying inside the rendered map;
4. every visible floating label staying inside the viewport;
5. no collision between a floating label and its sigil;
6. the details sheet opening and closing on representative desktop and mobile sizes;
7. no page or console errors; and
8. reduced-motion behavior.

The final correction loop is: run the full matrix, build desktop/mobile contact sheets, inspect sigils against embedded realm text and capital rings, adjust only the affected layout coordinate or label direction, rerun the full matrix, then finish with unit tests and a production build.
