"""Sound for the HYPE CASH v2 ad.

music.wav  original electronic track synthesised here (120 BPM, A minor), with sections that follow the
           storyboard: intro / pulse / drop on the logo reveal / breakdown on "não é promessa" / return / final chord.
sfx.wav    Pixabay-licensed one-shots (audio/sfx, see CREDITS.md) placed on the visual cues below; each file is
           aligned on its own transient, so the hit lands on the cue rather than the file start.
mix.wav    narration (untouched in time) + music ducked under the voice + sfx, -14 LUFS / -1 dBTP.
"""
import json, subprocess, sys, wave
from pathlib import Path
import numpy as np

root = Path(sys.argv[1])
T = json.loads((root / "timing.json").read_text())
E = T["emphasis"]
SR, DUR = 48000, T["video_duration_s"]
N = int(SR * DUR)
rng = np.random.default_rng(2026)

def db(x): return 10 ** (x / 20)

def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()

def write(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

def add(buf, sig, at):
    i = int(round(at * SR))
    if i < 0: sig, i = sig[-i:], 0
    m = min(len(sig), len(buf) - i)
    if m > 0: buf[i:i + m] += sig[:m]

# ------------------------------------------------------------------ music
BEAT = 0.5                      # 120 BPM
OFF = E["hypecash"] % BEAT      # grid aligned so the drop lands exactly on "Hype Cash"
DROP, BREAK, BACK, END = E["hypecash"], T["scenes"][5]["start"], E["plano"], E["cash_end"]
A = 440.0
def hz(semi): return A * 2 ** (semi / 12)          # semitones from A4
CHORDS = [[-12, -9, -5], [-16, -12, -9], [-21, -17, -14], [-14, -10, -7]]  # Am, F, C, G (2 s each)
ROOTS = [-36, -40, -33, -38]                      # A1, F1, C2, G1

def env(n, a=0.005, d=0.3):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)

def tone(f, n, harm=(1, .5, .25), detune=0.0):
    t = np.arange(n) / SR
    return sum(h * np.sin(2 * np.pi * f * (k + 1) * (1 + detune) * t) for k, h in enumerate(harm))

