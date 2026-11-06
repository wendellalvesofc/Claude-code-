# Tela de "direct" (caixa de mensagens no modo escuro) presa na parede verde, chegando mensagens no trecho
# "o direct tá bombando". Interface genérica de mensagens (sem logotipo), nomes e avatares fictícios (iniciais),
# mensagens sem preço nem data para não criar informação errada.
# Saída: camada por quadro, usada por scripts/build.py
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

SS = 2                                   # supersampling
PW, PH = 560, 930                        # tamanho do painel (px do vídeo)
PX, PY = 45, 440                         # posição na parede, coordenadas do 1º quadro do plano
FONTS = "fonts"
def F(name, size): return ImageFont.truetype(f"{FONTS}/Poppins-{name}.ttf", size * SS)
EMO = ImageFont.truetype("/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf", 109)

MSGS = [  # (nome, mensagem, cor do avatar)
    ("Juliana M.", "Oi! Já começou a pré-Black? 😍", (233, 86, 120)),
    ("Rafa", "Qual o horário da loja hoje?", (90, 140, 240)),
    ("Bia", "Ainda tem o fone da promoção?", (250, 170, 60)),
    ("Lucas P.", "Vocês parcelam no boleto?", (80, 190, 140)),
    ("Carla", "Tô indo aí agora!!", (170, 100, 230)),
    ("Thiago", "Separa um pra mim 🙏", (240, 110, 70)),
    ("Duda", "Onde fica a loja?", (60, 180, 220)),
    ("Marcos V.", "Quero aproveitar a Black! 🔥", (230, 200, 60)),
]
T_IN = 0.06                               # painel aparece logo no início do plano
ARR = [0.30 + 0.33 * k for k in range(len(MSGS))]   # chegada de cada mensagem (s do plano)
SLIDE = 0.16
ROW, TOP = 104, 190

def is_emoji(ch): return ord(ch) > 0x2600
def emoji_img(e, h):
    im = Image.new("RGBA", (160, 160)); ImageDraw.Draw(im).text((0, 0), e, font=EMO, embedded_color=True)
    bb = im.getbbox(); im = im.crop(bb) if bb else im
    return im.resize((int(im.width * h / im.height), h), Image.LANCZOS)
def draw_text(img, d, xy, txt, font, fill, maxw):
    x, y = xy; asc = font.getmetrics()[0]
    # separa texto e emojis (sequências com ZWJ/seletores ficam juntas)
    parts, cur, em = [], "", ""
    for ch in txt:
        if is_emoji(ch) or ch in "‍️":
            if cur: parts.append(("t", cur)); cur = ""
            em += ch
        else:
            if em: parts.append(("e", em)); em = ""
            cur += ch
    if cur: parts.append(("t", cur))
    if em: parts.append(("e", em))
    for kind, s in parts:
        if kind == "t":
            w = d.textlength(s, font=font)
            if x + w > xy[0] + maxw:
                while s and x + d.textlength(s + "…", font=font) > xy[0] + maxw: s = s[:-1]
                d.text((x, y), s + "…", font=font, fill=fill); return
            d.text((x, y), s, font=font, fill=fill); x += w
        else:
            h = int(asc * 0.92); ei = emoji_img(s.split("‍")[0] if len(s) > 2 else s, h)
            img.alpha_composite(ei, (int(x), int(y + asc - h - asc * 0.05))); x += ei.width + 4 * SS

def rrect(d, box, r, fill): d.rounded_rectangle([v * SS for v in box], r * SS, fill=fill)

