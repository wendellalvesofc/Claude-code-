# Rastreia a parede verde (ORB + RANSAC) -> analysis/homographies.npy: H[i] leva coordenadas do quadro 0 para o quadro i
import sys, numpy as np, cv2
root = sys.argv[1]
F = np.load(f"{root}/analysis/frames.npy", mmap_mode="r")
orb = cv2.ORB_create(4000)
mask = np.zeros((1920, 1080), np.uint8); mask[330:1700, 0:640] = 255
g0 = cv2.cvtColor(F[0], cv2.COLOR_BGR2GRAY); k0, d0 = orb.detectAndCompute(g0, mask)
bf = cv2.BFMatcher(cv2.NORM_HAMMING)
Hs = [np.eye(3)]; prev = np.eye(3)
for i in range(1, len(F)):
    g = cv2.cvtColor(F[i], cv2.COLOR_BGR2GRAY); k, d = orb.detectAndCompute(g, None)
    m = [a for a, b in bf.knnMatch(d0, d, k=2) if a.distance < 0.75 * b.distance]
    H, inl = cv2.findHomography(np.float32([k0[a.queryIdx].pt for a in m]), np.float32([k[a.trainIdx].pt for a in m]), cv2.RANSAC, 3.0)
    Hs.append(H); print(i, len(m), int(inl.sum()), np.round(H @ [300, 900, 1] / (H @ [300, 900, 1])[2], 1)[:2])
np.save(f"{root}/analysis/homographies.npy", np.array(Hs))
