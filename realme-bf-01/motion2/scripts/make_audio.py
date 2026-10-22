# Trilha original, SFX procedurais e mix final (48 kHz estéreo).
# Uso: python3 scripts/make_audio.py <raiz do projeto>
import json, sys
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy import signal

root = sys.argv[1]
SR = 48000
TOTAL = json.load(open(f"{root}/timing.json"))["video_duration_s"]
N = int(round(TOTAL * SR))
rng = np.random.default_rng(7)

def db(x): return 10 ** (x / 20)
def t_(d): return np.arange(int(d * SR)) / SR
def env(n, a, r):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    return e * np.exp(-np.arange(n) / (r * SR))
def place(buf, x, at, gain=1.0):
    i = int(at * SR); j = min(len(buf), i + len(x))
    if j > i: buf[i:j] += x[: j - i] * gain
def bp(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, hi], "band", fs=SR, output="sos"), x)
def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, "low", fs=SR, output="sos"), x)
def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, "high", fs=SR, output="sos"), x)
def norm(x, peak=0.9): return x / (np.abs(x).max() + 1e-9) * peak

# ---------------- SFX ----------------
def whoosh(d=0.3, rev=False):
    n = int(d * SR); x = rng.standard_normal(n); out = np.zeros(n); blk = 480
    for k in range(0, n, blk):
        f = 200 * (6000 / 200) ** (k / n)
        out[k:k + blk] = bp(x[k:k + blk + 2000], f * 0.7, min(f * 1.4, 20000))[:len(out[k:k + blk])]
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    out = norm(out * e)
    return out[::-1] if rev else out

def pop():
    t = t_(0.09); f = 900 * np.exp(-t * 18)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.03))

def impact():
    t = t_(0.8); f = 70 * np.exp(-t * 3) + 38
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.28)
    crack = lp(rng.standard_normal(len(t)), 2500) * np.exp(-t / 0.04)
    return norm(body + 0.5 * crack)

def riser(d=1.4):
    t = t_(d); f = 120 * (3000 / 120) ** (t / d)
    tone = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * 0.25
    noise = hp(rng.standard_normal(len(t)), 2000) * 0.5
    return norm((tone + noise) * (t / d) ** 2.2)

def cash():
    # "cha-ching": sino metálico duplo + chocalho de moedas
    out = np.zeros(int(0.9 * SR))
    def bell(f0, dur):
        t = t_(dur); s = sum(a * np.sin(2 * np.pi * f0 * r * t) for r, a in [(1, 1), (2.76, .5), (5.4, .3), (8.9, .15)])
        return s * np.exp(-t / (dur / 4))
    place(out, bell(2100, 0.7), 0.0, 0.6)
    place(out, bell(2650, 0.8), 0.09, 0.8)
    for k in range(14):
        t = t_(0.03); place(out, hp(rng.standard_normal(len(t)), 5000) * np.exp(-t / 0.006), 0.02 + k * 0.022 + rng.uniform(0, .01), 0.35)
    return norm(out)

def tick():
    t = t_(0.03); return hp(rng.standard_normal(len(t)), 3000) * np.exp(-t / 0.004)
def ding():
    t = t_(0.6); return (np.sin(2*np.pi*1568*t) + 0.6*np.sin(2*np.pi*2093*t)) * np.exp(-t / 0.15)
def click():
    t = t_(0.04); return (hp(rng.standard_normal(len(t)), 1500) + np.sin(2*np.pi*2200*t)) * np.exp(-t / 0.006)

sfx = np.zeros(N)
# cortes: whoosh curto em cada troca de cena
for c in [1.94, 3.52, 6.55, 8.0, 10.0, 12.95, 14.5, 16.5, 20.7, 23.0, 23.8, 27.0]:
    place(sfx, whoosh(0.26), c - 0.16, db(-7))
