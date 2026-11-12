# Gera etiqueta de preço 19 x 4 cm (realme P4 Power) em PDF, centralizada numa folha A4
# para que a impressora não corte as bordas.
# Uso: python3 gerar_etiqueta.py [preco] [parcelas]   ex.: python3 gerar_etiqueta.py 3.947 12
import sys
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

PRECO = sys.argv[1] if len(sys.argv) > 1 else "3.947"
PARCELAS = sys.argv[2] if len(sys.argv) > 2 else "12"
valor_parcela = int(PRECO.replace(".", "")) / int(PARCELAS)
PARCELA_FMT = f"{valor_parcela:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
SAIDA = "etiqueta_realme_p4_power.pdf"

F = "/usr/share/fonts/truetype/liberation/"
pdfmetrics.registerFont(TTFont("Reg", F + "LiberationSans-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Bold", F + "LiberationSans-Bold.ttf"))

W, H = 190 * mm, 40 * mm          # tamanho da etiqueta
PW, PH = A4
OX, OY = (PW - W) / 2, PH - 20 * mm - H   # posição: centralizada, 2 cm do topo
TEXTO = HexColor("#1a1a1a")

c = canvas.Canvas(SAIDA, pagesize=A4)
c.setTitle("Etiqueta realme P4 Power")
c.translate(OX, OY)

# Moldura (linha de corte = borda externa)
c.setStrokeColor(black); c.setLineWidth(2.2)
c.roundRect(0.6 * mm, 0.6 * mm, W - 1.2 * mm, H - 1.2 * mm, 1.2 * mm, stroke=1, fill=0)

x0 = 6 * mm
# Título + selo 5G
c.setFillColor(TEXTO); c.setFont("Bold", 17)
titulo = "realme P4 Power"
ty = H - 9.5 * mm
c.drawString(x0, ty, titulo)
tw = pdfmetrics.stringWidth(titulo, "Bold", 17)
px = x0 + tw + 2 * mm
c.setStrokeColor(TEXTO); c.setLineWidth(0.8)
c.roundRect(px, ty - 0.3 * mm, 6.8 * mm, 3.9 * mm, 1.95 * mm, stroke=1, fill=0)
c.setFont("Bold", 6.5); c.drawCentredString(px + 3.4 * mm, ty + 0.75 * mm, "5G")

SEP = 3.2 * mm
def separador(x, y, size):
    c.setFont("Reg", size); c.drawString(x + SEP - 0.6 * mm, y, "|")
    return x + 2 * SEP

def texto(x, y, t, font="Reg", size=7):
    c.setFont(font, size); c.drawString(x, y, t)
    return x + pdfmetrics.stringWidth(t, font, size)

# Linha 1 de características
y1 = H - 26 * mm
x = texto(x0, y1, "Bateria Gigante de 10001mAh")
x = separador(x, y1, 7)
x = texto(x, y1, "Carregamento Ultra 80W")
x = separador(x, y1, 7)
texto(x, y1, "Câmera Sony 50MP com OIS")

# Linha 2: cores + características
y2 = H - 35.5 * mm
x = x0
for nome, cor in [("Flash Silver", "#c9cacc"), ("Flash Orange", "#f26a1b")]:
    c.setFillColor(HexColor(cor)); c.setStrokeColor(HexColor("#9a9a9a")); c.setLineWidth(0.4)
    c.circle(x + 1.2 * mm, y2 + 0.85 * mm, 1.2 * mm, stroke=1, fill=1)
    c.setFillColor(TEXTO)
    x = texto(x + 3.3 * mm, y2, nome, "Bold", 7) + 3 * mm
x -= 3 * mm
x = separador(x, y2, 7)
x = texto(x, y2, "Chipset MediaTek Dimensity 7400 Ultra 5G")
x = separador(x, y2, 7)
texto(x, y2, "Tela 144Hz HyperGlow 4D Curve+")

# Quadro de preço (igual à referência: canto superior direito, compacto)
bw, bh = 44 * mm, 15.5 * mm
bx, by = W - 5.5 * mm - bw, H - 3 * mm - bh
c.setFillColor(black); c.roundRect(bx, by, bw, bh, 1.5 * mm, stroke=0, fill=1)
cx = bx + bw / 2
c.setFillColor(white)
c.setFont("Bold", 8.5); c.drawCentredString(cx, by + bh - 4.2 * mm, "256GB + 8GB")
c.setFont("Reg", 6); c.drawCentredString(cx, by + bh - 6.9 * mm, f"em {PARCELAS}x de R$ {PARCELA_FMT}")
rs, num, cent = "R$", PRECO, ",00"
w_rs = pdfmetrics.stringWidth(rs, "Bold", 8)
w_num = pdfmetrics.stringWidth(num, "Bold", 20)
w_cent = pdfmetrics.stringWidth(cent, "Bold", 7)
tot = w_rs + 0.7 * mm + w_num + 0.4 * mm + w_cent
sx, sy = cx - tot / 2, by + 2 * mm
c.setFont("Bold", 8); c.drawString(sx, sy, rs)
c.setFont("Bold", 20); c.drawString(sx + w_rs + 0.7 * mm, sy, num)
c.setFont("Bold", 7); c.drawString(sx + w_rs + 0.7 * mm + w_num + 0.4 * mm, sy + 8, cent)

c.showPage(); c.save()
print("OK:", SAIDA)
