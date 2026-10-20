// Times seek() and screenshot at a few instants (diagnostic).
import { chromium } from "playwright-core";
import { executablePath, args as chromeArgs } from "./chrome.mjs";
import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const b = await chromium.launch({ executablePath, args: chromeArgs });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await p.goto("file://" + path.join(root, "src/index.html"));
await p.evaluate(() => window.__ready);
for (const t of [0.5, 1.0, 5.0, 12.0, 20.0, 29.0]) {
  const a = Date.now(); const js = await p.evaluate((t) => { const s = performance.now(); seek(t); return performance.now() - s; }, t);
  const m = Date.now(); await p.screenshot({ type: "png" }); const e = Date.now();
  console.log(t, "seek js", js.toFixed(0), "ms | evaluate", m - a, "ms | screenshot", e - m, "ms");
}
await b.close();
