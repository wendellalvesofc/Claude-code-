# Vídeo 17 (HDR HLG 10-bit, mantido): frase "PRÉ-BLACK / ATÉ DIA 15/11" minúscula e meio borrada, parecendo sujeira na
# lente, e no gesto de zoom do final cresce em degraus (um a cada abertura dos dedos) até o tamanho normal para leitura.
# Composição direto nos valores HLG (16 bits); só a frase (sRGB) é convertida para HLG (branco SDR = 75% HLG, BT.2408).
import subprocess, sys, numpy as np, cv2, soundfile as sf
from PIL import Image, ImageDraw, ImageFont
W, H, FPS = 1080, 1920, 30
C = (540, 1395)                                  # centralizada na horizontal, logo abaixo dos queixos, na altura do polegar do gesto
S0 = 0.07                                        # tamanho de "sujeira"
STEPS = [(17.15, 0.18), (17.95, 0.40), (18.62, 0.62), (19.40, 0.80)]   # (abertura dos dedos, escala alcançada)
RISE = 0.28
END = 20.95                                      # some no início da vinheta

def text_rgba():
    S = 2; fb = ImageFont.truetype("fonts/Poppins-Black.ttf", 136 * S); fw = ImageFont.truetype("fonts/Poppins-Black.ttf", 80 * S)
    l1, l2 = "PRÉ-BLACK", "ATÉ DIA 15/11"
    d0 = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    w = int(max(d0.textlength(l1, font=fb), d0.textlength(l2, font=fw))) + 80 * S; h = 270 * S
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    sh = Image.new("RGBA", (w, h), (0, 0, 0, 0)); ds = ImageDraw.Draw(sh)
    for dd, off, a in ((ds, 10 * S, 120), (d, 0, 255)):
        dd.text((w / 2 + off, 78 * S + off), l1, font=fb, anchor="mm", fill=(255, 210, 31, a) if dd is d else (0, 0, 0, a), stroke_width=6 * S, stroke_fill=(10, 10, 10, a))
        dd.text((w / 2 + off, 198 * S + off), l2, font=fw, anchor="mm", fill=(255, 255, 255, a) if dd is d else (0, 0, 0, a), stroke_width=6 * S, stroke_fill=(10, 10, 10, a))
    from PIL import ImageFilter
    sh = sh.filter(ImageFilter.GaussianBlur(8 * S)); sh.alpha_composite(im)
    sh = sh.resize((w // S, h // S), Image.LANCZOS)
    return np.asarray(sh).astype(np.float32) / 255.0
TXT = text_rgba()
assert TXT.shape[1] <= 900, TXT.shape

M709_2020 = np.array([[0.6274, 0.3293, 0.0433], [0.0691, 0.9195, 0.0114], [0.0164, 0.0880, 0.8956]])
def srgb_to_hlg(rgb):
    lin = np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
    lin = np.clip(lin @ M709_2020.T, 0, None)
    e = (lin * 0.203) ** (1 / 1.2)
    a, b, c = 0.17883277, 0.28466892, 0.55991073
    return np.where(e <= 1 / 12, np.sqrt(3 * e), a * np.log(np.maximum(12 * e - b, 1e-6)) + c)
TXT_HLG = srgb_to_hlg(TXT[..., :3]).astype(np.float32); TXT_A = TXT[..., 3]

def ease(p): p = np.clip(p, 0, 1); return 1 - (1 - p) ** 3 + 0.08 * np.sin(np.pi * p) * (1 - p)
def scale_at(t):
    s = S0
    for t0, s1 in STEPS:
        if t >= t0: s = s + (s1 - s) * ease((t - t0) / RISE)
    return s

def comp(img, t):
    if t >= END: return img
    s = scale_at(t)
    h0, w0 = TXT_A.shape; w1, h1 = max(2, int(w0 * s)), max(2, int(h0 * s))
    rgb = cv2.resize(TXT_HLG, (w1, h1), interpolation=cv2.INTER_AREA); a = cv2.resize(TXT_A, (w1, h1), interpolation=cv2.INTER_AREA)
    k = (1 - min(1, s / 0.4)) * 0.9                                # quanto menor, mais "fora de foco", como sujeira na lente
    if k > 0.05:
        rgb = cv2.GaussianBlur(rgb, (0, 0), k); a = cv2.GaussianBlur(a, (0, 0), k)
    a = a * (0.8 + 0.2 * min(1, (s - S0) / 0.3))                    # sujeira um pouco translúcida
    x0, y0 = int(C[0] - w1 / 2), int(C[1] - h1 / 2)
    reg = img[y0:y0 + h1, x0:x0 + w1]
    img[y0:y0 + h1, x0:x0 + w1] = reg * (1 - a[..., None]) + rgb * a[..., None]
    return img

dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", "source/video17.mov", "-fps_mode", "passthrough", "-vf",
    "scale=in_color_matrix=bt2020:in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int,format=rgb48le", "-f", "rawvideo", "-pix_fmt", "rgb48le", "-"], stdout=subprocess.PIPE)
