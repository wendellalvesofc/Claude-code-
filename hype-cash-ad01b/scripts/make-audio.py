"""Sound for HYPE CASH Filme 01 ("A Rota"). No voice-over: the music and the SFX carry the cut.

music.wav  original track synthesised here, 120 BPM in E minor (Em-C-G-D), arranged on beats.json:
           hook hit + tense pulse / scrolling 16ths under the feed / hard stop on "E se você criasse?" with a riser
           into the iris / groove on the map with a pluck on each waypoint / full chorus on the logo and the phone /
           filtered breakdown on "sem promessa" / back on "plano" / final chorus and ring-out on the CTA.
sfx.wav    Pixabay-licensed one-shots (audio/sfx, see CREDITS.md), each aligned on its own transient to the cue.
mix.wav    music + sfx, -14 LUFS / -1.5 dBTP.
"""
import json, subprocess, sys, wave
from pathlib import Path
import numpy as np

root = Path(sys.argv[1])
B = json.loads((root / "beats.json").read_text())
SR, DUR = 48000, B["duration"]
N = int(SR * DUR)
t_all = np.arange(N) / SR
rng = np.random.default_rng(2401)
BEAT = 60 / B["bpm"]; BAR = 4 * BEAT

def db(x): return 10 ** (x / 20)
def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
def write(path, x):
    if x.ndim == 1: x = np.stack([x, x], 1)
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
def add(buf, sig, at):
    i = int(round(at * SR))
    if i < 0: sig, i = sig[-i:], 0
    m = min(len(sig), len(buf) - i)
    if m > 0: buf[i:i + m] += sig[:m]
def hz(semi): return 440.0 * 2 ** (semi / 12)
def env(n, a=.004, d=.3):
    t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def saw(f, n, det=(0.0,)):
    t = np.arange(n) / SR; return sum(2 * ((f * (1 + d) * t) % 1) - 1 for d in det) / len(det)
def lowpass(x, fc):
    a = np.exp(-2 * np.pi * np.broadcast_to(np.asarray(fc, float), x.shape) / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc; y[i] = acc
    return y

# sections
TURN, MAP, DEST, HON, PLAN, CTA, FEED = B["turn"], B["map"] - .2, B["dest"], B["honest"], B["plan"], B["cta"], B["feed"]
def in_(t, a, b): return a <= t < b
CHORDS = [[-5, -2, 2], [-9, -5, -2], [-14, -10, -7], [-7, -3, 0]]      # Em, C, G, D
ROOTS = [-29, -33, -26, -31]                                           # E2, C2, G2, D2

pad = np.zeros(N); bass = np.zeros(N); arp = np.zeros(N); drums = np.zeros(N); sub = np.zeros(N)
for bi, b0 in enumerate(np.arange(0, DUR, BAR)):
    ci = bi % 4
    n = int((BAR + .3) * SR); tt = np.arange(n) / SR
    ch = sum(saw(hz(s), n, (-.004, 0, .004)) for s in CHORDS[ci]) / 3
    add(pad, ch * np.minimum(1, tt / .3) * np.minimum(1, (BAR + .3 - tt) / .3), b0)
    for k in range(8):
        at = b0 + k * BEAT / 2
        if in_(at, TURN, MAP) or in_(at, HON, PLAN) or at >= 23.5: continue
        nb = int(.24 * SR)
        add(bass, .7 * saw(hz(ROOTS[ci] + (12 if k % 4 == 3 else 0)), nb) * env(nb, .003, .1), at)
    for k in range(16):
        at = b0 + k * BEAT / 4
        full = in_(at, MAP, HON) or in_(at, PLAN, 23.5)
        feed = in_(at, FEED, TURN)
        if not (full or feed): continue
        semi = CHORDS[ci][k % 3] + 24 + (12 if feed and k % 2 else 0)
        na = int(.14 * SR)
        add(arp, (.16 if feed else .2) * np.sin(2 * np.pi * hz(semi) * np.arange(na) / SR) * env(na, .002, .05), at)

fc = np.where(t_all < MAP, 900.0, 2800.0)
fc = np.where((t_all >= TURN) & (t_all < MAP), 500, fc)
fc = np.where((t_all >= HON) & (t_all < PLAN), 550, fc)
pad = lowpass(pad, fc)
bass = lowpass(bass, np.where(t_all < MAP, 420, 1000))

def kick():
    n = int(.45 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(42 + 125 * np.exp(-t * 28)) / SR) * np.exp(-t * 8)
def hat(l=.045):
    n = int(l * SR); x = np.diff(rng.standard_normal(n + 1)); return x * np.exp(-np.arange(n) / SR / (l / 4)) * .22
def snare():
    n = int(.35 * SR); t = np.arange(n) / SR
    return (.5 * np.convolve(rng.standard_normal(n), np.ones(4) / 4, "same") * np.exp(-t / .09) + .5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t / .05)) * .55
K, S_ = kick(), snare()
for i, bt in enumerate(np.arange(0, DUR, BEAT)):
    full = in_(bt, MAP, HON) or in_(bt, PLAN, 23.5)
    if full:
        add(drums, .9 * K, bt)
        if i % 2 == 1: add(drums, S_, bt)
        add(drums, .45 * hat(), bt + BEAT / 2)
    elif in_(bt, FEED, TURN):                       # the feed: kick on 1 and 3, 16th hats like scrolling
        if i % 2 == 0: add(drums, .7 * K, bt)
        for q in range(4): add(drums, .28 * hat(.03), bt + q * BEAT / 4)
    elif bt < FEED:                                 # hook: heartbeat
        if i % 2 == 0: add(drums, .6 * K, bt)

