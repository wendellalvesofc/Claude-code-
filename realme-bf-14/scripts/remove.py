# Remove o iPhone roxo da mesa (quadros 543–602): a mesa limpa do quadro de referência (569, preenchida com LaMa)
# é projetada em cada quadro pela homografia da mesa, com ajuste de cor e de borrão de movimento pelo anel em volta.
import sys, numpy as np, cv2
sys.path.insert(0, "scripts"); from lama import inpaint
F = np.load("analysis/frames.npy", mmap_mode="r"); Hs = np.load("analysis/H2.npy"); ok = np.load("analysis/H2_ok.npy")
R = 39; W, H = 1080, 1920
POLY = np.int32([(598, 1520), (946, 1598), (942, 1714), (885, 1742), (590, 1648)])
M0 = np.zeros((H, W), np.uint8); cv2.fillPoly(M0, [POLY], 255); M0 = cv2.dilate(M0, np.ones((31, 31), np.uint8))
ORIG = np.ascontiguousarray(F[R]).astype(np.float32)
CLEAN = inpaint(np.ascontiguousarray(F[R]), M0, (480, 1380, 1040, 1900)).astype(np.float32)
cv2.imwrite("analysis/ref_clean.png", CLEAN.astype(np.uint8))
C0 = np.float32([[[770, 1630]]])
def center(i): return cv2.perspectiveTransform(C0, Hs[i])[0, 0]
def line_kernel(v, frac):
    L = np.linalg.norm(v) * frac
    if L < 1.5: return None
    n = int(np.ceil(L)) | 1; k = np.zeros((n + 2, n + 2), np.float32); c = (n + 1) / 2; u = v / np.linalg.norm(v) * L / 2
    cv2.line(k, (int(round(c - u[0])), int(round(c - u[1]))), (int(round(c + u[0])), int(round(c + u[1]))), 1, 1)
    return k / k.sum()
def frame(i):
    """i: índice em frames.npy; devolve o quadro com o iPhone removido"""
    img = np.ascontiguousarray(F[i]).astype(np.float32)
    if not ok[i]: return img.astype(np.uint8)
    Hm = Hs[i]
    pat = cv2.warpPerspective(CLEAN, Hm, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    org = cv2.warpPerspective(ORIG, Hm, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    m = cv2.warpPerspective(M0, Hm, (W, H), flags=cv2.INTER_LINEAR)
    if m.max() == 0: return img.astype(np.uint8)
    a, b = max(i - 1, 0), min(i + 1, len(F) - 1)
    v = (center(b) - center(a)) / (b - a) if ok[a] and ok[b] else np.zeros(2)
    ys, xs = np.where(m > 0); y0, y1, x0, x1 = max(ys.min() - 80, 0), min(ys.max() + 80, H), max(xs.min() - 80, 0), min(xs.max() + 80, W)
    grow = int(np.linalg.norm(v) * 0.6) + (9 if 21 <= i <= 62 else 25)
    mm = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (grow, grow)))
    ring = (cv2.dilate(mm, np.ones((41, 41), np.uint8)) > 0) & (mm == 0)
    best = None
    for frac in (0, 0.25, 0.4, 0.55, 0.7, 0.9):                  # borrão de movimento que melhor casa com o anel
        k = line_kernel(v, frac)
        p = pat[y0:y1, x0:x1] if k is None else cv2.filter2D(pat[y0:y1, x0:x1], -1, k)
        r = ring[y0:y1, x0:x1]
        if r.sum() < 50: gain = np.ones(3, np.float32)
        else: gain = (img[y0:y1, x0:x1][r].mean(0) + 1) / (p[r].mean(0) + 1)
        err = np.abs(p[r] * gain - img[y0:y1, x0:x1][r]).mean() if r.sum() >= 50 else 0
        if best is None or err < best[0]: best = (err, p * gain, frac, k, gain)
    # o que está na frente do celular (caixa transparente, mão) não bate com o celular da referência: preserva
    o = org[y0:y1, x0:x1]; o = o if best[3] is None else cv2.filter2D(o, -1, best[3])
    d = np.abs(o * best[4] - img[y0:y1, x0:x1]).mean(2)
    bright = cv2.GaussianBlur(img[y0:y1, x0:x1].mean(2), (0, 0), 3) > 140          # celular é escuro; o que é claro e difere é a caixa/mão
    occ = cv2.GaussianBlur(((cv2.GaussianBlur(d, (0, 0), 3) > 38) & bright).astype(np.float32), (0, 0), 5)
    lens = np.zeros((H, W), np.uint8); lc = cv2.perspectiveTransform(np.float32([[[885, 1628]]]), Hm)[0, 0]
    cv2.circle(lens, (int(lc[0]), int(lc[1])), 85, 1, -1)                       # câmeras do iPhone: sempre substitui
    occ *= 1 - cv2.GaussianBlur(lens[y0:y1, x0:x1].astype(np.float32), (0, 0), 8)
    occ = np.clip(occ * 1.6, 0, 1) * (cv2.erode(m, np.ones((15, 15), np.uint8))[y0:y1, x0:x1] > 0)
    al = cv2.GaussianBlur(mm[y0:y1, x0:x1].astype(np.float32) / 255, (0, 0), 6) * (1 - occ)
    al = al[..., None]
    img[y0:y1, x0:x1] = img[y0:y1, x0:x1] * (1 - al) + best[1] * al
    return np.clip(img, 0, 255).astype(np.uint8)
if __name__ == "__main__" and len(sys.argv) > 1:
    ids = [int(x) - 530 for x in sys.argv[1].split(",")]
    ims = [np.vstack([cv2.resize(np.ascontiguousarray(F[i][1150:1920]), (540, 385)), cv2.resize(frame(i)[1150:1920], (540, 385))]) for i in ids]
    cv2.imwrite("analysis/remove_test.jpg", np.hstack(ims))
