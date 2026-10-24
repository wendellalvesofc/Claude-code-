# Gera etiqueta de preço 19 x 4 cm (realme P4 Power) em PDF.
# Uso: python3 gerar_etiqueta.py [preco] [parcelas]   ex.: python3 gerar_etiqueta.py 2.499 10
import sys
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

PRECO = sys.argv[1] if len(sys.argv) > 1 else "X.XXX"
PARCELAS = sys.argv[2] if len(sys.argv) > 2 else "10"
SAIDA = "etiqueta_realme_p4_power.pdf"

F = "/usr/share/fonts/truetype/liberation/"
pdfmetrics.registerFont(TTFont("Reg", F + "LiberationSans-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Bold", F + "LiberationSans-Bold.ttf"))

W, H = 190 * mm, 40 * mm
ESCURO = HexColor("#3a3634")
CAIXA = HexColor("#5b524c")
TEXTO = HexColor("#2b2b2b")

c = canvas.Canvas(SAIDA, pagesize=(W, H))
c.setTitle("Etiqueta realme P4 Power")

# Fundo e moldura
c.setFillColor(HexColor("#ffffff")); c.rect(0, 0, W, H, stroke=0, fill=1)
c.setStrokeColor(ESCURO); c.setLineWidth(1.6)
c.roundRect(2 * mm, 2 * mm, W - 4 * mm, H - 4 * mm, 1.5 * mm, stroke=1, fill=0)

x0 = 7 * mm
# Título + selo 5G
c.setFillColor(TEXTO); c.setFont("Bold", 21)
titulo = "realme P4 Power"
c.drawString(x0, H - 13 * mm, titulo)
tw = pdfmetrics.stringWidth(titulo, "Bold", 21)
px, py = x0 + tw + 2.5 * mm, H - 13 * mm
c.setLineWidth(0.8)
c.roundRect(px, py, 7.5 * mm, 4.2 * mm, 2.1 * mm, stroke=1, fill=0)
c.setFont("Bold", 7); c.drawCentredString(px + 3.75 * mm, py + 1.2 * mm, "5G")

def linha(y, itens, font="Reg", size=7.2):
    x = x0
    for i, t in enumerate(itens):
        if i:
            c.setFont("Reg", size); c.drawString(x + 1.6 * mm, y, "|"); x += 4.2 * mm
        c.setFont(font, size); c.drawString(x, y, t)
        x += pdfmetrics.stringWidth(t, font, size)

c.setFillColor(TEXTO)
linha(H - 21 * mm, ["Bateria Gigante de 10001mAh", "Carregamento Ultra 80W",
                    "Câmera Sony 50MP com OIS"])
linha(H - 26 * mm, ["Chipset MediaTek Dimensity 7400 Ultra 5G",
                    "Tela 144Hz HyperGlow 4D Curve+"])

# Cores
y = H - 32.5 * mm; x = x0
for nome, cor in [("Prata Power", "#c9cacc"), ("Laranja Flash", "#f26a1b")]:
    c.setFillColor(HexColor(cor)); c.setStrokeColor(HexColor("#9a9a9a")); c.setLineWidth(0.4)
    c.circle(x + 1.3 * mm, y + 0.9 * mm, 1.3 * mm, stroke=1, fill=1)
    c.setFillColor(TEXTO); c.setFont("Bold", 7)
    c.drawString(x + 3.6 * mm, y, nome)
    x += 3.6 * mm + pdfmetrics.stringWidth(nome, "Bold", 7) + 4 * mm

# Caixa de preço
bw, bh = 40 * mm, 27 * mm
bx, by = W - 7 * mm - bw, (H - bh) / 2
c.setFillColor(CAIXA); c.roundRect(bx, by, bw, bh, 2 * mm, stroke=0, fill=1)
cx = bx + bw / 2
c.setFillColor(white)
c.setFont("Bold", 8.5); c.drawCentredString(cx, by + bh - 6.5 * mm, "256GB + 8GB")
c.setFont("Reg", 6); c.drawCentredString(cx, by + bh - 9.6 * mm, f"em {PARCELAS}x")
rs, num, cent = "R$", PRECO, ",00"
w_rs = pdfmetrics.stringWidth(rs, "Bold", 9)
w_num = pdfmetrics.stringWidth(num, "Bold", 24)
w_cent = pdfmetrics.stringWidth(cent, "Bold", 8)
tot = w_rs + 0.8 * mm + w_num + 0.5 * mm + w_cent
sx, sy = cx - tot / 2, by + 6 * mm
c.setFont("Bold", 9); c.drawString(sx, sy, rs)
c.setFont("Bold", 24); c.drawString(sx + w_rs + 0.8 * mm, sy, num)
c.setFont("Bold", 8); c.drawString(sx + w_rs + 0.8 * mm + w_num + 0.5 * mm, sy + 9.5, cent)

c.showPage(); c.save()
print("OK:", SAIDA)
