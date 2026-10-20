"""Voice intelligibility check: voice vs. bed (ducked music + sfx) per 250 ms window, full band and 300 Hz-4 kHz."""
import json, re, subprocess, sys
from pathlib import Path
import numpy as np
root = Path(sys.argv[1]); SR = 48000
T = json.loads((root / "timing.json").read_text()); DUR = T["video_duration_s"]
out = subprocess.run([sys.executable, "-I", str(root / "scripts/make-audio.py"), str(root)], capture_output=True, text=True, check=True).stdout
gm, gs = map(float, re.search(r"music .*?->x([0-9.]+), sfx .*?->x([0-9.]+)", out).groups())
def run(fc, label):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(root / T["audio"]["file"]), "-i", str(root / "audio/music.wav"), "-i", str(root / "audio/sfx.wav"),
        "-filter_complex", fc, "-map", f"[{label}]", "-f", "f32le", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)
base = f"[0:a]aresample={SR},pan=stereo|c0=c0|c1=c0,apad=whole_dur={DUR},asplit=2[sc][vo];[1:a]volume={gm}[m];[m][sc]sidechaincompress=threshold=0.02:ratio=6:attack=12:release=260[md];[2:a]volume={gs}[fx];[md][fx]amix=inputs=2:normalize=0,atrim=0:{DUR},pan=mono|c0=c0[bed];[vo]atrim=0:{DUR},pan=mono|c0=c0[vv]"
bed, voice = run(base + ";[vv]anullsink", "bed"), run(base + ";[bed]anullsink", "vv")
def band(x):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < 300) | (f > 4000)] = 0; return np.fft.irfft(X, len(x))
w = SR // 4
for name, (v, b) in {"full band": (voice, bed), "300 Hz-4 kHz": (band(voice), band(bed))}.items():
    rows = [(i / SR, 20 * np.log10(np.sqrt(np.mean(v[i:i + w] ** 2)) / (np.sqrt(np.mean(b[i:i + w] ** 2)) + 1e-9)))
            for i in range(0, len(voice) - w, w) if np.sqrt(np.mean(voice[i:i + w] ** 2)) > 0.02]
    s = np.array([r[1] for r in rows])
    print(f"{name:13s} voice over bed: median {np.median(s):5.1f} dB  p10 {np.percentile(s, 10):5.1f}  min {s.min():5.1f} at {rows[int(s.argmin())][0]:.2f}s")
