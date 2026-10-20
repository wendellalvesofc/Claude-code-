// Captures real screens of the HYPE CASH app running locally (next start) at phone size.
// Usage: node scripts/capture.mjs [baseUrl]  →  assets/captures/*.png + capture-log.json
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { executablePath } from "./chrome.mjs";

const BASE = process.argv[2] || "http://localhost:3123";
const OUT = new URL("../assets/captures/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const log = [];

const browser = await chromium.launch({ executablePath });
const ctx = await browser.newContext({
  viewport: { width: 430, height: 932 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
});
const page = await ctx.newPage();
page.on("pageerror", (e) => log.push({ pageerror: e.message }));

async function shot(name, { full = false } = {}) {
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}${name}.png`, fullPage: full });
  log.push({ name, url: page.url(), full });
}

// Sales page
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await shot("sales-hero");
await shot("sales-full", { full: true });

// Playbook: the gate stores its unlock flag in localStorage; set it through the real form.
await page.goto(`${BASE}/playbook`, { waitUntil: "networkidle" });
await shot("gate");
const pw = process.env.GATE_PASSWORD;
await page.fill("input[type=password]", pw);
await page.press("input[type=password]", "Enter");
await shot("pb-home");

await page.goto(`${BASE}/playbook/missoes`, { waitUntil: "networkidle" });
await shot("pb-map-0");
await shot("pb-map-0-full", { full: true });

await page.goto(`${BASE}/playbook/missao/entre-no-jogo`, { waitUntil: "networkidle" });
// The checklist buttons set no text color, so each browser applies its own default:
// iOS Safari (where the owner's screenshots come from) shows its system blue, Chromium shows black.
// Reproduce the iOS rendering so the captures match what buyers on iPhone see.
await page.addStyleTag({ content: "button { color: rgb(10,132,255); }" });
await shot("pb-m1-top");
await shot("pb-m1-full-0", { full: true });

// Tick the checklist through the UI one item at a time, to verify progress really updates.
const { missions } = await import("/home/user/gta-vi-cash/data/missions.js");
const items = missions[0].checklist;
log.push({ checklistItems: items.length });
for (let i = 0; i < items.length; i++) {
  await page.getByRole("button", { name: items[i] }).click();
  await shot(`pb-m1-full-${i + 1}`, { full: true });
}
const progressText = await page.locator("text=/\\d+%/").first().textContent().catch(() => null);
log.push({ missionProgressAfter: progressText });

await page.goto(`${BASE}/playbook/missoes`, { waitUntil: "networkidle" });
await shot("pb-map-after");
log.push({ overallAfter: await page.locator("text=/\\d+%/").first().textContent().catch(() => null) });

await page.goto(`${BASE}/playbook`, { waitUntil: "networkidle" });
await shot("pb-home-after");

await page.goto(`${BASE}/playbook/missao/a-proxima-onda`, { waitUntil: "networkidle" }).catch(() => {});
await shot("pb-pro-top");

await page.goto(`${BASE}/playbook/ferramentas`, { waitUntil: "networkidle" });
await shot("pb-tools-top");
await shot("pb-tools-full", { full: true });

writeFileSync(`${OUT}capture-log.json`, JSON.stringify(log, null, 1));
await browser.close();
console.log(JSON.stringify(log, null, 1));
