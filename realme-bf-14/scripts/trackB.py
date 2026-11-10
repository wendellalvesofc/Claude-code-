# Rastreia o iPhone no trecho 6–10 s (quadros 100–340, recorte y 1000–1920) com SIFT em volta do celular
import numpy as np, cv2
F = np.load("analysis/framesB.npy", mmap_mode="r"); R = 140
sift = cv2.SIFT_create(4000)
reg = np.zeros((920, 1080), np.uint8); reg[400:620, 300:820] = 255
g0 = cv2.cvtColor(np.ascontiguousarray(F[R]), cv2.COLOR_BGR2GRAY); k0, d0 = sift.detectAndCompute(g0, reg)
print("pontos ref", len(k0))
bf = cv2.BFMatcher()
Hs = np.zeros((len(F), 3, 3)); ok = np.zeros(len(F), bool)
for i in range(len(F)):
    g = cv2.cvtColor(np.ascontiguousarray(F[i]), cv2.COLOR_BGR2GRAY); k, d = sift.detectAndCompute(g, None)
    if d is None or len(k) < 10: continue
    m = [a for a, b in bf.knnMatch(d0, d, k=2) if a.distance < 0.75 * b.distance]
    if len(m) < 10: continue
    H, inl = cv2.findHomography(np.float32([k0[a.queryIdx].pt for a in m]), np.float32([k[a.trainIdx].pt for a in m]), cv2.RANSAC, 4.0)
    if H is None or inl.sum() < 10: continue
    Hs[i] = H; ok[i] = True
    print(100 + i, len(m), int(inl.sum()), cv2.perspectiveTransform(np.float32([[[545, 495]]]), H)[0, 0].round())
np.save("analysis/HB.npy", Hs); np.save("analysis/HB_ok.npy", ok)
