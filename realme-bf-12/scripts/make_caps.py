# Monta as legendas a partir das palavras do large-v3 (analysis/tr_large.json), com correções de termos,
# blocos de até 4 palavras (corte seco) e destaques nas ofertas. Gera out/legendas.ass e out/legendas.srt.
import json, re, sys
root = sys.argv[1]
d = json.load(open(f"{root}/analysis/tr_large.json"))
OFF = 0.30   # o large-v3 marcou este vídeo ~0,3 s adiantado (conferido pelo início das falas)
W = [[w["w"], w["s"] + OFF, w["e"] + OFF] for s in d for w in s["words"]]

# junta "pré" + "-black"
i = 0; words = []
while i < len(W):
    w = W[i]
    if w[0] == "R" and i + 1 < len(W) and W[i + 1][0].startswith("$"):        # "R" + "$200," -> "R$ 200,"
        val, end, j = W[i + 1][0][1:], W[i + 1][2], i + 2
        if j < len(W) and W[j][0].startswith("."):                         # "$1" + ".700" -> "1.700"
            val += W[j][0]; end = W[j][2]; j += 1
        words.append(["R$ " + val, w[1], end]); i = j; continue
    if i + 1 < len(W) and W[i + 1][0].lower().startswith("-black"):
        words.append([w[0] + W[i + 1][0], w[1], W[i + 1][2]]); i += 2; continue
    words.append(w); i += 1

def fix(t):
    t = t.replace("Realme", "realme").replace("pré-black", "pré-Black").replace("Pré-black", "pré-Black")
    t = {"black": "Black", "yasmin,": "Yasmin,"}.get(t, t)
    keep = ("Black", "pré-Black", "Pix", "R$", "Yasmin")
    if t and t[0].isupper() and not t.startswith(keep): t = t[0].lower() + t[1:]   # minúsculas, como nas referências
    if t.startswith("R$"):                                                 # valores em amarelo
        tail = t[-1] if t[-1] in ",.?!" else ""
        t = "{\\c&H1FD2FF&}" + t.rstrip(",.?!") + "{\\c&HFFFFFF&}" + tail
    return t

# trechos substituídos à mão: (início, fim, texto) em segundos — sobrescreve as palavras nesse intervalo
MANUAL = [
    (23.50, 25.30, None),                     # "você vai comprar ele por apenas R$ 1": destaque
    (38.25, 39.70, None),                     # "e pegar esse fone por R$ 1" no fim: destaque
]
skip = lambda s: any(a <= s < b for a, b, _ in MANUAL)

caps = []; cur = []
def flush():
    global cur
    if cur:
        caps.append((cur[0][1], " ".join(fix(w[0]) for w in cur), cur[-1][2])); cur = []
for k, w in enumerate(words):
    if skip(w[1]) or (w[0] == "todos." and w[1] < 3): flush(); continue
    cur.append(w)
    nxt = words[k + 1][1] if k + 1 < len(words) else 999
    txt = " ".join(x[0] for x in cur)
    stop = w[0][-1] in ".?!"                                               # fim de frase: sempre corta
    comma = w[0][-1] == "," and len(cur) >= 2
    if len(cur) >= 4 or len(txt) > 26 or stop or comma or nxt - w[2] > 0.45: flush()
flush()
caps = [c for c in caps if not (c[1].lower().startswith("amiga") and False)]
# limpeza de caixa: minúsculas no início, como nas referências
caps = [(a, (t[0].lower() + t[1:]) if t and not t.startswith(("{", "R$", "C1", "P4")) else t, b) for a, t, b in caps]

Y, G = "&H1FD2FF&", "&H6BE239&"
HLS = [
    (23.54, ("H", [("você", 23.54), ("vai", 23.84), ("comprar", 23.90), ("ele", 24.16)], [("por", 24.34), ("apenas", 24.52), ("R$ 1", 24.74)], G), 25.30),
    (38.30, ("H", [("e", 38.30), ("pegar", 38.50), ("esse", 38.68)], [("fone", 38.82), ("por", 39.00), ("R$ 1", 39.14)], G), 39.70),
]
# remove legendas normais que colidem com os destaques
out = []
for a, t, b in sorted(caps):
    if any(ha - 0.05 <= a < hb for ha, _, hb in HLS): continue
    out.append((a, t, b))
CAPS = sorted(out + HLS, key=lambda c: c[0])

def tc(x):
    h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f"{h}:{m:02d}:{s:05.2f}"
def tsrt(x):
    ms = int(round(x * 1000)); return f"{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d},{ms%1000:03d}"
ev, srt = [], []
for i, (a, body, last) in enumerate(CAPS):
    nxt = CAPS[i + 1][0] if i + 1 < len(CAPS) else 999
    b = min(nxt, last + 0.5)
    if isinstance(body, str):
        ev.append(f"Dialogue: 0,{tc(a)},{tc(b)},Cap,,0,0,0,,{body}"); srt.append((a, b, re.sub(r"\{[^}]*\}", "", body))); continue
    _, l1, l2, col = body
    def word(w, t, big):
        ms = max(0, int(round((t - a) * 1000)) - 30); lit = col if big else "&HFFFFFF&"
        pop = f"\\t({ms},{ms+1},\\fscx125\\fscy125)\\t({ms+1},{ms+220},\\fscx100\\fscy100)" if big else ""
        return f"{{\\alpha&HA8&\\c&HD0D0D0&\\t({ms},{ms+80},\\alpha&H00&\\c{lit}){pop}}}{w}"
    ev.append(f"Dialogue: 0,{tc(a)},{tc(b)},HL2,,0,0,0,," + " ".join(word(w, t, True) for w, t in l2))
    ev.append(f"Dialogue: 0,{tc(a)},{tc(b)},HL1,,0,0,0,," + " ".join(word(w, t, False) for w, t in l1))
    srt.append((a, b, " ".join(w for w, _ in l1) + "\n" + " ".join(w for w, _ in l2)))
head = open(f"{root}/../realme-bf-09/out/legendas.ass").read().split("[Events]")[0]
open(f"{root}/out/legendas.ass", "w").write(head + "[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n" + "\n".join(ev) + "\n")
open(f"{root}/out/legendas.srt", "w").write("\n".join(f"{k}\n{tsrt(a)} --> {tsrt(b)}\n{t}\n" for k, (a, b, t) in enumerate(srt, 1)))
print(len(srt), "legendas")
for a, b, t in srt: print(f"{a:6.2f} {t}".replace("\n", " / "))
