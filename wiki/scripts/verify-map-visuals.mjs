import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

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

try {
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const reportErrors = await collectErrors(page, "landing");
    await page.goto(new URL("/", baseUrl).href, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "A Wiki of Ice and Fire", exact: true }).waitFor();
    if (await page.locator(".cinematic, .ink-loader, .topbar, .map-stage").count()) {
      failures.push("landing: retired cinematic, loader, top bar, or interactive map is present");
    }
    const wikiHref = await page.getByRole("link", { name: /Enter the Wiki/ }).getAttribute("href");
    const mapHref = await page.getByRole("link", { name: /View the Map/ }).getAttribute("href");
    if (wikiHref !== "/wiki" || mapHref !== "/map") failures.push("landing: navigation targets are incorrect");
    await page.screenshot({ path: new URL("landing-desktop.png", outputDir).pathname });
    reportErrors();
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const reportErrors = await collectErrors(page, "tour-desktop");
    await page.goto(new URL("/map", baseUrl).href, { waitUntil: "networkidle" });
    await page.locator(".realm-stage").waitFor();
    if (await page.locator(".realm-map-image").count() !== 1) failures.push("tour-desktop: live tour does not use one map image");
    if (await page.locator(".house-marker, .map-detail-panel, [aria-label^='Open House']").count()) {
      failures.push("tour-desktop: clickable realm markers or a detail panel remain");
    }
    const source = await page.locator(".realm-map-image").getAttribute("src");
    if (!source?.endsWith("world-map-houses.webp")) failures.push(`tour-desktop: wrong map source ${source}`);

    const initialTransform = await page.locator(".realm-map-frame").evaluate((node) => getComputedStyle(node).transform);
    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await page.waitForTimeout(3400);
    if (!await page.getByRole("heading", { name: "The North", exact: true }).count()) failures.push("tour-desktop: pause did not freeze the realm");
    const pausedTransform = await page.locator(".realm-map-frame").evaluate((node) => getComputedStyle(node).transform);
    if (pausedTransform !== initialTransform) failures.push("tour-desktop: camera moved while paused");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByRole("heading", { name: "The Vale", exact: true }).waitFor({ timeout: 5500 });
    const movedTransform = await page.locator(".realm-map-frame").evaluate((node) => getComputedStyle(node).transform);
    if (movedTransform === pausedTransform) failures.push("tour-desktop: camera did not move between realms");
    await page.waitForTimeout(700);
    await page.screenshot({ path: new URL("tour-desktop-vale.png", outputDir).pathname });

    await page.getByRole("heading", { name: "Dorne", exact: true }).waitFor({ timeout: 35000 });
    await page.getByRole("button", { name: "Replay", exact: true }).waitFor({ timeout: 5000 });
    await page.screenshot({ path: new URL("tour-desktop-dorne.png", outputDir).pathname });
    await page.getByRole("button", { name: "Replay", exact: true }).click();
    await page.getByRole("heading", { name: "The North", exact: true }).waitFor();
    reportErrors();
    await context.close();
  }

  for (const viewport of [
    { name: "phone-portrait", width: 390, height: 844 },
    { name: "phone-landscape", width: 844, height: 390 },
  ]) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    const reportErrors = await collectErrors(page, viewport.name);
    await page.goto(new URL("/map", baseUrl).href, { waitUntil: "networkidle" });
    await page.locator(".realm-stage").waitFor();
    const source = await page.locator(".realm-map-image").getAttribute("src");
    if (!source?.endsWith("world-map-realms-mobile-capitals.webp")) failures.push(`${viewport.name}: wrong portrait map source ${source}`);
    const geometry = await page.locator(".realm-map-frame").evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: innerWidth, height: innerHeight };
    });
    if (geometry.left > 0 || geometry.right < geometry.width || geometry.top > 0 || geometry.bottom < geometry.height) {
      failures.push(`${viewport.name}: camera exposes an empty map edge`);
    }
    await page.screenshot({ path: new URL(`${viewport.name}.png`, outputDir).pathname });
    reportErrors();
    await context.close();
  }

  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const reportErrors = await collectErrors(page, "tour-reduced-motion");
    await page.goto(new URL("/map", baseUrl).href, { waitUntil: "networkidle" });
    await page.locator(".realm-poster").waitFor();
    if (await page.locator(".realm-stage, .realm-map-frame").count()) failures.push("tour-reduced-motion: animated camera is present");
    if (await page.locator(".realm-picker button").count() !== 9) failures.push("tour-reduced-motion: all nine posters are not selectable");
    for (let index = 1; index <= 9; index += 1) {
      await page.locator(".realm-picker button").nth(index - 1).click();
      const poster = await page.locator(".realm-poster > img").getAttribute("src");
      if (!poster?.includes(`realm-${String(index).padStart(2, "0")}-`)) failures.push(`tour-reduced-motion: poster ${index} is incorrect`);
    }
    await page.screenshot({ path: new URL("tour-reduced-motion-dorne.png", outputDir).pathname });
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
  console.log("Landing and nine-realm tour verification passed.");
}
