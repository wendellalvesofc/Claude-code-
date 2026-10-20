"""Sound for HYPE CASH AD 01.

music.wav  original synthwave track synthesised here (110 BPM, D minor: Dm-Bb-F-C). Sections follow the storyboard:
           tense pulse under the feed / filtered suspense on "E se..." / drop on "Hype Cash" / groove through the
           missions and features / breakdown on "Sem promessa" / return on "plano" / final chord on the last "Hype Cash".
sfx.wav    Pixabay-licensed one-shots (audio/sfx, see CREDITS.md) on the visual cues below; each file is aligned on its
           own transient (or peak, for whooshes/risers), so the hit lands on the cue rather than the file start.
mix.wav    narration (untouched in time) + music ducked under the voice + sfx, -14 LUFS / -1.5 dBTP.
"""
import json, subprocess, sys, wave
from pathlib import Path
import numpy as np

root = Path(sys.argv[1])
T = json.loads((root / "timing.json").read_text())
E = T["emphasis"]
SR, DUR = 48000, T["video_duration_s"]
N = int(SR * DUR)
rng = np.random.default_rng(1101)
t_all = np.arange(N) / SR

def db(x): return 10 ** (x / 20)

def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()

def write(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    if pcm.ndim == 1: pcm = np.stack([pcm, pcm], 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

def add(buf, sig, at):
    i = int(round(at * SR))
    if i < 0: sig, i = sig[-i:], 0
    m = min(len(sig), len(buf) - i)
    if m > 0: buf[i:i + m] += sig[:m]

# ------------------------------------------------------------------ music
BEAT = 60 / 110
DROP, SUS, BREAK, BACK, END = E["hypecash"], E["e_se"] - 0.15, T["scenes"][5]["start"], E["plano"], 27.56
OFF = DROP % BEAT                                   # grid aligned so the drop lands exactly on "Hype Cash"
BAR = 4 * BEAT
def hz(semi): return 440.0 * 2 ** (semi / 12)       # semitones from A4
CHORDS = [[-7, -4, 0], [-11, -7, -4], [-16, -12, -9], [-9, -5, -2]]   # Dm, Bb, F, C
ROOTS = [-31, -35, -28, -33]                          # D2, Bb1, F2, C2

def env(n, a=0.005, d=0.3):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)

def saw(f, n, det=(0.0,)):
    t = np.arange(n) / SR
    return sum(2 * ((f * (1 + d) * t) % 1) - 1 for d in det) / len(det)

def lowpass(x, fc):
    # one-pole, time-varying cutoff array allowed
    a = np.exp(-2 * np.pi * np.broadcast_to(fc, x.shape) / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc; y[i] = acc
    return y

pad = np.zeros(N); bass = np.zeros(N); arp = np.zeros(N)
bars = np.arange(OFF - 3 * BAR, DUR, BAR)
for bi, b0 in enumerate(bars):
    ci = bi % 4
    n = int((BAR + .3) * SR); tt = np.arange(n) / SR
    ch = sum(saw(hz(s), n, (-.004, .0, .004)) for s in CHORDS[ci]) / 3
    add(pad, ch * np.minimum(1, tt / .35) * np.minimum(1, (BAR + .3 - tt) / .3), b0)
    for k in range(8):                                # 8th-note bass
        at = b0 + k * BEAT / 2
        if at >= END or BREAK <= at < BACK: continue
        nb = int(.25 * SR)
        add(bass, .7 * saw(hz(ROOTS[ci] + (12 if k % 4 == 3 else 0)), nb) * env(nb, .003, .11), at)
    for k in range(16):                               # 16th-note pluck arp in the full sections
        at = b0 + k * BEAT / 4
        if not (DROP <= at < BREAK or BACK <= at < END): continue
        semi = CHORDS[ci][(k * 2) % 3] + 24 + (12 if k % 8 == 7 else 0)
        na = int(.16 * SR)
        add(arp, .22 * np.sin(2 * np.pi * hz(semi) * np.arange(na) / SR) * env(na, .002, .06), at)

# pad filter: closed in the hook, sweeps open through "E se..." into the drop, dips in the breakdown
fc = np.full(N, 900.0)
fc = np.where(t_all < SUS, 700, fc)
fc = np.where((t_all >= SUS) & (t_all < DROP), 500 + 3500 * ((t_all - SUS) / (DROP - SUS)) ** 2, fc)
fc = np.where(t_all >= DROP, 2600, fc)
fc = np.where((t_all >= BREAK) & (t_all < BACK), 600, fc)
pad = lowpass(pad, fc)
bass = lowpass(bass, np.where(t_all < DROP, 380, 900))

def kick():
    n = int(.45 * SR); t = np.arange(n) / SR
    f = 42 + 120 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)
def hat(len_s=.045):
    n = int(len_s * SR); x = np.diff(rng.standard_normal(n + 1)); return x * np.exp(-np.arange(n) / SR / (len_s / 4)) * .22
def snare():
    n = int(.35 * SR); t = np.arange(n) / SR
    noise = np.convolve(rng.standard_normal(n), np.ones(4) / 4, "same") * np.exp(-t / .09)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / .05)
    return (.5 * noise + .5 * body) * .55

