# A Wiki of Ice and Fire — Comprehensive Website Animation Brief

## Objective

Implement a coherent animation system for the entire existing **A Wiki of Ice and Fire** website, including the opening cinematic, its seamless handoff into the interactive map at `/`, and restrained motion across the archive experience.

The visitor should feel as if an old atlas of Westeros has awakened, guided them through the Great Houses, carried them into an original dimensional view of the Red Keep, and then returned them gently to the usable map.

This is an **animation-only brief**. Motion may clarify and enrich the existing interface, but it must not become an excuse to redesign any screen.

Preserve the current:

- routes and navigation
- SQLite-backed lore data
- house records and canonical IDs
- interactive map landing
- map markers and detail panels
- typography, colors, spacing, and dark theme
- `Replay intro` and `Enter the archive` actions
- underlying website layout and information architecture

Do not redesign the wiki, add new product sections, alter lore data, or change static layout. Define consistent motion for existing navigation, cards, articles, panels, filters, dialogs, loading states, and other current interface surfaces.

---

## Experience Standard

The opening should feel:

- cinematic but not theatrical
- atmospheric but never noisy
- premium and handcrafted
- calm enough to read
- geographically continuous
- unmistakably Westerosi

The memorable moment is the transition from a flat parchment map into an original, dimensional Red Keep scene. Everything before it should build toward that moment; everything after it should resolve cleanly into the existing map.

The sequence must not resemble a game launcher, streaming ident, slideshow, YouTube intro, or generic website loader.

Never use:

- curtains or panels sliding from the viewport edges
- the existing ice-and-ember collision treatment
- sweeping glints
- a spinner, percentage, or progress bar
- hard cuts or teleportation between regions
- bounce, elastic easing, or spring overshoot
- rapidly spinning sigils
- glowing neon text or markers
- particle explosions, lens flares, or magical portals
- large title scaling
- aggressive camera rotation
- repeated flashes or strobing

The sequence begins from darkness. It does not begin with a loading interface.

---

# 1. Required Visual Assets

## Existing world map

Use the existing project-ready world map for the continental journey. Preserve its intrinsic aspect ratio and keep all camera coordinates relative to the map's intrinsic coordinate system rather than the viewport.

The map remains a flat illustrated atlas. Do not turn the entire world map into a 3D globe or heavily distort its geography.

## Red Keep reference directory

The images in `redkeep/` are **visual references only**. They establish:

- the Red Keep's red-stone massing
- its cliff-top relationship to the water and King's Landing
- the hierarchy of walls, yards, towers, and the central keep
- useful aerial, frontal, and close architectural viewpoints
- the desired sense of height, density, and fortified scale

Do not ship, trace, collage, repaint, or copy these images directly. Do not place one of them full-screen and simulate depth by merely scaling it.

## Original Red Keep artwork

Create a new, original Red Keep scene informed by the architecture and mood of the supplied references. The output must not duplicate any one reference's exact composition, camera angle, line work, textures, lighting, or recognizable photographic details.

The scene should be created specifically for layered 2.5D animation. Produce clean source layers or depth-separated exports for at least:

1. distant sky and sea
2. far King's Landing silhouettes
3. distant haze
4. rear towers and upper keep
5. central keep and major towers
6. curtain walls and secondary buildings
7. front walls, gates, and courtyards
8. cliff face
9. near architectural or foliage foreground
10. light, cloud shadow, mist, and atmospheric overlays

Every layer needs enough transparent overscan to survive camera movement without revealing empty edges.

Art direction:

- premium illustrated realism
- warm red stone against restrained blue-gray sea and sky
- late-afternoon or early-evening directional light
- atmospheric perspective between depth planes
- detailed enough for desktop close-up without becoming photorealistic fan art
- visually compatible with the existing atlas when entering and leaving the scene
- no actors, recognizable show stills, banners with modern logos, or copyrighted title treatments

The original Red Keep scene is an animation asset, not a replacement for the interactive map landing.

---

# 2. Runtime and State Contract

The cinematic plays automatically only when `sessionStorage.getItem("wiof:introComplete") !== "true"`.

Use the existing session key exactly:

```text
wiof:introComplete
```

When the sequence completes or the user skips it:

```js
sessionStorage.setItem("wiof:introComplete", "true");
```

Behavior requirements:

- Play automatically once per browser session.
- Do not replay on every visit to `/` during that session.
- Keep the existing `Replay intro` action after completion.
- Replay is visual only: it must not clear the session flag or refetch house data.
- Reloading or remounting while the session flag exists must show the completed interactive map immediately.
- Never automatically navigate to `/wiki` when the intro completes.
- The final destination is the existing interactive map at `/`.
- The visitor chooses `Enter the archive` themselves.

Represent the sequence with explicit lifecycle states so it can be skipped and cleaned up safely:

```text
idle
→ preloading
→ darkness
→ map-reveal
→ house-journey
→ kings-landing
→ red-keep-transition
→ red-keep-orbit
→ title
→ map-pullback
→ complete
```

Do not begin the visible timeline until critical map, sigil, Red Keep, and audio metadata have either loaded or failed into a supported fallback.

---

# 3. Master Timing

The complete desktop sequence must last **11–15 seconds**. Target approximately **14.5 seconds** in the primary implementation.

Full readability is required. Each house must receive approximately one second of clear visual prominence. Overlap camera travel, text exits, and the next regional highlight rather than shortening the text to an unreadable flash.

Recommended timing:

| Time | Moment |
|---|---|
| 0.00–0.45s | Complete darkness |
| 0.45–1.25s | Full map fades into view |
| 1.25–10.70s | Continuous nine-house journey |
| 10.70–11.35s | Arrival at King's Landing |
| 11.35–12.25s | Map transforms into the layered Red Keep |
| 12.25–13.30s | Desktop hover/orbit and aerial settling |
| 13.30–14.05s | Website title reveal over the aerial pause |
| 14.05–14.55s | Pull back into the completed interactive map |

The final implementation may tune individual moments, but it must remain between 11 and 15 seconds and must not sacrifice house-text readability.

---

# 4. Opening Timeline

## Scene A — Darkness

Duration: approximately `0.45s`.

- Begin with a genuinely black viewport.
- Show no logo, title, loader, spinner, progress indicator, or decorative animation.
- The Skip Intro control may be keyboard-focusable immediately but should remain visually quiet.
- If ambient audio successfully starts, introduce only a nearly inaudible wind bed.
- Do not extend darkness to hide indefinite asset loading.

## Scene B — The atlas appears

Duration: approximately `0.80s`.

- Fade the complete world map into view before moving the camera.
- Allow a short moment in which the visitor can understand the continent's scale.
- Use opacity and a restrained brightness lift, not a circular mask, curtain, glint, fire/ice collision, or expanding wipe.
- Keep the camera nearly still during the first half of the reveal.

Subtle environmental treatment may include:

- nearly static parchment grain
- very slow ocean texture movement
- broad, low-opacity cloud shadows
- a gentle vignette
- soft ambient light drift
- camera sway of only a few pixels

These details must be difficult to notice individually. Nothing should compete with geography or text.

---

# 5. Continuous House Journey

The camera must follow one uninterrupted north-to-south path. It may redirect and slow, but it may never cut, snap, jump, or teleport.

Use this order exactly:

1. **House Stark** — The North — “Winter is Coming.”
2. **House Arryn** — The Vale — “As High as Honor.”
3. **House Tully** — Riverlands — “Family, Duty, Honor.”
4. **House Greyjoy** — Iron Islands — “We Do Not Sow.”
5. **House Lannister** — Westerlands — “Hear Me Roar!”
6. **House Tyrell** — The Reach — “Growing Strong.”
7. **House Baratheon** — Stormlands — “Ours is the Fury.”
8. **House Martell** — Dorne — “Unbowed, Unbent, Unbroken.”
9. **House Targaryen** — King's Landing — “Fire and Blood.”

King's Landing must always be the final destination. Do not pass through or feature it before Dorne.

## Per-house choreography

Each house receives approximately `1.0–1.1s` of primary focus.

For every house:

1. The camera begins easing toward the region while the previous house treatment leaves.
2. The region receives a soft, low-opacity parchment highlight.
3. The sigil fades in with no more than a `0.98 → 1` scale correction.
4. The house name appears first.
5. The region follows approximately `80ms` later.
6. The words follow approximately `80ms` after the region.
7. All three text lines remain simultaneously readable for at least `650ms`.
8. The local highlight, sigil, and copy fade as the camera resumes its journey.

