"""Sound for HYPE CASH Motion 01 F ("Alto Impacto"). The ElevenLabs narration is the spine: used untouched (no trim, no speed change).

music.wav  original bed synthesised here, 120 BPM in A minor (Am-F-C-G): kinetic-edit pulse, half-time until
           "Hype Cash", full groove from there, thinning on "Sem promessa" and resolving under the CTA.
sfx.wav    Pixabay-licensed one-shots (audio/sfx, see CREDITS.md) on the graphic actions, each aligned on its transient.
mix.wav    voice + music ducked under the voice (sidechain) + sfx; -14 LUFS / -1.5 dBTP.
"""
import json, subprocess, sys, wave
from pathlib import Path
import numpy as np

root = Path(sys.argv[1])
T = json.loads((root / "timing.json").read_text()); E = T["emphasis"]
SR, DUR = 48000, T["video_duration_s"]
N = int(SR * DUR); t_all = np.arange(N) / SR
rng = np.random.default_rng(120)

def db(x): return 10 ** (x / 20)
def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
def write(p, x):
    if x.ndim == 1: x = np.stack([x, x], 1)
    with wave.open(str(p), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())
def add(buf, sig, at):
    i = int(round(at * SR))
    if i < 0: sig, i = sig[-i:], 0
    m = min(len(sig), len(buf) - i)
    if m > 0: buf[i:i + m] += sig[:m]
def hz(s): return 440 * 2 ** (s / 12)
def env(n, a=.004, d=.3):
    t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def tri(f, n, det=(0.0,)):
    t = np.arange(n) / SR; return sum(2 * np.abs(2 * ((f * (1 + d) * t) % 1) - 1) - 1 for d in det) / len(det)
