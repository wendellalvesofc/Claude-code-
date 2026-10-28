# Versão final em qualidade e cor originais: 4K (2160x3840), HDR HLG BT.2020 10-bit, sem conversão de cor do vídeo.
# O vídeo é composto direto nos valores HLG (16 bits); só o que é adicionado (cartaz e interruptor, em sRGB) é convertido
# para HLG com o branco SDR no nível de referência (BT.2408: 203 nits = 75% HLG).
# Rastreamento (analysis/homographies.npy) e recorte (analysis/masks.npy) foram calculados em 1080x1920 e são escalados 2x.
# Uso: python3 scripts/compose_hdr.py <raiz> [--test t1,t2]  (teste: PNG com prévia SDR aproximada)
import subprocess, sys
import numpy as np
import cv2
import soundfile as sf

root = sys.argv[1]
W, H, FPS, S = 2160, 3840, 24, 2                         # S: escala em relação às coordenadas de 1080x1920
Hs = np.load(f"{root}/analysis/homographies.npy").astype(np.float64)
MASKS = np.load(f"{root}/analysis/masks.npy", mmap_mode="r")
N = len(Hs)
Sm = np.diag([S, S, 1.0]); Sinv = np.linalg.inv(Sm)
TOUCH, REF_DROP = 5.083, 4.303
SHIFT = TOUCH - REF_DROP

SW = dict(cx=522, cy=418, w=168, h=76)                   # mesmas posições da prévia (coordenadas 1080 do quadro 120)
POSTER = dict(x=160, y=545, size=610)

# ---- sRGB -> HLG (BT.2020)
M709_2020 = np.array([[0.6274, 0.3293, 0.0433], [0.0691, 0.9195, 0.0114], [0.0164, 0.0880, 0.8956]])
def srgb_to_hlg(rgb):                                    # rgb float 0..1 (ordem R,G,B) -> sinal HLG 0..1
    lin = np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
    lin = np.clip(lin @ M709_2020.T, 0, None)
    e = (lin * 0.203) ** (1 / 1.2)                       # OOTF inversa aproximada (pico 1000 nits, gama 1,2)
    a, b, c = 0.17883277, 0.28466892, 0.55991073
    return np.where(e <= 1 / 12, np.sqrt(3 * e), a * np.log(np.maximum(12 * e - b, 1e-6)) + c)

def to_hlg_bgra(bgra):                                   # camada BGRA float (cores 0..255) -> RGB HLG 0..1 + alfa
    rgb = bgra[..., 2::-1] / 255.0
    return np.dstack([srgb_to_hlg(rgb), bgra[..., 3]]).astype(np.float32)

Y, K = (31, 210, 255), (17, 17, 17)
def switch_img(state):
    s = 4 * S; w, h = SW["w"] * s, SW["h"] * s
    img = np.zeros((h, w, 4), np.float32); pill = np.zeros((h, w), np.uint8); r = h // 2
    cv2.rectangle(pill, (r, 0), (w - r, h), 255, -1); cv2.circle(pill, (r, r), r, 255, -1); cv2.circle(pill, (w - r, r), r, 255, -1)
    img[..., :3] = np.float32(Y) * (1 - state) + np.float32(K) * state; img[..., 3] = pill / 255.0
    kr = int(r * 0.78); kx = int((w - r) * (1 - state) + r * state)
    knob = np.zeros((h, w), np.uint8); cv2.circle(knob, (kx, r), kr, 255, -1)
    ka = cv2.GaussianBlur(knob, (0, 0), 2 * S) / 255.0
    kcol = np.float32(K) * (1 - state) + np.float32(Y) * state
    img[..., :3] = img[..., :3] * (1 - ka[..., None]) + kcol * ka[..., None]
    img[..., :3] = np.clip(img[..., :3] * np.linspace(1.08, 0.92, h, dtype=np.float32)[:, None, None], 0, 255)
    return to_hlg_bgra(cv2.resize(img, (SW["w"] * S, SW["h"] * S), interpolation=cv2.INTER_AREA))

poster = cv2.imread(f"{root}/source/cartaz.png", cv2.IMREAD_COLOR).astype(np.float32)
P = POSTER["size"] * S
poster = cv2.resize(poster, (P, P), interpolation=cv2.INTER_AREA)
PB = to_hlg_bgra(np.dstack([poster, np.ones((P, P), np.float32)]))
SH = np.zeros((P + 80 * S, P + 80 * S, 4), np.float32)
cv2.rectangle(SH, (40 * S, 40 * S), (40 * S + P, 40 * S + P), (0, 0, 0, 1), -1)
SH[..., 3] = cv2.GaussianBlur(SH[..., 3], (0, 0), 14 * S) * 0.45
SW_OFF, SW_ON = switch_img(0.0), switch_img(1.0)

