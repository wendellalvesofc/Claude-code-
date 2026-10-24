# Zoom in no rosto da vendedora em "é só com você" e na risadinha para a câmera e volta ao normal.
# Lê o vídeo a 30 fps (ffmpeg -> rawvideo), aplica a transformação quadro a quadro com interpolação
# subpixel (sem tremido) e regrava em H.264 sem áudio. Uso: python3 scripts/zoom.py <raiz>
import subprocess, sys
import numpy as np
import cv2

root = sys.argv[1]
W, H, FPS = 1080, 1920, 30
ZIN, ZOUT, DUR = 31.72, 33.90, 0.30      # início do zoom, início da volta, duração de cada movimento (s)
SCALE = 1.6                               # quanto aproxima
FACE = (960.0, 770.0)                     # centro do rosto no quadro (px)

def ease_out(p): return 1 - (1 - p) ** 3
def ease_in_out(p): return 3 * p * p - 2 * p * p * p

def zoom_at(t):
    if t < ZIN or t >= ZOUT + DUR: return 1.0
    if t < ZIN + DUR: return 1 + (SCALE - 1) * ease_out((t - ZIN) / DUR)
    if t < ZOUT: return SCALE
    return 1 + (SCALE - 1) * (1 - ease_in_out((t - ZOUT) / DUR))

dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", f"{root}/source/video04.mov", "-vf", f"fps={FPS}", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                        "-c:v", "libx264", "-crf", "12", "-preset", "medium", "-pix_fmt", "yuv420p", f"{root}/analysis/zoomed.mp4"], stdin=subprocess.PIPE)
n = 0
while True:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    img = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    z = zoom_at(n / FPS)
    if z > 1.0001:
        # janela visível de tamanho W/z x H/z centrada no rosto, presa dentro do quadro
        vw, vh = W / z, H / z
        x0 = min(max(FACE[0] - vw / 2, 0), W - vw)
        y0 = min(max(FACE[1] - vh / 2, 0), H - vh)
        M = np.float32([[z, 0, -x0 * z], [0, z, -y0 * z]])
        img = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    enc.stdin.write(img.tobytes())
    n += 1
enc.stdin.close(); enc.wait(); dec.wait()
print("quadros", n)
