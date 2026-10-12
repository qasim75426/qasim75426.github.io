def test_hero(site):
    h1 = site.locator("h1#hero-title")
    assert h1.inner_text().startswith("Hi! I'm Qasim.")
    assert site.locator("#hero a.chip").count() == 5
    lines = [l.strip() for l in h1.inner_text().split("\n") if l.strip()]
    assert lines[0] == "Hi! I'm Qasim." and lines[-1] == "Oh, and I play the daf!"
    sub = site.locator(".hero__sub").inner_text()
    assert sub.startswith("I'm an open-source enthusiast.") and "40 of my changes" in sub


def test_see_kde_focuses_first_kde_entry(site):
    site.get_by_role("link", name="See my KDE work").click()
    assert site.evaluate("document.activeElement.closest('#kde') !== null")


def test_contact(site):
    c = site.locator("#contact")
    assert c.get_by_role("link", name="qasim75426@gmail.com").get_attribute("href") == "mailto:qasim75426@gmail.com"
    assert "Currently:" in c.inner_text()


def test_chip_never_splits_and_no_hscroll_at_320(browser, base_url):  # Review Focus 1
    ctx = browser.new_context(viewport={"width": 320, "height": 700})
    p = ctx.new_page()
    p.goto(base_url)
    p.wait_for_selector("#hero a.chip")
    assert p.evaluate("document.documentElement.scrollWidth <= innerWidth")
    assert p.evaluate("[...document.querySelectorAll('#hero .chip')].every(c => c.getClientRects().length === 1)")
    ctx.close()


def test_nav_target_not_under_header(site):  # Review Focus 2
    site.locator("header nav").get_by_role("link", name="Life").click()
    site.wait_for_timeout(900)
    assert site.evaluate("document.querySelector('#life h2').getBoundingClientRect().top >= document.querySelector('header.topbar').getBoundingClientRect().bottom")
