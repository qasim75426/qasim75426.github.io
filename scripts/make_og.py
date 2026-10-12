"""Render assets/og.png (1200x630 social preview) with the site's own font and colors.

Run: .venv/bin/python -I scripts/make_og.py
"""
import base64
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
FONT = base64.b64encode((ROOT / "assets/fonts/Archivo.woff2").read_bytes()).decode()
HTML = f"""<!doctype html><html><head><style>
@font-face {{ font-family: Archivo; src: url(data:font/woff2;base64,{FONT}) format('woff2'); font-weight: 100 900; font-stretch: 62% 125%; }}
body {{ margin: 0; width: 1200px; height: 630px; background: #ffffff; color: #16203a; font-family: Archivo; position: relative; }}
.wrap {{ padding: 84px 88px; }}
h1 {{ margin: 0; font-size: 92px; font-weight: 800; line-height: 1; letter-spacing: -0.02em; }}
p {{ margin: 32px 0 0; max-width: 24ch; font-size: 40px; font-weight: 600; line-height: 1.2; }}
.dots {{ position: absolute; left: 88px; bottom: 72px; display: flex; gap: 14px; }}
.dots span {{ width: 28px; height: 28px; border-radius: 50%; }}
</style></head><body><div class="wrap"><h1>Hi! I'm Qasim.</h1>
<p>I build software for TVs, phones, and Linux. 40 changes merged into KDE.</p></div>
<div class="dots"><span style="background:#ffc928"></span><span style="background:#1d99f3"></span><span style="background:#1fae6b"></span><span style="background:#ff5c8a"></span><span style="background:#7a5cff"></span></div></body></html>"""

with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page(viewport={"width": 1200, "height": 630})
    page.set_content(HTML)
    page.evaluate("document.fonts.ready.then(() => document.fonts.check('700 84px Archivo'))")
    page.wait_for_timeout(200)
    page.screenshot(path=str(ROOT / "assets/og.png"))
    b.close()
