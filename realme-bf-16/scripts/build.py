# Vídeo 16: legendas + intervalo de "palpites" entre o take 1 (pergunta) e o take 2 (resposta R$ 1).
# O intervalo (2 s) é o último quadro do take 1 congelado com leve aproximação, e balões de comentário
# com palpites de preço aparecendo um a um (clique do mouse em cada). Depois do intervalo tudo atrasa D segundos.
import subprocess, sys, numpy as np, cv2, soundfile as sf
from PIL import Image, ImageDraw, ImageFont
W, H, FPS = 720, 1280, 30
CUT = 167                      # 1º quadro do take 2 (5,567 s)
FREEZE = 162                   # quadro do take 1 usado no congelamento (5,40 s)
D = 2.0                        # duração do intervalo
ND = int(D * FPS)
GUESSES = [("R$ 299? 🤔", (233, 86, 120)), ("uns R$ 150 😅", (90, 140, 240)), ("R$ 199,90!", (80, 190, 140)), ("R$ 89?? 👀", (240, 150, 50))]
T_G = [0.15, 0.55, 0.95, 1.35]                         # entrada de cada palpite (s dentro do intervalo)
ROWS = [590, 708, 826, 944]                               # alturas dos balões; alternam esquerda/direita dentro da área segura
F = lambda n, s: ImageFont.truetype(f"fonts/Poppins-{n}.ttf", s)
EMO = ImageFont.truetype("/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf", 109)

def bubble(txt, col):
    S = 2; f = F("Bold", 40 * S); emo = None
    if " " in txt and ord(txt.split(" ")[-1][0]) > 0x2600: txt, emo = txt.rsplit(" ", 1)
    d0 = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    tw = d0.textlength(txt, font=f); eh = 44 * S; ew = eh + 8 * S if emo else 0
    av = 58 * S; pad = 18 * S; h = 84 * S; w = int(pad + av + 14 * S + tw + ew + pad + 6 * S)
    im = Image.new("RGBA", (w + 12 * S, h + 14 * S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([4 * S, 8 * S, w + 4 * S, h + 8 * S], h // 2, fill=(0, 0, 0, 70))          # sombra
    d.rounded_rectangle([0, 0, w, h], h // 2, fill=(255, 255, 255, 250))
    cy = h // 2; d.ellipse([pad, cy - av // 2, pad + av, cy + av // 2], fill=col + (255,))
    d.text((pad + av + 14 * S, cy), txt, font=f, fill=(20, 20, 24, 255), anchor="lm")
    if emo:
        e = Image.new("RGBA", (160, 160)); ImageDraw.Draw(e).text((0, 0), emo, font=EMO, embedded_color=True)
        e = e.crop(e.getbbox()); e = e.resize((int(e.width * eh / e.height), eh), Image.LANCZOS)
        im.alpha_composite(e, (int(pad + av + 14 * S + tw + 8 * S), cy - eh // 2))
    im = im.resize((im.width // S, im.height // S), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32); return a[..., 2::-1], a[..., 3] / 255
BUB = [bubble(t, c) for t, c in GUESSES]
POS = [(50, y) if k % 2 == 0 else (630 - BUB[k][1].shape[1], y) for k, y in enumerate(ROWS)]

def interlude(base, k):
    t = k / FPS
    z = 1 + 0.08 * (1 - (1 - t / D) ** 2)                       # aproximação suave no rosto/fone
    cx, cy = 300, 470
    M = np.float32([[z, 0, cx - z * cx], [0, z, cy - z * cy]])
    img = cv2.warpAffine(base, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT).astype(np.float32)
    for (rgb, a), t0, (x, y) in zip(BUB, T_G, POS):
        if t < t0: continue
        p = min(1, (t - t0) / 0.12); s = 0.6 + 0.4 * (1 - (1 - p) ** 3) + 0.06 * np.sin(np.pi * p)   # pop
        hh, ww = a.shape; r = cv2.resize(rgb, (max(1, int(ww * s)), max(1, int(hh * s)))); al = cv2.resize(a, (r.shape[1], r.shape[0]))
        ox, oy = int(x + ww * (1 - s) / 2), int(y + hh * (1 - s) / 2)
        reg = img[oy:oy + r.shape[0], ox:ox + r.shape[1]]
        img[oy:oy + r.shape[0], ox:ox + r.shape[1]] = reg * (1 - al[..., None]) + r * al[..., None]
    return np.clip(img, 0, 255).astype(np.uint8)

if "--test" in sys.argv:
    b = subprocess.run(["ffmpeg", "-v", "error", "-i", "source/video16.mov", "-vf", f"select=eq(n\\,{FREEZE}),scale=in_color_matrix=bt709:in_range=tv:out_range=pc", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], capture_output=True).stdout
    base = np.frombuffer(b, np.uint8).reshape(H, W, 3)
    cv2.imwrite("analysis/inter_test.jpg", np.hstack([cv2.resize(interlude(base, k), (360, 640)) for k in (8, 22, 34, 59)])); sys.exit()

# ---- áudio: take 1 | silêncio de sala | take 2 (atrasado D) + sons do CapCut
sr = 48000
y = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", "source/video16.mov", "-f", "f32le", "-ac", "2", "-ar", str(sr), "-"], capture_output=True).stdout, np.float32).reshape(-1, 2)
c = int(CUT / FPS * sr); gap = np.zeros((int(D * sr), 2), np.float32)
f = int(0.01 * sr); a1 = y[:c].copy(); a1[-f:] *= np.linspace(1, 0, f)[:, None]; a2 = y[c:].copy(); a2[:f] *= np.linspace(0, 1, f)[:, None]
au = np.concatenate([a1, gap, a2])
def sfx(name, at, gain):
    s, ssr = sf.read(f"../realme-bf-02/sfx/{name}.wav", dtype="float32")
    if s.ndim == 1: s = np.stack([s, s], 1)
    if ssr != sr:
        from scipy import signal; s = signal.resample_poly(s, sr, ssr, axis=0).astype(np.float32)
    i = int(at * sr); au[i:i + len(s)] += s[:len(au) - i] * gain
T0 = CUT / FPS
for t in T_G: sfx("mouse", T0 + t - 0.02, 0.55)
sfx("dinheiro", 6.32 + D - 0.02, 0.45)            # "R$ 1"
sfx("mouse", 8.70 + D - 0.02, 0.5)                # "então corre!"
au *= min(1, 0.95 / np.abs(au).max())
sf.write("analysis/audio_final.wav", au, sr, subtype="PCM_24")

dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", "source/video16.mov", "-fps_mode", "passthrough", "-vf", "scale=in_color_matrix=bt709:in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int",
                        "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-i", "analysis/audio_final.wav", "-map", "0:v", "-map", "1:a",
    "-vf", "scale=out_color_matrix=bt709:out_range=tv:in_range=pc:flags=accurate_rnd+full_chroma_int,format=yuv420p,ass=out/legendas.ass:fontsdir=fonts",
    "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
    "-c:a", "aac", "-b:a", "320k", "-shortest", "-movflags", "+faststart", "out/realme_video_16.mp4"], stdin=subprocess.PIPE)
n = 0; base = None
while True:
    b = dec.stdout.read(W * H * 3)
    if len(b) < W * H * 3: break
    img = np.frombuffer(b, np.uint8).reshape(H, W, 3)
    if n == FREEZE: base = img.copy()
    if n == CUT:
        for k in range(ND): enc.stdin.write(interlude(base, k).tobytes())
    enc.stdin.write(img.tobytes()); n += 1
enc.stdin.close(); enc.wait(); dec.wait(); print("quadros", n + ND)
