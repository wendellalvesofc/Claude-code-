# Homografia do plano da mesa: H[k] leva o quadro de referência (569) para o quadro 530+k
import sys, numpy as np, cv2
F = np.load("analysis/frames.npy", mmap_mode="r"); R = 39
orb = cv2.ORB_create(5000, fastThreshold=10)
reg = np.zeros((1920, 1080), np.uint8); reg[1250:1920, 250:1080] = 255
g0 = cv2.cvtColor(np.ascontiguousarray(F[R]), cv2.COLOR_BGR2GRAY); k0, d0 = orb.detectAndCompute(g0, reg)
bf = cv2.BFMatcher(cv2.NORM_HAMMING)
Hs = np.zeros((len(F), 3, 3)); ok = np.zeros(len(F), bool)
for i in range(len(F)):
    g = cv2.cvtColor(np.ascontiguousarray(F[i]), cv2.COLOR_BGR2GRAY); k, d = orb.detectAndCompute(g, None)
    if d is None: continue
    m = [a for a, b in bf.knnMatch(d0, d, k=2) if a.distance < 0.75 * b.distance]
    if len(m) < 12: print(530 + i, "poucos", len(m)); continue
    H, inl = cv2.findHomography(np.float32([k0[a.queryIdx].pt for a in m]), np.float32([k[a.trainIdx].pt for a in m]), cv2.RANSAC, 4.0)
    if H is None or inl.sum() < 12: print(530 + i, "falhou"); continue
    Hs[i] = H; ok[i] = True
    c = cv2.perspectiveTransform(np.float32([[[770, 1630]]]), H)[0, 0]
    print(530 + i, len(m), int(inl.sum()), c.round())
np.save("analysis/H.npy", Hs); np.save("analysis/H_ok.npy", ok)
