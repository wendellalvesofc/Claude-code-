# Posição das câmeras do iPhone (canto sup. esq. do molde) em cada quadro 180–315, partindo do 240 para os dois lados;
# busca local em volta da posição prevista, com borda acolchoada para quando o celular sai pela lateral.
import numpy as np, cv2
F = np.load("analysis/framesB.npy", mmap_mode="r")
T = cv2.cvtColor(np.ascontiguousarray(F[140][470:540, 575:675]), cv2.COLOR_BGR2GRAY).astype(np.float32)
P = 120
def gray(i): return cv2.copyMakeBorder(cv2.cvtColor(np.ascontiguousarray(F[i - 100]), cv2.COLOR_BGR2GRAY), P, P, P, P, cv2.BORDER_REPLICATE).astype(np.float32)
pos = {240: (575.0, 470.0)}; score = {240: 1.0}
for rng in (range(241, 316), range(239, 179, -1)):
    prev = 240; vel = np.zeros(2)
    for i in rng:
        px, py = np.clip(np.array(pos[prev]) + vel, [-P + 61, -P + 61], [1080 + P - 161, 920 + P - 131])
        g = gray(i); S, SY = 60, 18
        x0, y0 = int(px) + P - S, int(py) + P - SY
        win = g[max(y0, 0):y0 + 70 + 2 * SY, max(x0, 0):x0 + 100 + 2 * S]
        r = cv2.matchTemplate(win, T, cv2.TM_CCOEFF_NORMED); _, mx, _, loc = cv2.minMaxLoc(r)
        nx, ny = max(x0, 0) + loc[0] - P, max(y0, 0) + loc[1] - P
        if mx < 0.3: nx, ny = px, py                            # perdeu: segue a velocidade
        vel = 0.6 * vel + 0.4 * (np.array([nx, ny]) - np.array(pos[prev]))
        pos[i] = (nx, ny); score[i] = mx; prev = i
out = np.array([(i, *pos[i], score[i]) for i in sorted(pos)])
np.save("analysis/lensB.npy", out)
print(" | ".join(f"{int(i)} {x:.0f},{y:.0f} {s:.2f}" for i, x, y, s in out))
