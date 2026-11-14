# Detecta rostos (YuNet) em todos os quadros -> analysis/faces.json: lista de [x,y,w,h,score] por quadro
import json, subprocess, numpy as np, cv2
det = cv2.FaceDetectorYN.create("models/yunet.onnx", "", (540, 960), 0.5, 0.3, 50)
p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", "source/video15.mov", "-vf", "scale=540:960", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
out = []
while True:
    b = p.stdout.read(540 * 960 * 3)
    if len(b) < 540 * 960 * 3: break
    _, f = det.detect(np.frombuffer(b, np.uint8).reshape(960, 540, 3))
    out.append([] if f is None else [[round(float(v) * 2, 1) for v in r[:4]] + [round(float(r[14]), 2)] for r in f])
json.dump(out, open("analysis/faces.json", "w"))
print(len(out))
