// Times one seek+screenshot at a given t, optionally hiding selectors, to find slow-raster elements.
import { chromium } from "playwright-core";
import { executablePath, args } from "./chrome.mjs";
const [t, ...hide] = process.argv.slice(2);
const b = await chromium.launch({ executablePath, args });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto("file://" + new URL("../src/index.html", import.meta.url).pathname);
await p.evaluate(() => window.__ready);
await p.evaluate(([t, hide]) => { window.seek(+t); hide.forEach((s) => document.querySelectorAll(s).forEach((e) => (e.style.display = "none"))); }, [t, hide]);
const t1 = Date.now();
await Promise.race([p.screenshot({ path: "/tmp/claude-0/-home-user/0b5b346e-5647-5618-9f52-038fb9aedd1b/scratchpad/dbg.png" }), new Promise((r) => setTimeout(r, 30000))]);
console.log(t, hide.join(","), "shot ms", Date.now() - t1);
await b.close();