place(sfx, impact(), 0.0, db(-10))                 # quadro 0
place(sfx, pop(), 0.72, db(-9)); place(sfx, pop(), 0.9, db(-10))   # "pudesse", calendário
for k in range(12): place(sfx, tick(), 2.0 + k * 0.125, db(-8 if k % 2 else -4))  # relógio
place(sfx, impact(), 3.26, db(-9))
place(sfx, impact(), 4.07, db(-10)); place(sfx, pop(), 4.86, db(-9))   # realme / check
place(sfx, impact(), 6.72, db(-6)); place(sfx, pop(), 7.3, db(-9)); place(sfx, pop(), 7.4, db(-11))  # pré-Black / fogo
place(sfx, pop(), 9.14, db(-9)); place(sfx, impact(), 9.38, db(-11))   # escudo / garantido
place(sfx, whoosh(0.3), 10.4, db(-9)); place(sfx, whoosh(0.3), 10.65, db(-9))  # cards
for k in range(30): place(sfx, tick(), 10.75 + k * 0.07, db(-16))      # preço embaralhando
place(sfx, impact(), 11.62, db(-9))
place(sfx, ding(), 13.64, db(-8))                  # notificação Pix
place(sfx, impact(), 13.98, db(-5)); place(sfx, cash(), 13.98, db(-3))
place(sfx, pop(), 15.0, db(-9))                    # pílula das datas
place(sfx, impact(), 16.5, db(-9))                 # fone
for i in range(4): place(sfx, pop(), 18.58 + i * 0.08, db(-13))
place(sfx, riser(1.4), 20.08 - 1.4, db(-9))
place(sfx, impact(), 20.08, db(-5)); place(sfx, cash(), 20.08, db(-3))
place(sfx, cash(), 22.56, db(-5)); place(sfx, impact(), 22.56, db(-10))
place(sfx, pop(), 23.0, db(-8)); place(sfx, impact(), 23.36, db(-8))   # "essa?"
place(sfx, impact(), 24.17, db(-10)); place(sfx, pop(), 24.58, db(-9)) # realme / pin
place(sfx, pop(), 27.6, db(-9))
place(sfx, click(), 28.55, db(-4)); place(sfx, whoosh(0.4, rev=True), 28.6, db(-12))

# ---------------- Trilha original (124 BPM, Am–F–C–G) ----------------
BPM = 124; beat = 60 / BPM; bar = 4 * beat
music = np.zeros(N)
def kick():
    t = t_(0.35); f = 120 * np.exp(-t * 22) + 48
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12)
def hat(o=False):
    t = t_(0.18 if o else 0.05); return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t / (0.05 if o else 0.012))
def clap():
    t = t_(0.2); x = bp(rng.standard_normal(len(t)), 900, 2500)
    e = sum(np.exp(-np.clip(t - d, 0, None) / 0.008) * (t >= d) for d in (0, .01, .02)) + np.exp(-t / 0.06)
    return x * e
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def pluck(f, d):
    t = t_(d); s = signal.sawtooth(2 * np.pi * f * t) + 0.5 * signal.sawtooth(2 * np.pi * f * 1.005 * t)
    return lp(s, 2600) * env(len(t), 0.004, d / 3)
def bass(f, d):
    t = t_(d); s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)
    return s * env(len(t), 0.005, d / 1.5)
nbars = int(TOTAL / bar) + 2
for b in range(nbars):
    t0 = b * bar; ch = chords[b % 4]
    intro = t0 < 2 * bar
    for q in range(4):
        tq = t0 + q * beat
        if not intro: place(music, kick(), tq, 0.9)
        place(music, hat(), tq + beat / 2, 0.25)
        if q in (1, 3) and not intro: place(music, clap(), tq, 0.35)
    for s8 in range(8):  # arpejo de colcheias
        n = ch[[0, 1, 2, 1, 0, 2, 1, 2][s8]] + 12
        place(music, pluck(mtof(n), beat * 0.5), t0 + s8 * beat / 2, 0.16)
    for q in (0, 1.5, 2, 3.5):
        place(music, bass(mtof(ch[0] - 24), beat * 0.45), t0 + q * beat, 0.5 if not intro else 0.25)
