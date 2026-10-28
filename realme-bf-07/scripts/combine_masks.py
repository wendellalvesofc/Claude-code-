# Máscara final da pessoa = modelos de segmentação (pessoa + objeto) limitados à região que mudou em relação à parede
# vazia (descarta a parede quando o modelo a confunde com a pessoa) e completada pela diferença quando os modelos
# perdem a pessoa na borda do quadro (entrada e saída). Saída: analysis/masks_final.npy (uint8)
import sys
import numpy as np, cv2

root = sys.argv[1]
W, H = 1080, 1920
F = np.load(f"{root}/analysis/frames.npy", mmap_mode="r")
Hs = np.load(f"{root}/analysis/homographies.npy").astype(np.float64)
MH = np.load(f"{root}/analysis/masks_human.npy", mmap_mode="r")
MI = np.load(f"{root}/analysis/masks.npy", mmap_mode="r")
N = len(F)
PLATES = {0: F[0].astype(np.float32), N - 1: F[N - 1].astype(np.float32)}   # parede vazia no início e no fim

def diff_mask(i):
    k = 0 if i < N // 2 else N - 1
    Hm = Hs[i] @ np.linalg.inv(Hs[k])
    pl = cv2.warpPerspective(PLATES[k], Hm, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    a = cv2.cvtColor(cv2.GaussianBlur(F[i], (0, 0), 3), cv2.COLOR_BGR2LAB).astype(np.float32)
    b = cv2.cvtColor(np.clip(cv2.GaussianBlur(pl, (0, 0), 3), 0, 255).astype(np.uint8), cv2.COLOR_BGR2LAB).astype(np.float32)
    d = np.sqrt(((a - b) ** 2 * np.float32([0.6, 1, 1])).sum(-1))
    m = (d > 22).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31)))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    keep = np.zeros_like(m)
    for c in range(1, n):
        if st[c][4] > 8000: keep[lab == c] = 1
    cnts, _ = cv2.findContours(keep, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    full = np.zeros_like(keep); cv2.drawContours(full, cnts, -1, 1, -1)
    return full

out = np.zeros((N, H, W), np.uint8); log = []
for i in range(N):
    D = diff_mask(i)
    gate = cv2.dilate(D, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (61, 61))).astype(np.float32)
    seg = np.maximum(MH[i], MI[i]).astype(np.float32) / 255.0 * gate      # modelos só onde algo mudou
    seg_area, d_area = (seg > 0.5).sum(), D.sum()
    if d_area > 15000 and seg_area < 0.6 * d_area:                         # modelos perderam a pessoa: usa a diferença
        seg = np.maximum(seg, cv2.GaussianBlur(D.astype(np.float32), (0, 0), 3))
        log.append(i)
    out[i] = np.clip(seg * 255, 0, 255).astype(np.uint8)
np.save(f"{root}/analysis/masks_final.npy", out)
print("quadros completados pela diferença:", log)