The camera never stops completely for an ordinary house. It slows enough to create a readable visual hold, then continues.

Text should feel printed or engraved into the parchment, not placed inside a modern floating card. Use opacity and at most `8px` of vertical movement. Do not rotate, bounce, glow, or dramatically scale typography.

Keep the complete treatment readable over the map through restrained contrast, a local vignette, or a very subtle text shadow. Do not place a heavy opaque panel behind it.

House cues may overlap by approximately `100–160ms`, but two house names must never compete at equal prominence.

## Camera behavior

- Use one authored timeline, not independent CSS animations that drift out of sync.
- Use cinematic easing such as `cubic-bezier(0.65, 0, 0.35, 1)` for long camera segments.
- Keep rotation within approximately `-2deg` to `2deg`; use less whenever possible.
- Maintain recognizable north-up orientation.
- Avoid rapid zoom changes and deep perspective distortion.
- Never zoom beyond the usable resolution of the map.
- Preserve safe space for text, Skip Intro, and sound controls.
- Tune coordinates separately for desktop and mobile.

---

# 6. King's Landing to Red Keep Transition

After House Targaryen and “Fire and Blood” have been readable, let the house text fade while the camera continues toward King's Landing.

The transition must feel as if the atlas illustration gains depth rather than as if another image is loaded.

## Transition choreography

1. Ease toward the existing King's Landing map coordinate.
2. Reduce unrelated labels and regional highlights.
3. Align the map's King's Landing mark with the visual center of the original Red Keep composition.
4. Cross-blend matching shapes, coast direction, haze, color, and light between the atlas and Red Keep layers.
5. Introduce depth planes from back to front as the map texture recedes.
6. Let the flat mark become the distant keep silhouette.
7. Continue the push-in until walls, towers, cliff, and foreground separate perceptibly in depth.

Do not use a portal, white flash, radial wipe, page turn, hard cut, or full-screen blur to hide the transition.

The map and Red Keep scenes should share enough palette, grain, and atmosphere that their overlap feels intentional.

---

# 7. Desktop Red Keep Finale

Desktop should be visually rich, dimensional, and memorable without requiring a full 3D model.

Use the original layered scene to create a 2.5D camera movement:

- distant sky and city move slowest
- rear towers move slightly faster
- central keep remains the primary anchor
- front walls and cliff move more strongly
- a restrained near-foreground layer creates the clearest parallax
- haze and lighting bind the layers together

## Camera path

1. Push toward the Red Keep from a high oblique viewpoint.
2. Introduce a slow lateral arc of only a few degrees, creating the sensation of hovering around the keep.
3. Apply subtle perspective and depth scaling; do not make flat layers visibly shear apart.
4. Pass close enough to appreciate architectural scale, but do not fly through windows, gates, or courtyards.
5. Ease upward and outward into a strong aerial composition.
6. Nearly pause with the central keep framed as the visual anchor.

The orbit must remain smooth, heavy, and cinematic. It should feel like a controlled aerial camera, not a mouse-driven 3D product viewer.

Maximum guidance:

- lateral camera arc: approximately `3–5deg`
- scene rotation: no more than `2deg`
- foreground travel: restrained enough to avoid revealing layer seams
- scale changes: gradual, never a sudden punch-in
- depth-of-field: avoid or keep extremely subtle

Add atmosphere through slow cloud shadow, sea haze, dust, distant birds, or flags only if they remain secondary. Do not add fantasy particles or constant object motion.

---

# 8. Mobile Red Keep Finale

The phone version must be deliberately simpler than desktop.

Do not reuse the desktop camera coordinates or squeeze the full orbit into a narrow viewport.

Mobile requirements:

- use a dedicated portrait crop and safe composition
- center the keep's strongest tower mass
- use a short, straight push-in
- use shallow parallax between only the essential depth groups
- remove the lateral orbit
- reduce foreground travel
- use fewer atmospheric overlays
- avoid motion behind the title
- shorten the Red Keep move if required to maintain comfort and performance

