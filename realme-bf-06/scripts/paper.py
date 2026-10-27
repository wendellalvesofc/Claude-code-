# Troca o texto escrito à caneta no papel da caneca: apaga a caneta (mantendo dobras e sombra do papel)
# e escreve "A PRÉ BLACK COMEÇOU" em preto, caixa alta, acompanhando o papel quadro a quadro.
# Uso: python3 scripts/paper.py <raiz> [--test t1,t2,...]   (teste: grava PNGs em analysis/test_*.png)
import subprocess, sys
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

root = sys.argv[1]
W, H, FPS = 1080, 1920, 30
T0, T1 = 7.9, 11.6                      # janela em que o papel pode aparecer (s)
LINES = ["A", "PRÉ BLACK", "COMEÇOU"]
FONT = f"{root}/fonts/Poppins-ExtraBold.ttf"

# ---- arte do texto (canvas quadrado, depois deformado para o papel)
S = 1000
def text_art():
    img = Image.new("L", (S, S), 0); d = ImageDraw.Draw(img)
    size = 300
    while True:  # maior tamanho que cabe com margem
        f = ImageFont.truetype(FONT, size)
        boxes = [d.textbbox((0, 0), l, font=f) for l in LINES]
        wmax = max(b[2] - b[0] for b in boxes); lh = size * 1.08
        if wmax < S * 0.90 and lh * len(LINES) < S * 0.86: break
        size -= 4
    total = lh * len(LINES); y = (S - total) / 2
    for l, b in zip(LINES, boxes):
        d.text(((S - (b[2] - b[0])) / 2 - b[0], y - b[1] + (lh - (b[3] - b[1])) / 2), l, font=f, fill=255)
        y += lh
    return np.asarray(img, np.float32) / 255.0
ART = text_art()
SRC_Q = np.float32([[0, 0], [S, 0], [S, S], [0, S]])

def order(pts):
    pts = np.asarray(pts, np.float32).reshape(-1, 2)
    s, d = pts.sum(1), np.diff(pts, axis=1).ravel()
    return np.float32([pts[np.argmin(s)], pts[np.argmin(d)], pts[np.argmax(s)], pts[np.argmax(d)]])

def find_paper(img, prev_c, prev_mask=None):
    r = _find(img, prev_c, prev_mask=prev_mask)
    return r if r is not None or prev_c is None else _find(img, None, wide=True)   # câmera aproximou: procura de novo