def lowpass(x, fc):
    a = np.exp(-2 * np.pi * np.broadcast_to(np.asarray(fc, float), x.shape) / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc; y[i] = acc
    return y

BEAT = 60 / 120; BAR = 4 * BEAT
OPEN, THIN, BACK, END = E["hypecash"], E["sem2"] - .1, E["so2"], E["toque"] - .3
CH = [[0, 3, 7], [-4, 0, 3], [-9, -5, -2], [-2, 2, 5]]; RT = [-24, -28, -33, -26]
pad = np.zeros(N); pl = np.zeros(N); dr = np.zeros(N); sub = np.zeros(N)
off = OPEN % BEAT
for bi, b0 in enumerate(np.arange(off - BAR, DUR, BAR)):
    ci = bi % 4; n = int((BAR + .4) * SR); tt = np.arange(n) / SR
    add(pad, sum(tri(hz(s), n, (-.003, .003)) for s in CH[ci]) / 3 * np.minimum(1, tt / .5) * np.minimum(1, (BAR + .4 - tt) / .4), b0)
    add(sub, .5 * np.sin(2 * np.pi * hz(RT[ci]) * tt) * np.minimum(1, tt / .2) * np.minimum(1, (BAR + .4 - tt) / .3), b0)
    for k in range(8):
        at = b0 + k * BEAT / 2
        if THIN <= at < BACK or at >= END: continue
        na = int(.16 * SR); s = CH[ci][(k * 2) % 3] + 24
        g = .22 if at >= OPEN - .01 else .14
        sq = np.sign(np.sin(2 * np.pi * hz(s) * np.arange(na) / SR)) * .35 + np.sin(2 * np.pi * hz(s) * np.arange(na) / SR) * .65
        add(pl, g * sq * env(na, .002, .07), at)
def hat(l=.035):
    n = int(l * SR); x = np.diff(rng.standard_normal(n + 1)); return x * np.exp(-np.arange(n) / SR / (l / 4)) * .2
def kick():
    n = int(.35 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(45 + 90 * np.exp(-t * 30)) / SR) * np.exp(-t * 10)
K = kick()
for i, bt in enumerate(np.arange(off, DUR, BEAT)):
    if THIN <= bt < BACK or bt >= END: continue
    # keep the brand name clear: no hats (their noise sits on the "sh" of "Cash") around both "Hype Cash"
    near_brand = any(abs(bt - w) < .9 for w in (E["hypecash"] + .3,))
    if bt >= OPEN - .01:
        add(dr, .6 * K, bt)
        if not near_brand: add(dr, .16 * hat(), bt + BEAT / 2)
    else:
        if i % 2 == 0: add(dr, .45 * K, bt)
        add(dr, .12 * hat(.025), bt + BEAT / 2)
pad = lowpass(pad, np.where(t_all < OPEN, 700, np.where((t_all >= THIN) & (t_all < BACK), 600, 1500)))
sec = np.where((t_all >= THIN) & (t_all < BACK), .6, 1.0)
n = int((DUR - END) * SR); tt = np.arange(n) / SR
add(pad, 1.2 * lowpass(sum(tri(hz(s), n, (-.003, .003)) for s in CH[0] + [5]) / 4, 1600) * np.exp(-tt / 1.4), END)
mus = (.5 * pad + .4 * sub) * sec + pl + .7 * dr
mus *= np.clip(t_all / .3, 0, 1) * np.clip((DUR - t_all) / .5, 0, 1)
write(root / "audio/music.wav", np.tanh(1.2 * mus) / 1.2 * .8)

# graphic actions → sfx (file, time, gain dB, max length s)
CUES = (
    [("impact-bass-1", 0.0, -12, .7), ("whoosh", 0.02, -16, .5), ("riser", 0.1, -24, 1.1),
     ("pop", E["parar"], -13, .3), ("impact-bass-2", E["parar"] + .02, -13, .5), ("glitch-3", E["parar"] + .05, -20, .25),
     ("whoosh", 1.6, -13, .4), ("pop", 1.68, -15, .3), ("impact-bass-1", E["gta"] - .04, -12, .7),
     ("whoosh", 3.23, -13, .4), ("impact-bass-2", E["milhoes"] - .05, -14, .4), ("pop", E["milhoes"] + .2, -18, .25), ("pop", E["milhoes"] + .35, -18, .25)] +
    [x for t in (E["video"], E["noticia"], E["teoria"]) for x in (("whoosh-short", t - .1, -18, .3), ("pop", t, -16, .25))] +
    [("whoosh", 6.4, -12, .4), ("impact-bass-1", E["e"] - .02, -12, .6),
     ("whoosh-short", 7.2, -16, .35), ("pop", 7.27, -17, .25), ("click", E["quem"] + .05, -10, .25), ("ping", E["quem"] + .12, -17, .5),
     ("whoosh", 10.63, -13, .4), ("impact-bass-2", E["nao1"] - .04, -14, .4)] +
    [x for t in (E["celular"], E["edicao"], E["tempo"]) for x in (("click", t - .14, -15, .2), ("glitch-3", t + .38, -19, .2))] +
    [("whoosh", 14.6, -13, .4)] + [("pop", 14.7 + i * .12, -19, .25) for i in range(4)] +
    [("whoosh-cinematic", 16.75, -14, .5), ("impact-bass-1", E["hypecash"] - .06, -12, .8), ("sparkle", E["hypecash"] + .4, -20, .9),
     ("whoosh", 20.33, -13, .4)] +
    [("click-soft", E["checklist"] + d, -13, .2) for d in (.05, .17, .29, .41)] +
    [("pop", E["checklist"] - .05, -16, .25), ("pop", E["progresso"] - .05, -16, .25), ("pop", E["ferramentas"] - .05, -16, .25),
     ("whoosh", 24.43, -13, .4), ("whoosh-short", E["enrolacao"] + .35, -14, .35),
     ("whoosh", 25.53, -13, .4), ("pop", E["dinheiro"] - .1, -16, .3), ("impact-bass-2", E["facil"] + .1, -13, .4), ("glitch-3", E["facil"] + .14, -18, .25),
     ("whoosh", 27.3, -13, .4)] + [("whoosh-short", 27.5 + i * .13, -19, .25) for i in range(3)] +
    [("whoosh", 28.44, -13, .4), ("whoosh-short", E["chega"] + .1, -16, .35), ("impact-bass-1", E["d19"] - .03, -12, .8),
     ("whoosh-cinematic", 31.4, -15, .45), ("pop", E["toque"] - .02, -14, .3), ("click", E["saiba"] + .08, -10, .3),
     ("whoosh", E["saiba"] + .14, -14, .4), ("impact-bass-1", E["comece"] - .25, -14, .7), ("sparkle", E["hoje"] + .2, -18, 1.1)]
)
def onset(x, kind):
    a = np.abs(x).max(1); sm = np.convolve(a, np.ones(240) / 240, "same")
    return int(np.argmax(sm)) if kind.startswith(("whoosh", "riser")) else int(np.argmax(sm >= .5 * sm.max()))
sfx = np.zeros((N, 2)); cache, log = {}, []
for name, cue, gain, ml in CUES:
    if name not in cache: cache[name] = load(root / f"audio/sfx/{name}.mp3")
    x = cache[name]; o = onset(x, name); seg = x[:o + int(ml * SR)]
    fade = np.ones(len(seg)); fl = min(len(seg), int(.05 * SR)); fade[-fl:] = np.linspace(1, 0, fl)
    add(sfx, seg * fade[:, None] * db(gain), cue - o / SR); log.append({"sfx": name, "cue_s": round(cue, 3), "gain_db": gain})
sfx *= .5 / max(1e-9, np.abs(sfx).max())
write(root / "audio/sfx.wav", sfx)
(root / "audio/sfx-cues.json").write_text(json.dumps(log, ensure_ascii=False, indent=1))

def lufs(p):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(p), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(out.rsplit("I:", 1)[1].split("LUFS")[0])
lv, lm, ls = lufs(root / T["audio"]["file"]), lufs(root / "audio/music.wav"), lufs(root / "audio/sfx.wav")
gm, gs = db(lv - 14 - lm), db(lv - 10 - ls)      # bed 14 dB and sfx 10 dB under the voice before ducking
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(root / T["audio"]["file"]), "-i", str(root / "audio/music.wav"), "-i", str(root / "audio/sfx.wav"),
    "-filter_complex",
    f"[0:a]aresample={SR},pan=stereo|c0=c0|c1=c0,apad=whole_dur={DUR},asplit=2[v][sc];"
    f"[1:a]volume={gm:.4f}[m];[m][sc]sidechaincompress=threshold=0.02:ratio=5:attack=15:release=300[md];"
    f"[2:a]volume={gs:.4f}[fx];"
    f"[v][md][fx]amix=inputs=3:normalize=0:duration=first,volume=0.5,loudnorm=I=-14:TP=-1.5:LRA=14,alimiter=limit=0.84:level=false:latency=true,atrim=0:{DUR}[out]",
    "-map", "[out]", "-ar", str(SR), "-c:a", "pcm_s16le", str(root / "audio/mix.wav")], check=True)
print(f"voice {lv:.1f}, music {lm:.1f}->x{gm:.3f}, sfx {ls:.1f}->x{gs:.3f}; {len(CUES)} cues")
