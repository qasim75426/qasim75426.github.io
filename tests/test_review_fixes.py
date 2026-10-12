"""Regression tests for findings from the final whole-branch review."""


def test_no_js_content_not_covered(browser, base_url):  # review #1
    ctx = browser.new_context(java_script_enabled=False)
    p = ctx.new_page()
    p.goto(base_url)
    assert p.evaluate("document.elementFromPoint(200, 300).closest('#boot')") is None
    assert p.get_by_role("link", name="GitHub").is_visible()
    ctx.close()



def _open_first_kde(p):
    p.locator("#kde button.kde-row").first.click()
    p.wait_for_selector("dialog#panel[open]")


def test_double_click_close_stays_on_site(site, base_url):  # review #2
    site.goto(base_url + "?prev")
    site.goto(base_url)
    _open_first_kde(site)
    site.get_by_role("button", name="Close").dblclick()
    site.wait_for_timeout(600)
    assert "?prev" not in site.url
    assert site.locator("dialog#panel[open]").count() == 0


def test_esc_then_real_back_leaves_panel_closed(site, base_url):  # review #4
    site.goto(base_url + "?prev")
    site.goto(base_url)
    _open_first_kde(site)
    site.keyboard.press("Escape")
    site.wait_for_timeout(500)
    site.go_back()
    site.wait_for_timeout(300)
    assert "?prev" in site.url


def test_hash_deep_link_opens_panel_and_back_closes(site, base_url):  # review #3
    site.goto(base_url + "#polkit")
    site.wait_for_selector("dialog#panel[open]")
    assert site.locator("#panel-title").inner_text() == "Password prompt for the TV"
    site.go_back()
    site.wait_for_timeout(500)
    assert site.locator("dialog#panel[open]").count() == 0
    assert site.url.startswith(base_url)


def test_forward_after_back_reopens_panel(site):  # review #3
    _open_first_kde(site)
    site.go_back()
    site.wait_for_timeout(500)
    site.go_forward()
    site.wait_for_selector("dialog#panel[open]", timeout=1500)


def test_arrow_from_scrolled_page_starts_in_view(site):  # review #6
    site.evaluate("document.getElementById('contact').scrollIntoView({ behavior: 'instant' })")
    site.wait_for_timeout(200)
    y = site.evaluate("scrollY")
    site.keyboard.press("ArrowDown")
    site.wait_for_timeout(500)
    assert site.evaluate("document.activeElement.matches('[data-tile]')")
    assert site.evaluate("scrollY") >= y - 50


# ---- Final review of the bright redesign (2026-10-13) ----

import pytest

REACH_JS = """(async () => {
  const { nextTarget } = await import('./focus.js');
  const tiles = [...document.querySelectorAll('[data-tile]')].filter((t) => t.getClientRects().length);
  const seen = new Set([tiles[0]]); const queue = [tiles[0]];
  while (queue.length) {
    const t = queue.shift();
    for (const k of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) {
      const n = nextTarget(t, k, document.body);
      if (n && !seen.has(n)) { seen.add(n); queue.push(n); }
    }
  }
  return tiles.filter((t) => !seen.has(t)).map((t) => t.dataset.id || t.textContent.trim().slice(0, 40));
})()"""


@pytest.mark.parametrize("w", [375, 600, 800, 1024, 1440])
def test_every_tile_reachable_by_arrows(page, base_url, w):  # final review #1
    page.set_viewport_size({"width": w, "height": 800})
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    assert page.evaluate(REACH_JS) == []


def test_down_from_hero_reaches_startup_on_desktop(page, base_url):  # final review #2
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(base_url)
    page.locator("#see-kde").focus()
    page.keyboard.press("ArrowDown")
    assert page.evaluate("!!document.activeElement.closest('#startup')")
    page.locator("#kde button.kde-row").first.focus()
    page.keyboard.press("ArrowUp")
    assert page.evaluate("!!document.activeElement.closest('#startup')")


def test_hero_heading_reads_cleanly(site):  # final review #3
    name = site.locator("#hero-title").aria_snapshot()
    for word in ["logo", "badge", "frame drum"]:
        assert word not in name, name


def test_kde_all_link_is_public(site):  # final review #4
    href = site.locator("#kde a.kde__all").get_attribute("href")
    assert "/dashboard/" not in href and "sign_in" not in href


def test_card_body_opens_panel_links_do_not(site):  # final review #5
    # A real click on the summary text lands on the card's stretched hit area; force skips the "covered" check.
    site.locator("#built article.project .project__summary").first.click(force=True)
    site.wait_for_selector("dialog#panel[open]")
    site.keyboard.press("Escape")
    site.wait_for_timeout(400)
    with site.context.expect_page():
        site.locator("#built article.project").first.get_by_role("link", name="Read the code").click()
    assert site.locator("dialog#panel[open]").count() == 0
