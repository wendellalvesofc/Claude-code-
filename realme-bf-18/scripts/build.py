# Vídeo 18 (HDR HLG 10-bit, mantido): legendas renderizadas pelo libass em RGBA (sRGB) e convertidas para HLG
# (branco SDR = 75% HLG, BT.2408) antes de compor sobre o vídeo, para não ficarem estouradas. Clique do mouse no "começou!".
import subprocess, sys, numpy as np, cv2, soundfile as sf
W, H, FPS = 1080, 1920, 30
M709_2020 = np.array([[0.6274, 0.3293, 0.0433], [0.0691, 0.9195, 0.0114], [0.0164, 0.0880, 0.8956]])
def srgb_to_hlg(rgb):
    lin = np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
    lin = np.clip(lin @ M709_2020.T, 0, None); e = (lin * 0.203) ** (1 / 1.2)
    a, b, c = 0.17883277, 0.28466892, 0.55991073
    return np.where(e <= 1 / 12, np.sqrt(3 * e), a * np.log(np.maximum(12 * e - b, 1e-6)) + c)
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", "source/video18.mov", "-fps_mode", "passthrough", "-vf",
    "scale=in_color_matrix=bt2020:in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int,format=rgb48le", "-f", "rawvideo", "-pix_fmt", "rgb48le", "-"], stdout=subprocess.PIPE)
cap = subprocess.Popen(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", f"color=black@0:s={W}x{H}:r={FPS}:d=24,format=rgba", "-vf", "ass=out/legendas.ass:fontsdir=fonts:alpha=1",
    "-f", "rawvideo", "-pix_fmt", "rgba", "-"], stdout=subprocess.PIPE)
def comp(img, c):
    a = c[..., 3].astype(np.float32) / 255
    ys, xs = np.where(a > 0)
    if len(ys) == 0: return img
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    aa = a[y0:y1, x0:x1, None]; rgb = srgb_to_hlg(c[y0:y1, x0:x1, :3].astype(np.float32) / 255)
    img[y0:y1, x0:x1] = img[y0:y1, x0:x1] * (1 - aa) + rgb * aa
    return img
def frames():
    while True:
        b = dec.stdout.read(W * H * 6); c = cap.stdout.read(W * H * 4)
        if len(b) < W * H * 6: return
        yield np.frombuffer(b, np.uint16).reshape(H, W, 3).astype(np.float32) / 65535, np.frombuffer(c, np.uint8).reshape(H, W, 4)
if "--test" in sys.argv:
    want = [int(round(float(x) * FPS)) for x in sys.argv[sys.argv.index("--test") + 1].split(",")]; ims = []
    for i, (f, c) in enumerate(frames()):
        if i in want: ims.append(cv2.resize((np.clip(comp(f, c), 0, 1) ** 1.2 * 255).astype(np.uint8)[..., ::-1], (270, 480)))
        if i >= max(want): break
    cv2.imwrite("analysis/test.jpg", np.hstack(ims)); sys.exit()
sr = 48000
au = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", "source/video18.mov", "-f", "f32le", "-ac", "2", "-ar", str(sr), "-"], capture_output=True).stdout, np.float32).reshape(-1, 2).copy()
m, msr = sf.read("../realme-bf-02/sfx/mouse.wav", dtype="float32")
if m.ndim == 1: m = np.stack([m, m], 1)
if msr != sr:
    from scipy import signal; m = signal.resample_poly(m, sr, msr, axis=0).astype(np.float32)
i = int((6.85 - 0.02) * sr); au[i:i + len(m)] += m[:len(au) - i] * 0.5
au *= min(1, 0.95 / np.abs(au).max()); sf.write("analysis/audio_final.wav", au, sr, subtype="PCM_24")
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb48le", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-i", "analysis/audio_final.wav", "-map", "0:v", "-map", "1:a",
    "-vf", "scale=out_color_matrix=bt2020:out_range=tv:in_range=pc:flags=accurate_rnd+full_chroma_int,format=yuv420p10le",
    "-c:v", "libx265", "-preset", "medium", "-crf", "16", "-tag:v", "hvc1",
    "-x265-params", "colorprim=bt2020:transfer=arib-std-b67:colormatrix=bt2020nc:range=limited:hdr10=0:repeat-headers=1:log-level=error",
    "-color_primaries", "bt2020", "-color_trc", "arib-std-b67", "-colorspace", "bt2020nc", "-color_range", "tv",
    "-c:a", "aac", "-b:a", "320k", "-shortest", "-movflags", "+faststart", "out/realme_video_18.mov"], stdin=subprocess.PIPE)
n = 0
for f, c in frames():
    enc.stdin.write((np.clip(comp(f, c), 0, 1) * 65535 + 0.5).astype(np.uint16).tobytes()); n += 1
enc.stdin.close(); enc.wait(); dec.wait(); cap.kill(); print("quadros", n)