The phone experience should still communicate that the flat map has become dimensional, but it should prioritize stability, clarity, battery use, and smooth frame rate.

Keep the same house order and readable content. Reframe each region individually so labels and sigils remain legible on a narrow screen.

---

# 9. Website Title Reveal

Once the desktop orbit or mobile push-in settles into the aerial composition, reveal:

```text
A WIKI OF
ICE AND FIRE
```

Title rules:

- Fade from opacity `0` to `1`.
- Move upward by no more than `8px`.
- Do not bounce, rotate, glow, flare, or scale dramatically.
- Keep the camera almost still while the title is fully readable.
- Preserve strong contrast without placing the title in a modern card.
- Hold the complete title for approximately `700–800ms`.
- Quiet the soundtrack during the hold so the title feels like a moment of arrival.

The title is not a separate end card. The Red Keep remains visible behind it.

---

# 10. Pullback Into the Interactive Map

After the title hold, reverse the spatial transition rather than cutting away.

1. Fade the title gently.
2. Pull the camera upward and backward.
3. Reduce foreground parallax and merge the Red Keep depth layers toward a single silhouette.
4. Resolve that silhouette into the King's Landing mark on the map.
5. Restore the full map framing.
6. Reveal the existing house markers, map header, `Replay intro`, and `Enter the archive` controls in two restrained stages.
7. Hand interaction back only after the cinematic overlay can no longer intercept pointer or keyboard input.

The final map must be the same usable map landing that already exists at `/`. Do not replace it with the Red Keep image, navigate automatically to `/wiki`, or introduce a new landing screen.

The completed state must not retain hidden animated layers, audio nodes, timers, scroll locks, or focus traps.

---

# 11. Skip Intro and Replay

## Skip Intro

- Keep a clearly visible but understated `Skip intro` control throughout the cinematic.
- Make it available to keyboard and assistive-technology users from the beginning.
- Do not mark the entire overlay `aria-hidden` if it contains an interactive Skip button.
- Skipping must cancel the active timeline, scheduled cues, and Red Keep effects.
- Do not fast-forward through the remaining houses.
- Crossfade directly into the completed interactive map within approximately `250–400ms`.
- Set `wiof:introComplete` before revealing the completed state.
- Restore focus to a logical map or navigation target.

## Replay

- Preserve the existing `Replay intro` control.
- Replay the visual/audio sequence using the already loaded house data.
- Do not clear the session completion flag.
- Do not refetch SQLite-backed house records solely for replay.
- If reduced motion is active, keep replay unavailable or provide only the reduced-motion version.

---

# 12. Audio

Create an original ambient soundscape. Do not use copyrighted music, recognizable themes, show dialogue, or extracted sound effects.

Suggested progression:

- darkness: soft wind
- map reveal: low orchestral drone
- journey: rare distant raven and restrained tonal cues
- each house: a very quiet percussive or textural accent
- King's Landing approach: controlled orchestral swell
- Red Keep hover: deeper spatial ambience and distant city/sea texture
- title hold: near silence
- pullback: soft resolving tone

Playback policy:

- Attempt autoplay only when browser policy permits.
- Never block or delay the animation because audio was rejected.
- If autoplay is blocked, begin silently and expose a clear `Enable sound` control.
- Once sound is enabled, join the soundscape at the timeline's current position; do not restart the intro.
- Provide a visible mute/unmute control throughout the sequence.
- Preserve the user's mute choice during replay within the same session.
- Use short fades when starting, muting, skipping, or cleaning up audio.
- The entire sequence must remain understandable and emotionally coherent while silent.

---

# 13. Loading and Failure Behavior

Preload only assets required for the cinematic. Do not use a generic visible loader.

- Hold darkness briefly while critical assets settle.
- If loading exceeds a reasonable threshold, skip directly to the completed interactive map rather than leaving the user on indefinite black.
- If Red Keep layers fail, complete the house journey and use a restrained map-only King's Landing/title finale.
- If optional atmosphere or audio fails, continue silently without an error dialog.
- If the world map cannot render, leave the existing application-level error handling in control.
- Never fabricate missing house facts.
- Partial house data must not be padded with hard-coded lore.

Asset failure must degrade immersion, not usability.

---

# 14. Reduced Motion

Fully respect `prefers-reduced-motion: reduce`.

