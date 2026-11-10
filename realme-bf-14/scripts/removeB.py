# Remove o iPhone no trecho 6–10 s (quadros 180–313): celular quase de lado na borda de trás da mesa.
# Posição pelas câmeras (analysis/lensB.npy, ajustada à mão nos quadros borrados) e preenchimento LaMa por quadro.
import sys, numpy as np, cv2
sys.path.insert(0, "scripts"); from lama import inpaint
L = {int(r[0]): np.array(r[1:3]) for r in np.load("analysis/lensB.npy")}
L.update({309: np.array([390., 480.]), 310: np.array([250., 520.]), 311: np.array([100., 545.]), 312: np.array([-40., 580.]), 313: np.array([-180., 610.])})
POLY = np.float32([(-152, -23), (92, 27), (88, 77), (-152, -12)])
POLY_FAST = np.float32([(-210, -20), (110, 5), (110, 95), (-210, 70)])   # quadros 309–313: giro rápido, celular borrado e mais inclinado
A, B, Y0 = 180, 313, 1000                     # quadros e deslocamento vertical do recorte usado no rastreamento
def blurry(i): return i <= 186 or i >= 305
def mask(i):
    m = np.zeros((1920, 1080), np.uint8)
    p = ((POLY_FAST if i >= 309 else POLY) + L[i] + [0, Y0]).astype(np.int32); cv2.fillPoly(m, [p], 255)
    c = L[i] + [50, 35 + Y0]; cv2.circle(m, (int(c[0]), int(c[1])), 48, 255, -1)
    d = 41 if blurry(i) else 23
    return cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (d, d)))
def frame(img, i):
    if not (A <= i <= B): return img
    m = mask(i)
    if m.max() == 0: return img
    ys, xs = np.where(m > 0); cx, cy = (xs.min() + xs.max()) // 2, (ys.min() + ys.max()) // 2
    S = 200
    x0 = int(np.clip(cx - S, 0, 1080 - 2 * S)); y0 = int(np.clip(cy - S, 0, 1920 - 2 * S))
    return inpaint(img, m, (x0, y0, x0 + 2 * S, y0 + 2 * S))
if __name__ == "__main__" and len(sys.argv) > 1:
    F = np.load("analysis/framesB.npy", mmap_mode="r")
    ims = []
    for i in map(int, sys.argv[1].split(",")):
        full = np.zeros((1920, 1080, 3), np.uint8); full[1000:] = F[i - 100]
        a = full[1300:1750]; b = frame(full, i)[1300:1750]
        ims.append(np.vstack([cv2.resize(a, (360, 150)), cv2.resize(b, (360, 150))]))
        cv2.putText(ims[-1], str(i), (5, 20), 0, 0.6, (0, 255, 255), 2)
    cv2.imwrite("analysis/removeB_test.jpg", np.vstack([np.hstack(ims[k:k + 4]) for k in range(0, len(ims), 4)]))
