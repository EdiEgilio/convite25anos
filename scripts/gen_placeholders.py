"""Gera imagens placeholder em WebP com a proporcao correta para cada foto do site.
Rode uma unica vez; substitua os arquivos em assets/img/ pelas fotos reais quando tiver."""
from PIL import Image, ImageDraw, ImageFont
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "img")
os.makedirs(OUT_DIR, exist_ok=True)

# Paleta do site
IVORY = (247, 243, 236)
GRAPHITE = (27, 27, 29)
WINE = (122, 46, 59)
CHAMPAGNE = (198, 192, 180)
GOLD = (169, 139, 76)

IMAGES = [
    ("hero.webp", 1600, 2400, "CAPA"),
    ("historia-1.webp", 1000, 1250, "O ENCONTRO"),
    ("historia-2.webp", 1000, 1250, "O CASAMENTO"),
    ("historia-3.webp", 1000, 1250, "NASCIMENTO DA LARA"),
    ("historia-4.webp", 1000, 1250, "NASCIMENTO DO LUKE"),
    ("final.webp", 1200, 1500, "ENCERRAMENTO"),
]

def load_font(size):
    candidates = [
        r"C:\Windows\Fonts\georgia.ttf",
        r"C:\Windows\Fonts\arial.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()

for name, w, h, label in IMAGES:
    img = Image.new("RGB", (w, h), GRAPHITE)
    draw = ImageDraw.Draw(img)

    # gradiente diagonal simples entre grafite e vinho
    for y in range(h):
        t = y / h
        r = int(GRAPHITE[0] + (WINE[0] - GRAPHITE[0]) * t)
        g = int(GRAPHITE[1] + (WINE[1] - GRAPHITE[1]) * t)
        b = int(GRAPHITE[2] + (WINE[2] - GRAPHITE[2]) * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

    # moldura sutil
    border = max(6, w // 150)
    draw.rectangle([border, border, w - border, h - border], outline=CHAMPAGNE, width=2)

    # texto central
    title_font = load_font(max(28, w // 20))
    sub_font = load_font(max(16, w // 40))

    text1 = "EDI & DANI"
    text2 = label
    text3 = f"{w} x {h}"

    for text, font, dy, color in [
        (text1, title_font, -60, IVORY),
        (text2, sub_font, 30, CHAMPAGNE),
        (text3, sub_font, 90, GOLD),
    ]:
        bbox = draw.textbbox((0, 0), text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        x = (w - tw) / 2
        y = h / 2 + dy
        draw.text((x, y), text, font=font, fill=color)

    path = os.path.join(OUT_DIR, name)
    img.save(path, "WEBP", quality=82)
    print("gerado:", path)

print("Concluido.")
