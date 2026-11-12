// Deterministic frame capture: seek the paused GSAP timeline to f/fps, screenshot, encode with FFmpeg.
//   node scripts/render.mjs                 -> full render to out/motion.mp4
//   node scripts/render.mjs --stills 0,5,10 -> PNG stills + contact sheet in preview/
import { chromium } from "playwright-core";
import { executablePath, args as chromeArgs } from "./chrome.mjs";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const timing = JSON.parse(fs.readFileSync(path.join(root, "timing.json"), "utf8"));
// rewrite only when it changed: parallel workers start this script too, and a page could read a half-written file
const timingJs = `window.TIMING = ${JSON.stringify(timing)};\n`, timingPath = path.join(root, "src/timing.js");
if (!fs.existsSync(timingPath) || fs.readFileSync(timingPath, "utf8") !== timingJs) fs.writeFileSync(timingPath, timingJs);

const stillsArg = process.argv.indexOf("--stills");
const stills = stillsArg > -1 ? process.argv[stillsArg + 1].split(",").map(Number) : null;

const browser = await chromium.launch({ executablePath, args: chromeArgs });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on("pageerror", (e) => { console.error("pageerror:", e.message); process.exitCode = 1; });
await page.goto("file://" + path.join(root, "src/index.html"));
const info = await page.evaluate(() => window.__ready);
console.log("ready:", JSON.stringify(info));
const bad = Object.entries(info.fonts).filter(([, s]) => s !== "loaded");
if (bad.length) throw new Error("fonts not loaded: " + JSON.stringify(bad));

// Every frame starts from a freshly loaded page, so its pixels depend only on t
// (no GSAP or raster-cache state carried over from earlier frames).
const url = "file://" + path.join(root, "src/index.html");
const shot = async (t, file) => {
  await page.goto(url);
  await page.evaluate(() => window.__ready);
  await page.evaluate((t) => window.seek(t), t);
  await page.screenshot({ path: file, type: "png" });
};

if (stills) {
  const dir = path.join(root, "preview");
  fs.mkdirSync(dir, { recursive: true });
  const files = [];
  for (const t of stills) {
    const f = path.join(dir, `still_${t.toFixed(2).padStart(5, "0")}s.png`);
    await shot(t, f);
    files.push(f);
  }
  await browser.close();
  const cols = Math.min(files.length, 4), rows = Math.ceil(files.length / cols);
  execFileSync("ffmpeg", ["-y", "-v", "error", ...files.flatMap((f) => ["-i", f]), "-filter_complex",
    files.map((_, i) => `[${i}]scale=360:640,drawtext=text='${stills[i].toFixed(2)}s':x=12:y=12:fontsize=26:fontcolor=white:box=1:boxcolor=black@0.6[v${i}]`).join(";") + ";" +
    files.map((_, i) => `[v${i}]`).join("") + `xstack=inputs=${files.length}:layout=` +
    files.map((_, i) => `${(i % cols) * 360}_${Math.floor(i / cols) * 640}`).join("|") + `:fill=black`,
    path.join(dir, "contact_sheet.png")].concat(files.length === 1 ? [] : []));
  console.log(`stills: ${files.length}, grid ${cols}x${rows} -> preview/contact_sheet.png`);
} else if (process.argv.includes("--range")) {
  // worker: capture frames [a, b) into out/frames (seek is history-independent, so blocks can run in parallel)
  const [a, b] = process.argv[process.argv.indexOf("--range") + 1].split(":").map(Number);
  const frames = path.join(root, "out/frames");
  const t0 = Date.now();
  for (let f = a; f < b; f++) {
    await shot(f / timing.fps, path.join(frames, `${String(f).padStart(5, "0")}.png`));
    if ((f - a) % 50 === 0) console.log(`[${a}-${b}] frame ${f} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  await browser.close();
} else {
  await browser.close();
  const frames = path.join(root, "out/frames");
  const total = timing.total_frames;
  if (!process.argv.includes("--encode-only")) {
  fs.rmSync(frames, { recursive: true, force: true });
  fs.mkdirSync(frames, { recursive: true });
  const workers = Number(process.env.WORKERS || 3);
  const per = Math.ceil(total / workers);
  const { spawn } = await import("node:child_process");
  await Promise.all(Array.from({ length: workers }, (_, i) => new Promise((resolve, reject) => {
    const range = `${i * per}:${Math.min(total, (i + 1) * per)}`;
    const w = spawn(process.execPath, [new URL(import.meta.url).pathname, "--range", range], { stdio: ["ignore", "inherit", "inherit"] });
    w.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`worker ${range} exited ${code}`))));
  })));
  }
  const count = fs.readdirSync(frames).filter((n) => n.endsWith(".png")).length;
  if (count !== total) throw new Error(`frame count ${count} != ${total}`);
  console.log(`captured ${count} frames`);
  execFileSync("ffmpeg", ["-y", "-v", "error", "-framerate", String(timing.fps), "-i", path.join(frames, "%05d.png"),
    "-i", path.join(root, "audio/mix.wav"),
    "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p",
    "-profile:v", "high", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
    "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-t", String(timing.video_duration_s),
    "-movflags", "+faststart", path.join(root, "out/motion.mp4")], { stdio: "inherit" });
  console.log("wrote out/motion.mp4");
}
