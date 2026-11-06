# Vídeo 13: tela de direct chegando mensagens na parede verde ("o direct tá bombando"), atrás da vendedora.
# Resto do vídeo intacto (cores BT.709 mantidas). Uso: python3 scripts/build.py <raiz> [--test]
import subprocess, sys, os
import numpy as np, cv2, soundfile as sf
root = sys.argv[1]; os.chdir(root); sys.path.insert(0, "scripts")
from direct import layer, ARR
W, H, FPS = 1080, 1920, 30
S0, S1 = 212, 316                           # plano da parede verde: quadros 212..315 (7,067–10,533 s)
Hs = np.load("analysis/homographies.npy"); MK = np.load("analysis/masks_human.npy", mmap_mode="r")

def comp(img, k):
    L = layer(k / FPS)
    if L is None: return img
    rgb, a, sh = L; Hm = Hs[k]
    w = lambda x: cv2.warpPerspective(x, Hm, (W, H), flags=cv2.INTER_LINEAR)
    rgb, a, sh = w(rgb), w(a), w(sh)
    person = cv2.GaussianBlur(cv2.dilate(MK[k], np.ones((3, 3), np.uint8)).astype(np.float32) / 255, (0, 0), 1.2)
    vis = 1 - person
    f = img.astype(np.float32)
    f *= (1 - sh * vis)[..., None]
    a = (a * vis)[..., None]
    return np.clip(f * (1 - a) + rgb * a, 0, 255).astype(np.uint8)

dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", "source/video13.mov", "-fps_mode", "passthrough", "-vf", "scale=in_color_matrix=bt709:in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int",
                        "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
FR = W * H * 3
if "--test" in sys.argv:
    want = [S0 + 3, S0 + 20, S0 + 45, S0 + 75, S0 + 103]; ims = []
    for n in range(max(want) + 1):
        b = np.frombuffer(dec.stdout.read(FR), np.uint8).reshape(H, W, 3)
        if n in want: ims.append(cv2.resize(comp(b.copy(), n - S0), (432, 768)))
    dec.kill(); cv2.imwrite("analysis/test_sheet.jpg", cv2.hconcat(ims)); sys.exit()

# áudio: original + "ping" suave de notificação a cada mensagem
ffa = subprocess.run(["ffmpeg", "-v", "error", "-i", "source/video13.mov", "-f", "f32le", "-ac", "2", "-ar", "48000", "-"], capture_output=True).stdout
au = np.frombuffer(ffa, np.float32).reshape(-1, 2).copy(); sr = 48000
tt = np.arange(int(0.16 * sr)) / sr
ping = (np.sin(2 * np.pi * 1320 * tt) * np.exp(-tt * 28) + 0.5 * np.sin(2 * np.pi * 1980 * tt) * np.exp(-tt * 40)) * 0.10
for t in ARR:
    i = int((S0 / FPS + t) * sr); au[i:i + len(ping)] += ping[:, None]
au *= min(1, 0.95 / np.abs(au).max())
sf.write("analysis/audio_final.wav", au, sr, subtype="PCM_24")

enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-i", "analysis/audio_final.wav", "-map", "0:v", "-map", "1:a",
    "-vf", "scale=out_color_matrix=bt709:out_range=tv:in_range=pc:flags=accurate_rnd+full_chroma_int,format=yuv420p",
    "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
    "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", "out/realme_video_13.mp4"], stdin=subprocess.PIPE)
n = 0
while True:
    b = dec.stdout.read(FR)
    if len(b) < FR: break
    img = np.frombuffer(b, np.uint8).reshape(H, W, 3)
    enc.stdin.write((comp(img.copy(), n - S0) if S0 <= n < S1 else img).tobytes()); n += 1
enc.stdin.close(); enc.wait(); dec.wait(); print("quadros", n)
