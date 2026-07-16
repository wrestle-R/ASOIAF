import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.JOURNEY_VERIFY_URL
  || process.env.VERIFY_BASE_URL
  || "http://127.0.0.1:5173";
const outputDir = new URL("../../artifacts/screenshots/character-journeys/", import.meta.url);
let journeys = [];
const requestedPhases = new Set(
  (process.env.JOURNEY_VERIFY_PHASES
    || "load-gate,desktop,phone,reduced-motion,responsive,routes,deferred,dragons")
    .split(",")
    .map((phase) => phase.trim())
    .filter(Boolean),
);
const SEASON_CONTINUITY_TOLERANCE = 1;
const VIEWPORT_TOLERANCE = 2;
const RESPONSIVE_VIEWPORTS = [
  { name: "phone-320x568", width: 320, height: 568, touch: true },
  { name: "phone-360x800", width: 360, height: 800, touch: true },
  { name: "phone-390x844", width: 390, height: 844, touch: true },
  { name: "phone-430x932", width: 430, height: 932, touch: true },
  { name: "phone-landscape-844x390", width: 844, height: 390, touch: true },
  { name: "tablet-768x1024", width: 768, height: 1024, touch: true },
  { name: "desktop-1440x900", width: 1440, height: 900, touch: false },
];
const failures = [];
const blobAssetCache = new Map();

async function newVerifiedContext(browser, options) {
  const context = await browser.newContext(options);

  // Keep remote asset verification deterministic under local Chromium, where
  // Opaque Response Blocking can intermittently reject valid public Blob
  // images. Each immutable URL is fetched once and its verified bytes are
  // reused throughout the route matrix.
  await context.route("https://*.public.blob.vercel-storage.com/**", async (route) => {
    try {
      const url = route.request().url();
      let asset = blobAssetCache.get(url);
      if (!asset) {
        asset = fetch(url, { headers: { "user-agent": "ASOIAF-visual-verifier/1.0" } })
          .then(async (response) => {
            if (!response.ok) throw new Error(`Blob asset returned ${response.status}: ${url}`);
            return {
              status: response.status,
              headers: Object.fromEntries(response.headers.entries()),
              body: Buffer.from(await response.arrayBuffer()),
            };
          })
          .catch((error) => {
            blobAssetCache.delete(url);
            throw error;
          });
        blobAssetCache.set(url, asset);
      }
      await route.fulfill(await asset);
    } catch (error) {
      if (!/Route is already handled|Request context disposed/.test(error.message)) throw error;
    }
  });

  return context;
}

async function closeVerifiedContext(context) {
  await context.unrouteAll({ behavior: "ignoreErrors" });
  await context.close();
}

function fail(label, message) {
  failures.push(`${label}: ${message}`);
}

function pathFor(journey) {
  return `/journeys/${journey.seriesSlug}/${journey.characterSlug}`;
}

function rectanglesOverlap(first, second) {
  return first.x < second.x + second.width
    && first.x + first.width > second.x
    && first.y < second.y + second.height
    && first.y + first.height > second.y;
}

function pointDistance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function rectangleWithinViewport(rectangle, viewport, tolerance = VIEWPORT_TOLERANCE) {
  return rectangle.x >= -tolerance
    && rectangle.y >= -tolerance
    && rectangle.x + rectangle.width <= viewport.width + tolerance
    && rectangle.y + rectangle.height <= viewport.height + tolerance;
}

async function readSeasonGeometry(page) {
  return page.evaluate(() => {
    const path = document.querySelector(".journey-route:not(.journey-route-dragon)");
    const marker = document.querySelector(".journey-marker");
    if (!(path instanceof SVGGeometryElement) || !(marker instanceof SVGGElement)) return null;

    const pathLength = path.getTotalLength();
    const start = path.getPointAtLength(0);
    const end = path.getPointAtLength(pathLength);
    const markerMatrix = marker.transform.baseVal.consolidate()?.matrix;

    return {
      start: { x: start.x, y: start.y },
      end: { x: end.x, y: end.y },
      marker: markerMatrix ? { x: markerMatrix.e, y: markerMatrix.f } : null,
    };
  });
}

async function assertSeasonBoundaryContinuity(page, label, previousEnd, transition) {
  await page.waitForFunction((tolerance) => {
    const path = document.querySelector(".journey-route:not(.journey-route-dragon)");
    const marker = document.querySelector(".journey-marker");
    if (!(path instanceof SVGGeometryElement) || !(marker instanceof SVGGElement)) return false;

    const start = path.getPointAtLength(0);
    const markerMatrix = marker.transform.baseVal.consolidate()?.matrix;
    return markerMatrix
      && Math.hypot(markerMatrix.e - start.x, markerMatrix.f - start.y) <= tolerance;
  }, SEASON_CONTINUITY_TOLERANCE);

  const geometry = await readSeasonGeometry(page);
  if (!geometry?.marker) {
    fail(label, `${transition} did not render measurable path and marker geometry`);
    return;
  }

  const pathGap = pointDistance(previousEnd, geometry.start);
  if (pathGap > SEASON_CONTINUITY_TOLERANCE) {
    fail(
      label,
      `${transition} teleports ${pathGap.toFixed(2)} map units between seasons`,
    );
  }

  const markerGap = pointDistance(geometry.start, geometry.marker);
  if (markerGap > SEASON_CONTINUITY_TOLERANCE) {
    fail(
      label,
      `${transition} marker begins ${markerGap.toFixed(2)} map units away from the new path start`,
    );
  }
}

