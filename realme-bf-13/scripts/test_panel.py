import sys; sys.path.insert(0, "scripts"); from direct import *
ims = [np.asarray(panel(t).resize((PW // 2, PH // 2)))[..., :3] for t in (0.4, 1.0, 1.7, 2.4, 3.3)]
Image.fromarray(np.hstack(ims)).save("analysis/panel_test.png")
