import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.CATALOG_VERIFY_URL
  || process.env.VERIFY_BASE_URL
  || "http://127.0.0.1:5173";
const outputDir = new URL("../../artifacts/screenshots/catalog-verification/", import.meta.url);
const failures = [];

function fail(label, message) {
  failures.push(`${label}: ${message}`);
}

async function waitForCatalogue(page) {
  await page.locator(".character-grid").waitFor({ timeout: 10_000 });
  await page.locator(".catalog-loading").waitFor({ state: "detached" }).catch(() => {});
}

async function runAfterCharacterRequest(page, action) {
  const response = page.waitForResponse((candidate) => (
    candidate.url().includes("/api/characters?") && candidate.request().method() === "GET"
  ));
  await action();
  await response;
  await waitForCatalogue(page);
}

function collectBrowserErrors(page, label) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return () => {
    if (errors.length) fail(label, `browser errors: ${errors.join(" | ")}`);
  };
}

async function assertInitialCatalogue(page, label) {
  await page.goto(new URL("/home", baseUrl).href, { waitUntil: "networkidle" });
  await waitForCatalogue(page);

  if (await page.title() !== "Map of Ice and Fire") {
    fail(label, `unexpected document title: ${await page.title()}`);
  }
  if (!await page.getByRole("heading", { name: "Trace every character. Season by season.", exact: true }).count()) {
    fail(label, "character catalogue heading is missing");
  }
  if (await page.locator(".character-card").count() !== 30) {
    fail(label, `first page should contain 30 cards, found ${await page.locator(".character-card").count()}`);
  }
  if (await page.locator('[data-journey-status="published"]').count() !== 30) {
    fail(label, "published journeys are not presented first");
  }

  const initialHrefs = await page.locator(".character-card > a").evaluateAll((links) => (
    links.map((link) => link.getAttribute("href"))
  ));
  for (const href of initialHrefs) {
    if (!/^\/journeys\/[a-z0-9-]+\/[a-z0-9-]+$/.test(href ?? "")) {
      fail(label, `non-canonical character destination: ${href}`);
    }
  }

  const visibleCopy = await page.locator("body").innerText();
  if (/\b(?:wiki|archive)\b/i.test(visibleCopy)) {
    fail(label, "retired product wording is still visible");
  }
  const realmHref = await page.getByRole("link", { name: "Realm map", exact: true }).getAttribute("href");
  if (realmHref !== "/") fail(label, `realm map link targets ${realmHref}`);
}

async function assertThemePersistence(page, label) {
  const pageRoot = page.locator(".catalog-page");
  const initialTheme = await pageRoot.getAttribute("data-theme");
  const toggle = page.getByRole("button", { name: /Switch to .* theme/ });
  await toggle.click();
  const nextTheme = await pageRoot.getAttribute("data-theme");
  if (!initialTheme || !nextTheme || initialTheme === nextTheme) {
    fail(label, "theme did not change");
    return;
  }

  await page.reload({ waitUntil: "networkidle" });
  await waitForCatalogue(page);
  if (await pageRoot.getAttribute("data-theme") !== nextTheme) {
    fail(label, "theme did not persist after reload");
  }
}

async function assertFiltersAndAllCharacters(page, label) {
  const search = page.getByRole("searchbox", { name: "Find a character" });
  await runAfterCharacterRequest(page, () => search.fill("Stark"));
  if (new URL(page.url()).searchParams.get("search") !== "Stark") {
    fail(label, "search was not preserved in the URL");
  }
  if (await page.locator(".character-card").count() === 0) {
    fail(label, "search returned no character cards");
  }

  await runAfterCharacterRequest(page, () => page.getByRole("button", { name: "Clear search" }).click());
  await runAfterCharacterRequest(page, () => page.getByRole("button", { name: "House of the Dragon", exact: true }).click());
  if (new URL(page.url()).searchParams.get("series") !== "house-of-the-dragon") {
    fail(label, "series filter was not preserved in the URL");
  }
  const seriesLabels = await page.locator(".character-card figcaption").allTextContents();
  if (!seriesLabels.length || seriesLabels.some((value) => value !== "House of the Dragon")) {
    fail(label, "series filter returned characters from another series");
  }

  await runAfterCharacterRequest(page, () => page.getByRole("button", { name: "All characters", exact: true }).click());
  for (let pageNumber = 0; pageNumber < 7; pageNumber += 1) {
    const loadMore = page.getByRole("button", { name: /Show more characters|Charting more characters/ });
    if (!await loadMore.count()) break;
    const countBefore = await page.locator(".character-card").count();
    await runAfterCharacterRequest(page, () => loadMore.click());
    const countAfter = await page.locator(".character-card").count();
    if (countAfter <= countBefore) {
      fail(label, "Show more characters did not append results");
      break;
    }
  }

  const cards = page.locator(".character-card");
  const hrefs = await cards.locator(":scope > a").evaluateAll((links) => (
    links.map((link) => link.getAttribute("href"))
  ));
  if (hrefs.length !== 203) fail(label, `expected 203 character cards, found ${hrefs.length}`);
  if (new Set(hrefs).size !== 203) fail(label, "character destinations are not unique");
  if (hrefs.some((href) => !/^\/journeys\/[a-z0-9-]+\/[a-z0-9-]+$/.test(href ?? ""))) {
    fail(label, "one or more cards has a non-canonical journey URL");
  }
  const mappedCount = await cards.filter({ has: page.locator('[data-status="published"]') }).count();
  const deferredCount = await cards.filter({ has: page.locator('[data-status="deferred"]') }).count();
  const pendingCount = await cards.filter({ has: page.locator('[data-status="pending"]') }).count();
  if (mappedCount !== 126) fail(label, `expected 126 mapped cards, found ${mappedCount}`);
  if (deferredCount !== 77) fail(label, `expected 77 ongoing cards, found ${deferredCount}`);
  if (pendingCount !== 0) fail(label, `expected no pending cards, found ${pendingCount}`);
}