def panel(t):
    """RGBA do painel no tempo t (s do plano), em SS x"""
    img = Image.new("RGBA", (PW * SS, PH * SS), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    rrect(d, (0, 0, PW, PH), 46, (12, 12, 14, 245))
    n = sum(1 for a in ARR if t >= a)
    # barra de status e cabeçalho
    d.text((40 * SS, 26 * SS), "9:41", font=F("SemiBold", 22), fill=(255, 255, 255))
    for k in range(4): rrect(d, (PW - 120 + k * 9, 44 - k * 4, PW - 114 + k * 9, 50), 1, (255, 255, 255))
    rrect(d, (PW - 74, 34, PW - 40, 50), 4, (255, 255, 255))
    d.text((40 * SS, 78 * SS), "Mensagens", font=F("Bold", 34), fill=(255, 255, 255))
    if n:
        badge = str(n * 3 + 9) if n < len(MSGS) else "99+"
        bw = d.textlength(badge, font=F("Bold", 20)) / SS + 26
        bx = 40 + d.textlength("Mensagens", font=F("Bold", 34)) / SS + 14
        rrect(d, (bx, 88, bx + bw, 120), 16, (255, 48, 64))
        d.text(((bx + 13) * SS, 89 * SS), badge, font=F("Bold", 20), fill=(255, 255, 255))
    rrect(d, (32, 140, PW - 32, 180), 14, (38, 38, 42))
    d.text((60 * SS, 145 * SS), "Pesquisar", font=F("Medium", 20), fill=(140, 140, 146))
    # lista: a mais nova entra no topo e empurra as outras para baixo
    rows = img.copy(); rows.putalpha(0); rd = ImageDraw.Draw(rows)
    for j in range(n):
        k = n - 1 - j                                   # j = posição (0 = topo); k = índice da mensagem
        age = t - ARR[k]
        slide = min(1, (t - ARR[n - 1]) / SLIDE); slide = 1 - (1 - slide) ** 3
        y = TOP + 18 + (j - 1 + slide) * ROW if j > 0 else TOP + 18 - (1 - slide) * 40
        a = 1.0 if j > 0 else slide
        name, msg, col = MSGS[k]
        if age < 0.6:                                   # destaque da conversa que acabou de chegar
            hl = int(46 * (1 - age / 0.6) * a); rrect(rd, (14, y - 6, PW - 14, y + ROW - 10), 18, (60, 60, 70, hl))
        # avatar com anel colorido e iniciais
        cx, cy, r = 32 + 40, y + 44, 40
        rd.ellipse([(cx - r) * SS, (cy - r) * SS, (cx + r) * SS, (cy + r) * SS], fill=(255, 120, 80, int(255 * a)))
        rd.ellipse([(cx - r + 4) * SS, (cy - r + 4) * SS, (cx + r - 4) * SS, (cy + r - 4) * SS], fill=(12, 12, 14, int(255 * a)))
        rd.ellipse([(cx - r + 8) * SS, (cy - r + 8) * SS, (cx + r - 8) * SS, (cy + r - 8) * SS], fill=col + (int(255 * a),))
        ini = "".join(p[0] for p in name.replace(".", "").split()[:2]).upper()
        f = F("Bold", 24); iw = rd.textlength(ini, font=f)
        rd.text((cx * SS - iw / 2, (cy - 18) * SS), ini, font=f, fill=(255, 255, 255, int(255 * a)))
        unread = age < 2.5
        rd.text((134 * SS, (y + 12) * SS), name, font=F("Bold" if unread else "Medium", 23), fill=(255, 255, 255, int(255 * a)))
        draw_text(rows, rd, (134 * SS, (y + 46) * SS), msg + "  ·  agora", F("Bold" if unread else "Regular", 19),
                  (235, 235, 240, int(255 * a)) if unread else (150, 150, 156, int(255 * a)), (PW - 134 - 64) * SS)
        if unread: rd.ellipse([(PW - 50) * SS, (cy - 8) * SS, (PW - 34) * SS, (cy + 8) * SS], fill=(0, 149, 246, int(255 * a)))
    clip = Image.new("L", img.size, 0); ImageDraw.Draw(clip).rectangle([0, TOP * SS, PW * SS, (PH - 24) * SS], fill=255)
    ra = np.asarray(rows)[..., 3].astype(np.float32) * (np.asarray(clip) / 255.0)
    rows.putalpha(Image.fromarray(ra.astype(np.uint8)))
    img.alpha_composite(rows)
    return img

def layer(t):
    """camada BGR float 0..255 + alfa (1080x1920) no 1º quadro do plano; pop de entrada"""
    p = np.clip((t - T_IN) / 0.18, 0, 1)
    if p <= 0: return None
    s = 0.86 + 0.14 * (1 - (1 - p) ** 3)
    im = panel(t).resize((PW, PH), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32) / 255.0
    rgb, al = a[..., 2::-1] * 255, a[..., 3] * min(1, p * 1.6)
    out = np.zeros((1920, 1080, 3), np.float32); oa = np.zeros((1920, 1080), np.float32)
    # sombra suave na parede
    sh = np.zeros((1920, 1080), np.float32); cv2.rectangle(sh, (PX + 14, PY + 22), (PX + PW + 14, PY + PH + 22), 1, -1)
    sh = cv2.GaussianBlur(sh, (0, 0), 18) * 0.55 * min(1, p * 1.6)
    out[PY:PY + PH, PX:PX + PW] = rgb; oa[PY:PY + PH, PX:PX + PW] = al
    if s < 0.9999:
        c = (PX + PW / 2, PY + PH / 2); M = cv2.getRotationMatrix2D(c, 0, s)
        out = cv2.warpAffine(out, M, (1080, 1920)); oa = cv2.warpAffine(oa, M, (1080, 1920)); sh = cv2.warpAffine(sh, M, (1080, 1920))
    return out, oa, sh
