import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { REALM_TOUR } from "../src/data/realmTour.js";

const baseUrl = process.env.MAP_VERIFY_URL || "http://127.0.0.1:5174/";
const outputDir = new URL("../../artifacts/screenshots/map-verification/", import.meta.url);
const failures = [];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

async function collectErrors(page, label) {
  const errors = [];
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  return () => errors.length && failures.push(`${label}: ${errors.join(" | ")}`);
}

async function mapGeometry(page) {
  return page.locator(".realm-map-frame").evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: innerWidth,
      height: innerHeight,
    };
  });
}

async function assertHighlight(page, label, expectedSigilSize) {
  if (await page.locator(".realm-capital-link line").count() !== 1) {
    failures.push(`${label}: expected one capital-to-sigil connector`);
  }
  if (await page.locator(".realm-capital-link circle").count()) {
    failures.push(`${label}: legacy capital endpoint circle remains`);
  }
  await page.waitForTimeout(1100);
  const sigilSize = await page.locator(".realm-sigil").evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  if (Math.abs(sigilSize.width - expectedSigilSize) > 2 || Math.abs(sigilSize.height - expectedSigilSize) > 2) {
    failures.push(`${label}: expected ${expectedSigilSize}px sigil, received ${sigilSize.width}x${sigilSize.height}`);
  }
}

async function assertCompleteMap(page, label) {
  await page.getByRole("button", { name: "Replay", exact: true }).waitFor({ timeout: 40000 });
  await page.waitForTimeout(1300);
  if (await page.locator(".realm-copy, .realm-capital-link, .realm-spotlight, .realm-vignette, .realm-progress").count()) {
    failures.push(`${label}: realm overlays remain over the complete map`);
  }
  const wikiHref = await page.getByRole("link", { name: "Explore the Wiki", exact: true }).getAttribute("href");
  if (wikiHref !== "/wiki") failures.push(`${label}: complete-map wiki action targets ${wikiHref}`);
  const geometry = await mapGeometry(page);
  const tolerance = 1.5;
  if (
    geometry.left < -tolerance
    || geometry.right > geometry.width + tolerance
    || geometry.top < -tolerance
    || geometry.bottom > geometry.height + tolerance
  ) {
    failures.push(`${label}: complete map is cropped (${JSON.stringify(geometry)})`);
  }
}

async function assertViewportLocked(page, label) {
  const before = await page.evaluate(() => ({
    bodyOverflow: getComputedStyle(document.body).overflow,
    documentOverflow: getComputedStyle(document.documentElement).overflow,
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: document.documentElement.clientHeight,
    scrollY: window.scrollY,
  }));

  if (before.bodyOverflow !== "hidden" || before.documentOverflow !== "hidden") {
    failures.push(`${label}: document overflow is not locked`);
  }
  if (before.scrollHeight > before.viewportHeight + 1) {
    failures.push(`${label}: page height exceeds the viewport`);
  }
  if (before.scrollY !== 0) failures.push(`${label}: page did not begin at the viewport origin`);

  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(100);
  if (await page.evaluate(() => window.scrollY) !== 0) failures.push(`${label}: wheel input scrolled the page`);
}

