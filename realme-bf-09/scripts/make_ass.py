# Legendas no padrão realme UGC (ESTILO-realme-ugc.md): frases curtas, corte seco entre uma e outra;
# só os destaques acendem palavra a palavra. A música e a vinheta final não são legendadas.
# Uso: python3 scripts/make_ass.py <raiz>  -> out/legendas.ass e out/legendas.srt
import re, sys
root = sys.argv[1]

# legenda normal: (início, texto). Fica até a próxima, ou até 0,5 s depois da última palavra numa pausa.
# destaque: (início, ("H", [(palavra, t), ...linha 1], [(palavra, t), ...linha 2], cor))
Y, G = "&H1FD2FF&", "&H6BE239&"
CAPS = [
    (0.00, "a gente acabou", 0.86), (0.86, "de arrumar a loja,", 2.00), (2.18, "a pré-Black começou", 2.98),
    (2.98, "e eu quero vocês", 3.58), (3.58, "com o melhor marketing possível", 5.00), (5.74, "a gente vai arrasar esse ano", 6.90),
    (7.00, "fechou, você grava a gente?", 7.95), (8.04, "gravo", 8.45),
    (8.52, "vida, pode existir", 9.60), (9.60, "milhares,", 10.50), (10.88, "mas nenhuma é igual", 11.66),
    (11.66, "à {\\c&H1FD2FF&}realme{\\c&HFFFFFF&}", 12.30),
    (13.06, "aqui a nossa Black", 13.84), (13.84, "é de verdade,", 14.60),
    (15.34, ("H", [("você", 15.34), ("pega", 15.56), ("o", 15.78), ("fone", 15.94)], [("por", 16.10), ("R$ 1", 16.36)], G), 16.90),
    (17.50, "eu troco qualquer marca", 18.50), (18.50, "aqui pela realme", 19.40), (20.02, "a realme é tudo pra mim,", 21.20),
    (21.86, "assim", 22.20), (22.38, "a Yasmin comprou", 23.04), (23.04, "o realme aqui?", 23.90), (24.82, "comprei", 25.26),
    (25.42, "então bora,", 25.90),
    (25.96, ("H", [("vem", 25.96), ("aproveitar", 26.06)], [("a", 26.40), ("pré-Black", 26.50)], Y), 27.30),
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