def place(layer, x0, y0, i):                             # x0,y0 em coordenadas 1080 do quadro de referência
    T = np.array([[1, 0, x0 * S], [0, 1, y0 * S], [0, 0, 1]])
    M = Sm @ Hs[i] @ Sinv @ T
    out = cv2.warpPerspective(layer, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    return out[..., :3], out[..., 3]

def person_vis(i):
    m = MASKS[i].astype(np.float32) / 255.0
    m = cv2.resize(cv2.dilate(m, np.ones((3, 3), np.uint8)), (W, H), interpolation=cv2.INTER_LINEAR)
    return 1 - cv2.GaussianBlur(m, (0, 0), 2.0)

def render(i, img):                                      # img: RGB HLG float 0..1
    t = i / FPS; vis = person_vis(i)
    if t >= TOUCH:
        _, sa = place(SH, POSTER["x"] - 30, POSTER["y"] - 25, i)
        img = img * (1 - sa[..., None] * vis[..., None])
        pc, pa = place(PB, POSTER["x"], POSTER["y"], i)
        a = pa * vis; img = img * (1 - a[..., None]) + pc * 0.97 * a[..., None]
    p = np.clip((t - TOUCH) / (3 / FPS), 0, 1)
    sw = switch_img(p) if 0 < p < 1 else (SW_ON if p >= 1 else SW_OFF)
    sc, sa = place(sw, SW["cx"] - SW["w"] // 2, SW["cy"] - SW["h"] // 2, i)
    a = sa * vis
    return img * (1 - a[..., None]) + sc * a[..., None]

# decodifica mantendo o sinal HLG (só a matriz YUV->RGB BT.2020, sem mudar curva nem primárias)
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", f"{root}/source/video07.mov", "-vf",
                        f"fps={FPS},scale=in_color_matrix=bt2020:in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int,format=rgb48le",
                        "-f", "rawvideo", "-pix_fmt", "rgb48le", "-"], stdout=subprocess.PIPE)
FR = W * H * 3 * 2

def frames():
    while True:
        b = dec.stdout.read(FR)
        if len(b) < FR: return
        yield np.frombuffer(b, np.uint16).reshape(H, W, 3).astype(np.float32) / 65535.0

if "--test" in sys.argv:
    want = {min(N - 1, int(round(float(x) * FPS))) for x in sys.argv[sys.argv.index("--test") + 1].split(",")}
    for i, f in enumerate(frames()):
        if i in want:
            out = render(i, f)
            prev = np.clip(out, 0, 1) ** 1.2                     # prévia SDR aproximada só para conferência visual
            cv2.imwrite(f"{root}/analysis/hdr_test_{i/FPS:.2f}.jpg", cv2.resize((prev[..., ::-1] * 255).astype(np.uint8), (540, 960)))
        if i >= max(want): break
    dec.kill(); sys.exit()

# áudio: referência com o silêncio alongado (mesmo cálculo da prévia)
y, sr = sf.read(f"{root}/analysis/ref_audio.wav")
cut = int(3.70 * sr)
audio = np.concatenate([y[:cut], np.zeros((int(round(SHIFT * sr)), y.shape[1])), y[cut:]])
fl = int(0.25 * sr); audio[-fl:] *= np.linspace(1, 0, fl)[:, None]
sf.write(f"{root}/analysis/audio_sync.wav", audio, sr, subtype="PCM_24")
n_out = int(round(len(audio) / sr * FPS))

enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb48le", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-i", f"{root}/analysis/audio_sync.wav", "-map", "0:v", "-map", "1:a",
    "-vf", "scale=out_color_matrix=bt2020:out_range=tv:in_range=pc:flags=accurate_rnd+full_chroma_int,format=yuv420p10le",
    "-c:v", "libx265", "-preset", "medium", "-crf", "14", "-tag:v", "hvc1",
    "-x265-params", "colorprim=bt2020:transfer=arib-std-b67:colormatrix=bt2020nc:range=limited:hdr10=0:repeat-headers=1",
    "-color_primaries", "bt2020", "-color_trc", "arib-std-b67", "-colorspace", "bt2020nc", "-color_range", "tv",
    "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-shortest", "-movflags", "+faststart",
    f"{root}/out/realme_video_07.mov"], stdin=subprocess.PIPE)
last = None
gen = frames()
for k in range(n_out):
    if k < N:
        f = next(gen, None)
        if f is not None:
            last = (np.clip(render(k, f), 0, 1) * 65535 + 0.5).astype(np.uint16)
    enc.stdin.write(last.tobytes())
    if k % 24 == 0: print(k, flush=True)
enc.stdin.close(); enc.wait(); dec.kill()
print("quadros", n_out)
