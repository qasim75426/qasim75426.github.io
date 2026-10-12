import pytest


def open_at(browser, base_url, w, h, **kw):
    ctx = browser.new_context(viewport={"width": w, "height": h}, **kw)
    p = ctx.new_page()
    p.goto(base_url)
    p.wait_for_load_state("networkidle")
    return ctx, p


@pytest.mark.parametrize("w,h", [(375, 812), (768, 1024), (1440, 900)])
def test_no_horizontal_scroll(browser, base_url, w, h):
    ctx, p = open_at(browser, base_url, w, h)
    assert p.evaluate("document.documentElement.scrollWidth <= innerWidth")
    p.screenshot(path=f"tmp/shot-{w}.png", full_page=True)
    ctx.close()


def test_phone_panel_is_bottom_sheet(browser, base_url):
    ctx, p = open_at(browser, base_url, 375, 812)
    p.locator("#kde button.kde-row").first.click()
    p.wait_for_timeout(400)
    box = p.locator("#panel").bounding_box()
    assert box["y"] > 0
    assert abs(box["y"] + box["height"] - 812) < 2
    ctx.close()


def test_meta(site):
    assert site.locator("link[rel=icon]").count() == 1
    assert site.locator("meta[property='og:image']").count() == 1
    assert site.locator("meta[name=theme-color]").get_attribute("content") == "#ffffff"
    assert site.locator("html").get_attribute("lang") == "en"
    assert site.request.get(site.url + "assets/og.png").ok
    assert site.request.get(site.url + "assets/favicon.svg").ok


def test_hero_above_fold(browser, base_url):
    for w, h, sel in [(1440, 900, "#hero .hero__sub"), (375, 812, "#hero h1")]:
        ctx, p = open_at(browser, base_url, w, h)
        assert p.evaluate(f"document.querySelector('{sel}').getBoundingClientRect().bottom <= innerHeight"), (w, sel)
        ctx.close()


def test_contrast_tokens(site):
    pairs = site.evaluate("""(() => { const s = getComputedStyle(document.documentElement); const v = n => s.getPropertyValue(n).trim();
      const bgs = ['--paper', '--kde-tint', '--startup-tint', '--built-tint', '--life-tint', '--progress-tint', '--sun'];
      return bgs.flatMap(b => ['--ink', '--ink-soft', '--link'].map(f => [f, b, v(f), v(b)])); })()""")

    def lum(h):
        c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]

    for fn, bn, f, b in pairs:
        hi, lo = sorted([lum(f), lum(b)], reverse=True)
        assert (hi + 0.05) / (lo + 0.05) >= 4.5, (fn, bn)


def test_reduced_motion_chips_visible(browser, base_url):
    ctx, p = open_at(browser, base_url, 1280, 800, reduced_motion="reduce")
    assert p.evaluate("[...document.querySelectorAll('#hero .chip')].every(c => getComputedStyle(c).opacity === '1' && getComputedStyle(c).animationName === 'none')")
    ctx.close()


def test_phone_nav_collapses(browser, base_url):
    ctx, p = open_at(browser, base_url, 375, 812)
    assert p.locator(".topbar__nav").is_hidden()
    assert p.locator("header.topbar").get_by_role("link", name="Résumé").is_visible()
    ctx.close()


def test_share_image_and_favicon_are_light(site):
    import io
    from PIL import Image
    og = Image.open(io.BytesIO(site.request.get(site.url + "assets/og.png").body())).convert("RGB")
    assert og.size == (1200, 630)
    assert og.getpixel((8, 8)) == (255, 255, 255)
    fav = site.request.get(site.url + "assets/favicon.svg").text()
    assert "#ffc928" in fav.lower()


def test_scroll_to_top_on_mobile(browser, base_url):
    ctx, p = open_at(browser, base_url, 375, 812)
    btn = p.locator("button.to-top")
    assert btn.get_attribute("aria-label") == "Back to top"
    assert not p.evaluate("document.querySelector('.to-top').classList.contains('is-visible')")
    p.evaluate("document.getElementById('life').scrollIntoView({ behavior: 'instant' })")
    p.wait_for_function("document.querySelector('.to-top').classList.contains('is-visible')")
    btn.click()
    p.wait_for_function("scrollY === 0")
    ctx.close()
    ctx, p = open_at(browser, base_url, 1440, 900)
    assert p.locator("button.to-top").evaluate("b => getComputedStyle(b).display") == "none"
    ctx.close()
