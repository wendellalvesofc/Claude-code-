# Legendas no padrão realme UGC (ESTILO-realme-ugc.md): frases curtas, corte seco entre uma e outra;
# só os destaques acendem palavra a palavra. A música e a vinheta final não são legendadas.
# Uso: python3 scripts/make_ass.py <raiz>  -> out/legendas.ass e out/legendas.srt
import sys
root = sys.argv[1]

# legenda normal: (início, texto). Fica até a próxima, ou até 0,5 s depois da última palavra numa pausa.
# destaque: (início, ("H", [(palavra, t), ...linha 1], [(palavra, t), ...linha 2], cor))
Y, G = "&H1FD2FF&", "&H6BE239&"
CAPS = [
    (0.54, "oi,", 1.02), (1.30, "fala com o cliente aqui", 2.14), (2.38, "o que que ele quer?", 2.84),
    (3.14, "fala aqui com ele", 4.16), (4.50, "cara, fala você,", 5.22), (5.26, "eu tô ocupada", 5.80),
    (5.82, "por favor,", 6.22), (6.22, "fala aqui com ele", 7.10), (7.32, "cara, eu acredito", 8.08),
    (8.08, "no seu potencial,", 8.92), (8.92, "você consegue", 9.68), (10.02, "ele quer comprar", 10.58),
    (10.58, ("H", [("2", 10.58), ("P4", 10.75), ("Power", 11.2)], [("de", 11.4), ("256", 11.64), ("GB", 12.2)], Y), 12.96),
    (14.28, "2 P4 Power?", 15.24), (15.84, "de 256 GB?", 17.40),
    (18.36, "passa aqui", 18.96), (19.76, "coloca aquela música lá", 20.90), (21.40, "pode deixar", 21.76),
    (25.52, "fala, patrão", 26.48), (27.72, "como que você tá?", 28.68),
    (30.00, "viu as ofertas", 31.02), (31.02, "da pré-Black, né?", 32.70), (33.48, "já vai garantir", 34.24),
    (34.24, "seu celular, né?", 35.50), (36.38, "um pra você", 36.90), (36.90, "e um pra esposa?", 38.38),
    (39.14, "pode deixar que eu", 39.86), (39.86, "vou deixar separado", 41.20), (41.30, "e vou melhorar pra você", 42.82),
    (43.34, "no dia da Black,", 44.68), (44.98, "você pode vir aqui", 46.02), (46.02, "com a nota oficial", 46.92),
    (46.92, "do seu celular", 47.76), (48.06, "e vai pegar", 48.58),
    (48.58, ("H", [("um", 48.58), ("fone", 48.78), ("oficial", 48.96), ("realme", 49.4)], [("por", 49.92), ("R$ 1", 50.08)], G), 50.50),
    (51.78, "é isso aí", 52.54),
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
        srt.append((a, b, body))
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
