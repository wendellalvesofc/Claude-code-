# Final do vídeo 11: troca "VITÓRIA!" (texto e fala) por "PARABÉNS!" na tela e a fala "Parabéns, Ana!".
# - texto: apaga o original (aparece em 9,04 s) preenchendo com o quadro limpo de 9,00 s e escreve PARABÉNS! no mesmo
#   estilo (branco, grosso, contorno preto), ATRÁS da moça e da raposa (recorte em analysis/chars.npy), como o original
# - áudio: até 8,4 s é o original; depois, música sem voz (Demucs) + "Parabéns, Ana!" (ElevenLabs, voz Lari Diniz)
# Uso: python3 scripts/build.py <raiz> [--test]
import subprocess, sys
import numpy as np, cv2, soundfile as sf, librosa
from PIL import Image, ImageDraw, ImageFont

root = sys.argv[1]
W, H, FPS = 848, 478, 24
F = np.load(f"{root}/analysis/frames.npy", mmap_mode="r")
CH = np.load(f"{root}/analysis/chars.npy", mmap_mode="r")
N = len(F)
T_OLD = 9.04            # quando o VITÓRIA! aparece
CLEAN = 216             # quadro 9,00 s: explosão sem texto
TEMPO = 1.15            # fala levemente acelerada para caber até o fim
T_NEW = 10.0 - 1.62 / TEMPO - 0.03   # texto e fala novos começam juntos (~8,56 s)

# máscara do texto original (estático): branco + contorno escuro dentro da caixa do texto, no quadro 9,6 s
ref = F[230].astype(np.int16)
box = np.zeros((H, W), np.uint8); box[18:175, 135:712] = 1
white = (ref.min(axis=2) > 215) & (box > 0)
dark = (ref.max(axis=2) < 120) & (box > 0)
near_white = cv2.dilate(white.astype(np.uint8), np.ones((25, 25), np.uint8)) > 0
OLD = ((white | (dark & near_white)).astype(np.uint8))
OLD = cv2.morphologyEx(OLD, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
OLD = cv2.dilate(OLD, np.ones((11, 11), np.uint8))
OLD &= (CH[230] < 100).astype(np.uint8)          # não pega a raposa/moça

# texto novo no mesmo estilo
def text_layer():
    size = 128
    font = ImageFont.truetype(f"{root}/../realme-bf-10/fonts/Poppins-Black.ttf", size)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    txt = "PARABÉNS!"
    while True:
        bb = d.textbbox((0, 0), txt, font=font, stroke_width=10)
        if bb[2] - bb[0] <= 640: break
        size -= 2; font = ImageFont.truetype(f"{root}/../realme-bf-10/fonts/Poppins-Black.ttf", size)
    bb = d.textbbox((0, 0), txt, font=font, stroke_width=10)
    x = (W - (bb[2] - bb[0])) / 2 - bb[0]
    cap_bottom = 160; ascent = d.textbbox((0, 0), "P", font=font)[3]
    y = cap_bottom - ascent
    d.text((x, y), txt, font=font, fill=(255, 255, 255, 255), stroke_width=10, stroke_fill=(10, 10, 10, 255))
    a = np.asarray(img).astype(np.float32) / 255.0
    return a[..., 2::-1] * 255, a[..., 3]            # BGR, alfa
TXT, TA = text_layer()

def render(i):
    t = i / FPS
    img = F[i].astype(np.float32)
    ch = cv2.GaussianBlur(CH[i].astype(np.float32) / 255.0, (0, 0), 1.0)
    if t >= T_OLD:                                    # apaga o VITÓRIA!
        m = OLD.astype(np.float32) * (1 - (CH[i] > 100))
        m = cv2.GaussianBlur(m, (0, 0), 1.5)[..., None]
        img = img * (1 - m) + F[CLEAN].astype(np.float32) * m
    if t >= T_NEW:                                    # PARABÉNS! atrás dos personagens
        a = (TA * (1 - ch))[..., None]
        img = img * (1 - a) + TXT * a
    return np.clip(img, 0, 255).astype(np.uint8)

if "--test" in sys.argv:
    ims = [cv2.resize(render(int(round(t * FPS))), (424, 239)) for t in (8.3, 8.7, 9.1, 9.5, 9.9)]
    cv2.imwrite(f"{root}/analysis/test_sheet.jpg", cv2.hconcat(ims))
    cv2.imwrite(f"{root}/analysis/test_full.png", render(230)); sys.exit()

# ---- áudio
sr = 48000
orig, _ = librosa.load(f"{root}/analysis/orig48.wav", sr=sr, mono=False)
mus, _ = librosa.load(f"{root}/analysis/sep/htdemucs/orig48/no_vocals.wav", sr=sr, mono=False)
if orig.ndim == 1: orig = np.stack([orig, orig])
if mus.ndim == 1: mus = np.stack([mus, mus])
n = min(orig.shape[1], mus.shape[1]); orig, mus = orig[:, :n], mus[:, :n]
xf = int(8.40 * sr), int(0.06 * sr)
ramp = np.ones(n); ramp[xf[0]:xf[0] + xf[1]] = np.linspace(1, 0, xf[1]); ramp[xf[0] + xf[1]:] = 0
out = orig * ramp + mus * (1 - ramp)
tts, _ = librosa.load(f"{root}/tts/take1.wav", sr=sr)
nz = np.where(np.abs(tts) > 0.02)[0]; tts = tts[max(0, nz[0] - int(0.02 * sr)):nz[-1] + int(0.08 * sr)]
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "-", "-af", f"rubberband=tempo={TEMPO}",
                "-f", "f32le", f"{root}/analysis/tts_fast.raw"], input=tts.astype(np.float32).tobytes(), check=True)
tts = np.fromfile(f"{root}/analysis/tts_fast.raw", np.float32)
vo, _ = librosa.load(f"{root}/analysis/sep/htdemucs/orig48/vocals.wav", sr=sr)
ref_rms = np.sqrt((vo[int(5.9 * sr):int(7.3 * sr)] ** 2).mean())                 # mesmo nível da fala original
tts *= ref_rms / (np.sqrt((tts[np.abs(tts) > 0.01] ** 2).mean()) + 1e-9) * 1.1
s = int(T_NEW * sr); e = min(n, s + len(tts))
out[:, s:e] += tts[: e - s]
fl = int(0.04 * sr); out[:, -fl:] *= np.linspace(1, 0, fl)
pk = np.abs(out).max(); out *= min(1, 0.89 / pk)
sf.write(f"{root}/analysis/audio_final.wav", out.T, sr, subtype="PCM_24")

enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-i", f"{root}/analysis/audio_final.wav", "-map", "0:v", "-map", "1:a",
    "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
    "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
    "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", f"{root}/out/video11_parabens_ana.mp4"], stdin=subprocess.PIPE)
for i in range(N):
    enc.stdin.write(render(i).tobytes())
enc.stdin.close(); enc.wait()
print("quadros", N, "| fala e texto novos a partir de", round(T_NEW, 2), "s")
