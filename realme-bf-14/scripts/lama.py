import numpy as np, cv2, onnxruntime as ort
_s = None
def inpaint(img, mask, box):
    """img BGR uint8, mask uint8 0/255; box = (x0,y0,x1,y1) região enviada ao LaMa (redimensionada para 512)"""
    global _s
    if _s is None: _s = ort.InferenceSession(__file__.replace("scripts/lama.py", "models/lama.onnx"))
    x0, y0, x1, y1 = box
    c = img[y0:y1, x0:x1]; m = mask[y0:y1, x0:x1]
    ci = cv2.resize(c, (512, 512), interpolation=cv2.INTER_AREA)[..., ::-1].astype(np.float32) / 255
    mi = (cv2.resize(m, (512, 512), interpolation=cv2.INTER_NEAREST) > 127).astype(np.float32)
    out = _s.run(None, {"image": ci.transpose(2, 0, 1)[None], "mask": mi[None, None]})[0][0].transpose(1, 2, 0)
    if out.max() > 2: out = out / 255
    out = cv2.resize(np.clip(out, 0, 1)[..., ::-1] * 255, (x1 - x0, y1 - y0), interpolation=cv2.INTER_CUBIC)
    res = img.copy().astype(np.float32)
    mm = cv2.GaussianBlur(m.astype(np.float32) / 255, (0, 0), 2)[..., None]
    res[y0:y1, x0:x1] = res[y0:y1, x0:x1] * (1 - mm) + out * mm
    return np.clip(res, 0, 255).astype(np.uint8)
