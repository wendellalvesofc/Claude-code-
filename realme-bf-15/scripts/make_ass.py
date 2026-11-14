# Legendas de impacto do vídeo 15 (posicionadas abaixo do queixo do vendedor: rostos medidos com YuNet, scripts/faces.py) (só nos momentos em que a vendedora sobe com cada coisa).
# Corte seco, com "pop" de escala na entrada; amarelo = frase-chave, verde = dinheiro.
Y, G, WH = "&H1FD2FF&", "&H5BE239&", "&HFFFFFF&"
def pop(s=128, ms=140): return f"\\fscx{s}\\fscy{s}\\t(0,{ms},\\fscx100\\fscy100)"
def line(a, b, y, txt, size, col, delay=0.0, p=True):
    st = f"{{\\an5\\pos(540,{y})\\fs{size}\\c{col}{pop() if p else ''}}}"
    return (a + delay, b, st + txt)
EV = [
    # 1) folheto: PRÉ-BLACK
    line(0.50, 2.10, 1260, "PRÉ-BLACK", 250, Y),
    # 2) fone: FONE POR R$ 1
    line(6.60, 8.50, 1190, "FONE POR", 130, WH, p=False),
    line(6.60, 8.50, 1365, "R$ 1", 300, G),
    # 3) placa do boleto
    line(13.70, 15.40, 1180, "PARCELAMENTO NO BOLETO", 100, WH, p=False),
    line(13.70, 15.40, 1320, "EM ATÉ 18X", 220, Y),
    # 4) gesto do dinheiro: melhor preço garantido na pré-Black / ou Pix de R$ 1.000 na Black
    line(17.20, 21.00, 1180, "MELHOR PREÇO GARANTIDO", 96, WH, p=False),
    line(17.20, 21.00, 1295, "NA PRÉ-BLACK", 150, Y),
    line(18.18, 21.00, 1435, "OU PIX DE R$ 1.000", 130, G),
    line(18.18, 21.00, 1555, "NA BLACK", 130, WH, p=False),
]
def tc(x): return f"0:{int(x // 60):02d}:{x % 60:05.2f}"
head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Imp,Poppins Black,100,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,11,6,5,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
open("out/legendas.ass", "w").write(head + "\n".join(f"Dialogue: 0,{tc(a)},{tc(b)},Imp,,0,0,0,,{t}" for a, b, t in EV) + "\n")
print(len(EV), "linhas")