drums = np.zeros(N)
K, S_ = kick(), snare()
for bt in np.arange(OFF, DUR, BEAT):
    i = round((bt - OFF) / BEAT)
    full = DROP - 0.01 <= bt < BREAK or BACK - 0.01 <= bt < END
    if full:
        add(drums, .9 * K, bt)
        if i % 2 == 1: add(drums, S_, bt)
        add(drums, .45 * hat(), bt + BEAT / 2)
    elif bt < SUS:                                    # hook: ticking hats like a scrolling feed
        add(drums, .3 * hat(.03), bt); add(drums, .3 * hat(.03), bt + BEAT / 2)

sub = .32 * np.sin(2 * np.pi * hz(-31) * t_all) * np.clip(t_all / .2, 0, 1) * np.clip((SUS + .4 - t_all) / .4, 0, 1)
# final chord on the last "Hype Cash", ringing out to the end
n = int((DUR - END) * SR); tt = np.arange(n) / SR
final = lowpass(sum(saw(hz(s), n, (-.004, .004)) for s in CHORDS[0] + [5]) / 4, 1800) * np.exp(-tt / 1.3)
add(pad, 1.4 * final, END)
add(sub, .45 * np.sin(2 * np.pi * hz(-31) * tt) * np.exp(-tt / .9), END)

sec = np.ones(N)
sec[(t_all >= BREAK) & (t_all < BACK)] = .5
pad_gain = np.where(t_all < DROP, .55, .42)
mus = pad_gain * pad * sec + .55 * bass + .9 * arp + .8 * drums + sub
mus *= np.clip(t_all / .03, 0, 1) * np.clip((DUR - t_all) / .3, 0, 1)
mus = np.tanh(1.25 * mus) / 1.25
write(root / "audio/music.wav", mus * .8)

# ------------------------------------------------------------------ sfx cues  (file, cue time, gain dB, max length s)
S = T["scenes"]
STEPS = [E["formato"] - .6, E["publicar"], E["construir"], E["entender"]]
TICKS = [19.80, 19.98, 20.16, 20.34]
P_M1, P_AFTER, P_TOOLS = 19.55, E["progresso"] - .05, E["central"] - .06
FLICKS = [0.45, 1.15, 1.85, 2.55, 3.12]
CUES = (
    [("impact-bass-1", 0.0, -4, 1.6)] +
    [("whoosh-short", t + .05, -24, .4) for t in FLICKS] +
    [("pop", E["centenas"], -14, .4), ("impact-bass-2", E["gta"], -12, .7), ("glitch-1", E["gta"], -21, .25),
     ("click-soft", 3.45, -14, .3),
     ("whoosh", E["deles"] + .2, -11, .6), ("notification", E["seus"], -13, .9), ("pop", E["seus"], -16, .4),
     ("riser", E["hypecash"] - .02, -9, 1.7), ("whoosh-cinematic", 6.42, -12, .8),
     ("impact-bass-1", E["hypecash"], -4, 1.2), ("sparkle", E["hypecash"] + .3, -16, 1.2),
     ("click", E["playbook"], -13, .3), ("impact-bass-2", E["projeto"], -15, .7),
     ("whoosh", 12.1, -13, .6)] +
    [("click", t, -11, .3) for t in STEPS] +
    [("whoosh-short", t + .05, -19, .5) for t in STEPS] +
    [("whoosh-short", P_M1 + .1, -15, .5)] +
    [("click-soft", t, -9, .3) for t in TICKS] +
    [("whoosh-short", P_AFTER + .1, -16, .5), ("chime", P_AFTER + .32, -15, 1.6),
     ("whoosh-short", P_TOOLS + .1, -16, .5),
     ("whoosh", 22.98, -17, .5), ("glitch-3", E["facil"], -13, .5),
     ("impact-bass-2", E["plano"], -11, .8),
     ("whoosh", 26.75, -10, .6), ("impact-bass-1", E["conheca"], -4, 1.6), ("sparkle", E["conheca"] + .1, -17, 1.2),
     ("pop", 27.2, -13, .4), ("click", 28.3, -8, .3)]
)

