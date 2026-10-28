# Recorte da pessoa em todos os quadros com o modelo isnet-general-use (rembg) -> analysis/masks.npy (uint8 0-255)
import sys
import numpy as np, cv2
from rembg import new_session, remove
root = sys.argv[1]
f = np.load(f"{root}/analysis/frames.npy", mmap_mode="r")
s = new_session("isnet-general-use")
import os
part = f"{root}/analysis/masks_part.npy"
out = np.load(part) if os.path.exists(part) else np.zeros(f.shape[:3], np.uint8)
done = int((out.reshape(len(f), -1).max(1) > 0).sum())   # continua de onde parou
for i in range(done, len(f)):
    out[i] = np.asarray(remove(cv2.cvtColor(np.ascontiguousarray(f[i]), cv2.COLOR_BGR2RGB), session=s, only_mask=True))
    if i % 10 == 0: print(i, flush=True); np.save(part, out)
np.save(f"{root}/analysis/masks.npy", out)
print("ok", out.shape)
