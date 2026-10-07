import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { DOC_ARTICLES } from "../src/data/docs.js";

const baseUrl = process.env.VERIFY_BASE_URL || "http://127.0.0.1:5173";
const outputDir = new URL(
  "../../artifacts/screenshots/atlas/",
  import.meta.url,
);
await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]) {
    const context = await browser.newContext({
      viewport,
      colorScheme: "light",
    });
    const errors = [];
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(new URL("/docs", baseUrl).href);
    await page
      .getByRole("heading", {
        name: "A guide to the known world.",
        exact: true,
      })
      .waitFor();
    assert.equal(await page.title(), "Getting started | A Map of Ice and Fire");
    assert.equal(
      await page
        .getByRole("link", { name: "A Map of Ice and Fire home" })
        .count(),
      1,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
    );

    if (viewport.width < 850) {
      const contents = page.getByRole("button", {
        name: "Contents",
        exact: true,
      });
      assert.equal(await contents.getAttribute("aria-expanded"), "false");
      await contents.click();
      await page
        .locator("#archive-navigation")
        .getByRole("link", { name: "Reading a journey", exact: true })
        .click();
      await page
        .getByRole("heading", {
          name: "Follow a story across the map.",
          exact: true,
        })
        .waitFor();
      assert.equal(await contents.getAttribute("aria-expanded"), "false");
    }

    await page.keyboard.press("Control+k");
    const search = page.getByRole("searchbox", { name: "Search the archives" });
    await search.fill("SHA-256");
    await page
      .getByRole("heading", { name: "Find your way.", exact: true })
      .waitFor();
    assert.equal(await page.locator(".docs-search-results > a").count(), 1);
    await page
      .locator(".docs-search-results")
      .getByRole("link", { name: /Local development/ })
      .click();
    await page
      .getByRole("heading", { name: "Open your own map room.", exact: true })
      .waitFor();
    assert.equal(await search.inputValue(), "");
    assert.equal(new URL(page.url()).pathname, "/docs/local-development");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page
      .getByRole("button", { name: "Copy development server", exact: true })
      .click();
    await page.getByText("Commands copied.", { exact: true }).waitFor();
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      "cd wiki\nnpm install\nnpm run dev",
    );

    await search.fill("there-is-no-such-topic");
    assert.equal(await page.locator(".docs-search-results > a").count(), 0);
    await page.keyboard.press("Escape");
    assert.equal(await search.inputValue(), "");

    for (const article of DOC_ARTICLES) {
      await page.goto(new URL(`/docs/${article.slug}`, baseUrl).href);
      await page
        .getByRole("heading", { name: article.title, exact: true })
        .waitFor();
      for (const section of article.sections)
        assert.equal(await page.locator(`#${section.id}`).count(), 1);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
        `${article.slug} overflows at ${viewport.width}px`,
      );
    }

    await page.goto(new URL("/docs/reading-a-journey#keyboard", baseUrl).href);
    await page.locator("#keyboard").waitFor();
    await page.waitForFunction(() => {
      const top = document
        .getElementById("keyboard")
        ?.getBoundingClientRect().top;
      return top >= 60 && top < innerHeight / 2;
    });
    await page.goto(new URL("/docs/not-a-real-article", baseUrl).href);
    await page
      .getByRole("heading", {
        name: "This page is missing from the archives.",
        exact: true,
      })
      .waitFor();
    await page
      .getByRole("link", { name: "Open the getting started guide" })
      .click();
    await page
      .getByRole("heading", {
        name: "A guide to the known world.",
        exact: true,
      })
      .waitFor();
    const root = page.locator(".docs-page");
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    assert.equal(await root.getAttribute("data-theme"), "dark");
    await page.reload();
    await page.locator('.docs-page[data-theme="dark"]').waitFor();
    await page.screenshot({
      path: new URL(`docs-${viewport.width}-dark.png`, outputDir).pathname,
    });
    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await page.screenshot({
      path: new URL(`docs-${viewport.width}-light.png`, outputDir).pathname,
    });
    assert.deepEqual(errors, []);
    await context.close();
  }
} finally {
  await browser.close();
}
console.log(
  "Archive verification passed: all guides, body search, mobile navigation, clipboard, anchors, missing articles, themes, and responsive layout.",
);
