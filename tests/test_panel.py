def open_first_kde(p):
    t = p.locator("#kde button.kde-row").first
    t.focus()
    p.keyboard.press("Enter")
    return t


def test_open_close_esc_returns_focus(site):
    t = open_first_kde(site)
    assert site.locator("dialog#panel[open]").is_visible()
    assert "— Qasim K." in site.title()
    site.keyboard.press("Escape")
    site.wait_for_timeout(400)
    assert site.locator("dialog#panel[open]").count() == 0
    assert site.title() == "Qasim K."
    assert site.evaluate("document.activeElement.dataset.id") == t.get_attribute("data-id")


def test_back_closes(site):
    open_first_kde(site)
    site.go_back()
    site.wait_for_timeout(400)
    assert site.locator("dialog#panel[open]").count() == 0


def test_esc_then_back_does_not_reopen(site):  # Review Focus 2
    open_first_kde(site)
    site.keyboard.press("Escape")
    site.wait_for_timeout(400)
    assert site.evaluate("location.hash") == ""
    assert not site.evaluate("history.state && history.state.panel")


def test_close_button(site):
    open_first_kde(site)
    site.get_by_role("button", name="Close").click()
    site.wait_for_timeout(400)
    assert site.locator("dialog#panel[open]").count() == 0


def test_tile_without_images(site):  # Review Focus 1
    site.locator("#kde button.kde-row[data-id='kde-connect']").click()
    assert site.locator("dialog#panel[open]").is_visible()
    assert site.locator("#panel figure").count() == 0
    assert site.locator("#panel img").count() == 0


def test_kde_panel_has_mr_link(site):
    open_first_kde(site)
    assert site.locator("#panel a[href*='invent.kde.org']").count() >= 1


def test_arrows_do_not_move_background_focus(site):
    open_first_kde(site)
    site.keyboard.press("ArrowRight")
    assert site.evaluate("!!document.activeElement.closest('#panel')")
