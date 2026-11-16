# Legendas do vídeo 19 (REAL FRIDAY). Tempos do large-v3 corrigidos por take pelo início real das falas:
# take 1 +0,00 s | take 2 (11,2–16,47 s) +0,33 s | take 3 (16,47 s–) +0,42 s.
# Sempre UMA linha (pedido do cliente): corte seco nos blocos normais; nos destaques as palavras-chave acendem em amarelo (clique do mouse).
Y = "&H1FD2FF&"
CAP = [
    (1.86, 2.68, "a cada compra"),
    (2.68, 4.00, "que você faz na loja,"),
    (4.04, 4.94, "você ganha"),
    (6.48, 7.46, "então, quanto mais"),
    (7.46, 8.40, "você compra,"),
    (8.40, 9.32, "mais chances"),
    (9.32, 10.95, "você tem de ganhar."),
    (11.15, 11.67, "terão"),
    (12.93, 13.80, "C73"),
    (13.83, 15.40, "e 16 Pro+"),
    (15.43, 16.45, "e aí, qual vai ser o seu?"),
    (16.66, 17.62, "e você ainda"),
    (17.62, 18.38, "concorre"),
    (20.14, 21.80, "Yamaha Factor."),
    (21.84, 22.60, "vem garantir"),
]
# destaques em UMA linha: palavras comuns entram brancas no corte; as palavras-chave acendem em amarelo com "pop"
HLS = [  # (início, fim, [(palavra, tempo, chave?)])
    (0.04, 1.80, [("a", 0.04, 0), ("Real", 0.10, 1), ("Friday", 0.36, 1), ("começou!", 0.78, 1)]),
    (4.96, 6.40, [("2", 4.96, 1), ("números", 5.24, 1), ("da", 5.68, 1), ("sorte", 5.96, 1)]),
    (11.69, 12.92, [("12", 11.69, 1), ("aparelhos", 11.87, 1), ("sorteados", 12.33, 1)]),
    (18.40, 20.10, [("uma", 18.40, 0), ("moto", 18.62, 1), ("0 km", 19.04, 1)]),
    (22.62, 23.30, [("seu", 22.62, 1), ("número", 22.72, 1), ("da", 22.92, 1), ("sorte!", 23.10, 1)]),
]
CLICKS = [next(t for w, t, k in h[2] if k) for h in HLS]
LOW = 16.467                                   # take 3: legendas mais baixas (fora da estampa da camiseta)
mv = lambda a: "470" if a >= LOW else "0"
def tc(x): return f"0:{int(x // 60):02d}:{x % 60:05.2f}"
ev = [f"Dialogue: 0,{tc(a)},{tc(b)},Cap,,0,0,{mv(a)},,{t}" for a, b, t in CAP]
for a, b, ws in HLS:
    def word(w, t, key):
        if not key: return w
        ms = max(0, int(round((t - a) * 1000)) - 30)
        return (f"{{\\alpha&HA8&\\c&HD0D0D0&\\t({ms},{ms+80},\\alpha&H00&\\c{Y})"
                f"\\t({ms},{ms+1},\\fscx115\\fscy115)\\t({ms+1},{ms+220},\\fscx100\\fscy100)}}{w}{{\\r}}")
    ev.append(f"Dialogue: 0,{tc(a)},{tc(b)},Key,,0,0,{mv(a)},," + " ".join(word(*x) for x in ws))
head = open("../realme-bf-09/out/legendas.ass").read().split("[Events]")[0]
head = head.rstrip() + "\nStyle: Key,Poppins Black,92,&H00FFFFFF,&H00FFFFFF,&H8C000000,&H90000000,0,0,0,0,100,100,-1.5,0,1,4,5,2,60,60,670,1\n\n"
open("out/legendas.ass", "w").write(head + "[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n" + "\n".join(ev) + "\n")
if __name__ == "__main__": print(len(ev), "eventos; cliques em", CLICKS)