def _find(img, prev_c, wide=False, prev_mask=None):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    sat, val = hsv[..., 1], hsv[..., 2]
    m = ((val > 165) & (sat < 20)).astype(np.uint8)                        # papel: quase sem cor (pele tem saturação alta)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))     # separa ligações finas com a parede
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((11, 11), np.uint8))  # junta a caneta ao papel
    near = None
    if prev_mask is not None:   # perto de onde o papel estava: separa o papel da parede quando os dois se encostam
        k = int(np.sqrt(prev_mask.sum()) * 0.35) | 1
        near = cv2.dilate(prev_mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
        m = m & near
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    n, lab, st, cen = cv2.connectedComponentsWithStats(m, 8)
    best, bscore = None, 0
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if a < 5000 or a > 450000: continue                  # ignora ruído e a parede
        if near is None and (x <= 2 or y <= 2 or x + w >= W - 2 or y + h >= H - 2): continue   # parede encosta na borda
        cx, cy = cen[i]
        if prev_c is None:
            lim = (250, 1000, 250, 1300) if wide else (400, 850, 650, 1150)
            if not (lim[0] < cx < lim[1] and lim[2] < cy < lim[3]): continue  # o papel fica no centro, na caneca
        else:
            dist = np.hypot(cx - prev_c[0], cy - prev_c[1])
            if dist > 260: continue
        fill = a / float(w * h)
        if fill < 0.45: continue                             # papel é um bloco quase retangular
        score = a * fill
        if score > bscore: best, bscore = i, score
    if best is None: return None
    pm = (lab == best).astype(np.uint8)
    cnts, _ = cv2.findContours(pm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    c = max(cnts, key=cv2.contourArea)
    full = np.zeros_like(pm); cv2.drawContours(full, [c], -1, 1, -1)      # preenche buracos (letras)
    hull = cv2.convexHull(c)
    q = cv2.approxPolyDP(hull, 0.04 * cv2.arcLength(hull, True), True)
    quad = order(q) if len(q) == 4 else order(cv2.boxPoints(cv2.minAreaRect(c)))
    return full, quad, cen[best]

def clean_and_write(img, mask, quad, text_alpha=1.0):
    out = img.astype(np.float32)
    L = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    side = np.sqrt(mask.sum())
    k = max(5, int(side * 0.06) | 1)
    bg = cv2.morphologyEx(L, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))  # papel sem a caneta
    bg = cv2.GaussianBlur(bg, (0, 0), k / 4)
    inner = cv2.erode(mask, np.ones((5, 5), np.uint8))
    ink = ((bg - L) > 10) & (inner > 0)
    ink = cv2.dilate(ink.astype(np.uint8), np.ones((3, 3), np.uint8)) & inner
    clean = cv2.inpaint(img, ink, 5, cv2.INPAINT_TELEA).astype(np.float32)
    # leve clareada no papel (estava acinzentado) para ficar "em branco"
    m3 = cv2.GaussianBlur(inner.astype(np.float32), (0, 0), 2)[..., None]
    clean = clean * (1 - 0.25 * m3) + np.minimum(255, clean * 1.08 + 6) * (0.25 * m3)
    out = out * (1 - m3) + clean * m3
    # texto: margem dentro do papel, deformado pela perspectiva do papel
    c = quad.mean(0)
    q = c + (quad - c) * 0.86
    Hm = cv2.getPerspectiveTransform(SRC_Q, np.float32(q))
    a = cv2.warpPerspective(ART, Hm, (W, H), flags=cv2.INTER_LINEAR)
    blur = max(0.6, side / 900)
    a = cv2.GaussianBlur(a, (0, 0), blur) * (mask > 0) * text_alpha
    ink_col = out * 0.10 + 8                                   # preto que herda a sombra do papel
    out = out * (1 - a[..., None]) + ink_col * a[..., None]
    return np.clip(out, 0, 255).astype(np.uint8)

def run(test_times=None):
    dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", f"{root}/source/video06.mov", "-vf", f"fps={FPS}", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
    enc = None
    if test_times is None:
        enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                                "-i", f"{root}/source/video06.mov", "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "17", "-preset", "slow",
                                "-pix_fmt", "yuv420p", "-c:a", "copy", "-shortest", "-movflags", "+faststart", f"{root}/out/realme_video_06.mp4"], stdin=subprocess.PIPE)
    n, prev_c, sq, last = 0, None, None, None
    base_bright = None; log = []
    while True:
        buf = dec.stdout.read(W * H * 3)
        if len(buf) < W * H * 3: break
        img = np.frombuffer(buf, np.uint8).reshape(H, W, 3).copy()
        t = n / FPS
        if T0 <= t <= T1:
            bright = cv2.resize(img, (108, 192)).mean()   # o vídeo funde para branco a partir de ~11,07 s
            fade = 0.0
            if t > 11.0 and base_bright is not None:
                fade = float(np.clip((bright - base_bright) / (255 - base_bright), 0, 1))
            r = find_paper(img, prev_c, last[0] if last is not None else None) if fade < 0.15 else None
            if r is not None:
                mask, quad, cen = r
                sq = quad if sq is None else sq * 0.55 + quad * 0.45        # suaviza o tremido dos cantos
                prev_c = cen; last = (mask, sq)
                if t <= 11.0: base_bright = bright
                img = clean_and_write(img, mask, sq)
                log.append((round(t, 2), int(mask.sum())))
            elif last is not None and fade > 0 and t < 11.32:      # aos 11,33 s corta para o plano aberto: sem texto
                img = clean_and_write(img, last[0], last[1], text_alpha=(1 - fade) ** 3)
                log.append((round(t, 2), "fade", round(fade, 2)))
        if test_times is not None:
            if any(abs(t - tt) < 0.5 / FPS for tt in test_times):
                cv2.imwrite(f"{root}/analysis/test_{t:.2f}.png", img)
        else:
            enc.stdin.write(img.tobytes())
        n += 1
    if enc: enc.stdin.close(); enc.wait()
    dec.wait()
    print("quadros", n); print(log[:3], "...", log[-6:]); print("quadros tratados", len(log))

if __name__ == "__main__":
    if "--test" in sys.argv:
        run([float(x) for x in sys.argv[sys.argv.index("--test") + 1].split(",")])
    else:
        run()
