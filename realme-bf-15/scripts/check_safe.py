# Confere cada legenda: área segura do Reels (sem cabeçalho em cima, legenda/nome embaixo e botões à direita) e rostos
import json, subprocess, numpy as np
SAFE = dict(x0=60, x1=960, y0=250, y1=1500)          # 1080x1920: fora disso ficam os itens da interface do Instagram
F = json.load(open("analysis/faces.json")); WIN = [(0.5, 2.1), (6.6, 8.5), (13.7, 15.4), (17.2, 21.0)]
worst = {}; bad_face = []
for n in range(0, 640):
    t = n / 30
    if not any(a <= t < b for a, b in WIN): continue
    a = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "color=black:s=1080x1920:d=30:r=30", "-vf",
        f"select=eq(n\\,{n}),ass=out/legendas.ass:fontsdir=fonts", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout, np.uint8).reshape(1920, 1080)
    ys, xs = np.where(a > 40)
    if len(ys) == 0: continue
    k = [w for w in WIN if w[0] <= t < w[1]][0]
    b = worst.get(k, [9999, 9999, 0, 0]); worst[k] = [min(b[0], xs.min()), min(b[1], ys.min()), max(b[2], xs.max()), max(b[3], ys.max())]
    for x, y, w, h, s in F[n]:
        if h >= 110 and s > 0.6 and y < 1000 and a[int(y):int(y + h), int(x):int(x + w)].max() > 40: bad_face.append(n)
for k, (x0, y0, x1, y1) in worst.items():
    ok = x0 >= SAFE["x0"] and x1 <= SAFE["x1"] and y0 >= SAFE["y0"] and y1 <= SAFE["y1"]
    print(k, "x", x0, "-", x1, "y", y0, "-", y1, "OK" if ok else "FORA da área segura")
print("rostos cobertos:", bad_face)
