# Legendas do vídeo 18 (fala muda no vídeo; texto da transcrição enviada; tempos pela boca/gestos).
Y = "&H1FD2FF&"
CAP = [
    (2.85, 3.45, "o que foi?"),
    (3.50, 4.40, "tô triste porque"),
    (4.40, 5.75, "a pré-Black acabou 😢".replace(" 😢", "...")),
]
HLS = [(5.90, 7.90, [("mas", 5.90), ("a", 6.05), ("Black", 6.15), ("Friday", 6.45)], [("começou!", 6.85)], Y)]
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
