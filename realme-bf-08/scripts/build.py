# Vídeo 08: zoom nas caras e bocas debochadas, transição de luz laranja + clique de câmera na emenda dos dois vídeos,
# áudio melhorado (scripts/audio.sh) e legendas (scripts/make_ass.py). Vídeo SDR BT.709: cores mantidas como no original.
# Uso: python3 scripts/build.py <raiz> [--test t1,t2,...]
import subprocess, sys
import numpy as np
import cv2
import soundfile as sf

root = sys.argv[1]
W, H, FPS = 1080, 1920, 30
SRC = f"{root}/source/video08.mov"

# zooms: (início, fim, zoom, centro do rosto em px)
ZOOMS = [
    (3.90, 4.95, 1.8, (670, 820)),     # inclina a cabeça para trás e revira os olhos
    (6.90, 8.00, 1.8, (687, 785)),     # "aaah" de boca aberta, olhos fechados
    (20.90, 23.00, 1.7, (722, 820)),   # queixo para cima + gesto no "melhor, de 512 GB"
    (32.90, 34.85, 1.8, (652, 750)),   # sobrancelha erguida, olhar de canto
]
IN, OUT = 0.18, 0.15                    # duração da entrada e da saída do zoom (s)
JOIN = 35.467                          # emenda entre os dois vídeos
PRE, POST = 0.14, 0.22                 # luz laranja estoura antes do corte e revela o plano seguinte

def ease_out(p): return 1 - (1 - p) ** 3
def ease_in(p): return p ** 3

def zoom_at(t):
    for a, b, z, c in ZOOMS:
        if a <= t < b:
            if t < a + IN: k = ease_out((t - a) / IN)
            elif t > b - OUT: k = 1 - ease_in((t - (b - OUT)) / OUT)
            else: k = 1.0
            return 1 + (z - 1) * k, c
    return 1.0, (W / 2, H / 2)

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
def leak_layer(cx):
    """luz laranja quente (mesma do vídeo 02): elipse branca-amarela no centro esquentando para laranja"""
    dx, dy = (xx - cx) / (W * 0.6), (yy - H * 0.5) / (H * 0.7)
    r = np.sqrt(dx * dx + dy * dy)
    stops = [(0.0, (214, 246, 255)), (0.28, (64, 196, 255)), (0.52, (10, 120, 255)), (0.70, (0, 70, 255)), (0.85, (0, 60, 255))]
    alphas = [1.0, 0.95, 0.75, 0.35, 0.0]
    col = np.zeros((H, W, 3), np.float32); al = np.zeros((H, W), np.float32)
    for (r0, c0), (r1, c1), a0, a1 in zip(stops, stops[1:], alphas, alphas[1:]):
        m = (r >= r0) & (r < r1); p = ((r - r0) / (r1 - r0))[m]
        col[m] = np.float32(c0) * (1 - p[:, None]) + np.float32(c1) * p[:, None]; al[m] = a0 * (1 - p) + a1 * p
    m = r < 1e-6; col[m] = stops[0][1]; al[m] = 1.0
    return col * al[..., None] / 255.0

def leak_at(t):
    """intensidade (0..1) e posição horizontal da luz"""
    if JOIN - PRE <= t < JOIN:
        p = (t - (JOIN - PRE)) / PRE; return p ** 2, W * (0.15 + 0.30 * p)
    if JOIN <= t < JOIN + POST:
        p = (t - JOIN) / POST; return 1 - (1 - (1 - p) ** 2) , W * (0.45 + 0.40 * p)
    return 0.0, 0

def render(img, t):
    z, (cx, cy) = zoom_at(t)
    if z > 1.0001:
        vw, vh = W / z, H / z
        x0 = min(max(cx - vw / 2, 0), W - vw); y0 = min(max(cy - vh / 2, 0), H - vh)
        M = np.float32([[z, 0, -x0 * z], [0, z, -y0 * z]])
        img = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    k, lx = leak_at(t)
    if k > 0:
        f = img.astype(np.float32) / 255.0
        f = np.clip(f * (1 + 0.4 * k) * np.float32([1 - 0.1 * k, 1, 1 + 0.15 * k]), 0, 1)   # esquenta e clareia
        L = leak_layer(lx) * k
        f = 1 - (1 - f) * (1 - L)                                                          # mistura "tela"
        img = (np.clip(f, 0, 1) * 255).astype(np.uint8)
    return img

dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", SRC, "-vf", f"fps={FPS},scale=in_color_matrix=bt709:in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
FR = W * H * 3

if "--test" in sys.argv:
    want = {int(round(float(x) * FPS)) for x in sys.argv[sys.argv.index("--test") + 1].split(",")}
    n = 0
    while n <= max(want):
        b = dec.stdout.read(FR)
        if len(b) < FR: break
        if n in want:
            cv2.imwrite(f"{root}/analysis/test_{n / FPS:.2f}.jpg", cv2.resize(render(np.frombuffer(b, np.uint8).reshape(H, W, 3).copy(), n / FPS), (360, 640)))
        n += 1
    dec.kill(); sys.exit()

# áudio: voz melhorada + clique de câmera do CapCut na emenda
voice, sr = sf.read(f"{root}/analysis/voice_enh.wav")
cam, csr = sf.read(f"{root}/../realme-bf-02/sfx/camera.wav")
if cam.ndim == 1: cam = np.stack([cam, cam], 1)
if csr != sr:
    from scipy import signal
    cam = signal.resample_poly(cam, sr, csr, axis=0)
i = int((JOIN - 0.05) * sr); cam = cam * 10 ** (-4 / 20)
voice[i:i + len(cam)] += cam[: len(voice) - i]
peak = np.abs(voice).max(); lim = 10 ** (-1.5 / 20)
if peak > lim: voice *= lim / peak
sf.write(f"{root}/analysis/audio_final.wav", voice, sr, subtype="PCM_24")

enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-i", f"{root}/analysis/audio_final.wav", "-map", "0:v", "-map", "1:a",
    "-vf", f"scale=out_color_matrix=bt709:out_range=tv:in_range=pc:flags=accurate_rnd+full_chroma_int,format=yuv420p,ass={root}/out/legendas.ass:fontsdir={root}/fonts",   # mesma matriz de cor do original (BT.709)
    "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p",
    "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
    "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-shortest", "-movflags", "+faststart",
    f"{root}/out/realme_video_08.mp4"], stdin=subprocess.PIPE)
n = 0
while True:
    b = dec.stdout.read(FR)
    if len(b) < FR: break
    enc.stdin.write(render(np.frombuffer(b, np.uint8).reshape(H, W, 3).copy(), n / FPS).tobytes())
    n += 1
enc.stdin.close(); enc.wait(); dec.wait()
print("quadros", n)