def onset(x, kind):
    a = np.abs(x).max(1)
    sm = np.convolve(a, np.ones(240) / 240, "same")
    if kind.startswith(("whoosh", "riser")):
        return int(np.argmax(sm))                         # whooshes/risers peak on the cue
    return int(np.argmax(sm >= .5 * sm.max()))            # hits: the attack lands on the cue

sfx = np.zeros((N, 2))
cache, log = {}, []
for name, cue, gain, maxlen in CUES:
    if name not in cache: cache[name] = load(root / f"audio/sfx/{name}.mp3")
    x = cache[name]
    o = onset(x, name)
    if name == "riser":                                   # only the last part of the riser, peaking on the cue
        start = max(0, o - int(maxlen * SR)); seg = x[start:o + int(.05 * SR)]; o = len(seg) - int(.05 * SR)
    else:
        seg = x[:o + int(maxlen * SR)]
    fade = np.ones(len(seg)); fl = min(len(seg), int(.06 * SR)); fade[-fl:] = np.linspace(1, 0, fl)
    add(sfx, seg * fade[:, None] * db(gain), cue - o / SR)
    log.append({"sfx": name, "cue_s": round(cue, 3), "gain_db": gain})
sfx *= 0.5 / max(1e-9, np.abs(sfx).max())   # headroom: stems are levelled by loudness in the mix below
write(root / "audio/sfx.wav", sfx)
(root / "audio/sfx-cues.json").write_text(json.dumps(log, ensure_ascii=False, indent=1))

# ------------------------------------------------------------------ mix
def lufs(path):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(out.rsplit("I:", 1)[1].split("LUFS")[0])

# stem balance relative to the voice: music bed 11 dB under (before ducking), sfx 8 dB under (integrated)
lv, lm, ls = lufs(root / T["audio"]["file"]), lufs(root / "audio/music.wav"), lufs(root / "audio/sfx.wav")
gm, gs = db(lv - 11 - lm), db(lv - 8 - ls)
subprocess.run(["ffmpeg", "-y", "-v", "error",
    "-i", str(root / T["audio"]["file"]), "-i", str(root / "audio/music.wav"), "-i", str(root / "audio/sfx.wav"),
    "-filter_complex",
    f"[0:a]aresample={SR},pan=stereo|c0=c0|c1=c0,apad=whole_dur={DUR},asplit=2[v][sc];"
    f"[1:a]volume={gm:.4f}[m];[m][sc]sidechaincompress=threshold=0.02:ratio=6:attack=12:release=260[md];"
    f"[2:a]volume={gs:.4f}[fx];"
    f"[v][md][fx]amix=inputs=3:normalize=0:duration=first,volume=0.5,loudnorm=I=-14:TP=-1.5:LRA=14,alimiter=limit=0.84:level=false:latency=true,atrim=0:{DUR}[out]",
    "-map", "[out]", "-ar", str(SR), "-c:a", "pcm_s16le", str(root / "audio/mix.wav")], check=True)
print(f"voice {lv:.1f} LUFS, music {lm:.1f}->x{gm:.3f}, sfx {ls:.1f}->x{gs:.3f}")
print(f"music.wav, sfx.wav ({len(CUES)} cues), mix.wav written")
