import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.WIKI_VERIFY_URL || "http://127.0.0.1:5173/";
const outputDir = new URL("../../artifacts/screenshots/wiki-verification/", import.meta.url);
const failures = [];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 900 },
    { name: "phone", width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(new URL("/wiki", baseUrl).href, { waitUntil: "networkidle" });
    await page.locator(".wiki-grid").waitFor();
    const mapLinks = page.getByRole("link", { name: /Map|View the map/ });
    for (let index = 0; index < await mapLinks.count(); index += 1) {
      const href = await mapLinks.nth(index).getAttribute("href");
      if (href !== "/") failures.push(`${viewport.name}: wiki map link targets ${href}`);
    }
    const expectedColumns = viewport.name === "phone" ? 2 : 3;
    const cards = page.locator(".wiki-entry-card");
    if (await cards.count() < expectedColumns) failures.push(`${viewport.name}: archive grid did not load`);

    const toggle = page.getByRole("button", { name: /Switch to .* theme/ });
    const initialTheme = await page.locator(".wiki-page").getAttribute("data-theme");
    await page.screenshot({
      path: new URL(`wiki-${viewport.name}-${initialTheme}.png`, outputDir).pathname,
      fullPage: true,
    });
    await toggle.click();
    const nextTheme = await page.locator(".wiki-page").getAttribute("data-theme");
    if (initialTheme === nextTheme) failures.push(`${viewport.name}: theme did not change`);
    await page.reload({ waitUntil: "networkidle" });
    if (await page.locator(".wiki-page").getAttribute("data-theme") !== nextTheme) failures.push(`${viewport.name}: theme did not persist`);

    const opener = cards.first().getByRole("button");
    await opener.click();
    const dialog = page.locator('[data-slot="dialog-content"]');
    await dialog.waitFor();
    const box = await dialog.boundingBox();
    if (!box) {
      failures.push(`${viewport.name}: entry dialog has no visible bounds`);
    } else {
      const horizontalOffset = Math.abs((box.x + box.width / 2) - viewport.width / 2);
      const verticalOffset = Math.abs((box.y + box.height / 2) - viewport.height / 2);
      if (horizontalOffset > 2 || verticalOffset > 2) failures.push(`${viewport.name}: entry dialog is not centered`);
      if (viewport.name === "desktop" && box.width < 800) failures.push(`${viewport.name}: entry dialog is too narrow`);
      if (viewport.name === "phone" && box.width > viewport.width - 6) failures.push(`${viewport.name}: entry dialog lacks a viewport gutter`);
    }
    if (await dialog.locator('[data-slot="dialog-title"]').count() !== 1) failures.push(`${viewport.name}: entry dialog is missing its title`);
    if (await page.locator('[data-slot="sheet-content"]').count()) failures.push(`${viewport.name}: retired entry Sheet is still rendered`);
    await page.screenshot({
      path: new URL(`wiki-entry-${viewport.name}-${nextTheme}.png`, outputDir).pathname,
    });
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    if (!await opener.evaluate((node) => document.activeElement === node)) failures.push(`${viewport.name}: dialog did not return focus`);

    const search = page.getByRole("searchbox", { name: "Search the archive" });
    await search.fill("Stark");
    await page.waitForTimeout(400);
    if (!page.url().includes("search=Stark")) failures.push(`${viewport.name}: search URL was not preserved`);
    await page.screenshot({ path: new URL(`wiki-${viewport.name}-${nextTheme}.png`, outputDir).pathname, fullPage: true });
    if (errors.length) failures.push(`${viewport.name}: ${errors.join(" | ")}`);
    await context.close();
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`Wiki verification failed:\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log("Wiki desktop, phone, theme, URL, and centered dialog verification passed.");
}
