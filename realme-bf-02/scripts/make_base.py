# Corta o vídeo original nos trechos de fala (scripts/cuts.json) -> motion/src/base.mp4 (1080x1920, 30 fps, sem áudio)
# e a voz com os mesmos limites -> audio/voice_cut.wav (48 kHz). Cor natural de celular, só um toque de contraste.
import json, subprocess, sys
root = sys.argv[1]; c = json.load(open(f"{root}/scripts/cuts.json")); fps = c["fps"]
src = f"{root}/source/video02.mov"
segs = [(round(a * fps) / fps, round(b * fps) / fps) for a, b in c["segments"]]
v, a = [], []
for i, (s, e) in enumerate(segs):
    v.append(f"[0:v]trim=start={s}:end={e},setpts=PTS-STARTPTS,fps={fps}[v{i}]")
    a.append(f"[0:a]atrim=start={s}:end={e},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={e-s-0.012}:d=0.012[a{i}]")
n = len(segs)
fc = ";".join(v + a) + ";" + "".join(f"[v{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0,eq=contrast=1.03:saturation=1.05,format=yuv420p[vo];" + "".join(f"[a{i}]" for i in range(n)) + f"concat=n={n}:v=0:a=1,aresample=48000[ao]"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-filter_complex", fc, "-map", "[vo]", "-c:v", "libx264", "-crf", "14", "-preset", "medium", "-an", f"{root}/audio/base.mp4",
                "-map", "[ao]", "-ac", "2", f"{root}/audio/voice_cut.wav"], check=True)
out = 0; m = []
for s, e in segs: m.append({"src": [s, e], "out": round(out, 4)}); out += e - s
json.dump({"segments": m, "total": round(out, 4)}, open(f"{root}/scripts/timeline.json", "w"), indent=1)
print("total", round(out, 3)); [print(x) for x in m]
