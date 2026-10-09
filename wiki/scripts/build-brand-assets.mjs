import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const publicDir = new URL("../public/", import.meta.url);
const mark = await readFile(new URL("brand-mark.svg", publicDir), "utf8");
const fontDir = new URL("../node_modules/", import.meta.url);
const [displayFont, bodyFont] = await Promise.all([
  readFile(new URL("@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2", fontDir)),
  readFile(new URL("@fontsource-variable/geist/files/geist-latin-wght-normal.woff2", fontDir)),
]);
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage();
  for (const [name, size] of [
    ["favicon.png", 48],
    ["apple-touch-icon.png", 180],
    ["icon-192.png", 192],
    ["icon-512.png", 512],
  ]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:100vw;height:100vh}</style>${mark}`);
    await page.screenshot({ path: new URL(name, publicDir).pathname, omitBackground: true });
  }

  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(`<!doctype html><html><head><style>
    @font-face{font-family:Newsreader;src:url(data:font/woff2;base64,${displayFont.toString("base64")});font-weight:200 800}
    @font-face{font-family:Geist;src:url(data:font/woff2;base64,${bodyFont.toString("base64")});font-weight:100 900}
    *{box-sizing:border-box}body{margin:0;background:#17201e;color:#eee8db;font-family:Geist,sans-serif}
    main{position:relative;width:1200px;height:630px;overflow:hidden;padding:65px 72px}
    main:before{content:"";position:absolute;inset:0;background-image:linear-gradient(#d3b77c0a 1px,transparent 1px),linear-gradient(90deg,#d3b77c0a 1px,transparent 1px);background-size:60px 60px}
    .copy{position:relative;z-index:1}.eyebrow{margin:0;color:#d3b77c;font-size:13px;letter-spacing:3px}
    h1{margin:40px 0 24px;font-family:Newsreader,serif;font-size:104px;line-height:.95;letter-spacing:-4px;font-weight:450}
    .description{max-width:560px;color:#b5b7ab;font-size:19px;line-height:1.8}
    footer{position:absolute;left:72px;right:72px;bottom:44px;border-top:1px solid #d3b77c40;padding-top:23px;color:#d3b77c;font-size:13px;letter-spacing:1px}
    .emblem{position:absolute;right:70px;top:140px;width:310px;height:310px}
    .emblem:before,.emblem:after{position:absolute;inset:-50px;content:"";border:1px solid #d3b77c30;border-radius:50%}
    .emblem:after{inset:-85px;border-style:dashed;border-color:#d3b77c20}.emblem svg{width:100%;height:100%}
  </style></head><body><main>
    <div class="copy"><p class="eyebrow">AN ATLAS OF THE KNOWN WORLD</p><h1>A Map of<br>Ice and Fire.</h1><p class="description">Follow the characters of Westeros and Essos,<br>season by season.</p></div>
    <div class="emblem">${mark}</div><footer>THE PEOPLE. THE PLACES. THE PATHS BETWEEN.</footer>
  </main></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: new URL("social-card.png", publicDir).pathname });
  console.log("Built favicon, app icons, and social card from brand-mark.svg.");
} finally {
  await browser.close();
}
