# Legendas do vídeo 20 (REAL FRIDAY). Tempos do large-v3 corrigidos por take pelo início real das falas:
# take 1 +0,08 s | take 2 (2,467–9,067 s) +0,40 s | take 3 (9,067 s–) +0,34 s.
# Sempre UMA linha (pedido do cliente): corte seco nos blocos normais; nos destaques as palavras-chave acendem em amarelo (clique do mouse).
Y = "&H1FD2FF&"
CAP = [
    (0.08, 1.30, "você está pensando"),
    (1.34, 2.45, "em trocar de celular?"),
    (2.64, 3.94, "e se eu te dissesse"),
    (3.96, 5.12, "que comprando um realme"),
    (5.14, 6.22, "você pode concorrer"),
    (14.06, 15.12, "já imaginou"),
]
HLS = [  # (início, fim, [(palavra, tempo, chave?)])
    (6.24, 8.08, [("a", 6.24, 0), ("uma", 6.54, 0), ("moto", 6.76, 1), ("0 km", 7.12, 1)]),
    (8.10, 9.05, [("e", 8.10, 0), ("um", 8.38, 0), ("celular!", 8.54, 1)]),
    (9.16, 11.22, [("são", 9.16, 0), ("6", 9.48, 1), ("realme", 9.82, 0), ("C73", 10.48, 1)]),
    (11.24, 14.00, [("e", 11.24, 0), ("6", 11.76, 1), ("realme", 12.12, 0), ("16 Pro+", 12.74, 1)]),
    (15.14, 16.30, [("você", 15.14, 0), ("ser", 15.40, 0), ("o", 15.80, 0), ("ganhador?", 15.92, 1)]),
]
CLICKS = [next(t for w, t, k in h[2] if k) for h in HLS if h[0] != 8.10]   # sem clique no "celular" (muito perto da moto)
mv = lambda a: "410" if 2.4667 <= a < 9.0667 else "470"   # mais baixa: fora da estampa da camiseta (take 2 ela está mais perto)
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