Reduced motion is an alternate sequence, not a slower version of the cinematic:

- skip the continuous camera journey
- skip all zooming, orbiting, parallax, sway, and atmospheric drift
- do not enter the Red Keep 2.5D scene
- fade the completed map in within approximately `150ms`
- reveal the existing map markers and controls immediately
- set `wiof:introComplete` for the session
- keep all lore and navigation available

Do not allow a CSS rule that merely reduces durations to `0.01ms` to flash every cinematic keyframe. The React/timeline state must bypass the sequence completely.

---

# 15. Accessibility

- Skip Intro and sound controls require visible focus states and accessible names.
- Do not delay keyboard focus until an entrance animation completes.
- Never move focus into hidden or exiting cinematic content.
- Do not rely on sound, color, or motion alone to communicate a house identity.
- Keep house text large enough and visible long enough to read.
- Maintain sufficient contrast over the moving map.
- The animation must not flash more than three times per second.
- Avoid oscillation, repeated zooming, and rapid direction reversal.
- Pause non-essential visual and audio work when the document is hidden.
- Ensure the completed map is not hidden from assistive technology by leftover cinematic attributes.

---

# 16. Performance and Implementation Guidance

Target smooth 60 FPS on desktop and stable performance on mid-range phones.

- Prefer `transform` and `opacity`.
- Keep camera motion on a small number of composited scene containers.
- Do not promote every tower or decorative layer to its own GPU layer.
- Use `will-change` only shortly before complex motion and remove it afterward.
- Avoid expensive full-viewport blur and continuously animated filters.
- Give all Red Keep layers sufficient overscan.
- Use responsive image formats and sizes for desktop and mobile.
- Decode critical images before their first visible frame.
- Pause or destroy offscreen atmospheric loops.
- Cancel stale animations when skipping, replaying, navigating, or unmounting.
- Prevent development-mode remounts from playing two timelines or creating duplicate audio.
- Keep animation state separate from lore data and map interaction state.

Use a single master timeline for the journey and Red Keep choreography. Use the project's existing animation approach if it can reliably coordinate the sequence. A dedicated timeline library may be introduced for the cinematic if necessary, but ordinary fades and controls should remain CSS transitions.

Full WebGL geometry is not required. The approved direction is original layered 2.5D artwork with controlled transforms and perspective. The completed map must still work if advanced effects are unavailable.

---

# 17. Website-Wide Motion System

The opening cinematic establishes the motion language, but ordinary pages must use a quieter version of it. The archive should feel like one product after the cinematic ends, not a static application attached to an animated splash screen.

## Motion principles

- Motion communicates hierarchy, continuity, cause, and state.
- Every animation must answer what changed, where it came from, or what now has focus.
- Use restrained, weighted movement inspired by paper, ink, map layers, shutters, and archival folios.
- Prefer opacity, clipping, and short directional movement over scaling.
- Never animate merely to keep the page busy.
- Never run more than one dominant animation in the same viewport region.
- Repeated interactions become faster after their first appearance.
- Motion must never delay reading, navigation, search, or primary actions.

## Shared duration tokens

Define and reuse a small set of tokens rather than inventing durations per component:

```css
--motion-instant: 100ms;
--motion-fast: 160ms;
--motion-standard: 240ms;
--motion-emphasis: 360ms;
--motion-page: 480ms;
--ease-enter: cubic-bezier(0.2, 0.75, 0.2, 1);
--ease-exit: cubic-bezier(0.4, 0, 1, 1);
--ease-move: cubic-bezier(0.45, 0, 0.2, 1);
```

Allowed ranges:

- hover and press feedback: `100–160ms`
- tooltips, labels, and small controls: `140–200ms`
- cards, disclosures, filters, and tabs: `180–280ms`
- panels and dialogs: `240–360ms`
- page-level entrances: `360–520ms`

Do not use spring, bounce, elastic, or overshoot easing anywhere.

## Route transitions

- Keep the current router, routes, scroll behavior, and data fetching.
- On initial entry to an archive route, fade the main content from `0` to `1` with no more than `10px` of upward travel.
- Animate the page shell once, then reveal major content groups with `40–70ms` stagger.
- Do not animate every paragraph, table row, or inline element.
- Route exits must remain shorter than entrances and must never hold navigation hostage.
- Back/forward navigation should feel immediate; preserve expected browser behavior.
- Never crossfade two full pages in a way that leaves duplicate readable content onscreen.