music = music[:N]
# respiro antes do CTA: corta graves no gancho de "Vai perder essa?" e volta no CTA
fade = np.ones(N); i0, i1 = int(22.95 * SR), int(23.8 * SR)
music_lp = lp(music, 400)
w = np.zeros(N); w[i0:i1] = np.sin(np.linspace(0, np.pi, i1 - i0))
music = music * (1 - w) + music_lp * w
music = norm(music, 0.8)

# ---------------- Voz ----------------
v, sr = sf.read(f"{root}/../audio/voice_cut.wav")
v = v.mean(axis=1) if v.ndim > 1 else v
v = hp(v, 80, 4)
meter = pyln.Meter(SR)
v = pyln.normalize.loudness(v, meter.integrated_loudness(v), -22)
# compressor 3:1 a -18 dB (detector RMS 10 ms, ataque 5 ms, release 80 ms)
lvl = np.sqrt(signal.lfilter([1 - np.exp(-1 / (0.01 * SR))], [1, -np.exp(-1 / (0.01 * SR))], v ** 2)) + 1e-9
ldb = 20 * np.log10(lvl); gr = np.where(ldb > -18, (ldb + 18) * (1 - 1 / 3), 0)
sm = np.zeros_like(gr); a_, r_ = np.exp(-1 / (0.005 * SR)), np.exp(-1 / (0.08 * SR)); g = 0
for k in range(len(gr)):
    c = a_ if gr[k] > g else r_; g = c * g + (1 - c) * gr[k]; sm[k] = g
v = v * db(-sm)
v = pyln.normalize.loudness(v, meter.integrated_loudness(v), -19)  # -19 mono = -16 LUFS no estéreo duplicado
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]

# ducking: -8 dB na música quando há fala
venv = np.abs(signal.hilbert(lp(voice, 1000))) if False else np.abs(voice)
venv = signal.lfilter([1 - np.exp(-1 / (0.05 * SR))], [1, -np.exp(-1 / (0.05 * SR))], venv)
speech = (20 * np.log10(venv + 1e-9) > -40).astype(float)
k = int(0.25 * SR); speech = np.convolve(speech, np.ones(k) / k, mode="same")
speech = np.clip(speech * 3, 0, 1)
duck = db(-8 * speech)

music_bus = music * db(-22 + 9) * duck  # trilha ~-22 dB abaixo da referência da voz
sfx_bus = norm(sfx, 1.0) * db(-12 + 6)
mix = voice + music_bus + sfx_bus
# fades de 0.3 s
fl = int(0.3 * SR); mix[:fl] *= np.linspace(0, 1, fl); mix[-fl:] *= np.linspace(1, 0, fl)
# limitador de pico em -1 dBFS (look-ahead de 5 ms, release de 60 ms)
lim = db(-1.2)
gain = np.minimum(1, lim / (np.abs(mix) + 1e-9))
la = int(0.005 * SR)
from scipy.ndimage import minimum_filter1d
gain = minimum_filter1d(gain, 2 * la + 1)
rel = np.exp(-1 / (0.06 * SR)); g = 1.0; gs = np.empty_like(gain)
for k in range(len(gain)):
    g = gain[k] if gain[k] < g else rel * g + (1 - rel) * gain[k]; gs[k] = g
mix = np.clip(mix * gs, -db(-1), db(-1))
st = np.stack([mix, mix], axis=1)
sf.write(f"{root}/audio/mix.wav", st, SR, subtype="PCM_24")
sf.write(f"{root}/audio/music.wav", music_bus, SR, subtype="PCM_24")
sf.write(f"{root}/audio/sfx.wav", sfx_bus, SR, subtype="PCM_24")
print("LUFS mix", round(meter.integrated_loudness(mix), 1), "voz", round(meter.integrated_loudness(voice), 1), "pico dBFS", round(20 * np.log10(np.abs(mix).max()), 2))
