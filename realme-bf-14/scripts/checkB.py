import sys, numpy as np, cv2
F = np.load("analysis/framesB.npy", mmap_mode="r"); L = {int(r[0]): r[1:3] for r in np.load("analysis/lensB.npy")}
POLY = np.float32([(-152, -23), (92, 27), (88, 77), (-152, -12)])
ims = []
for i in map(int, sys.argv[1].split(",")):
    im = np.ascontiguousarray(F[i - 100][300:750]).copy()
    p = (POLY + L[i] - [0, 300]).astype(np.int32); cv2.polylines(im, [p], True, (0, 0, 255), 2)
    cv2.rectangle(im, (int(L[i][0]), int(L[i][1]) - 300), (int(L[i][0]) + 100, int(L[i][1]) - 230), (0, 255, 0), 2)
    ims.append(cv2.putText(cv2.resize(im, (360, 150)), str(i), (5, 20), 0, 0.6, (0, 255, 255), 2))
cv2.imwrite("analysis/checkB.jpg", np.vstack([np.hstack(ims[k:k + 4]) for k in range(0, len(ims), 4)]))
