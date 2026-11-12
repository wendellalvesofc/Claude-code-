"""Sound for HYPE CASH Motion 03 (post-launch version with price) (non-gamers, editorial). The ElevenLabs narration is the spine: used untouched.

music.wav  original bed synthesised here, 90 BPM in D minor (Dm-Bb-F-C): soft felt-piano plucks, warm pad and a
           quiet shaker; a soft kick enters on "Hype Cash", the bed thins on "Sem promessa" and resolves on the end.
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
rng = np.random.default_rng(96)

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

BEAT = 60 / 90; BAR = 4 * BEAT
OPEN, THIN, BACK, END = E["hypecash"], E["sem"] - .1, E["direcao"], E["cash_end"] - .6
CH = [[-7, -4, 0], [-11, -7, -4], [-16, -12, -9], [-9, -5, -2]]; RT = [-31, -35, -28, -33]
pad = np.zeros(N); pl = np.zeros(N); dr = np.zeros(N); sub = np.zeros(N)
off = OPEN % BEAT
for bi, b0 in enumerate(np.arange(off - BAR, DUR, BAR)):
    ci = bi % 4; n = int((BAR + .4) * SR); tt = np.arange(n) / SR
    add(pad, sum(tri(hz(s), n, (-.003, .003)) for s in CH[ci]) / 3 * np.minimum(1, tt / .5) * np.minimum(1, (BAR + .4 - tt) / .4), b0)
    add(sub, .5 * np.sin(2 * np.pi * hz(RT[ci]) * tt) * np.minimum(1, tt / .2) * np.minimum(1, (BAR + .4 - tt) / .3), b0)
    for k in range(8):
        at = b0 + k * BEAT / 2
        if THIN <= at < BACK or at >= END: continue
        if k % 2: continue                          # quarter notes: calmer than the gamer cut
        na = int(.9 * SR); s = CH[ci][(k // 2) % 3] + 12 + (12 if k % 4 == 2 else 0)
        g = .26 if at >= OPEN - .01 else .2
        tt2 = np.arange(na) / SR
        piano = sum(a * np.sin(2 * np.pi * hz(s) * h * tt2) * np.exp(-tt2 * (3 + 2.5 * h)) for h, a in ((1, 1), (2, .45), (3, .2), (4, .1)))
        add(pl, g * piano * np.minimum(1, tt2 / .004), at)
def hat(l=.035):
    n = int(l * SR); x = np.diff(rng.standard_normal(n + 1)); return x * np.exp(-np.arange(n) / SR / (l / 4)) * .2
def kick():
    n = int(.35 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(45 + 90 * np.exp(-t * 30)) / SR) * np.exp(-t * 10)
K = kick()
for i, bt in enumerate(np.arange(off, DUR, BEAT)):
    if THIN <= bt < BACK or bt >= END: continue
    # keep the brand name clear: no hats (their noise sits on the "sh" of "Cash") around both "Hype Cash"
    near_brand = any(abs(bt - w) < .9 for w in (E["hypecash"] + .3, E["cash_end"] + .3))
    if bt >= OPEN - .01 and i % 2 == 0: add(dr, .35 * K, bt)
    if not near_brand: add(dr, .08 * hat(.05), bt + BEAT / 2)
pad = lowpass(pad, np.where(t_all < OPEN, 700, np.where((t_all >= THIN) & (t_all < BACK), 600, 1500)))
sec = np.where((t_all >= THIN) & (t_all < BACK), .6, 1.0)
n = int((DUR - END) * SR); tt = np.arange(n) / SR
add(pad, 1.2 * lowpass(sum(tri(hz(s), n, (-.003, .003)) for s in CH[0] + [5]) / 4, 1600) * np.exp(-tt / 1.4), END)
mus = (.5 * pad + .4 * sub) * sec + pl + .7 * dr
mus *= np.clip(t_all / .3, 0, 1) * np.clip((DUR - t_all) / .5, 0, 1)
write(root / "audio/music.wav", np.tanh(1.2 * mus) / 1.2 * .8)

# graphic actions → sfx (file, time, gain dB, max length s)
EO = T["emphasis_prelaunch"]
CUES = (
    [("pop", 0.02, -18, .3), ("whoosh-short", EO["jogar"] - .06, -18, .35), ("whoosh-short", EO["gta"], -15, .35), ("glitch-3", EO["gta"] + .05, -22, .25),
     ("whoosh", EO["gta"] + .3, -16, .5), ("pop", EO["criar"], -17, .3), ("whoosh-short", EO["conteudo"] + .15, -19, .4),
     ("whoosh", 3.85, -13, .5), ("pop", EO["assunto"], -16, .3)] +
    [x for t in (EO["noticias"], EO["curiosidades"], EO["analises"]) for x in (("whoosh-short", t - .3, -19, .35), ("pop", t, -13, .3))] +
    [("key-press", EO["noticias"] + .2, -20, .3), ("ping", EO["curiosidades"] + .15, -19, .5), ("click-soft", EO["analises"] + .15, -16, .25),
     ("whoosh-cinematic", 9.15, -14, .5), ("impact-bass-1", EO["hypecash"] - .04, -15, .7), ("sparkle", EO["hypecash"] + .6, -21, .8),
     ("pop", EO["playbook"] - .05, -17, .3), ("whoosh", 11.55, -13, .5), ("whoosh-short", 12.6, -18, .3), ("whoosh-short", 13.25, -18, .3),
     ("whoosh", 13.92, -14, .4), ("whoosh-short", EO["conteudo2"] - .05, -18, .35), ("whoosh", 15.98, -14, .45),
     ("glitch-3", EO["facil"] + .2, -20, .25), ("pop", EO["com_dir"], -16, .3), ("click", EO["direcao"] + .6, -17, .3)]
)
# the cues above follow the pre-launch narration: move them onto the post-launch one through the same words
ANCH = [(0, 0), (EO["nao"], E["nao"]), (EO["precisa"], E["precisa"]), (EO["jogar"], E["jogar"]), (EO["gta"], E["gta"]), (EO["criar"], E["criar"]), (EO["conteudo"], E["conteudo"]), (EO["assunto"], E["assunto"]), (EO["estar"], E["estar"]), (EO["todo"], E["todo"]), (EO["lugar"], E["lugar"]), (EO["noticias"], E["noticias"]), (EO["curiosidades"], E["curiosidades"]), (EO["analises"], E["analises"]), (EO["hypecash"], E["hypecash"]), (EO["playbook"], E["playbook"]), (EO["interativo"], E["interativo"]), (EO["mostra"], E["mostra"]), (EO["missao"], E["missao"]), (EO["missao2"], E["missao2"]), (EO["comecar"], E["comecar"]), (EO["projeto"], E["projeto"]), (EO["conteudo2"], E["conteudo2"]), (EO["com"], E["com"]), (EO["tema"], E["tema"]), (EO["sem"], E["sem"]), (EO["facil"], E["facil"]), (EO["com_dir"], E["com_dir"]), (EO["direcao"], E["direcao"]), (18.85, 18.2)]
def remap(t):
    for (a0, b0), (a1, b1) in zip(ANCH, ANCH[1:]):
        if t <= a1: return b0 + (t - a0) * (b1 - b0) / (a1 - a0)
    return t + ANCH[-1][1] - ANCH[-1][0]
CUES = [(n, round(remap(c), 3), g, ml) for n, c, g, ml in CUES] + [
    ("whoosh-cinematic", 17.9, -15, .5), ("impact-bass-1", 18.2, -14, .7), ("impact-bass-2", E["reais"] + .02, -14, .5), ("sparkle", E["reais"] + .1, -20, .8),
    ("pop", E["garantia"] - .75, -17, .25), ("pop", E["toque"] - .03, -16, .3), ("click", E["botao"] + .1, -11, .3), ("sparkle", E["hoje"] + .15, -19, 1.0)]
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
