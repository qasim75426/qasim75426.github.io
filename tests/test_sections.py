def test_timeline_order(site):
    markers = site.locator("#progress .milestone__marker").all_inner_texts()
    assert [" ".join(m.split()) for m in markers] == ["2019 age 10", "2020 age 11", "2024 age 15", "2024 age 15", "2025 age 15", "2026 age 16"]
    assert "Steady progress, fueled by passion." in site.locator("#progress h2").inner_text()


def test_startup(site):
    t = site.locator("#startup").inner_text()
    assert "Lumnitek" in t and "technical founder" in t and "Azure Function Apps" in t
    assert site.locator("#startup a[href*='lumnitek.com']").count() == 1


def test_kde_list(site):
    assert "(40)" in site.locator("#kde h2").inner_text()
    assert site.locator("#kde button.kde-row").count() == 6


def test_kde_preview_follows_keyboard(site):  # Review Focus 3
    rows = site.locator("#kde button.kde-row")
    rows.nth(0).focus()
    assert site.locator(".kde-preview img").is_visible()
    site.locator("#kde button.kde-row[data-id='kde-connect']").focus()
    assert site.locator(".kde-preview img").is_hidden()
    assert site.locator(".kde-preview__summary").is_visible()


def test_built(site):
    assert site.locator("#built article.project").count() == 3
    assert "Pi-Hole" in site.locator("#built .also").inner_text()


def test_read_the_code_does_not_open_panel(site):  # Review Focus 4
    card = site.locator("#built article.project").first
    with site.context.expect_page() as newp:
        card.get_by_role("link", name="Read the code").click()
    assert "github.com/User8395" in newp.value.url
    assert site.locator("dialog#panel[open]").count() == 0


def test_built_panel_returns_focus(site):  # Review Focus 4
    btn = site.locator("#built button.project__open").first
    btn.focus()
    site.keyboard.press("Enter")
    site.wait_for_selector("dialog#panel[open]")
    site.keyboard.press("Escape")
    site.wait_for_timeout(400)
    assert site.evaluate("document.activeElement.classList.contains('project__open')")


def test_life(site):
    t = site.locator("#life").inner_text()
    for w in ["homeschooled", "Cairo", "Woodworking", "Jordan", "Permaculture design", "Istanbul", "Calligraphy", "daf", "brisket", "pastrami", "jerky"]:
        assert w in t, w


def test_missing_photo_falls_back(page, base_url):  # Review Focus 5
    page.route("**/assets/photos/cairo.svg", lambda r: r.abort())
    page.goto(base_url)
    page.wait_for_selector("#life .trip img")
    page.locator("#life .trip img").first.scroll_into_view_if_needed()  # images are lazy: they only load (and fail) in view
    page.evaluate("document.querySelector('#life .trip img').src = 'assets/photos/missing-cairo.jpg'")
    page.wait_for_timeout(600)
    src = page.locator("#life .trip img").first.get_attribute("src")
    assert src.endswith("cairo.svg")
