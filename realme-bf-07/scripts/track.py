# Rastreia a parede: homografia de cada quadro para o quadro de referência (o do toque no interruptor).
# Usa pontos da textura da parede/banner com fluxo óptico entre quadros vizinhos e reancora no quadro de referência
# (evita deriva). Saída: analysis/homographies.npy (N x 3 x 3, referência -> quadro t) e frames 1080x1920 em analysis/frames.npy
import subprocess, sys
import numpy as np
import cv2

root = sys.argv[1]
W, H, FPS = 1080, 1920, 24
REF_T = 5.0
p = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{root}/source/video07.mov", "-vf", f"scale={W}:{H}:flags=area,fps={FPS}",
                    "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], capture_output=True, check=True).stdout
frames = np.frombuffer(p, np.uint8).reshape(-1, H, W, 3)
N = len(frames); ref = int(round(REF_T * FPS))
gray = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]
np.save(f"{root}/analysis/frames.npy", frames)

orb = cv2.ORB_create(6000, scaleFactor=1.2, nlevels=8)
def match_h(a, b):
    """homografia que leva a imagem a -> b (pontos de a em coordenadas de b)"""
    ka, da = orb.detectAndCompute(a, None); kb, db = orb.detectAndCompute(b, None)
    m = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True).match(da, db)
    m = sorted(m, key=lambda x: x.distance)[:1500]
    pa = np.float32([ka[x.queryIdx].pt for x in m]); pb = np.float32([kb[x.trainIdx].pt for x in m])
    Hm, inl = cv2.findHomography(pa, pb, cv2.RANSAC, 3.0, maxIters=5000, confidence=0.999)
    return Hm, int(inl.sum()), len(m)

Hs = np.zeros((N, 3, 3), np.float32)
stats = []
for i in range(N):
    Hm, inl, tot = match_h(gray[ref], gray[i])
    Hs[i] = Hm; stats.append((i, inl, tot))
# suaviza no tempo (tremor de mão) sem perder o movimento real
sm = Hs.copy()
for i in range(N):
    lo, hi = max(0, i - 2), min(N, i + 3)
    sm[i] = np.mean(Hs[lo:hi] / Hs[lo:hi, 2:3, 2:3], axis=0)
np.save(f"{root}/analysis/homographies.npy", sm)
print("quadros", N, "ref", ref)
print("inliers min/med:", min(s[1] for s in stats), int(np.median([s[1] for s in stats])))
print([s for s in stats if s[1] < 150][:10])
