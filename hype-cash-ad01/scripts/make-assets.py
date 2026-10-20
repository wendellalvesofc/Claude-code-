"""Real screens and backgrounds for the ad → src/img.

Screens come from assets/captures (the HYPE CASH app run locally and captured at 430×932 CSS px, DPR 3; see
scripts/capture.mjs). They are only resized to 1040 px wide, which is ~1:1 with the phone screen at its closest
zoom, so the UI is shown as captured. Backgrounds are the site's own art from public/images.
"""
import sys
from pathlib import Path
from PIL import Image, ImageFilter, ImageEnhance

root = Path(sys.argv[1])
cap, src, out = root / "assets/captures", root / "assets/src", root / "src/img"
out.mkdir(parents=True, exist_ok=True)
W = 1040

screens = {
    "scr-feedbg": None,
    "scr-home": "pb-home", "scr-map": "pb-map-0-full", "scr-map-after": "pb-map-after",
    "scr-tools": "pb-tools-full", "scr-sales": "sales-hero", "scr-m1-top": "pb-m1-top",
    **{f"scr-m1-{k}": f"pb-m1-full-{k}" for k in range(5)},
}
for name, f in screens.items():
    if not f: continue
    im = Image.open(cap / f"{f}.png").convert("RGB")
    im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
    im.save(out / f"{name}.jpg", quality=93, subsampling=0)
    print(name, im.size)

def bg(name, f, blur, bright, size=(1300, 2300)):
    im = Image.open(src / f).convert("RGB")
    s = max(size[0] / im.width, size[1] / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    l, t = (im.width - size[0]) // 2, (im.height - size[1]) // 2
    im = im.crop((l, t, l + size[0], t + size[1]))
    if blur: im = im.filter(ImageFilter.GaussianBlur(blur))
    ImageEnhance.Brightness(im).enhance(bright).save(out / f"{name}.jpg", quality=90)
    print(name, im.size)

bg("bg-city", "missoes-bg.jpg", 14, 0.55)
bg("bg-city-sharp", "missoes-bg.jpg", 3, 0.7)
bg("bg-car", "hero-bg.jpg", 0, 0.85)
bg("bg-cta", "cta-final-bg.jpg", 6, 0.6)
