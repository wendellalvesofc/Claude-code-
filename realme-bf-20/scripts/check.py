# Confere as legendas: rostos cobertos (YuNet), área segura do Reels e se alguma virou 2 linhas (altura do bloco).
import subprocess, sys, numpy as np, cv2
SRC = sys.argv[1]; W, H = 1080, 1920
det = cv2.FaceDetectorYN.create("models/yunet.onnx", "", (540, 960), 0.6, 0.3, 50)
v = subprocess.Popen(["ffmpeg", "-v", "error", "-i", SRC, "-fps_mode", "passthrough", "-vf", "fps=30,scale=540:960", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
c = subprocess.Popen(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "color=black:s=1080x1920:r=30:d=60", "-vf", "ass=out/legendas.ass:fontsdir=fonts", "-f", "rawvideo", "-pix_fmt", "gray", "-"], stdout=subprocess.PIPE)
n = 0; bad = []; box = [9999, 9999, 0, 0]; tall = []
while True:
    b = v.stdout.read(540 * 960 * 3); a = c.stdout.read(W * H)
    if len(b) < 540 * 960 * 3 or len(a) < W * H: break
    a = np.frombuffer(a, np.uint8).reshape(H, W)
    if a.max() > 40:
        _, f = det.detect(np.frombuffer(b, np.uint8).reshape(960, 540, 3))
        for r in (f if f is not None else []):
            if r[3] > 30:
                x0, y0, x1, y1 = [int(q * 2) for q in (r[0], r[1], r[0] + r[2], r[1] + r[3])]
                if a[max(y0, 0):y1, max(x0, 0):x1].max() > 40: bad.append(round(n / 30, 2))
        ys, xs = np.where(a > 40); box = [min(box[0], xs.min()), min(box[1], ys.min()), max(box[2], xs.max()), max(box[3], ys.max())]
        if ys.max() - ys.min() > 140: tall.append(round(n / 30, 2))
    n += 1
print("rostos cobertos:", bad); print("extensão:", [int(q) for q in box], "| área segura x 60-960, y 250-1500"); print("quadros com 2 linhas:", tall[:10], len(tall))
