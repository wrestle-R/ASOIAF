import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.MAP_VERIFY_URL || "http://127.0.0.1:5174/";
const outputDir = new URL("../../artifacts/screenshots/map-verification/", import.meta.url);
const houses = [
  "House Stark",
  "House Arryn",
  "House Tully",
  "House Greyjoy",
  "House Lannister",
  "House Targaryen",
  "House Tyrell",
  "House Baratheon",
  "House Martell",
];
const viewports = [
  { name: "desktop-ultrawide-2560x1080", width: 2560, height: 1080, mobile: false },
  { name: "desktop-wide-1920x1080", width: 1920, height: 1080, mobile: false },
  { name: "desktop-tall-1920x1200", width: 1920, height: 1200, mobile: false },
  { name: "desktop-1600x900", width: 1600, height: 900, mobile: false },
  { name: "desktop-1440x900", width: 1440, height: 900, mobile: false },
  { name: "desktop-1366x768", width: 1366, height: 768, mobile: false },
  { name: "desktop-1280x720", width: 1280, height: 720, mobile: false },
  { name: "desktop-1024x768", width: 1024, height: 768, mobile: false },
  { name: "desktop-900x1200", width: 900, height: 1200, mobile: false },
  { name: "desktop-breakpoint-881x900", width: 881, height: 900, mobile: false },
  { name: "phone-breakpoint-880x900", width: 880, height: 900, mobile: true },
  { name: "tablet-768x1024", width: 768, height: 1024, mobile: true },
  { name: "phone-430x932", width: 430, height: 932, mobile: true },
  { name: "phone-412x915", width: 412, height: 915, mobile: true },
  { name: "phone-390x844", width: 390, height: 844, mobile: true },
  { name: "phone-375x812", width: 375, height: 812, mobile: true },
  { name: "phone-360x800", width: 360, height: 800, mobile: true },
  { name: "phone-small-320x568", width: 320, height: 568, mobile: true },
];

function overlaps(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const failures = [];
let screenshotCount = 0;

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();
    const browserErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.locator(".map-stage").waitFor();
    await page.screenshot({ path: new URL(`${viewport.name}-default.png`, outputDir).pathname });
    screenshotCount += 1;

    const expectedImage = viewport.mobile
      ? "world-map-realms-mobile-capitals.webp"
      : "world-map-houses.webp";
    const currentImage = await page.locator(".world-map").evaluate((image) => image.currentSrc);
    if (!currentImage.endsWith(expectedImage)) {
      failures.push(`${viewport.name}: expected ${expectedImage}, received ${currentImage}`);
    }
    if (await page.locator(".marker-pulse").count()) {
      failures.push(`${viewport.name}: legacy UI pin dots are still rendered`);
    }

    for (const house of houses) {
      const marker = page.getByRole("button", { name: new RegExp(`^${house}`) });
      if (viewport.mobile) await marker.focus();
      else await marker.hover();
      await page.waitForTimeout(200);

      const slug = house.toLowerCase().replace("house ", "").replaceAll(" ", "-");
      await page.screenshot({
        path: new URL(`${viewport.name}-${slug}.png`, outputDir).pathname,
      });
      screenshotCount += 1;

      const geometry = await marker.evaluate((element) => {
        const markerBox = element.getBoundingClientRect();
        const label = element.querySelector(".marker-label");
        const labelBox = label?.getBoundingClientRect();
        const stageBox = element.closest(".map-stage")?.getBoundingClientRect();
        const visible = label && getComputedStyle(label).display !== "none" && Number(getComputedStyle(label).opacity) > 0;
        const serialize = (box) => box && ({
          left: box.left,
          right: box.right,
          top: box.top,
          bottom: box.bottom,
          width: box.width,
          height: box.height,
        });
        return {
          marker: serialize(markerBox),
          label: serialize(labelBox),
          stage: serialize(stageBox),
          visible,
          viewport: { width: window.innerWidth, height: window.innerHeight },
        };
      });

      const { marker: markerBox, label: labelBox, stage: stageBox } = geometry;
      if (!geometry.visible) failures.push(`${viewport.name}/${house}: floating label is not visible`);
      if (markerBox.left < stageBox.left || markerBox.right > stageBox.right || markerBox.top < stageBox.top || markerBox.bottom > stageBox.bottom) {
        failures.push(`${viewport.name}/${house}: marker escapes the map`);
      }
      if (labelBox.left < 0 || labelBox.right > geometry.viewport.width || labelBox.top < 0 || labelBox.bottom > geometry.viewport.height) {
        failures.push(`${viewport.name}/${house}: label escapes the viewport`);
      }
      if (overlaps(markerBox, labelBox)) failures.push(`${viewport.name}/${house}: label overlaps its marker`);

      if (viewport.mobile) await marker.evaluate((element) => element.blur());
      else await page.mouse.move(0, 0);
    }

    if (browserErrors.length) failures.push(`${viewport.name}: browser errors: ${browserErrors.join(" | ")}`);
    await context.close();
  }

  for (const viewport of [
    { name: "details-desktop", width: 1440, height: 900, side: "right" },
    { name: "details-phone", width: 390, height: 844, side: "bottom" },
  ]) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const marker = page.getByRole("button", { name: /^House Stark/ });
    await marker.click();
    const sheet = page.locator('[data-slot="sheet-content"]');
    await sheet.waitFor();
    const side = await sheet.getAttribute("data-side");
    if (side !== viewport.side) failures.push(`${viewport.name}: expected ${viewport.side} sheet, received ${side}`);
    if (!await sheet.getByText("House Stark", { exact: true }).count()) failures.push(`${viewport.name}: sheet title is missing`);
    await page.screenshot({ path: new URL(`${viewport.name}.png`, outputDir).pathname });
    screenshotCount += 1;
    await page.getByRole("button", { name: "Close" }).click();
    await sheet.waitFor({ state: "hidden" });
    if (!await marker.evaluate((element) => element === document.activeElement)) {
      failures.push(`${viewport.name}: focus did not return to the opening sigil`);
    }
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.route("**/api/intro/houses", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1600));
      await route.continue();
    });
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.locator(".map-stage").waitFor();
    if (await page.locator(".archive-state, .ink-loader, .cinematic").count()) {
      failures.push("map-first-paint: a blocking loader or cinematic is visible");
    }
    if (await page.locator(".house-marker").count()) {
      failures.push("map-first-paint: house markers rendered before the delayed API response");
    }
    await page.screenshot({ path: new URL("map-first-paint.png", outputDir).pathname });
    screenshotCount += 1;
    await context.close();
  }

  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.locator(".map-stage").waitFor();
    if (await page.locator(".cinematic").count()) failures.push("reduced-motion-phone: cinematic UI is still rendered");
    await page.screenshot({ path: new URL("reduced-motion-phone.png", outputDir).pathname });
    screenshotCount += 1;
    await context.close();
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`Map verification failed after ${screenshotCount} screenshots:\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Map verification passed with ${screenshotCount} screenshots across ${viewports.length} viewports.`);
}
