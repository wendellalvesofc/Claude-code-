# Vídeo 05: câmera lenta (3x) no arremesso final + zoom no vendedor da direita seguindo a bolinha até a menina.
# 1) monta a base: 0–40,40 s normal | 40,40–41,00 s em câmera lenta (interpolação de movimento) | meme a partir de 41,00 s
# 2) aplica o zoom/panorâmica quadro a quadro (subpixel)
# Uso: python3 scripts/build.py <raiz>  -> analysis/base.mp4, analysis/base.wav, analysis/zoomed.mp4
import subprocess, sys
import numpy as np
import cv2

root = sys.argv[1]
SRC = f"{root}/source/video05.mov"
A_END, B_END, SLOW = 40.40, 41.00, 3        # trecho em câmera lenta e fator
W, H, FPS = 1080, 1920, 30

fc = (
    f"[0:v]trim=0:{A_END},setpts=PTS-STARTPTS,fps={FPS}[va];"
    f"[0:v]trim={A_END}:{B_END},setpts=PTS-STARTPTS,minterpolate=fps={FPS*SLOW}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,setpts={SLOW}*PTS,fps={FPS}[vb];"
    f"[0:v]trim=start={B_END},setpts=PTS-STARTPTS,fps={FPS}[vc];"
    f"[va][vb][vc]concat=n=3:v=1:a=0[v];"
    f"[0:a]atrim=0:{A_END},asetpts=PTS-STARTPTS[aa];"
    f"[0:a]atrim={A_END}:{B_END},asetpts=PTS-STARTPTS,rubberband=tempo={1/SLOW:.4f}[ab];"
    f"[0:a]atrim=start={B_END},asetpts=PTS-STARTPTS[ac];"
    f"[aa][ab][ac]concat=n=3:v=0:a=1,aresample=48000[a]"
)
import os
if "--rebuild" in sys.argv or not os.path.exists(f"{root}/analysis/base.mp4"):
  subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-filter_complex", fc, "-map", "[v]", "-c:v", "libx264", "-crf", "12", "-preset", "medium",
                "-pix_fmt", "yuv420p", f"{root}/analysis/base.mp4", "-map", "[a]", "-c:a", "pcm_s16le", f"{root}/analysis/base.wav"], check=True)

def B(t):  # tempo de origem -> tempo na base (dentro do trecho lento)
    return A_END + (t - A_END) * SLOW

MAN, GIRL = (930.0, 720.0), (655.0, 860.0)
# quadros-chave: (tempo na base, zoom, centro)
KEYS = [
    (40.02, 1.0, MAN),
    (40.40, 1.6, MAN),          # aproxima no vendedor quando ele aparece com a bolinha
    (B(40.75), 1.6, MAN),       # segura até soltar a bolinha
    (B(40.87), 1.55, GIRL),     # segue a bolinha até a menina
]
CUT = B(B_END)                  # corte para o meme: volta ao quadro inteiro

def smooth(p): return p * p * (3 - 2 * p)

def cam(t):
    if t < KEYS[0][0] or t >= CUT: return 1.0, MAN
    if t >= KEYS[-1][0]: return KEYS[-1][1], KEYS[-1][2]
    for (t0, z0, c0), (t1, z1, c1) in zip(KEYS, KEYS[1:]):
        if t0 <= t < t1:
            p = smooth((t - t0) / (t1 - t0))
            return z0 + (z1 - z0) * p, (c0[0] + (c1[0] - c0[0]) * p, c0[1] + (c1[1] - c0[1]) * p)

dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", f"{root}/analysis/base.mp4", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                        "-c:v", "libx264", "-crf", "12", "-preset", "medium", "-pix_fmt", "yuv420p", f"{root}/analysis/zoomed.mp4"], stdin=subprocess.PIPE)
n = 0
while True:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    img = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    z, (cx, cy) = cam(n / FPS)
    if z > 1.0001:
        vw, vh = W / z, H / z
        x0 = min(max(cx - vw / 2, 0), W - vw)
        y0 = min(max(cy - vh / 2, 0), H - vh)
        M = np.float32([[z, 0, -x0 * z], [0, z, -y0 * z]])
        img = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    enc.stdin.write(img.tobytes())
    n += 1
enc.stdin.close(); enc.wait(); dec.wait()
print("quadros", n, "corte para o meme em", round(CUT, 3), "s")
