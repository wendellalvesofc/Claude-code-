// Chromium launch settings shared by render and checks.
// Raster flags remove timing-dependent image quality (async checker-imaging, partial raster, GPU heuristics),
// so the same DOM state always rasterises to the same pixels.
export const executablePath = process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
export const args = [
  "--force-color-profile=srgb", "--disable-lcd-text", "--font-render-hinting=none",
  "--disable-gpu", "--disable-gpu-compositing", "--disable-checker-imaging", "--disable-partial-raster",
  "--run-all-compositor-stages-before-draw", "--disable-threaded-animation", "--disable-threaded-scrolling",
  "--disable-image-animation-resync", "--disable-renderer-backgrounding", "--disable-background-timer-throttling",
];
