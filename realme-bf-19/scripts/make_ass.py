# Legendas do vídeo 19 (REAL FRIDAY). Tempos do large-v3 corrigidos por take pelo início real das falas:
# take 1 +0,00 s | take 2 (11,2–16,47 s) +0,33 s | take 3 (16,47 s–) +0,42 s.
# Corte seco nos blocos normais; destaques acendem palavra a palavra em amarelo (clique do mouse na 1ª palavra grande).
Y = "&H1FD2FF&"
CAP = [
    (1.86, 2.68, "a cada compra"),
    (2.68, 4.00, "que você faz na loja,"),
    (6.48, 7.46, "então, quanto mais"),
    (7.46, 8.40, "você compra,"),
    (8.40, 9.32, "mais chances"),
    (9.32, 10.95, "você tem de ganhar."),
    (12.93, 13.80, "C73"),
    (13.83, 15.40, "e 16 Pro+"),
    (15.43, 16.45, "e aí, qual vai ser o seu?"),
    (16.66, 17.62, "e você ainda"),
    (17.62, 18.38, "concorre"),
    (20.14, 21.80, "Yamaha Factor."),
]
HLS = [
    (0.04, 1.80, [("a", 0.04)], [("Real", 0.10), ("Friday", 0.36), ("começou!", 0.78)]),
    (4.04, 6.40, [("você", 4.04), ("ganha", 4.26)], [("2", 4.96), ("números", 5.24), ("da", 5.68), ("sorte", 5.96)]),
    (11.15, 12.92, [("terão", 11.15)], [("12", 11.69), ("aparelhos", 11.87), ("sorteados", 12.33)]),
    (18.40, 20.10, [("uma", 18.40)], [("moto", 18.62), ("0 km", 19.04)]),
    (21.84, 23.30, [("vem", 21.84), ("garantir", 22.28)], [("seu", 22.62), ("número", 22.72), ("da", 22.92), ("sorte!", 23.10)]),
]
CLICKS = [h[3][0][1] for h in HLS]
def tc(x): return f"0:{int(x // 60):02d}:{x % 60:05.2f}"
LOW = 16.467                                   # take 3: legendas mais baixas (fora da estampa da camiseta)
mv = lambda a, base: str(base - 200) if a >= LOW else "0"
ev = [f"Dialogue: 0,{tc(a)},{tc(b)},Cap,,0,0,{mv(a, 670)},,{t}" for a, b, t in CAP]
for a, b, l1, l2 in HLS:
    def word(w, t, big):
        ms = max(0, int(round((t - a) * 1000)) - 30); lit = Y if big else "&HFFFFFF&"
        pop = f"\\t({ms},{ms+1},\\fscx115\\fscy115)\\t({ms+1},{ms+220},\\fscx100\\fscy100)" if big else ""
        return f"{{\\alpha&HA8&\\c&HD0D0D0&\\t({ms},{ms+80},\\alpha&H00&\\c{lit}){pop}}}{w}"
    ev.append(f"Dialogue: 0,{tc(a)},{tc(b)},HL2,,0,0,{mv(a, 650)},,{{\\fs100}}" + " ".join(word(w, t, True) for w, t in l2))
    ev.append(f"Dialogue: 0,{tc(a)},{tc(b)},HL1,,0,0,{mv(a, 785)},,{{\\fs62}}" + " ".join(word(w, t, False) for w, t in l1))
head = open("../realme-bf-09/out/legendas.ass").read().split("[Events]")[0]
open("out/legendas.ass", "w").write(head + "[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n" + "\n".join(ev) + "\n")
if __name__ == "__main__": print(len(ev), "eventos; cliques em", CLICKS)
