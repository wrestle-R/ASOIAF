import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.JOURNEY_VERIFY_URL || "http://127.0.0.1:5173";
const outputDir = new URL("../../artifacts/screenshots/daenerys-journey/", import.meta.url);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function openPage(browser, options = {}) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${baseUrl}/danerys`, { waitUntil: "networkidle" });
  return { context, page, errors };
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  {
    const { context, page, errors } = await openPage(browser, {
      viewport: { width: 1440, height: 900 },
    });
    await page.locator(".journey-stage").waitFor();
    assert(await page.locator(".journey-map-image").count() === 1, "desktop must render one persistent map image");
    const imageSource = await page.locator(".journey-map-image").getAttribute("src");
    const route = page.locator(".journey-route");
    const routeReveal = page.locator(".journey-route-reveal");
    const routeDasharray = await route.evaluate((element) => getComputedStyle(element).strokeDasharray);
    assert(routeDasharray !== "none", "visible route must use a dotted stroke");
    assert(
      (await page.locator(".journey-stop").first().evaluate((element) => getComputedStyle(element).fill)) === "none",
      "stay markers must be hollow dotted rings",
    );
    await page.waitForTimeout(180);
    const offsetBefore = Number.parseFloat(await routeReveal.evaluate((element) => element.style.strokeDashoffset));
    await page.waitForTimeout(650);
    const offsetAfter = Number.parseFloat(await routeReveal.evaluate((element) => element.style.strokeDashoffset));
    assert(offsetAfter < offsetBefore, "route stroke must draw forward");

    await page.getByRole("button", { name: "Pause" }).click();
    const pausedOffset = Number.parseFloat(await routeReveal.evaluate((element) => element.style.strokeDashoffset));
    await page.waitForTimeout(650);
    const stillPausedOffset = Number.parseFloat(await routeReveal.evaluate((element) => element.style.strokeDashoffset));
    assert(Math.abs(stillPausedOffset - pausedOffset) < 0.2, "pause must stop route progress");
    await page.getByRole("button", { name: "Continue" }).click();

    await page.locator(".journey-kicker", { hasText: "Season 2 of 8" }).waitFor({ timeout: 7000 });
    assert(await page.locator(".journey-map-image").getAttribute("src") === imageSource, "season changes must not swap the map image");
    await page.screenshot({ path: new URL("desktop-season-2.png", outputDir).pathname });

    await page.getByRole("button", { name: "Replay" }).waitFor({ timeout: 45000 });
    assert(await page.locator(".journey-kicker").textContent() === "Season 8 of 8", "animation must stop on Season 8");
    await page.screenshot({ path: new URL("desktop-complete.png", outputDir).pathname });
    await page.getByRole("button", { name: "Replay" }).click();
    await page.locator(".journey-kicker", { hasText: "Season 1 of 8" }).waitFor();
    assert(errors.length === 0, `desktop browser errors: ${errors.join(" | ")}`);
    await context.close();
  }

  {
    const { context, page, errors } = await openPage(browser, {
      viewport: { width: 390, height: 844 },
    });
    await page.locator(".journey-stage").waitFor();
    assert(await page.locator(".journey-map-image").count() === 1, "phone must render one map image");
    assert(await page.getByRole("button", { name: "Pause" }).isVisible(), "phone pause control must be visible");
    await page.screenshot({ path: new URL("phone-season-1.png", outputDir).pathname });
    assert(errors.length === 0, `phone browser errors: ${errors.join(" | ")}`);
    await context.close();
  }

  {
    const { context, page, errors } = await openPage(browser, {
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    await page.locator(".journey-page-static").waitFor();
    assert(await page.locator(".journey-route-layer").count() === 0, "reduced motion must not mount the animated route");
    assert(await page.locator(".journey-static-shell > img").count() === 1, "reduced motion must show a fallback poster");
    assert(await page.locator(".journey-season-picker button").count() === 8, "reduced motion must expose all seasons");
    await page.getByRole("button", { name: "8", exact: true }).click();
    assert((await page.locator(".journey-static-shell > img").getAttribute("src")).endsWith("season-08.webp"), "Season 8 fallback must be selectable");
    await page.screenshot({ path: new URL("phone-reduced-motion-season-8.png", outputDir).pathname });
    assert(errors.length === 0, `reduced-motion browser errors: ${errors.join(" | ")}`);
    await context.close();
  }

  console.log("Daenerys journey verification passed: desktop animation, completion/replay, phone, and reduced motion.");
} finally {
  await browser.close();
}
