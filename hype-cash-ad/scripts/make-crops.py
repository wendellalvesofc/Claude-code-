"""Crop the real HYPE CASH screenshots (assets/src) into composition assets (src/img).
Removes the iOS status bar and Safari toolbar; nothing is redrawn."""
import sys
from pathlib import Path
from PIL import Image

root = Path(sys.argv[1])
src, out = root / "assets/src", root / "src/img"
out.mkdir(parents=True, exist_ok=True)

# Boxes are measured on the 920px-wide preview of the screenshots; the files are 1206px wide.
S = 1206 / 920

def box(b):
    return tuple(round(v * S) for v in b)

def crop(name, b, dest):
    Image.open(src / name).convert("RGB").crop(box(b)).save(out / dest, optimize=True)

# Full-height screens, status bar (0-140) and Safari bar (>~1790) removed
crop("01-home.png",        (0, 140, 920, 1780), "screen-home.png")
crop("02-missoes.png",     (0, 140, 920, 1790), "screen-missoes.png")
crop("03-ferramentas.png", (0, 140, 920, 1790), "screen-ferramentas.png")
crop("04-missao01.png",    (0, 140, 920, 1800), "screen-missao01.png")
crop("05-checklist.png",   (0, 330, 920, 1850), "screen-checklist.png")
# Hero art without UI text (sky + skyline/car) for backgrounds
crop("01-home.png",        (0, 450, 920, 690), "sky.png")

# Logo: key out the sky it sits on. The sky behind the logo is estimated from the crop's
# border (the logo never touches it); alpha comes from each pixel's distance to that sky,
# and colours are un-mixed so no purple fringe is left.
import numpy as np
a = np.asarray(Image.open(src / "01-home.png").convert("RGB").crop(box((40, 160, 270, 325)))).astype(float)
h, w, _ = a.shape
top, bot = a[:6].mean(0), a[-6:].mean(0)
left, right = a[:, :6].mean(1), a[:, -6:].mean(1)
yy = np.linspace(0, 1, h)[:, None, None]
xx = np.linspace(0, 1, w)[None, :, None]
sky = ((1 - yy) * top[None] + yy * bot[None] + (1 - xx) * left[:, None] + xx * right[:, None]) / 2
d = np.sqrt(((a - sky) ** 2).sum(2))
alpha = np.clip((d - 12) / 45, 0, 1)
rgb = np.clip((a - (1 - alpha[..., None]) * sky) / np.maximum(alpha[..., None], 1e-3), 0, 255)
logo = Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), "RGBA")
logo.save(out / "logo.png")
print("ok", sorted(p.name for p in out.iterdir()))