music = np.zeros(N)
pad_bus = np.zeros(N)
bars = np.arange(OFF - 2 * 2, DUR, 2.0)
for bi, b0 in enumerate(bars):
    ci = bi % 4
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    chord = sum(tone(hz(s), n, (1, .35, .12), d) for s in CHORDS[ci] for d in (-.003, .003)) / 6
    add(pad_bus, chord * np.minimum(1, t / .5) * np.minimum(1, (2.2 - t) / .4), b0)
    # bass: 8th-note pulse from 2.48, sustained sub before that
    for k in range(4 * 2):
        at = b0 + k * BEAT / 2
        if at < 2.4 or BREAK <= at < BACK or at >= END: continue
        nb = int(.24 * SR)
        add(music, .55 * tone(hz(ROOTS[ci]), nb, (1, .45, .2)) * env(nb, .004, .12), at)
    # arp: 16ths through the chord, only in the full sections
    for k in range(16):
        at = b0 + k * BEAT / 4
        if not (DROP <= at < BREAK or BACK <= at < END): continue
        semi = CHORDS[ci][k % 3] + 12 * (1 + (k // 3) % 2)
        na = int(.18 * SR)
        add(music, .16 * tone(hz(semi), na, (1, .3, .15, .08)) * env(na, .002, .07), at)

sub = np.zeros(N)
t_all = np.arange(N) / SR
sub_env = np.clip(t_all / 0.3, 0, 1) * np.clip((2.5 - t_all) / 0.3, 0, 1)
sub += .35 * np.sin(2 * np.pi * 55 * t_all) * sub_env      # drone under the hook

def kick():
    n = int(.4 * SR); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
def hat(len_s=.05):
    n = int(len_s * SR); x = np.diff(rng.standard_normal(n + 1)); return x * np.exp(-np.arange(n) / SR / (len_s / 4)) * .25
def clap():
    n = int(.2 * SR); x = np.convolve(np.diff(rng.standard_normal(n + 1)), np.ones(6) / 6, "same")
    return x * np.exp(-np.arange(n) / SR / .05) * .5

drums = np.zeros(N)
K, C = kick(), clap()
beats = np.arange(OFF, DUR, BEAT)
for bt in beats:
    full = DROP - 0.01 <= bt < BREAK or BACK - 0.01 <= bt < END
    pulse = 2.48 <= bt < DROP
    if full:
        add(drums, .9 * K, bt)
        if round((bt - OFF) / BEAT) % 2 == 1: add(drums, .55 * C, bt)
    if full or pulse:
        add(drums, (.5 if full else .28) * hat(), bt + BEAT / 2)
        if full: add(drums, .22 * hat(.03), bt + BEAT / 4); add(drums, .22 * hat(.03), bt + 3 * BEAT / 4)

# final chord on the last "Cash" + decay to the end
n = int((DUR - END) * SR)
tt = np.arange(n) / SR
final = sum(tone(hz(s), n, (1, .4, .15)) for s in CHORDS[0] + [0]) / 4 * np.exp(-tt / 1.4)
add(pad_bus, 1.3 * final, END)
add(sub, .5 * np.sin(2 * np.pi * 55 * tt) * np.exp(-tt / 1.0), END)

# section dynamics: breakdown keeps only a quiet pad, the pulse section swells in
sec = np.ones(N)
sec[(t_all >= BREAK) & (t_all < BACK)] = 0.55
swell = np.clip((t_all - 2.48) / (DROP - 2.48), 0, 1)
pulse_gain = np.where((t_all >= 2.48) & (t_all < DROP), .5 + .5 * swell, 1)
mus = (.5 * pad_bus * sec + music * pulse_gain + .8 * drums + sub)
mus *= np.clip(t_all / .05, 0, 1) * np.clip((DUR - t_all) / .3, 0, 1)
mus = np.tanh(1.3 * mus) / 1.3
write(root / "audio/music.wav", np.stack([mus, mus], 1) * .8)

# ------------------------------------------------------------------ sfx cues  (file, cue time, gain dB, max length s)
S = T["scenes"]
steps = [E["formato"], E["constancia"], E["audiencia"], E["monetizacao"]]
checks = [E["checklist"] + .1 + i * .16 + .06 for i in range(4)]
crowd = sorted({E["galera"] - 2 / 30 + abs(i - 4) * .06 for i in range(9)})
CUES = (
    [("impact-bass-1", 0.0, -3, 2.0)] +
    [("pop", t, -17, .5) for t in (0.05, 0.26, 0.47, 0.68, 0.89, 1.10)] +
    [("glitch-1", E["gta"], -18, .3), ("impact-bass-2", E["gta"], -14, .7),
     ("whoosh", 2.42, -9, .6), ("click", 2.58, -9, .35),
     ("impact-bass-2", E["criar"], -12, .8)] +
    [("pop", t, -20, .4) for t in crowd[::2]] +
    [("riser", E["hypecash"] - .05, -8, 1.9),
     ("impact-bass-1", E["hypecash"], -5, 1.0), ("sparkle", E["hypecash"] + .3, -15, 1.2),
     ("click", E["playbook"] - .05, -11, .35),
     ("whoosh-short", S[3]["start"] - .05, -21, .6)] +
    [("click", t - .12, -10, .35) for t in steps] +
    [("whoosh-short", t - .1, -17, .6) for t in steps] +
    [("whoosh", S[4]["start"] - .1, -7, .6),
     ("pop", E["seis"], -9, .5), ("pop", E["bonus"], -9, .5),
     ("whoosh", E["central"] - .02, -15, .6)] +
    [("click-soft", t, -10, .35) for t in checks] +
    [("chime", E["progresso"] + .62, -12, 2.0),
     ("glitch-2", S[5]["start"], -12, .35), ("glitch-3", E["dinheiro"], -9, .6),
     ("impact-bass-2", E["plano"], -11, .8),
     ("whoosh", S[6]["start"] - .05, -9, .6), ("click", E["botao"], -7, .35),
     ("impact-bass-1", E["cash_end"], -4, 2.0), ("sparkle", E["cash_end"] + .05, -10, 1.6)]
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
    if name == "riser":                                   # use only the last part of the 10 s riser
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

# stem balance relative to the voice: music bed 12 dB under (before ducking), sfx 8 dB under (integrated)
lv, lm, ls = lufs(root / T["audio"]["file"]), lufs(root / "audio/music.wav"), lufs(root / "audio/sfx.wav")
gm, gs = db(lv - 12 - lm), db(lv - 8 - ls)
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
