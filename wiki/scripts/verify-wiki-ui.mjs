import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.WIKI_VERIFY_URL || "http://127.0.0.1:5174/";
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
    const sheet = page.locator('[data-slot="sheet-content"]');
    await sheet.waitFor();
    const expectedSide = viewport.name === "phone" ? "bottom" : "right";
    if (await sheet.getAttribute("data-side") !== expectedSide) failures.push(`${viewport.name}: entry Sheet is on the wrong side`);
    await page.keyboard.press("Escape");
    await sheet.waitFor({ state: "hidden" });
    if (!await opener.evaluate((node) => document.activeElement === node)) failures.push(`${viewport.name}: Sheet did not return focus`);

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
  console.log("Wiki desktop, phone, theme, URL, and Sheet verification passed.");
}
