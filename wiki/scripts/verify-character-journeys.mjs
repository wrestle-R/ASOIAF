import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.JOURNEY_VERIFY_URL
  || process.env.VERIFY_BASE_URL
  || "http://127.0.0.1:5173";
const outputDir = new URL("../../artifacts/screenshots/character-journeys/", import.meta.url);
const journeys = [
  { seriesSlug: "game-of-thrones", characterSlug: "arya-stark", characterName: "Arya Stark" },
  { seriesSlug: "game-of-thrones", characterSlug: "brienne-of-tarth", characterName: "Brienne of Tarth" },
  { seriesSlug: "game-of-thrones", characterSlug: "cersei-lannister", characterName: "Cersei Lannister" },
  { seriesSlug: "game-of-thrones", characterSlug: "daenerys-targaryen", characterName: "Daenerys Targaryen" },
  { seriesSlug: "game-of-thrones", characterSlug: "jon-snow", characterName: "Jon Snow" },
  { seriesSlug: "game-of-thrones", characterSlug: "tyrion-lannister", characterName: "Tyrion Lannister" },
];
const publishedJourneyKeys = journeys.map((journey) => (
  `${journey.seriesSlug}/${journey.characterSlug}`
));
const failures = [];

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

function collectBrowserErrors(page, getLabel) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${getLabel()}: ${message.text()}`);
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
  if (metrics.scrollY !== 0) fail(label, "page did not begin at the viewport origin");

  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(100);
  if (await page.evaluate(() => window.scrollY) !== 0) fail(label, "wheel input scrolled the page");
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

  for (const selector of [".journey-controls", ".journey-progress"]) {
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
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  let label = "published-desktop";
  const reportErrors = collectBrowserErrors(page, () => label);

  for (const journey of journeys) {
    label = `${journey.characterSlug}-desktop`;
    const { firstKicker, seasonCount } = await openJourney(page, journey);

    if (await page.locator(".journey-map-image").count() !== 1) {
      fail(label, "journey does not use one persistent map image");
    }
    if (await page.locator(".journey-route").count() !== 1) {
      fail(label, "current season does not render exactly one route");
    }
    const dash = await page.locator(".journey-route").evaluate((element) => getComputedStyle(element).strokeDasharray);
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
      await page.keyboard.press("ArrowRight");
      await page.waitForFunction((previous) => (
        document.querySelector(".journey-kicker")?.textContent !== previous
      ), previousKicker);
      lastKicker = await page.locator(".journey-kicker").textContent();
    }
    await page.keyboard.press("ArrowRight");
    await page.getByRole("button", { name: "Replay", exact: true }).waitFor();
    await page.waitForTimeout(1_300);
    if (await page.locator(".journey-route-complete").count() !== seasonCount) {
      fail(label, "complete view does not show every season route");
    }
    if (await page.locator(".journey-marker").count()) fail(label, "complete view still shows a moving marker");
    const backHref = await page.getByRole("link", { name: "Back to Home", exact: true }).getAttribute("href");
    if (backHref !== "/home") fail(label, `completion action targets ${backHref}`);
    await page.screenshot({ path: new URL(`${journey.characterSlug}-desktop-complete.png`, outputDir).pathname });

    await page.keyboard.press("ArrowLeft");
    await page.locator(".journey-kicker", { hasText: lastKicker }).waitFor();
    await page.keyboard.press("ArrowRight");
    await page.getByRole("button", { name: "Replay", exact: true }).waitFor();
    await page.getByRole("button", { name: "Replay", exact: true }).click();
    await page.locator(".journey-kicker", { hasText: firstKicker }).waitFor();
  }

  reportErrors();
  await context.close();
}

async function verifyPublishedOnPhone(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await context.newPage();
  let label = "published-phone";
  const reportErrors = collectBrowserErrors(page, () => label);

  for (const journey of journeys) {
    label = `${journey.characterSlug}-phone`;
    const { firstKicker } = await openJourney(page, journey);
    await assertViewportLocked(page, label);
    await page.waitForTimeout(350);
    await assertMarkerVisible(page, label);

    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100);
    if (await page.locator(".journey-kicker").textContent() !== firstKicker) {
      fail(label, "desktop arrow navigation changed the phone season");
    }

    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await page.touchscreen.tap(330, 420);
    await page.waitForFunction((first) => (
      document.querySelector(".journey-kicker")?.textContent !== first
    ), firstKicker);
    await page.touchscreen.tap(60, 420);
    await page.locator(".journey-kicker", { hasText: firstKicker }).waitFor();
    if (/\b(?:click|tap)\b.{0,28}\b(?:left|right)\b/i.test(await page.locator("body").innerText())) {
      fail(label, "visible copy explains edge navigation");
    }
    await page.screenshot({ path: new URL(`${journey.characterSlug}-phone.png`, outputDir).pathname });
  }

  reportErrors();
  await context.close();
}

async function verifyReducedMotion(browser) {
  const context = await browser.newContext({
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
    await page.getByRole("button", { name: "Show complete journey", exact: true }).click();
    await page.getByRole("button", { name: "Replay", exact: true }).waitFor();
  }

  reportErrors();
  await context.close();
}

async function verifyEveryCharacterRoute(browser, characters) {
  const context = await browser.newContext({ viewport: { width: 1100, height: 760 } });
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
      await page.locator(".journey-route").waitFor();
      await page.waitForFunction((name) => document.title.includes(name), character.name);
    } else {
      await page.locator(".pending-journey-stage").waitFor();
      await page.getByRole("heading", { name: character.name, exact: true }).waitFor();
      await page.getByText("Journey being charted", { exact: true }).waitFor();
    }

    if (new URL(page.url()).pathname !== character.journeyUrl) {
      fail(label, `resolved to ${new URL(page.url()).pathname}`);
    }
    if ((index + 1) % 50 === 0) console.log(`Verified ${index + 1}/203 character routes…`);
  }

  reportErrors();
  await context.close();
}

async function verifyPendingPhone(browser, pendingCharacter) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await context.newPage();
  let label = `${pendingCharacter.characterSlug}-pending-phone`;
  const reportErrors = collectBrowserErrors(page, () => label);
  await gotoWithRetry(page, new URL(pendingCharacter.journeyUrl, baseUrl).href, {
    waitUntil: "networkidle",
  });
  await page.getByRole("heading", { name: pendingCharacter.name, exact: true }).waitFor();
  await assertViewportLocked(page, label, { requireClasses: false });
  if (await page.locator(".journey-map-image").count() !== 1) fail(label, "pending view does not show the shared map");
  await page.screenshot({ path: new URL("pending-character-phone.png", outputDir).pathname });
  reportErrors();
  await context.close();
}

await mkdir(outputDir, { recursive: true });
const characters = await fetchEveryCharacter();
const characterRoutes = characters.map((character) => character.journeyUrl);
const mappedCharacters = characters.filter((character) => character.journeyStatus === "published");
const pendingCharacters = characters.filter((character) => character.journeyStatus === "pending");

if (characters.length !== 203) fail("catalogue-contract", `expected 203 characters, found ${characters.length}`);
if (new Set(characterRoutes).size !== 203) fail("catalogue-contract", "character routes are not unique");
if (mappedCharacters.length !== 6) fail("catalogue-contract", `expected 6 mapped characters, found ${mappedCharacters.length}`);
if (pendingCharacters.length !== 197) fail("catalogue-contract", `expected 197 pending characters, found ${pendingCharacters.length}`);
const apiPublishedKeys = mappedCharacters.map((character) => `${character.seriesSlug}/${character.characterSlug}`).sort();
if (JSON.stringify(apiPublishedKeys) !== JSON.stringify([...publishedJourneyKeys].sort())) {
  fail("catalogue-contract", "API mapped statuses do not match the six published journey definitions");
}

const browser = await chromium.launch({ headless: true });

try {
  await verifyPublishedDesktop(browser);
  await verifyPublishedOnPhone(browser);
  await verifyReducedMotion(browser);
  await verifyEveryCharacterRoute(browser, characters);
  await verifyPendingPhone(browser, pendingCharacters[0]);
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`Character journey verification failed:\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log("Character journey verification passed: all 203 routes, six mapped journeys, mobile edge navigation, completion, replay, pending, and reduced-motion states.");
}
