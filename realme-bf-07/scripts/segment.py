# Recorte da pessoa em todos os quadros com o modelo isnet-general-use (rembg) -> analysis/masks.npy (uint8 0-255)
import sys
import numpy as np, cv2
from rembg import new_session, remove
root = sys.argv[1]
f = np.load(f"{root}/analysis/frames.npy", mmap_mode="r")
s = new_session("isnet-general-use")
out = np.zeros(f.shape[:3], np.uint8)
for i in range(len(f)):
    out[i] = np.asarray(remove(cv2.cvtColor(np.ascontiguousarray(f[i]), cv2.COLOR_BGR2RGB), session=s, only_mask=True))
    if i % 20 == 0: print(i, flush=True)
np.save(f"{root}/analysis/masks.npy", out)
print("ok", out.shape)
