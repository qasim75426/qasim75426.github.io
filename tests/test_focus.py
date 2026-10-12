def fid(p):
    return p.evaluate("document.activeElement.dataset.id || document.activeElement.textContent.trim().slice(0, 30)")


def test_down_from_hero_moves_below(site):
    b = site.locator("#see-kde")
    b.focus()
    top0 = site.evaluate("document.querySelector('#see-kde').getBoundingClientRect().top + scrollY")
    site.keyboard.press("ArrowDown")
    assert site.evaluate("document.activeElement.id") != "see-kde"
    assert site.evaluate("document.activeElement.getBoundingClientRect().top + scrollY") > top0


def test_right_in_built_grid(site):
    first = site.locator("#built button.project__open").first
    first.scroll_into_view_if_needed()
    first.focus()
    x0 = first.bounding_box()["x"]
    site.keyboard.press("ArrowRight")
    x, inside = site.evaluate("(() => { const r = document.activeElement.getBoundingClientRect(); return [r.x, !!document.activeElement.closest('#built')]; })()")
    assert inside and x > x0


def test_down_up_kde_list(site):
    rows = site.locator("#kde button.kde-row")
    rows.nth(0).focus()
    site.keyboard.press("ArrowDown")
    assert fid(site) == rows.nth(1).get_attribute("data-id")
    site.keyboard.press("ArrowUp")
    assert fid(site) == rows.nth(0).get_attribute("data-id")


def test_arrow_with_nothing_focused_picks_visible(site):
    site.keyboard.press("ArrowDown")
    assert site.evaluate("document.activeElement.matches('[data-tile]')")


def test_start_ignores_tile_under_sticky_header(site):
    # Put KDE row 03 so its top sits 20px below the viewport top: hidden behind the sticky header.
    site.evaluate("""(() => { const r = document.querySelectorAll('#kde button.kde-row')[2];
        scrollTo({ top: r.getBoundingClientRect().top + scrollY - 20, behavior: 'instant' }); })()""")
    y = site.evaluate("scrollY")
    site.keyboard.press("ArrowDown")
    site.wait_for_timeout(500)
    assert site.evaluate("document.activeElement.dataset.id") != site.locator("#kde button.kde-row").nth(2).get_attribute("data-id")
    assert site.evaluate("scrollY") >= y - 2