try {
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const reportErrors = await collectErrors(page, "tour-desktop");
    await page.goto(new URL("/", baseUrl).href, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "The North", exact: true }).waitFor();
    if (await page.locator(".landing-page, .realm-poster, .house-marker, .map-detail-panel").count()) {
      failures.push("tour-desktop: retired landing, poster picker, or interactive map UI remains");
    }
    if (await page.locator(".realm-map-image").count() !== 1) {
      failures.push("tour-desktop: live tour does not use one persistent map image");
    }
    const source = await page.locator(".realm-map-image").getAttribute("src");
    if (!source?.endsWith("world-map-houses.webp")) failures.push(`tour-desktop: wrong map source ${source}`);
    await assertHighlight(page, "tour-desktop", 76);

    await page.keyboard.press("ArrowRight");
    await page.getByRole("heading", { name: "The Vale", exact: true }).waitFor();
    await page.keyboard.press("ArrowLeft");
    await page.getByRole("heading", { name: "The North", exact: true }).waitFor();
    await page.waitForTimeout(1200);

    const initialTransform = await page.locator(".realm-map-frame").evaluate((node) => getComputedStyle(node).transform);
    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await page.waitForTimeout(3400);
    if (!await page.getByRole("heading", { name: "The North", exact: true }).count()) {
      failures.push("tour-desktop: pause did not freeze the realm");
    }
    const pausedTransform = await page.locator(".realm-map-frame").evaluate((node) => getComputedStyle(node).transform);
    if (pausedTransform !== initialTransform) failures.push("tour-desktop: camera moved while paused");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByRole("heading", { name: "The Vale", exact: true }).waitFor({ timeout: 5500 });
    const movedTransform = await page.locator(".realm-map-frame").evaluate((node) => getComputedStyle(node).transform);
    if (movedTransform === pausedTransform) failures.push("tour-desktop: camera did not move between realms");
    await page.waitForTimeout(700);
    await page.screenshot({ path: new URL("tour-desktop-vale.png", outputDir).pathname });

    await assertCompleteMap(page, "tour-desktop");
    await page.screenshot({ path: new URL("tour-desktop-complete.png", outputDir).pathname });
    await page.keyboard.press("ArrowLeft");
    await page.getByRole("heading", { name: "Dorne", exact: true }).waitFor();
    await page.keyboard.press("ArrowRight");
    await page.getByRole("button", { name: "Replay", exact: true }).waitFor();
    await page.getByRole("button", { name: "Replay", exact: true }).click();
    await page.getByRole("heading", { name: "The North", exact: true }).waitFor();
    reportErrors();
    await context.close();
  }

  for (const viewport of [
    { name: "phone-portrait", width: 390, height: 844, verifyComplete: true },
    { name: "phone-landscape", width: 844, height: 390, verifyComplete: false },
  ]) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      hasTouch: true,
    });
    const page = await context.newPage();
    const reportErrors = await collectErrors(page, viewport.name);
    await page.goto(new URL("/", baseUrl).href, { waitUntil: "networkidle" });
    await page.locator(".realm-stage").waitFor();
    await assertViewportLocked(page, viewport.name);
    const source = await page.locator(".realm-map-image").getAttribute("src");
    if (!source?.endsWith("world-map-realms-mobile-capitals.webp")) {
      failures.push(`${viewport.name}: wrong portrait map source ${source}`);
    }
    await assertHighlight(page, viewport.name, 59);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(200);
    if (!await page.getByRole("heading", { name: "The North", exact: true }).count()) {
      failures.push(`${viewport.name}: desktop arrow binding changed the phone realm`);
    }
    await page.getByRole("button", { name: "Pause", exact: true }).click();
    if (!await page.getByRole("heading", { name: "The North", exact: true }).count()) {
      failures.push(`${viewport.name}: pause control advanced the realm`);
    }
    await page.touchscreen.tap(viewport.width * 0.82, viewport.height * 0.5);
    await page.getByRole("heading", { name: "The Vale", exact: true }).waitFor();
    await page.touchscreen.tap(viewport.width * 0.18, viewport.height * 0.5);
    await page.getByRole("heading", { name: "The North", exact: true }).waitFor();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    const geometry = await mapGeometry(page);
    if (geometry.left > 0 || geometry.right < geometry.width || geometry.top > 0 || geometry.bottom < geometry.height) {
      failures.push(`${viewport.name}: camera exposes an empty map edge`);
    }
    await page.screenshot({ path: new URL(`${viewport.name}-north.png`, outputDir).pathname });
    if (viewport.verifyComplete) {
      for (const realm of REALM_TOUR) {
        await page.getByRole("heading", { name: realm.name, exact: true }).waitFor({ timeout: 5500 });
        await page.waitForTimeout(900);
        await page.screenshot({
          path: new URL(`${viewport.name}-realm-${String(realm.order).padStart(2, "0")}.png`, outputDir).pathname,
        });
      }
      await assertCompleteMap(page, viewport.name);
      await page.screenshot({ path: new URL(`${viewport.name}-complete.png`, outputDir).pathname });
    }
    reportErrors();
    await context.close();
  }

  for (const path of ["/map", "/the-page-that-was-promised"]) {
    const label = path === "/map" ? "retired-map-route" : "unknown-route";
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const reportErrors = await collectErrors(page, label);
    await page.goto(new URL(path, baseUrl).href, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "This page has been lost to history.", exact: true }).waitFor();
    if (new URL(page.url()).pathname !== path) failures.push(`${label}: URL redirected unexpectedly`);
    const returnHref = await page.getByRole("link", { name: "Return to the Map", exact: true }).getAttribute("href");
    const wikiHref = await page.getByRole("link", { name: "Explore the Wiki", exact: true }).getAttribute("href");
    if (returnHref !== "/" || wikiHref !== "/wiki") failures.push(`${label}: 404 actions are incorrect`);
    await page.screenshot({ path: new URL(`${label}.png`, outputDir).pathname });
    reportErrors();
    await context.close();
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`Map tour verification failed:\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log("Root tour, complete map, responsive sigils, and 404 verification passed.");
}