sub += .3 * np.sin(2 * np.pi * hz(-29) * t_all) * (t_all < FEED) * np.clip(t_all / .05, 0, 1)
n = int((DUR - 23.5) * SR); tt = np.arange(n) / SR
add(pad, 1.4 * lowpass(sum(saw(hz(s), n, (-.004, .004)) for s in CHORDS[0] + [7]) / 4, 1800) * np.exp(-tt / 1.2), 23.5)
add(sub, .4 * np.sin(2 * np.pi * hz(-29) * tt) * np.exp(-tt / .9), 23.5)

mus = .45 * pad + .55 * bass + arp + .8 * drums + sub
mus *= np.where((t_all >= TURN) & (t_all < TURN + .02), 0, 1)
mus *= np.clip(t_all / .01, 0, 1) * np.clip((DUR - t_all) / .4, 0, 1)
mus = np.tanh(1.25 * mus) / 1.25
write(root / "audio/music.wav", mus * .8)

# ---------------- sfx cues (file, time, gain dB, max length s)
CUES = (
    [("impact-bass-1", B["hook_slam"], -2, 1.6), ("whoosh-short", B["hook_top"], -18, .4)] +
    [("pop", .08 + i * .05, -21, .3) for i in range(12)] +
    [("click-soft", B["hook_sub"] + i * .12, -14, .25) for i in range(4)] +
    [("whoosh", FEED, -10, .6), ("pop", B["feed_w"][0], -15, .3), ("impact-bass-2", B["feed_w"][1], -14, .6),
     ("click", B["feed_w"][2] + .12, -10, .3),
     ("glitch-1", TURN, -16, .2), ("impact-bass-2", B["turn_b"], -8, .7), ("ping", B["turn_b"] + .1, -16, .6),
     ("riser", B["iris"] + .45, -9, 1.0), ("whoosh-cinematic", B["iris"] + .3, -10, .8),
     ("impact-bass-1", MAP + .2, -6, 1.0), ("whoosh-short", B["map_t1"], -18, .4), ("whoosh-short", B["map_t2"], -18, .4),
     ("pop", B["pin"] + .25, -9, .4), ("whoosh", B["route"] - .15, -14, .6)] +
    [("click", t, -10, .3) for t in B["wp"]] + [("pop", t + .02, -16, .3) for t in B["wp"]] +
    [("impact-bass-1", DEST, -3, 1.4), ("sparkle", B["logo"] + .1, -11, 1.3), ("whoosh-short", B["logo_sub"], -18, .4),
     ("whoosh", B["phone_in"], -9, .6)] +
    [("click-soft", t, -8, .25) for t in B["ticks"]] +
    [("pop", t, -14, .3) for t in B["chips"]] +
    [("whoosh-short", B["nav"] + .05, -14, .4), ("chime", B["nav"] + .35, -14, 1.4),
     ("whoosh", B["phone_out"] + .15, -9, .6),
     ("whoosh-short", HON + .1, -15, .4), ("glitch-3", B["strike"], -12, .45),
     ("whoosh", PLAN - .1, -11, .6), ("impact-bass-2", PLAN + .12, -9, .8),
     ("impact-bass-1", CTA, -4, 1.4), ("sparkle", B["cta_logo"] + .15, -12, 1.2),
     ("pop", B["cta_btn"], -11, .35), ("click", B["tap"], -6, .3)]
)
def onset(x, kind):
    a = np.abs(x).max(1); sm = np.convolve(a, np.ones(240) / 240, "same")
    return int(np.argmax(sm)) if kind.startswith(("whoosh", "riser")) else int(np.argmax(sm >= .5 * sm.max()))
sfx = np.zeros((N, 2)); cache, log = {}, []
for name, cue, gain, maxlen in CUES:
    if name not in cache: cache[name] = load(root / f"audio/sfx/{name}.mp3")
    x = cache[name]; o = onset(x, name)
    if name == "riser":
        start = max(0, o - int(maxlen * SR)); seg = x[start:o + int(.05 * SR)]; o = len(seg) - int(.05 * SR)
    else: seg = x[:o + int(maxlen * SR)]
    fade = np.ones(len(seg)); fl = min(len(seg), int(.05 * SR)); fade[-fl:] = np.linspace(1, 0, fl)
    add(sfx, seg * fade[:, None] * db(gain), cue - o / SR)
    log.append({"sfx": name, "cue_s": round(cue, 3), "gain_db": gain})
sfx *= .5 / max(1e-9, np.abs(sfx).max())
write(root / "audio/sfx.wav", sfx)
(root / "audio/sfx-cues.json").write_text(json.dumps(log, ensure_ascii=False, indent=1))

def lufs(p):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(p), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(out.rsplit("I:", 1)[1].split("LUFS")[0])
lm, ls = lufs(root / "audio/music.wav"), lufs(root / "audio/sfx.wav")
gs = db(lm - 5 - ls)          # SFX sit 5 dB under the music (integrated); hits still poke through on transients
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(root / "audio/music.wav"), "-i", str(root / "audio/sfx.wav"),
    "-filter_complex", f"[1:a]volume={gs:.4f}[fx];[0:a][fx]amix=inputs=2:normalize=0:duration=first,volume=0.6,"
    f"loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.84:level=false:latency=true,atrim=0:{DUR}[out]",
    "-map", "[out]", "-ar", str(SR), "-c:a", "pcm_s16le", str(root / "audio/mix.wav")], check=True)
print(f"music {lm:.1f} LUFS, sfx {ls:.1f} -> x{gs:.3f}; {len(CUES)} cues; mix.wav written")