## Header and navigation

- Keep the header position, spacing, typography, colors, and destinations unchanged.
- Active navigation indicators may travel or draw into place over `180–240ms`.
- Hover feedback uses a restrained color/opacity transition and, where already present, a one-pixel rule reveal.
- Pressed controls move no more than `1px`; do not shrink entire buttons dramatically.
- Mobile navigation opens as one controlled layer with a dimmed backdrop, not many independently flying links.
- Keyboard focus appears immediately and is never delayed by motion.

## Map interactions

- Sigil pin dots must remain exactly anchored to their map coordinates throughout all hover, focus, selection, and responsive states.
- Hovering or focusing a sigil may raise the crest visually, but the geographic pin must not move.
- Selected-house emphasis uses one pulse or restrained halo, then settles; do not loop continuously.
- Non-selected markers may reduce emphasis over `180–240ms` without disappearing.
- Detail panels must appear to originate from the selected marker direction when practical, while remaining readable and within the viewport.
- Resetting or panning the map must use controlled movement and must not produce motion sickness.
- Mobile map motion must never fight native touch scrolling.

## Archive index, cards, and search results

- Reveal the result group as a unit; do not cascade hundreds of records.
- Stagger only the first visible row or first `6–8` cards, capped at `240ms` total.
- Card hover may lift by `2px` maximum with a subtle border or shadow response.
- Images crossfade only after decoding; reserve their final space to prevent layout shift.
- Filtered and searched results use stable keyed transitions. Existing items move to their new location while removed items fade quickly.
- Search input, clear action, count, and empty state transition without flashing or resetting focus.
- Pagination and load-more actions preserve the user's reading position.

## Wiki entry pages

- Animate the article header, metadata, and primary image as one composed entrance.
- Body copy appears immediately after the header; do not animate paragraphs line by line.
- In-page anchor jumps remain precise. If smooth scrolling is used, cap it and disable it for reduced motion.
- Related-entry cards follow the shared card rules.
- Image galleries use short crossfades or directional slides based on navigation direction, never 3D flips.
- Tables of contents may highlight the active section with a moving rule, but the text itself stays stable.

## Panels, dialogs, disclosures, and tooltips

- Side panels enter from their attached edge over `240–320ms` while the backdrop fades separately.
- Bottom sheets on phone rise no farther than their own height and support interruption by touch.
- Dialog content does not scale from zero. Use opacity plus `6–10px` movement.
- Accordion/disclosure motion should use measured height or a grid-row technique, not an arbitrary large `max-height`.
- Tooltips appear after intentional hover/focus and disappear faster than they enter.
- Closing motion must complete cleanup reliably, restore focus, and never leave an invisible click-blocking layer.

## Loading, empty, error, and data refresh states

- Preserve the exact layout with skeletons shaped like the final content.
- Skeleton shimmer, if retained, must be extremely subtle and stop when the document is hidden.
- Do not spin house sigils or use lore imagery as loading indicators.
- Existing content remains visible during background refresh whenever data correctness allows.
- Empty states fade into the same content region; they must not arrive as full-screen theatrical scenes.
- Errors appear promptly with no shake animation.
- Retrying gives immediate pressed/busy feedback and prevents duplicate requests.

## Micro-interactions

- Buttons, links, chips, checkboxes, and controls share the same duration and easing tokens.
- Icons may translate or rotate only when the movement explains state, such as a disclosure chevron.
- Copy/share success uses a brief text or icon swap and an accessible live announcement.
- Avoid perpetual ambient motion outside the opening cinematic.
- Decorative texture drift must stop after the cinematic handoff unless it is nearly imperceptible, cheap to render, and disabled for reduced motion.

## Responsive behavior

- The motion hierarchy stays the same across breakpoints even when choreography is simplified.
- Phone motion uses shorter distances, fewer simultaneous layers, and no hover-dependent requirement.
- Do not create separate mobile coordinates by eye for map sigils; use the same intrinsic map coordinate system on every viewport.
- Orientation changes and resizes must settle immediately without replaying entrances.
- Nothing may animate from an offscreen desktop position when mounted on phone.

