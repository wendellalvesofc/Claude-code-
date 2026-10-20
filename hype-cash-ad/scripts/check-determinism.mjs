// Renders the same instants in forward and in shuffled order and checks the PNGs are byte-identical.
import { chromium } from "playwright-core";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const timing = JSON.parse(fs.readFileSync(path.join(root, "timing.json"), "utf8"));
fs.writeFileSync(path.join(root, "src/timing.js"), `window.TIMING = ${JSON.stringify(timing)};\n`);
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--force-color-profile=srgb", "--disable-lcd-text", "--font-render-hinting=none"] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto("file://" + path.join(root, "src/index.html"));
await page.evaluate(() => window.__ready);
const out = path.join(root, "out/determinism");
fs.mkdirSync(out, { recursive: true });
const hash = async (t, tag) => {
  await page.evaluate((t) => window.seek(t), t);
  const buf = await page.screenshot({ type: "png" });
  if (tag) fs.writeFileSync(path.join(out, `${t.toFixed(3)}_${tag}.png`), buf);
  return crypto.createHash("md5").update(buf).digest("hex");
};

const times = [];
for (let f = 0; f < timing.total_frames; f += Number(process.env.STEP || 23)) times.push(f / timing.fps);
const forward = {};
for (const t of times) forward[t] = await hash(t, "fwd");
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const shuffled = [...times].sort(() => rnd() - 0.5);
let bad = 0;
for (const t of shuffled) if ((await hash(t, "shuf")) !== forward[t]) { bad++; console.log("MISMATCH at", t.toFixed(3)); }
await browser.close();
console.log(`${times.length} instants, forward vs shuffled: ${bad ? bad + " mismatches" : "all identical"}`);
if (!bad) fs.rmSync(out, { recursive: true, force: true });
process.exit(bad ? 1 : 0);
