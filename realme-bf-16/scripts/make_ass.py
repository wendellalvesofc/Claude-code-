# Legendas do vídeo 16 (tempos já na linha do tempo final: depois de 5,567 s tudo atrasa 2 s pelo intervalo dos palpites).
# Mesmo estilo dos anteriores: blocos curtos com corte seco; destaques acendem palavra a palavra (amarelo = chave, verde = valor).
Y, G = "&H1FD2FF&", "&H5BE239&"
CAP = [
    (0.32, 1.40, "quanto você acha"),
    (1.40, 2.78, "que custa esse fone"),
    (2.78, 4.02, "oficial da realme"),
    (4.02, 5.55, "aqui na nossa {\\c" + Y + "}pré-Black?"),
    (8.76, 9.52, "você garante"),
    (9.52, 10.55, "o fone da realme!"),
    (12.16, 13.14, "ofertas válidas"),
    (13.14, 13.95, "até o dia {\\c" + Y + "}15!"),
]
HLS = [  # (início, fim, linha de cima [(palavra, t)], linha de baixo [(palavra, t)], cor)
    (7.66, 8.76, [("é", 7.66), ("por", 7.86), ("apenas", 7.98)], [("R$ 1", 8.32)], G),
    (10.70, 11.95, [("então", 10.70)], [("corre!", 10.98)], Y),
]
def tc(x): return f"0:{int(x // 60):02d}:{x % 60:05.2f}"
ev = [f"Dialogue: 0,{tc(a)},{tc(b)},Cap,,0,0,0,,{t}" for a, b, t in CAP]
for a, b, l1, l2, col in HLS:
    def word(w, t, big):
        ms = max(0, int(round((t - a) * 1000)) - 30); lit = col if big else "&HFFFFFF&"
        pop = f"\\t({ms},{ms+1},\\fscx125\\fscy125)\\t({ms+1},{ms+220},\\fscx100\\fscy100)" if big else ""
        return f"{{\\alpha&HA8&\\c&HD0D0D0&\\t({ms},{ms+80},\\alpha&H00&\\c{lit}){pop}}}{w}"
    ev.append(f"Dialogue: 0,{tc(a)},{tc(b)},HL2,,0,0,0,," + " ".join(word(w, t, True) for w, t in l2))
    ev.append(f"Dialogue: 0,{tc(a)},{tc(b)},HL1,,0,0,0,," + " ".join(word(w, t, False) for w, t in l1))
head = open("../realme-bf-09/out/legendas.ass").read().split("[Events]")[0]
open("out/legendas.ass", "w").write(head + "[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n" + "\n".join(ev) + "\n")
print(len(ev), "eventos")
