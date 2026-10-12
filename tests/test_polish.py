"""Deferred minors from the bright-redesign review, fixed 2026-10-14."""
import pytest


def test_hero_says_kde_plasma(site):
    text = site.locator("#hero-title").inner_text()
    assert "KDE Plasma" in text and "KDE Linux" not in text


def test_hover_does_not_override_keyboard_preview(site):
    # Pointer resting over the KDE list while keyboard focus moves: the preview must follow focus.
    rows = site.locator("#kde button.kde-row")
    rows.nth(0).scroll_into_view_if_needed()
    box = rows.nth(4).bounding_box()
    site.mouse.move(box["x"] + 20, box["y"] + 10)   # hover row 05
    site.wait_for_timeout(100)
    rows.nth(5).focus()                             # keyboard on row 06 (lockscreen)
    site.evaluate("document.querySelectorAll('#kde button.kde-row')[4].dispatchEvent(new MouseEvent('mouseenter'))")
    src = site.locator(".kde-preview img").get_attribute("src")
    assert "plasma-mobile-664" in src, src


def test_preview_crossfades_between_screenshots(site):
    rows = site.locator("#kde button.kde-row")
    rows.nth(0).focus()
    site.wait_for_timeout(300)
    rows.nth(2).focus()  # both have screenshots
    running = site.evaluate("document.querySelector('.kde-preview img').getAnimations().length")
    assert running >= 1


@pytest.mark.parametrize("name", ["desk.JPG", "desk.png", "desk.avif"])
def test_any_photo_type_fills_desk_slot(page, base_url, name):
    page.route(f"**/assets/photos/{name}", lambda r: r.fulfill(status=200, content_type="image/png",
        body=bytes.fromhex("89504e470d0a1a0a0000000d4948445200000001000000010806000000"
                           "1f15c4890000000d49444154789c6360000002000154a24f5d0000000049454e44ae426082")))
    page.goto(base_url)
    page.evaluate(f"document.querySelector('.life__table img').src = 'assets/photos/{name}'")
    page.locator("#life").scroll_into_view_if_needed()
    page.wait_for_timeout(300)
    fit, display = page.evaluate("""(() => { const i = document.querySelector('.life__table img');
        return [getComputedStyle(i).objectFit, getComputedStyle(i.parentElement).display]; })()""")
    assert fit == "cover" and display != "none"


@pytest.mark.parametrize("old,section", [("lumnitek", "startup"), ("cs50x", "progress"), ("pi-hole", "built"), ("github", "contact")])
def test_old_deep_links_land_on_section(page, base_url, old, section):
    page.goto(base_url + "#" + old)
    page.wait_for_timeout(600)
    assert page.evaluate("location.hash") == "#" + section
    top, at_bottom = page.evaluate(f"""[document.getElementById('{section}').getBoundingClientRect().top,
        Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight]""")
    assert -5 <= top <= 200 or at_bottom  # the last section can't scroll above the page end


def test_kde_row_name_is_short_and_not_external(site):
    row = site.locator("#kde button.kde-row").first
    assert row.get_attribute("aria-label") == "Bluetooth settings for Bigscreen, plasma-bigscreen"
    assert "↗" not in row.inner_text()


def test_fixture_has_no_boot_leftovers():
    from pathlib import Path
    assert "bootSeen" not in (Path(__file__).parent / "conftest.py").read_text()