FR = W * H * 3 * 2
def frames():
    while True:
        b = dec.stdout.read(FR)
        if len(b) < FR: return
        yield np.frombuffer(b, np.uint16).reshape(H, W, 3).astype(np.float32) / 65535.0

if "--test" in sys.argv:
    want = [int(round(float(x) * FPS)) for x in sys.argv[sys.argv.index("--test") + 1].split(",")]; ims = []
    for i, f in enumerate(frames()):
        if i in want:
            o = np.clip(comp(f, i / FPS), 0, 1) ** 1.2
            ims.append(cv2.resize((o[..., ::-1] * 255).astype(np.uint8), (270, 480)))
        if i >= max(want): break
    dec.kill(); cv2.imwrite("analysis/test.jpg", np.hstack(ims)); sys.exit()

# áudio: original + clique do mouse quando a frase chega ao tamanho normal
y, sr = sf.read("source/video17.mov") if False else (None, 48000)
au = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", "source/video17.mov", "-f", "f32le", "-ac", "2", "-ar", "48000", "-"], capture_output=True).stdout, np.float32).reshape(-1, 2).copy()
m, msr = sf.read("../realme-bf-02/sfx/mouse.wav", dtype="float32")
if m.ndim == 1: m = np.stack([m, m], 1)
if msr != sr:
    from scipy import signal; m = signal.resample_poly(m, sr, msr, axis=0).astype(np.float32)
i = int((STEPS[-1][0] - 0.02) * sr); au[i:i + len(m)] += m[:len(au) - i] * 0.5
au *= min(1, 0.95 / np.abs(au).max()); sf.write("analysis/audio_final.wav", au, sr, subtype="PCM_24")

enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb48le", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-i", "analysis/audio_final.wav", "-map", "0:v", "-map", "1:a",
    "-vf", "scale=out_color_matrix=bt2020:out_range=tv:in_range=pc:flags=accurate_rnd+full_chroma_int,format=yuv420p10le",
    "-c:v", "libx265", "-preset", "medium", "-crf", "16", "-tag:v", "hvc1",
    "-x265-params", "colorprim=bt2020:transfer=arib-std-b67:colormatrix=bt2020nc:range=limited:hdr10=0:repeat-headers=1:log-level=error",
    "-color_primaries", "bt2020", "-color_trc", "arib-std-b67", "-colorspace", "bt2020nc", "-color_range", "tv",
    "-c:a", "aac", "-b:a", "320k", "-shortest", "-movflags", "+faststart", "out/realme_video_17.mov"], stdin=subprocess.PIPE)
n = 0
for f in frames():
    enc.stdin.write((np.clip(comp(f, n / FPS), 0, 1) * 65535 + 0.5).astype(np.uint16).tobytes()); n += 1
enc.stdin.close(); enc.wait(); dec.wait(); print("quadros", n)