async function assertCardDestinations(page, label) {
  const mappedCard = page.locator('[data-journey-status="published"]').first();
  const mappedHref = await mappedCard.locator(":scope > a").getAttribute("href");
  await mappedCard.locator(":scope > a").click();
  await page.locator(".journey-stage:not(.pending-journey-stage)").waitFor();
  if (new URL(page.url()).pathname !== mappedHref) {
    fail(label, `mapped card navigated to ${new URL(page.url()).pathname}`);
  }

  await page.goto(new URL("/home?series=house-of-the-dragon", baseUrl).href, { waitUntil: "networkidle" });
  await waitForCatalogue(page);
  const pendingCard = page.locator('[data-journey-status="deferred"]').first();
  const pendingHref = await pendingCard.locator(":scope > a").getAttribute("href");
  await pendingCard.locator(":scope > a").click();
  await page.locator(".pending-journey-stage").waitFor();
  if (new URL(page.url()).pathname !== pendingHref) {
    fail(label, `ongoing card navigated to ${new URL(page.url()).pathname}`);
  }
  await page.getByText("After HOTD Season 4", { exact: true }).waitFor({ timeout: 10_000 })
    .catch(() => fail(label, "ongoing card does not open an honest deferred state"));
  if (await page.getByRole("link", { name: "Back to Home", exact: true }).getAttribute("href") !== "/home") {
    fail(label, "ongoing journey does not return to the catalogue");
  }
}

async function assertPhoneGrid(page, label) {
  const cards = page.locator(".character-card");
  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  const third = await cards.nth(2).boundingBox();
  if (!first || !second || !third) {
    fail(label, "phone card geometry is unavailable");
    return;
  }
  if (Math.abs(first.y - second.y) > 2 || third.y <= first.y + first.height) {
    fail(label, "phone catalogue is not a stable two-column grid");
  }
  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  if (overflows) fail(label, "phone catalogue overflows horizontally");
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const reportErrors = collectBrowserErrors(page, "catalog-desktop");
    await assertInitialCatalogue(page, "catalog-desktop");
    await assertThemePersistence(page, "catalog-desktop");
    await assertFiltersAndAllCharacters(page, "catalog-desktop");
    await page.screenshot({
      path: new URL("catalog-desktop-all-characters.png", outputDir).pathname,
      fullPage: false,
    });
    await assertCardDestinations(page, "catalog-desktop");

    await page.goto(new URL("/wiki", baseUrl).href, { waitUntil: "networkidle" });
    await waitForCatalogue(page);
    if (new URL(page.url()).pathname !== "/home") {
      fail("catalog-desktop", `retired route resolved to ${new URL(page.url()).pathname}`);
    }
    reportErrors();
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
    const page = await context.newPage();
    const reportErrors = collectBrowserErrors(page, "catalog-phone");
    await assertInitialCatalogue(page, "catalog-phone");
    await assertPhoneGrid(page, "catalog-phone");
    await assertThemePersistence(page, "catalog-phone");
    await page.screenshot({
      path: new URL("catalog-phone.png", outputDir).pathname,
      fullPage: true,
    });
    reportErrors();
    await context.close();
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`Character catalogue verification failed:\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log("Character catalogue verification passed: 203 routes, filters, themes, card destinations, and responsive layout.");
}
