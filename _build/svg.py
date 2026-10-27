# Genera los dos dibujos de ladrillos del sitio y los pega en index.html:
#  - DIAGRAM: ladrillos sueltos -> la carga del camión (cinta) -> la casita del logo armada
#  - BRICKHOUSE: la casita del pie, hecha de ladrillos trabados
# Uso: python _build/svg.py
import random, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
INK, CREAM, PALE, DEEP = '#15110d', '#ecebe7', '#f8c37a', '#db6a0b'
BW, BH, GAP = 22, 10, 3   # ladrillo y junta


def house_cells(x0, y0, cols, rows_wall, rows_roof):
    """Ladrillos trabados que llenan una casita: muro + techo a dos aguas."""
    cells = []
    total = rows_wall + rows_roof
    width = cols * (BW + GAP)
    for r in range(total):
        y = y0 + r * (BH + GAP)
        if r < rows_roof:  # techo: la fila se angosta hacia arriba
            frac = (r + 1) / (rows_roof + 0.6)
            w = width * frac
        else:
            w = width
        left = x0 + (width - w) / 2
        off = (BW + GAP) / 2 if r % 2 else 0
        x = left - off
        while x < left + w - 4:
            a, b = max(x, left), min(x + BW, left + w)
            if b - a > 5:
                cells.append((a, y, b - a, BH))
            x += BW + GAP
    return cells


def rect(x, y, w, h, fill, rot=None):
    t = f' transform="rotate({rot:.0f} {x + w / 2:.1f} {y + h / 2:.1f})"' if rot is not None else ''
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}"{t}/>'


def diagram(vertical=False):
    rnd = random.Random(2660)
    out = []
    if not vertical:
        W, H = 1200, 270
        # izquierda: sueltos
        for i in range(58):
            x, y = rnd.uniform(10, 360), rnd.uniform(20, 240)
            out.append(rect(x, y, BW, BH, rnd.choice([CREAM, PALE]), rnd.uniform(-60, 60)))
        # centro: cinta de tres hileras, apretada
        for r in range(3):
            y = 120 + r * (BH + 2)
            off = 11 if r % 2 else 0
            x = 420 - off
            while x < 780:
                out.append(rect(max(x, 420), y, min(BW, 780 - max(x, 420)), BH, CREAM if r != 1 else PALE))
                x += BW + 2
        # derecha: la casita armada en tinta
        for c in house_cells(870, 40, 11, 10, 7):
            out.append(rect(*c, INK))
        vb = f'0 0 {W} {H}'
        cls = 'dg dg-h'
    else:
        W, H = 360, 520
        for i in range(36):
            x, y = rnd.uniform(20, 340), rnd.uniform(10, 150)
            out.append(rect(x, y, BW, BH, rnd.choice([CREAM, PALE]), rnd.uniform(-60, 60)))
        for r in range(3):
            x = 160 + r * (BH + 2)
            for k in range(9):
                out.append(rect(x, 180 + k * (BW + 2) - (11 if r % 2 else 0), BH, BW, CREAM if r != 1 else PALE))
        for c in house_cells(55, 372, 10, 6, 5):
            out.append(rect(*c, INK))
        vb = f'0 0 {W} {H}'
        cls = 'dg dg-v'
    return f'<svg class="{cls}" viewBox="{vb}" role="img" aria-label="Ladrillos sueltos que se juntan en una carga y terminan formando una casa">' + ''.join(out) + '</svg>'


def brickhouse():
    cells = house_cells(0, 0, 9, 9, 7)
    w = 9 * (BW + GAP)
    h = 16 * (BH + GAP)
    rects = []
    for (x, y, cw, ch) in cells:
        # puerta: hueco en el centro abajo
        if y > h - 5 * (BH + GAP) and w / 2 - 30 < x + cw / 2 < w / 2 + 30:
            continue
        rects.append(rect(x, y, cw, ch, '#f29312'))
    return f'<svg class="brickhouse" viewBox="-4 -4 {w + 8:.0f} {h + 4:.0f}">' + ''.join(rects) + '</svg>'


def put(html, key, content):
    pat = re.compile(rf'<!--{key}-->.*?<!--/{key}-->', re.S)
    block = f'<!--{key}-->{content}<!--/{key}-->'
    if pat.search(html):
        return pat.sub(lambda m: block, html)
    return html.replace(f'<!--{key}-->', block)


p = ROOT / 'index.html'
html = p.read_text(encoding='utf-8')
html = put(html, 'DIAGRAM', diagram() + diagram(vertical=True))
html = put(html, 'BRICKHOUSE', brickhouse())
p.write_text(html, encoding='utf-8')
print('ok')