function collectBrowserErrors(page, getLabel) {
  const errors = [];
  page.on("console", (message) => {
    const text = message.text();
    const transientTransportError = /Failed to load resource: net::ERR_(?:CONNECTION_RESET|NETWORK_CHANGED|TIMED_OUT)/.test(text);
    if (message.type() === "error" && !transientTransportError) {
      errors.push(`${getLabel()}: ${text}`);
    }
  });
  page.on("pageerror", (error) => errors.push(`${getLabel()}: ${error.message}`));
  return () => {
    if (errors.length) failures.push(...errors);
  };
}

async function gotoWithRetry(page, url, options) {
  let lastError;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await page.goto(url, options);
    } catch (error) {
      lastError = error;
      const transient = /ERR_(?:CONNECTION_RESET|NETWORK_CHANGED|TIMED_OUT)/.test(
        error.message,
      );
      if (!transient || attempt === 2) throw error;
      await page.waitForTimeout(400 * (attempt + 1));
    }
  }

  throw lastError;
}

async function fetchEveryCharacter() {
  const characters = [];

  for (let offset = 0; offset < 203; offset += 60) {
    const url = new URL("/api/characters", baseUrl);
    url.searchParams.set("limit", "60");
    url.searchParams.set("offset", String(offset));
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Character API returned ${response.status} for offset ${offset}`);
    const payload = await response.json();
    characters.push(...payload.characters);
  }

  return characters;
}

async function assertViewportLocked(page, label, { requireClasses = true } = {}) {
  const metrics = await page.evaluate(() => ({
    bodyOverflow: getComputedStyle(document.body).overflow,
    bodyScrollWidth: document.body.scrollWidth,
    documentOverflow: getComputedStyle(document.documentElement).overflow,
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: document.documentElement.clientHeight,
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    scrollY: window.scrollY,
  }));

  if (requireClasses && (metrics.bodyOverflow !== "hidden" || metrics.documentOverflow !== "hidden")) {
    fail(label, "document overflow is not locked");
  }
  if (metrics.scrollHeight > metrics.viewportHeight + 1) fail(label, "page exceeds the viewport height");
  if (metrics.scrollWidth > metrics.viewportWidth + 1) fail(label, "page exceeds the viewport width");
  if (metrics.bodyScrollWidth > metrics.viewportWidth + 1) fail(label, "body creates horizontal overflow");
  if (metrics.scrollY !== 0) fail(label, "page did not begin at the viewport origin");

  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(100);
  if (await page.evaluate(() => window.scrollY) !== 0) fail(label, "wheel input scrolled the page");
}

async function assertPersistentBackLink(page, label) {
  const links = page.locator("a.journey-back-control");
  if (await links.count() !== 1) {
    fail(label, `expected one persistent back link, found ${await links.count()}`);
    return;
  }

  const link = links.first();
  if (await link.getAttribute("href") !== "/home") {
    fail(label, `persistent back link targets ${await link.getAttribute("href")}`);
  }
  if (!(await link.isVisible())) fail(label, "persistent back link is not visible");

  const viewport = page.viewportSize();
  const rectangle = await link.boundingBox();
  if (!viewport || !rectangle || !rectangleWithinViewport(rectangle, viewport)) {
    fail(label, "persistent back link leaves the viewport");
  }
}

async function assertOriginMarker(
  page,
  label,
  { expectedOrigin = null, matchCurrentRouteStart = false } = {},
) {
  const geometry = await page.evaluate(() => {
    const path = document.querySelector(".journey-route:not(.journey-route-complete):not(.journey-route-dragon)");
    const origins = [...document.querySelectorAll("[data-journey-origin]")];
    const origin = origins[0];
    if (!(origin instanceof SVGCircleElement)) {
      return { count: origins.length };
    }

    const start = path instanceof SVGGeometryElement ? path.getPointAtLength(0) : null;
    const styles = getComputedStyle(origin);
    const rectangle = origin.getBoundingClientRect();
    return {
      count: origins.length,
      origin: { x: origin.cx.baseVal.value, y: origin.cy.baseVal.value },
      placeId: origin.dataset.placeId,
      radius: origin.r.baseVal.value,
      start: start ? { x: start.x, y: start.y } : null,
      stroke: styles.stroke,
      strokeDasharray: styles.strokeDasharray,
      strokeWidth: Number.parseFloat(styles.strokeWidth),
      visibleRectangle: rectangle.width > 0 && rectangle.height > 0,
    };
  });

  if (geometry.count !== 1 || !geometry.origin) {
    fail(label, `expected one measurable season origin, found ${geometry.count}`);
    return null;
  }
  if (matchCurrentRouteStart && !geometry.start) {
    fail(label, "season origin could not be compared to its route start");
  }
  if (
    matchCurrentRouteStart
    && geometry.start
    && pointDistance(geometry.origin, geometry.start) > SEASON_CONTINUITY_TOLERANCE
  ) {
    fail(label, "origin circle is not centered on the route start");
  }
  if (!geometry.placeId) fail(label, "origin circle does not identify its place");
  if (geometry.radius < 10 || geometry.strokeWidth < 2 || geometry.stroke === "none") {
    fail(label, "origin circle is not visually prominent");
  }
  if (!geometry.visibleRectangle) fail(label, "origin circle has no rendered area");
  if (geometry.strokeDasharray !== "none" && geometry.strokeDasharray !== "0px") {
    fail(label, "origin circle is not visually distinct from dotted stops");
  }
  if (expectedOrigin && (
    geometry.placeId !== expectedOrigin.placeId
    || pointDistance(geometry.origin, expectedOrigin.origin) > SEASON_CONTINUITY_TOLERANCE
  )) {
    fail(label, "completion does not preserve the character's first journey origin");
  }

  return {
    origin: geometry.origin,
    placeId: geometry.placeId,
  };
}

function axisRespectsMapBoundary(mapStart, mapSize, stageStart, stageSize) {
  const mapEnd = mapStart + mapSize;
  const stageEnd = stageStart + stageSize;
  return mapSize >= stageSize - VIEWPORT_TOLERANCE
    ? mapStart <= stageStart + VIEWPORT_TOLERANCE
      && mapEnd >= stageEnd - VIEWPORT_TOLERANCE
    : mapStart >= stageStart - VIEWPORT_TOLERANCE
      && mapEnd <= stageEnd + VIEWPORT_TOLERANCE;
}

async function assertCompletionMapBoundary(page, label) {
  const camera = await page.locator(".journey-camera.is-zoomable-overview").boundingBox();
  const stage = await page.locator(".journey-stage.is-complete").boundingBox();
  if (!camera || !stage) {
    fail(label, "completion map does not expose measurable boundary geometry");
    return;
  }

  if (
    !axisRespectsMapBoundary(camera.x, camera.width, stage.x, stage.width)
    || !axisRespectsMapBoundary(camera.y, camera.height, stage.y, stage.height)
  ) {
    fail(
      label,
      `completion map escaped its boundary (${camera.x.toFixed(1)}, ${camera.y.toFixed(1)}, ${camera.width.toFixed(1)}x${camera.height.toFixed(1)})`,
    );
  }
}

async function assertResponsiveOverlayLayout(page, label) {
  const viewport = page.viewportSize();
  if (!viewport) {
    fail(label, "viewport size is unavailable");
    return;
  }

  const selectors = [
    ".journey-back-control",
    ".journey-controls",
    ".journey-progress",
    ".journey-zoom-controls",
    ".journey-season-picker-overlay",
  ];
  const rectangles = new Map();

  for (const selector of selectors) {
    const locator = page.locator(selector);
    if (await locator.count() === 0 || !(await locator.first().isVisible())) continue;
    const rectangle = await locator.first().boundingBox();
    if (!rectangle || !rectangleWithinViewport(rectangle, viewport)) {
      fail(label, `${selector} leaves the viewport`);
    } else {
      rectangles.set(selector, rectangle);
    }
  }

  const back = rectangles.get(".journey-back-control");
  const copy = await page.locator(".journey-copy").boundingBox();
  if (back && copy && rectanglesOverlap(back, copy)) {
    fail(label, "persistent back link overlaps the journey copy");
  }

  const controls = rectangles.get(".journey-controls");
  const zoom = rectangles.get(".journey-zoom-controls");
  if (controls && zoom && rectanglesOverlap(controls, zoom)) {
    fail(label, "completion zoom and journey controls overlap");
  }

  if (viewport.width <= 880) {
    const targets = page.locator(".journey-back-control, .journey-controls .journey-control, .journey-zoom-control");
    for (let index = 0; index < await targets.count(); index += 1) {
      const target = targets.nth(index);
      if (!(await target.isVisible())) continue;
      const rectangle = await target.boundingBox();
      if (rectangle && (rectangle.width < 40 || rectangle.height < 40)) {
        fail(label, `interactive target ${index + 1} is smaller than 40px`);
      }
    }
  }
}

async function advanceJourneyToCompletion(page, label, { touch }) {
  const seasonCount = await page.locator(".journey-progress span").count();
  const pause = page.getByRole("button", { name: "Pause", exact: true });
  if (await pause.count()) await pause.click();
  if (!touch) {
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
  }

  for (let index = 1; index < seasonCount; index += 1) {
    const previous = await page.locator(".journey-kicker").textContent();
    if (touch) {
      const viewport = page.viewportSize();
      await page.touchscreen.tap(Math.round(viewport.width * 0.82), Math.round(viewport.height * 0.5));
    } else {
      await page.keyboard.press("ArrowRight");
    }
    await page.waitForFunction((value) => (
      document.querySelector(".journey-kicker")?.textContent !== value
    ), previous);
    await assertOriginMarker(page, `${label}-season-${index + 1}`, {
      matchCurrentRouteStart: true,
    });
  }

  if (touch) {
    const viewport = page.viewportSize();
    await page.touchscreen.tap(Math.round(viewport.width * 0.82), Math.round(viewport.height * 0.5));
  } else {
    await page.keyboard.press("ArrowRight");
  }
  await page.locator(".journey-stage.is-complete").waitFor();
  await page.getByRole("button", { name: "Replay", exact: true }).waitFor();
}

async function readMapScale(page) {
  return Number.parseFloat(
    await page.locator(".journey-camera.is-zoomable-overview").getAttribute("data-map-scale"),
  );
}

async function assertCompletionZoom(page, label) {
  const camera = page.locator(".journey-camera.is-zoomable-overview");
  const zoomIn = page.getByRole("button", { name: "Zoom in", exact: true });
  const zoomOut = page.getByRole("button", { name: "Zoom out", exact: true });
  const reset = page.getByRole("button", { name: "Reset map view", exact: true });

  if (await camera.count() !== 1) fail(label, "completion map is not zoomable");
  for (const [name, locator] of [["Zoom in", zoomIn], ["Zoom out", zoomOut], ["Reset map view", reset]]) {
    if (await locator.count() !== 1 || !(await locator.isVisible())) {
      fail(label, `${name} control is not persistently available on completion`);
      return;
    }
  }

  const initialScale = await readMapScale(page);
  if (!Number.isFinite(initialScale) || initialScale !== 1) {
    fail(label, `completion map begins at invalid scale ${initialScale}`);
  }
  await assertCompletionMapBoundary(page, `${label}-initial-boundary`);

  await zoomIn.click();
  await page.waitForFunction((scale) => (
    Number.parseFloat(document.querySelector(".is-zoomable-overview")?.dataset.mapScale) > scale
  ), initialScale);
  await page.waitForTimeout(260);
  if (await readMapScale(page) <= initialScale) fail(label, "Zoom in did not increase map scale");
  if (await zoomOut.isDisabled()) fail(label, "Zoom out stayed disabled after zooming in");
  await assertCompletionMapBoundary(page, `${label}-zoomed-boundary`);

  let zoomSteps = 1;
  while (!(await zoomIn.isDisabled()) && zoomSteps < 12) {
    await zoomIn.click();
    zoomSteps += 1;
  }
  await page.waitForTimeout(260);
  if (!(await zoomIn.isDisabled())) fail(label, "Zoom in does not expose a bounded maximum");
  await assertCompletionMapBoundary(page, `${label}-maximum-zoom-boundary`);

  await camera.focus();
  for (let index = 0; index < 24; index += 1) await page.keyboard.press("ArrowRight");
  for (let index = 0; index < 24; index += 1) await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(260);
  await assertCompletionMapBoundary(page, `${label}-pan-bottom-right-boundary`);
  for (let index = 0; index < 48; index += 1) await page.keyboard.press("ArrowLeft");
  for (let index = 0; index < 48; index += 1) await page.keyboard.press("ArrowUp");
  await page.waitForTimeout(260);
  await assertCompletionMapBoundary(page, `${label}-pan-top-left-boundary`);
  if (await page.locator(".journey-stage.is-complete").count() !== 1) {
    fail(label, "map keyboard panning left the completion state");
    return;
  }

  await reset.click();
  await page.waitForFunction(() => (
    Number.parseFloat(document.querySelector(".is-zoomable-overview")?.dataset.mapScale) === 1
  ));
  await page.waitForTimeout(260);
  const resetOffsets = await camera.evaluate((element) => ({
    x: element.style.getPropertyValue("--overview-x"),
    y: element.style.getPropertyValue("--overview-y"),
  }));
  if (!/^0(?:\.0+)?px$/.test(resetOffsets.x) || !/^0(?:\.0+)?px$/.test(resetOffsets.y)) {
    fail(label, `Reset map view left offsets at ${resetOffsets.x || "unset"}, ${resetOffsets.y || "unset"}`);
  }
  await assertCompletionMapBoundary(page, `${label}-reset-boundary`);
}

async function assertMarkerVisible(page, label) {
  const viewport = page.viewportSize();
  const marker = await page.locator(".journey-marker").boundingBox();
  if (!viewport || !marker) {
    fail(label, "moving marker is not rendered");
    return;
  }
  if (
    marker.x < 12
    || marker.y < 12
    || marker.x + marker.width > viewport.width - 12
    || marker.y + marker.height > viewport.height - 12
  ) {
    fail(label, "moving marker leaves the visible phone viewport");
  }

  for (const selector of [".journey-back-control", ".journey-controls", ".journey-progress"]) {
    const overlay = await page.locator(selector).boundingBox();
    if (overlay && rectanglesOverlap(marker, overlay)) {
      fail(label, `${selector} covers the moving marker`);
    }
  }
}

async function openJourney(page, journey) {
  await gotoWithRetry(page, new URL(pathFor(journey), baseUrl).href, {
    waitUntil: "networkidle",
  });
  await page.locator(".journey-stage:not(.pending-journey-stage)").waitFor();
  await page.locator(".journey-kicker").filter({ hasText: /^Season \d+ of \d+$/ }).waitFor();

  return {
    firstKicker: await page.locator(".journey-kicker").textContent(),
    seasonCount: await page.locator(".journey-progress span").count(),
  };
}

async function verifyPublishedDesktop(browser) {
  const context = await newVerifiedContext(browser, { viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  let label = "published-desktop";
  const reportErrors = collectBrowserErrors(page, () => label);

  for (const journey of journeys) {
    label = `${journey.characterSlug}-desktop`;
    const { firstKicker, seasonCount } = await openJourney(page, journey);
    await assertPersistentBackLink(page, label);
    const firstOrigin = await assertOriginMarker(page, label, { matchCurrentRouteStart: true });

    if (await page.locator(".journey-map-image").count() !== 1) {
      fail(label, "journey does not use one persistent map image");
    }
    if (await page.locator(".journey-route:not(.journey-route-dragon)").count() !== 1) {
      fail(label, "current season does not render exactly one primary route");
    }
    const dash = await page.locator(".journey-route:not(.journey-route-dragon)").evaluate((element) => getComputedStyle(element).strokeDasharray);
    if (dash === "none") fail(label, "route is not dotted");
    if (await page.locator(".pending-journey-stage").count()) fail(label, "published journey opened a pending state");

    await page.waitForTimeout(180);
    await page.getByRole("button", { name: "Pause", exact: true }).click();
    const reveal = page.locator(".journey-route-reveal");
    const pausedOffset = Number.parseFloat(await reveal.evaluate((element) => element.style.strokeDashoffset));
    await page.waitForTimeout(450);
    const heldOffset = Number.parseFloat(await reveal.evaluate((element) => element.style.strokeDashoffset));
    if (!Number.isFinite(pausedOffset) || !Number.isFinite(heldOffset)) {
      fail(label, "route progress was not measurable");
    } else if (Math.abs(heldOffset - pausedOffset) > 0.25) {
      fail(label, "pause did not freeze route progress");
    }

    let lastKicker = firstKicker;
    for (let index = 1; index < seasonCount; index += 1) {
      const previousKicker = await page.locator(".journey-kicker").textContent();
      const previousGeometry = await readSeasonGeometry(page);
      if (!previousGeometry) {
        fail(label, `${previousKicker} did not expose measurable route geometry`);
        break;
      }
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      });
      await page.keyboard.press("ArrowRight");
      await page.waitForFunction((previous) => (
        document.querySelector(".journey-kicker")?.textContent !== previous
      ), previousKicker);
      lastKicker = await page.locator(".journey-kicker").textContent();
      await assertSeasonBoundaryContinuity(
        page,
        label,
        previousGeometry.end,
        `${previousKicker} to ${lastKicker}`,
      );
      await assertOriginMarker(page, `${label}-${lastKicker}`, {
        matchCurrentRouteStart: true,
      });
    }
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
    await page.keyboard.press("ArrowRight");
    await page.getByRole("button", { name: "Replay", exact: true }).waitFor();
    await page.waitForTimeout(1_300);
    if (await page.locator(".journey-route-complete").count() !== seasonCount) {
      fail(label, "complete view does not show every season route");
    }
    if (await page.locator(".journey-marker").count()) fail(label, "complete view still shows a moving marker");
    const backHref = await page.getByRole("link", { name: "Back to Home", exact: true }).getAttribute("href");
    if (backHref !== "/home") fail(label, `completion action targets ${backHref}`);
    await assertPersistentBackLink(page, `${label}-complete`);
    await assertOriginMarker(page, `${label}-complete`, { expectedOrigin: firstOrigin });
    if (["arya-stark", "daenerys-targaryen", "ser-duncan-the-tall"].includes(journey.characterSlug)) {
      await page.screenshot({ path: new URL(`${journey.characterSlug}-desktop-complete.png`, outputDir).pathname });
    }

    await page.keyboard.press("ArrowLeft");
    await page.locator(".journey-kicker", { hasText: lastKicker }).waitFor();
    await page.keyboard.press("ArrowRight");
    await page.getByRole("button", { name: "Replay", exact: true }).waitFor();
    await page.getByRole("button", { name: "Replay", exact: true }).click();
    await page.locator(".journey-kicker", { hasText: firstKicker }).waitFor();
  }

  reportErrors();
  await closeVerifiedContext(context);
}

async function verifyPublishedOnPhone(browser) {
  const context = await newVerifiedContext(browser, {
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await context.newPage();
  let label = "published-phone";
  const reportErrors = collectBrowserErrors(page, () => label);

  for (const journey of journeys) {
    label = `${journey.characterSlug}-phone`;
    const { firstKicker, seasonCount } = await openJourney(page, journey);
    await assertViewportLocked(page, label);
    await assertPersistentBackLink(page, label);
    await assertOriginMarker(page, label, { matchCurrentRouteStart: true });
    await assertResponsiveOverlayLayout(page, label);
    await page.waitForTimeout(350);
    await assertMarkerVisible(page, label);

    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100);
    if (await page.locator(".journey-kicker").textContent() !== firstKicker) {
      fail(label, "desktop arrow navigation changed the phone season");
    }

    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await page.touchscreen.tap(330, 420);
    if (seasonCount > 1) {
      await page.waitForFunction((first) => (
        document.querySelector(".journey-kicker")?.textContent !== first
      ), firstKicker);
      await assertOriginMarker(page, `${label}-next-season`, { matchCurrentRouteStart: true });
      await page.touchscreen.tap(60, 420);
      await page.locator(".journey-kicker", { hasText: firstKicker }).waitFor();
      await assertOriginMarker(page, `${label}-previous-season`, { matchCurrentRouteStart: true });
    } else {
      const replay = page.getByRole("button", { name: "Replay", exact: true });
      await replay.waitFor();
      await assertOriginMarker(page, `${label}-complete`);
      await replay.click();
      await page.locator(".journey-kicker", { hasText: firstKicker }).waitFor();
    }
    if (/\b(?:click|tap)\b.{0,28}\b(?:left|right)\b/i.test(await page.locator("body").innerText())) {
      fail(label, "visible copy explains edge navigation");
    }
    if (["arya-stark", "daenerys-targaryen", "ser-duncan-the-tall"].includes(journey.characterSlug)) {
      await page.screenshot({ path: new URL(`${journey.characterSlug}-phone.png`, outputDir).pathname });
    }
  }

  reportErrors();
  await closeVerifiedContext(context);
}

async function verifyReducedMotion(browser) {
  const context = await newVerifiedContext(browser, {
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  let label = "reduced-motion";
  const reportErrors = collectBrowserErrors(page, () => label);

  for (const journey of journeys) {
    label = `${journey.characterSlug}-reduced-motion`;
    const { seasonCount } = await openJourney(page, journey);
    await page.locator(".journey-stage.is-reduced-motion").waitFor();
    await assertViewportLocked(page, label);
    await assertPersistentBackLink(page, label);
    const firstOrigin = await assertOriginMarker(page, label, { matchCurrentRouteStart: true });
    await assertResponsiveOverlayLayout(page, label);
    if (await page.locator(".journey-route-reveal").count()) {
      fail(label, "reduced-motion view mounts an animated route reveal");
    }
    if (await page.locator(".journey-season-picker button").count() !== seasonCount + 1) {
      fail(label, "reduced-motion view does not expose every mapped season and overview");
    }
    const lastSeasonButton = page.locator(".journey-season-picker button").nth(seasonCount - 1);
    await lastSeasonButton.click();
    await page.waitForFunction((index) => (
      document.querySelectorAll(".journey-season-picker button")[index]
        ?.getAttribute("aria-current") === "step"
    ), seasonCount - 1, { timeout: 3_000 })
      .catch(() => fail(label, "last mapped season was not selected"));
    await assertOriginMarker(page, `${label}-last-season`, { matchCurrentRouteStart: true });
    await page.getByRole("button", { name: "Show complete journey", exact: true }).click();
    await page.getByRole("button", { name: "Replay", exact: true }).waitFor();
    await assertPersistentBackLink(page, `${label}-complete`);
    await assertOriginMarker(page, `${label}-complete`, { expectedOrigin: firstOrigin });
  }

  reportErrors();
  await closeVerifiedContext(context);
}

async function verifyResponsiveViewports(browser) {
  const representative = journeys.find((journey) => journey.characterSlug === "daenerys-targaryen")
    ?? journeys[0];

  for (const profile of RESPONSIVE_VIEWPORTS) {
    const context = await newVerifiedContext(browser, {
      viewport: { width: profile.width, height: profile.height },
      hasTouch: profile.touch,
    });
    const page = await context.newPage();
    let label = `responsive-${profile.name}`;
    const reportErrors = collectBrowserErrors(page, () => label);

    for (const journey of journeys) {
      label = `responsive-${profile.name}-${journey.characterSlug}`;
      await openJourney(page, journey);
      await page.getByRole("button", { name: "Pause", exact: true }).click();
      await assertViewportLocked(page, label, { requireClasses: profile.width <= 880 });
      await assertPersistentBackLink(page, label);
      await assertOriginMarker(page, label, { matchCurrentRouteStart: true });
      await assertResponsiveOverlayLayout(page, label);
      await assertMarkerVisible(page, label);

      if (journey === representative) {
        const firstOrigin = await assertOriginMarker(page, label, { matchCurrentRouteStart: true });
        await advanceJourneyToCompletion(page, label, { touch: profile.touch });
        await assertPersistentBackLink(page, `${label}-complete`);
        await assertOriginMarker(page, `${label}-complete`, { expectedOrigin: firstOrigin });
        await assertViewportLocked(page, `${label}-complete`, { requireClasses: profile.width <= 880 });
        await assertResponsiveOverlayLayout(page, `${label}-complete`);
        await assertCompletionZoom(page, `${label}-complete`);
        await assertResponsiveOverlayLayout(page, `${label}-reset`);
        await page.screenshot({
          path: new URL(`${representative.characterSlug}-${profile.name}-complete.png`, outputDir).pathname,
        });
      }
    }

    reportErrors();
    await closeVerifiedContext(context);
  }
}

async function verifyEveryCharacterRoute(browser, characters) {
  const context = await newVerifiedContext(browser, { viewport: { width: 1100, height: 760 } });
  const page = await context.newPage();
  let label = "all-character-routes";
  const reportErrors = collectBrowserErrors(page, () => label);

  for (const [index, character] of characters.entries()) {
    label = `route-${character.seriesSlug}/${character.characterSlug}`;
    await gotoWithRetry(page, new URL(character.journeyUrl, baseUrl).href, {
      waitUntil: "domcontentloaded",
    });

    if (character.journeyStatus === "published") {
      await page.locator(".journey-stage:not(.pending-journey-stage)").waitFor();
      await page.locator(".journey-route").waitFor({ state: "attached" });
      await page.waitForFunction((name) => document.title.includes(name), character.name);
    } else {
      await page.locator(".pending-journey-stage").waitFor();
      await page.getByRole("heading", { name: character.name, exact: true }).waitFor();
      await page.getByText("Ongoing Story", { exact: true }).waitFor();
    }

    const backLinks = page.locator("a.journey-back-control[href='/home']");
    if (await backLinks.count() !== 1) {
      fail(label, `expected one persistent back link, found ${await backLinks.count()}`);
    }

    if (new URL(page.url()).pathname !== character.journeyUrl) {
      fail(label, `resolved to ${new URL(page.url()).pathname}`);
    }
    if ((index + 1) % 50 === 0) console.log(`Verified ${index + 1}/203 character routes…`);
  }

  reportErrors();
  await closeVerifiedContext(context);
}

async function verifyDeferredPhone(browser, deferredCharacter) {
  const context = await newVerifiedContext(browser, {
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await context.newPage();
  let label = `${deferredCharacter.characterSlug}-deferred-phone`;
  const reportErrors = collectBrowserErrors(page, () => label);
  await gotoWithRetry(page, new URL(deferredCharacter.journeyUrl, baseUrl).href, {
    waitUntil: "networkidle",
  });
  await page.getByRole("heading", { name: deferredCharacter.name, exact: true }).waitFor();
  await assertViewportLocked(page, label, { requireClasses: false });
  await assertPersistentBackLink(page, label);
  await assertResponsiveOverlayLayout(page, label);
  await page.getByText("Ongoing Story", { exact: true }).waitFor();
  if (await page.locator(".journey-map-image").count() !== 1) fail(label, "deferred view does not show the shared map");
  await page.screenshot({ path: new URL("deferred-character-phone.png", outputDir).pathname });
  reportErrors();
  await closeVerifiedContext(context);
}

async function verifyAutoplayLoadGate(browser) {
  const label = "journey-load-gate";
  const journey = journeys.find((candidate) => candidate.characterSlug === "arya-stark");
  const context = await newVerifiedContext(browser, { viewport: { width: 1440, height: 900 } });
  let releaseMap;
  const mapGate = new Promise((resolve) => {
    releaseMap = resolve;
  });

  await context.route("https://*.public.blob.vercel-storage.com/maps/world/**", async (route) => {
    await mapGate;
    await route.fallback();
  });

  const page = await context.newPage();
  const reportErrors = collectBrowserErrors(page, () => label);

  try {
    await page.goto(new URL(pathFor(journey), baseUrl).href, { waitUntil: "domcontentloaded" });
    await page.locator(".journey-route-reveal").waitFor({ state: "attached" });
    const before = await page.locator(".journey-route-reveal").evaluate((route) => ({
      kicker: document.querySelector(".journey-kicker")?.textContent,
      offset: Number.parseFloat(route.style.strokeDashoffset),
      mapWidth: document.querySelector(".journey-map-image")?.naturalWidth,
    }));

    if (before.mapWidth !== 0) {
      fail(label, "critical map decoded before the test released it");
    }

    // Arya's first season would finish in 3,350ms without the load gate.
    await page.waitForTimeout(3_600);
    const held = await page.locator(".journey-route-reveal").evaluate((route) => ({
      kicker: document.querySelector(".journey-kicker")?.textContent,
      offset: Number.parseFloat(route.style.strokeDashoffset),
    }));
    if (held.kicker !== before.kicker || Math.abs(held.offset - before.offset) > 0.25) {
      fail(label, "route autoplay progressed before the full page and critical map loaded");
    }

    releaseMap();
    await page.waitForLoadState("load");
    await page.waitForFunction(() => {
      const image = document.querySelector(".journey-map-image");
      return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
    });
    await page.waitForFunction((initialOffset) => {
      const route = document.querySelector(".journey-route-reveal");
      return route instanceof SVGGeometryElement
        && Number.parseFloat(route.style.strokeDashoffset) < initialOffset - 0.5;
    }, before.offset, { timeout: 10_000 });
  } finally {
    releaseMap();
    reportErrors();
    await closeVerifiedContext(context);
  }
}

async function verifyDragonPresentation(browser) {
  const context = await newVerifiedContext(browser, {
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  let label = "dragon-presentation";
  const reportErrors = collectBrowserErrors(page, () => label);

  const daenerys = journeys.find((journey) => journey.characterSlug === "daenerys-targaryen");
  const jon = journeys.find((journey) => journey.characterSlug === "jon-snow");
  await openJourney(page, daenerys);
  await page.getByRole("button", { name: "Season 5", exact: true }).click();
  if (await page.locator(".journey-route-dragon[data-dragon-id='drogon']").count() !== 1) {
    fail(label, "Daenerys Season 5 does not show the sourced Drogon flight leg");
  }
  await page.getByText("Drogon", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Show complete journey", exact: true }).click();
  await page.getByText("Drogon", { exact: true }).waitFor();

  label = "non-dragon-presentation";
  await openJourney(page, jon);
  if (await page.locator(".journey-route-dragon").count()) {
    fail(label, "a journey without sourced dragon travel renders a dragon leg");
  }

  label = "deferred-rider-presentation";
  await gotoWithRetry(page, new URL("/journeys/house-of-the-dragon/viserys-i-targaryen", baseUrl).href, {
    waitUntil: "networkidle",
  });
  await page.getByText("Ongoing Story", { exact: true }).waitFor();
  if (await page.locator(".journey-route-dragon, .journey-dragon-marker").count()) {
    fail(label, "Viserys renders Balerion without a sourced flight segment");
  }

  reportErrors();
  await closeVerifiedContext(context);
}

await mkdir(outputDir, { recursive: true });
const characters = await fetchEveryCharacter();
const characterRoutes = characters.map((character) => character.journeyUrl);
const mappedCharacters = characters.filter((character) => character.journeyStatus === "published");
const deferredCharacters = characters.filter((character) => character.journeyStatus === "deferred");
const pendingCharacters = characters.filter((character) => character.journeyStatus === "pending");
journeys = mappedCharacters.map((character) => ({
  seriesSlug: character.seriesSlug,
  characterSlug: character.characterSlug,
  characterName: character.name,
}));

if (characters.length !== 203) fail("catalogue-contract", `expected 203 characters, found ${characters.length}`);
if (new Set(characterRoutes).size !== 203) fail("catalogue-contract", "character routes are not unique");
if (mappedCharacters.length !== 126) fail("catalogue-contract", `expected 126 mapped characters, found ${mappedCharacters.length}`);
if (deferredCharacters.length !== 77) fail("catalogue-contract", `expected 77 deferred characters, found ${deferredCharacters.length}`);
if (pendingCharacters.length !== 0) fail("catalogue-contract", `expected 0 pending characters, found ${pendingCharacters.length}`);

const browser = await chromium.launch({ headless: true });

try {
  if (requestedPhases.has("load-gate")) await verifyAutoplayLoadGate(browser);
  if (requestedPhases.has("desktop")) await verifyPublishedDesktop(browser);
  if (requestedPhases.has("phone")) await verifyPublishedOnPhone(browser);
  if (requestedPhases.has("reduced-motion")) await verifyReducedMotion(browser);
  if (requestedPhases.has("responsive")) await verifyResponsiveViewports(browser);
  if (requestedPhases.has("routes")) await verifyEveryCharacterRoute(browser, characters);
  if (requestedPhases.has("deferred")) await verifyDeferredPhone(browser, deferredCharacters[0]);
  if (requestedPhases.has("dragons")) await verifyDragonPresentation(browser);
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`Character journey verification failed:\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  if (process.env.JOURNEY_VERIFY_PHASES) {
    console.log(`Selected character journey verification passed: ${[...requestedPhases].join(", ")}.`);
  } else {
    console.log("Character journey verification passed: load-gated autoplay, all 203 routes, 126 mapped journeys, 77 deferred HOTD states, persistent back links and origins, season continuity, dragon evidence, seven responsive viewports, bounded completion zoom/pan, mobile edge navigation, replay, and reduced-motion states.");
  }
}
