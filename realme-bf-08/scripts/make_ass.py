# Legendas no padrão realme UGC (ESTILO-realme-ugc.md): frases curtas, corte seco entre uma e outra;
# só os destaques acendem palavra a palavra. A música e a vinheta final não são legendadas.
# Uso: python3 scripts/make_ass.py <raiz>  -> out/legendas.ass e out/legendas.srt
import re, sys
root = sys.argv[1]

# legenda normal: (início, texto). Fica até a próxima, ou até 0,5 s depois da última palavra numa pausa.
# destaque: (início, ("H", [(palavra, t), ...linha 1], [(palavra, t), ...linha 2], cor))
Y, G = "&H1FD2FF&", "&H6BE239&"
CAPS = [
    (0.54, "olá, boa tarde", 1.48), (1.48, "boa tarde", 1.82), (1.82, "tudo bem?", 2.52), (2.52, "tudo?", 2.90),
    (3.22, "eu queria aquele", 3.78), (3.78, "celular C100", 4.60), (5.04, "C100? aqui, ó", 6.08),
    (6.08, "{\\c&H1FD2FF&}6.500 mAh{\\c&HFFFFFF&}", 6.84),
    (7.22, "e eu tô querendo", 8.06), (8.06, "aquele realme C85", 9.12), (9.26, "sabe aquele que tem", 9.84),
    (9.84, "resistência à água?", 10.64), (10.74, "agora, na sua mão", 11.62), (12.08, "obrigada", 12.48),
    (12.56, "e eu queria o P4 Power", 13.68), (14.00, "P4 Power,", 14.70),
    (14.72, "{\\c&H1FD2FF&}10.000 mAh{\\c&HFFFFFF&} de bateria", 15.80), (16.50, "ai, que legal", 17.12),
    (17.24, "eu queria um realme 14", 18.70), (18.88, "5G de 256...", 20.60),
    (21.08, ("H", [("melhor,", 21.08)], [("de", 21.82), ("512 GB", 22.10)], Y), 22.90),
    (23.08, "na sua mão", 23.70), (24.14, "e eu queria dois", 24.90), (24.90, "realme 14 Pro+", 25.90),
    (25.94, "de 512 GB", 26.60), (26.90, "eita, que chique", 27.58), (27.74, "dois na sua mão", 28.68),
    (29.68, "aproveita no dia", 30.36), (30.36, "da Black Friday, tá?", 31.30),
    (31.36, ("H", [("fone", 31.38), ("de", 31.50), ("ouvido", 31.62)], [("por", 31.84), ("apenas", 32.00), ("R$ 1", 32.28)], G), 32.60),
    (32.66, "pra quem comprou", 33.10), (33.10, "do dia 15/10", 33.88), (33.88, "ao dia 15/11", 35.00),
    (36.46, "prontinho", 36.86), (37.96, "obrigada", 38.36),
]

def tc(x):
    h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60
    return f"{h}:{m:02d}:{s:05.2f}"
def tsrt(x):
    ms = int(round(x * 1000)); return f"{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d},{ms%1000:03d}"

ev, srt = [], []
for i, (a, body, last) in enumerate(CAPS):
    nxt = CAPS[i + 1][0] if i + 1 < len(CAPS) else 99
    b = min(nxt, last + 0.5)
    if isinstance(body, str):
        ev.append(f"Dialogue: 0,{tc(a)},{tc(b)},Cap,,0,0,0,,{body}")
        srt.append((a, b, re.sub(r"\{[^}]*\}", "", body)))
        continue
    _, l1, l2, col = body
    def word(w, t, big):
        ms = max(0, int(round((t - a) * 1000)) - 30)
        lit = (col if big else "&HFFFFFF&")
        pop = f"\\t({ms},{ms+1},\\fscx125\\fscy125)\\t({ms+1},{ms+220},\\fscx100\\fscy100)" if big else ""
        return f"{{\\alpha&HA8&\\c&HD0D0D0&\\t({ms},{ms+80},\\alpha&H00&\\c{lit}){pop}}}{w}"
    line1 = " ".join(word(w, t, False) for w, t in l1)
    line2 = " ".join(word(w, t, True) for w, t in l2)
    ev.append(f"Dialogue: 0,{tc(a)},{tc(b)},HL2,,0,0,0,,{line2}")
    ev.append(f"Dialogue: 0,{tc(a)},{tc(b)},HL1,,0,0,0,,{line1}")
    srt.append((a, b, " ".join(w for w, _ in l1) + "\n" + " ".join(w for w, _ in l2)))

head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Poppins ExtraBold,60,&H00FFFFFF,&H00FFFFFF,&H99000000,&H90000000,0,0,0,0,100,100,-0.5,0,1,2.5,4,2,90,90,670,1
Style: HL1,Poppins ExtraBold,68,&H00FFFFFF,&H00FFFFFF,&H99000000,&H90000000,0,0,0,0,100,100,-1,0,1,3,5,2,60,60,785,1
Style: HL2,Poppins Black,120,&H00FFFFFF,&H00FFFFFF,&H8C000000,&H90000000,0,0,0,0,100,100,-3,0,1,5,5,2,60,60,650,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
open(f"{root}/out/legendas.ass", "w").write(head + "\n".join(ev) + "\n")
open(f"{root}/out/legendas.srt", "w").write("\n".join(f"{k}\n{tsrt(a)} --> {tsrt(b)}\n{t}\n" for k, (a, b, t) in enumerate(srt, 1)))
print(len(srt), "legendas")
