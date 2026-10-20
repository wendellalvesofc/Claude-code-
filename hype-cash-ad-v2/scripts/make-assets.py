"""Assets from the real HYPE CASH material (assets/src) -> src/img.
UI crops are taken at native resolution (1206 px wide) so they stay legible full-width in the video.
Backgrounds are pre-blurred here so the browser does no heavy filtering per frame."""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

root = Path(sys.argv[1])
src, out = root / "assets/src", root / "src/img"
out.mkdir(parents=True, exist_ok=True)
S = 1206 / 920  # boxes measured on the 920 px preview of the 1206 px screenshots

def crop(name, b):
    return Image.open(src / name).convert("RGB").crop(tuple(round(v * S) for v in b))

UI = {
    "ui-formato.png":    ("05-checklist.png",   (30, 1238, 890, 1356)),
    "ui-constancia.png": ("05-checklist.png",   (30, 783, 890, 1014)),
    "ui-audiencia.png":  ("02-missoes.png",     (30, 1230, 890, 1734)),
    "ui-monet.png":      ("02-missoes.png",     (8, 365, 905, 655)),
    "ui-mapa.png":       ("02-missoes.png",     (0, 365, 905, 1765)),
    "ui-tools.png":      ("03-ferramentas.png", (0, 392, 920, 1800)),
    "ui-check.png":      ("05-checklist.png",   (0, 1040, 920, 1625)),
    "ui-prog.png":       ("04-missao01.png",    (30, 648, 890, 802)),
}
for dest, (name, b) in UI.items():
    crop(name, b).save(out / dest, optimize=True)

# backgrounds (pre-blurred real art from the home page)
home = Image.open(src / "01-home.png").convert("RGB")
home.filter(ImageFilter.GaussianBlur(22)).save(out / "bg-home-blur.jpg", quality=92)
crop("01-home.png", (0, 1240, 920, 1785)).resize((1080, 640), Image.LANCZOS).filter(ImageFilter.GaussianBlur(3)).save(out / "bg-car.jpg", quality=92)
crop("01-home.png", (0, 300, 920, 690)).filter(ImageFilter.GaussianBlur(10)).save(out / "bg-sky.jpg", quality=92)

# HQ logo: black background -> alpha (brightness), colours un-premultiplied
a = np.asarray(Image.open(src / "logo-hq.png").convert("RGB")).astype(float) / 255
alpha = np.clip((a.max(2) - 0.04) / 0.5, 0, 1)
rgb = np.clip(a / np.maximum(alpha[..., None], 1e-3), 0, 1)
img = Image.fromarray((np.dstack([rgb, alpha]) * 255).astype(np.uint8), "RGBA")
img = img.crop(img.getbbox())
img.save(out / "logo.png")
# pre-scaled to the exact display sizes, so Chromium never resamples them differently between frames
for w in (860, 600):
    img.resize((w, round(img.height * w / img.width)), Image.LANCZOS).save(out / f"logo-{w}.png")

# film grain tile (seeded)
rng = np.random.default_rng(7)
g = (rng.normal(128, 40, (512, 512))).clip(0, 255).astype(np.uint8)
Image.fromarray(g, "L").save(out / "grain.png")
print("ok", sorted(p.name for p in out.iterdir()))
