"""Original sound bed (synthesised here, no third-party samples) + final mix.
Hits and whooshes sit on the scene cuts from timing.json; the bed is ducked under the voice."""
import json, subprocess, sys, wave
from pathlib import Path
import numpy as np

root = Path(sys.argv[1])
T = json.loads((root / "timing.json").read_text())
SR, DUR = 48000, T["video_duration_s"]
n = int(SR * DUR)
t = np.arange(n) / SR
rng = np.random.default_rng(1805)  # fixed seed: same file every run

def lowpass(x, fc):
    a = np.exp(-2 * np.pi * np.asarray(fc) / SR)
    y = np.empty_like(x); acc = 0.0
    a = np.broadcast_to(a, x.shape)
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y

def saw(f, ph=0.0):
    return 2 * ((t * f + ph) % 1) - 1

# pad: A minor add9, detuned saws, slow filter swell, fades
pad = sum(saw(f * d, rng.random()) for f in (110, 164.81, 220, 246.94, 261.63) for d in (0.997, 1.003))
pad = lowpass(pad / 10, 500 + 350 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 9)))
pad *= np.clip(t / 1.2, 0, 1) * np.clip((DUR - t) / 1.6, 0, 1)

# sub pulse on the ad's main beats (impacts), plus a soft kick
fx = np.zeros(n)
def hit(at, gain=1.0):
    i = int(at * SR); m = min(n - i, int(SR * 0.9))
    tt = np.arange(m) / SR
    f = 42 + 90 * np.exp(-tt * 28)
    fx[i:i + m] += gain * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 5.5)

def whoosh(end, length=0.45, gain=0.5):
    i0 = max(0, int((end - length) * SR)); m = int(length * SR)
    env = np.linspace(0, 1, m) ** 2.2
    nz = rng.standard_normal(m) * env
    fx[i0:i0 + m] += gain * lowpass(nz, 300 + 5000 * env)

E, S = T["emphasis"], {s["id"]: s for s in T["scenes"]}
for at, g in [(0.0, 1.0), (E["gta"], 1.0), (S["S2"]["start"], 0.6), (E["hypecash"], 1.0), (S["S4"]["start"], 0.5),
              (E["central"], 0.45), (S["S5"]["start"], 0.45), (S["S6"]["start"], 0.45), (S["S7"]["start"], 0.7), (E["entre"], 0.9)]:
    hit(at, g)
for cut in [S["S2"]["start"], E["central"], S["S5"]["start"], S["S6"]["start"], S["S7"]["start"]]:
    whoosh(cut)
whoosh(E["hypecash"], length=0.75, gain=0.7)  # riser into the logo

music = 0.55 * pad + 0.8 * fx
music = np.tanh(music * 1.2) / 1.2
stereo = np.stack([music, music], 1)
pcm = (np.clip(stereo, -1, 1) * 32767 * 0.7).astype("<i2")
with wave.open(str(root / "audio/music.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

# mix: narration untouched in time (only gain); bed ducked by the voice; loudness to -14 LUFS, -1 dBTP
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(root / T["audio"]["file"]), "-i", str(root / "audio/music.wav"),
    "-filter_complex",
    "[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,apad=whole_dur=%s,asplit=2[v][sc];"
    "[1:a]volume=0.38[m];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=280[md];"
    "[v][md]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1:LRA=11,atrim=0:%s[out]" % (DUR, DUR),
    "-map", "[out]", "-ar", "48000", "-c:a", "pcm_s16le", str(root / "audio/mix.wav")], check=True)
print("music.wav + mix.wav written")