## Global reduced-motion contract

When `prefers-reduced-motion: reduce` is active:

- bypass the cinematic as specified above
- remove parallax, camera moves, smooth scrolling, stagger, and decorative loops
- preserve short opacity changes up to approximately `120ms` where they clarify state
- make panels, dialogs, disclosures, and route changes usable immediately
- do not trigger every keyframe at near-zero duration
- keep all focus management and cleanup identical to the standard experience

## Motion architecture and cleanup

- Centralize tokens and shared primitives; do not scatter near-duplicate keyframes across the stylesheet.
- Use React state for semantic lifecycle and CSS for simple visual interpolation.
- Use one master timeline only where choreography genuinely requires it.
- All timers, animation frames, observers, listeners, and audio nodes must clean up on unmount.
- Animations must tolerate React development remounts without duplication.
- Pause optional work when `document.hidden` is true.
- Test interactions at animation start, midpoint, completion, interruption, rapid repeat, and route change.

---

# 18. Acceptance Checklist

## Scope

- [ ] Only animation and motion behavior are implemented; static layouts and product scope remain unchanged.
- [ ] Routes, data, theme, typography, map layout, and wiki pages are not redesigned.
- [ ] One consistent website-wide motion system covers the existing map and archive interface.
- [ ] Shared duration and easing tokens are used across components.
- [ ] Route, navigation, card, search, panel, dialog, loading, and feedback motion follows this brief.
- [ ] Map pin dots remain geographically fixed during hover, focus, selection, and responsive layout changes.

## Sequence

- [ ] The intro begins from complete darkness with no curtain, spinner, progress bar, fire/ice collision, or glint.
- [ ] The complete map is visible before camera travel begins.
- [ ] The camera follows one continuous path with no cuts or teleportation.
- [ ] Houses appear in this exact order: Stark, Arryn, Tully, Greyjoy, Lannister, Tyrell, Baratheon, Martell, Targaryen.
- [ ] Every house name, region, and motto remains simultaneously readable for at least approximately `650ms`.
- [ ] King's Landing is the final regional destination.
- [ ] The complete desktop sequence lasts between 11 and 15 seconds.

## Red Keep

- [ ] The `redkeep/` images are used only as references.
- [ ] The final Red Keep artwork is original and prepared as separate depth layers.
- [ ] No reference is shipped, traced, copied, or used as a direct full-screen background.
- [ ] Desktop uses a sophisticated but restrained 2.5D push-in, slow lateral hover, and aerial settling.
- [ ] Mobile uses a simple centered push-in with shallow parallax and no lateral orbit.
- [ ] The title appears over the nearly paused aerial view without bounce, rotation, or dramatic scaling.

## Handoff and state

- [ ] The finale pulls back until the Red Keep resolves into the King's Landing map position.
- [ ] The result is the existing interactive map at `/`, not an automatic navigation to `/wiki`.
- [ ] The intro plays automatically once per session using `wiof:introComplete`.
- [ ] Replay does not clear the session flag or refetch house data.
- [ ] Skip Intro cancels the timeline and crossfades directly to the usable map.
- [ ] No invisible overlay blocks the completed map.

## Audio, accessibility, and performance

- [ ] Audio attempts autoplay only when allowed and fails silently when blocked.
- [ ] Enable sound and mute controls work without restarting the sequence.
- [ ] The sequence remains coherent when muted.
- [ ] Reduced-motion users bypass the journey and Red Keep scene entirely.
- [ ] Skip and audio controls are keyboard accessible.
- [ ] Desktop motion remains smooth and the simplified phone version performs reliably.
- [ ] Timelines, audio, and atmospheric effects clean up on skip, completion, navigation, and unmount.

---

# Final Standard

The visitor should remember one seamless transformation:

> a dark screen becomes an atlas, the atlas carries them through the Great Houses, King's Landing rises from parchment into an original living Red Keep, and the camera pulls back until they are holding the interactive map themselves.

Make the desktop finale complex, dimensional, and beautiful. Make the phone finale simple, stable, and elegant. In both cases, preserve readability, restraint, accessibility, and the existing wiki experience.
