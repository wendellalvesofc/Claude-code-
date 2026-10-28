# Trend do interruptor: interruptor amarelo/preto preso na parede, vira no toque (5,083 s) e o cartaz Pré-Black
# aparece na parede ATRÁS da pessoa. Áudio da referência com o silêncio alongado para a volta da música cair no toque.
# Uso: python3 scripts/compose.py <raiz> [--test t1,t2]
import subprocess, sys
import numpy as np
import cv2
import soundfile as sf

root = sys.argv[1]
W, H, FPS = 1080, 1920, 24
frames = np.load(f"{root}/analysis/frames.npy", mmap_mode="r")
Hs = np.load(f"{root}/analysis/homographies.npy")       # referência (quadro 120) -> quadro t
N = len(frames)
TOUCH = 5.083                                            # mão encosta no interruptor (quadro 122)
REF_DROP, REF_STOP = 4.303, 2.175                        # na referência: volta e parada da música
SHIFT = TOUCH - REF_DROP                                 # silêncio a mais

# ---- elementos em coordenadas do quadro de referência (120)
SW = dict(cx=522, cy=418, w=168, h=76)                   # interruptor: à esquerda dos balões, sob os dedos
POSTER = dict(x=160, y=545, size=610)                    # cartaz na parede de grama, abaixo do interruptor
Y, K = (31, 210, 255), (17, 17, 17)                      # BGR amarelo realme / preto

def switch_img(state):
    """state 0 = desligado (pílula amarela, bolinha preta à direita), 1 = ligado (pílula preta, bolinha amarela à esquerda)"""
    s = 4; w, h = SW["w"] * s, SW["h"] * s
    img = np.zeros((h, w, 4), np.float32)
    pill = np.zeros((h, w), np.uint8)
    r = h // 2
    cv2.rectangle(pill, (r, 0), (w - r, h), 255, -1); cv2.circle(pill, (r, r), r, 255, -1); cv2.circle(pill, (w - r, r), r, 255, -1)
    col = np.float32(Y) * (1 - state) + np.float32(K) * state
    img[..., :3] = col; img[..., 3] = pill / 255.0
    kr = int(r * 0.78); kx = int((w - r) * (1 - state) + r * state)   # bolinha desliza da direita para a esquerda
    knob = np.zeros((h, w), np.uint8); cv2.circle(knob, (kx, r), kr, 255, -1)
    kcol = np.float32(K) * (1 - state) + np.float32(Y) * state
    ka = cv2.GaussianBlur(knob, (0, 0), 2) / 255.0
    img[..., :3] = img[..., :3] * (1 - ka[..., None]) + kcol * ka[..., None]
    # leve brilho e sombra para não parecer chapado
    shade = np.linspace(1.08, 0.92, h, dtype=np.float32)[:, None, None]
    img[..., :3] = np.clip(img[..., :3] * shade, 0, 255)
    return cv2.resize(img, (SW["w"], SW["h"]), interpolation=cv2.INTER_AREA)

poster = cv2.imread(f"{root}/source/cartaz.png", cv2.IMREAD_COLOR)
poster = cv2.resize(poster, (POSTER["size"], POSTER["size"]), interpolation=cv2.INTER_AREA).astype(np.float32)

def place(layer_bgra, x0, y0, Hm):
    """deforma um elemento (BGRA float, posição x0,y0 no quadro de referência) para o quadro atual"""
    T = np.float32([[1, 0, x0], [0, 1, y0], [0, 0, 1]])
    M = Hm @ T
    out = cv2.warpPerspective(layer_bgra, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    return out[..., :3], out[..., 3]

# recorte da pessoa (modelo de segmentação, scripts/segment.py): o cartaz e o interruptor ficam atrás dela
MASKS = np.load(f"{root}/analysis/masks.npy", mmap_mode="r")

def person_mask(i):
    m = MASKS[i].astype(np.float32) / 255.0
    m = cv2.dilate(m, np.ones((3, 3), np.uint8))          # cobre a franja fina da borda
    return cv2.GaussianBlur(m, (0, 0), 1.0)

SW_OFF, SW_ON = switch_img(0.0), switch_img(1.0)
PB = np.dstack([poster, np.ones(poster.shape[:2], np.float32)])
SHADOW = np.zeros((POSTER["size"] + 80, POSTER["size"] + 80, 4), np.float32)
cv2.rectangle(SHADOW, (40, 40), (40 + POSTER["size"], 40 + POSTER["size"]), (0, 0, 0, 1), -1)
SHADOW[..., 3] = cv2.GaussianBlur(SHADOW[..., 3], (0, 0), 14) * 0.45

def render(i):
    t = i / FPS
    img = frames[i].astype(np.float32)
    Hm = Hs[i].astype(np.float64)
    pm = person_mask(i)
    vis = 1 - pm
    if t >= TOUCH:
        sc, sa = place(SHADOW, POSTER["x"] - 30, POSTER["y"] - 25, Hm)
        img = img * (1 - sa[..., None] * vis[..., None])
        pc, pa = place(PB, POSTER["x"], POSTER["y"], Hm)
        a = pa * vis
        img = img * (1 - a[..., None]) + pc * 0.97 * a[..., None]
    p = np.clip((t - TOUCH) / (3 / FPS), 0, 1)                # bolinha desliza em 3 quadros
    swl = switch_img(p) if 0 < p < 1 else (SW_ON if p >= 1 else SW_OFF)
    sc, sa = place(swl, SW["cx"] - SW["w"] // 2, SW["cy"] - SW["h"] // 2, Hm)
    a = sa * vis
    img = img * (1 - a[..., None]) + sc * a[..., None]
    return np.clip(img, 0, 255).astype(np.uint8)

if "--test" in sys.argv:
    for t in [float(x) for x in sys.argv[sys.argv.index("--test") + 1].split(",")]:
        i = min(N - 1, int(round(t * FPS))); cv2.imwrite(f"{root}/analysis/test_{t:.2f}.jpg", render(i))
    sys.exit()

# ---- áudio: referência com o silêncio alongado em SHIFT segundos (inserido no trecho mudo, depois do clique)
y, sr = sf.read(f"{root}/analysis/ref_audio.wav")
cut = int(3.70 * sr); gap = np.zeros((int(round(SHIFT * sr)), y.shape[1]))
audio = np.concatenate([y[:cut], gap, y[cut:]])
total = len(audio) / sr
fl = int(0.25 * sr); audio[-fl:] *= np.linspace(1, 0, fl)[:, None]
sf.write(f"{root}/analysis/audio_sync.wav", audio, sr, subtype="PCM_24")
n_out = int(round(total * FPS))

enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                        "-i", f"{root}/analysis/audio_sync.wav", "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "17", "-preset", "slow",
                        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-shortest", "-movflags", "+faststart",
                        f"{root}/out/realme_video_07.mp4"], stdin=subprocess.PIPE)
last = None
for k in range(n_out):
    if k < N: last = render(k)                           # depois do fim do vídeo, segura o último quadro (cartaz na parede)
    enc.stdin.write(last.tobytes())
enc.stdin.close(); enc.wait()
print("quadros", n_out, "duração", round(total, 3), "s | toque em", TOUCH, "s | música volta em", round(REF_DROP + SHIFT, 3), "s")
