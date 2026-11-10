# Estende o rastreamento para os quadros borrados nas pontas (encadeando quadro a quadro com ECC afim)
import numpy as np, cv2
F = np.load("analysis/frames.npy", mmap_mode="r"); Hs = np.load("analysis/H.npy"); ok = np.load("analysis/H_ok.npy")
def g(i):
    x = cv2.cvtColor(np.ascontiguousarray(F[i][960:1920]), cv2.COLOR_BGR2GRAY)
    return cv2.GaussianBlur(cv2.resize(x, (540, 480)), (0, 0), 2).astype(np.float32)
S = np.array([[2, 0, 0], [0, 2, 960], [0, 0, 1.0]])           # meia resolução, recorte inferior -> quadro cheio
def step(a, b):                                                 # transformação do quadro a para o b (coord. cheias)
    W = np.eye(2, 3, dtype=np.float32)
    try: _, W = cv2.findTransformECC(g(a), g(b), W, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-5), None, 5)
    except cv2.error as e: print("ecc falhou", a, b); return None
    A = np.vstack([W, [0, 0, 1]]); return S @ A @ np.linalg.inv(S)                 # ECC: coordenadas de a -> b
first, last = np.where(ok)[0][[0, -1]]
for i in range(first - 1, 543 - 530 - 1, -1):
    T = step(i + 1, i); Hs[i] = T @ Hs[i + 1]; ok[i] = True
for i in range(last + 1, 602 - 530 + 1):
    T = step(i - 1, i); Hs[i] = T @ Hs[i - 1]; ok[i] = True
for i in range(len(Hs)):
    if ok[i]: print(530 + i, cv2.perspectiveTransform(np.float32([[[770, 1630]]]), Hs[i])[0, 0].round())
np.save("analysis/H2.npy", Hs); np.save("analysis/H2_ok.npy", ok)
