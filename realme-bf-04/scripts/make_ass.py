# Legendas no padrão realme UGC (ESTILO-realme-ugc.md): frases curtas, corte seco entre uma e outra;
# só os destaques acendem palavra a palavra. A música e a vinheta final não são legendadas.
# Uso: python3 scripts/make_ass.py <raiz>  -> out/legendas.ass e out/legendas.srt
import re, sys
root = sys.argv[1]

# legenda normal: (início, texto). Fica até a próxima, ou até 0,5 s depois da última palavra numa pausa.
# destaque: (início, ("H", [(palavra, t), ...linha 1], [(palavra, t), ...linha 2], cor))
Y, G = "&H1FD2FF&", "&H6BE239&"
CAPS = [
    (0.0, "e aí, você gostou,", 0.90), (1.08, "Yasmin?", 1.22), (1.24, "eu gostei, mas", 1.90), (1.90, "quanto você faz ele no pix?", 3.08),
    (3.20, "ó, esse daqui", 3.88), (3.88, "eu consigo fazer ele", 5.04), (5.04, "por {\\c&H6BE239&}R$ 3.950{\\c&HFFFFFF&}", 7.42),
    (7.62, "esse daqui, o C85,", 9.44), (9.68, "por {\\c&H6BE239&}R$ 2.500{\\c&HFFFFFF&}", 11.34),
    (11.80, "tá bom, então vou levar", 12.66), (12.82, "um pra mim,", 13.14), (13.14, "um pro meu filho", 13.76), (13.90, "ai, legal", 14.40),
    (15.02, "ah, Yasmin, e aí,", 16.14), (16.18, "você gostou,", 17.08), (17.10, "vai querer levar?", 18.02),
    (18.86, "ai, não sei", 19.92), (20.04, "eu queria que combinasse", 20.84), (20.84, "com a bancada lá de casa", 22.00),
    (22.24, "mas eu tenho os dois modelos", 23.56), (23.56, "em outras cores também", 25.04),
    (25.50, "ah, mas eu queria", 26.06), (26.06, "que combinasse", 26.58), (26.58, "com a minha personalidade", 27.74),
    (27.74, "ó, vamos fazer assim, então?", 29.68), (30.16, "só pra te mimar, tá?", 31.60), (31.82, "é só com você", 33.16),
    (33.56, "ai, eu sei,", 34.08), (34.14, "eu sou um ótimo cliente", 35.14),
    (36.12, "pra melhorar o seu pacote,", 37.80), (37.92, "como você vai estar adquirindo", 39.16), (39.16, "o aparelho na pré-Black,", 40.66),
    (41.12, "no dia da Black,", 42.28), (42.42, "você pode voltar aqui", 43.60), (43.60, "e você consegue", 44.54),
    (44.54, ("H", [("esse", 44.54), ("fone", 44.74), ("oficial", 44.96), ("realme", 45.56)], [("por", 45.84), ("apenas", 46.02), ("R$ 1", 46.34)], G), 46.66),
    (47.12, "ah, então vou levar os dois", 48.46), (48.64, "ai!", 48.96),
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
