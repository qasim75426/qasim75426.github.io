def open_term(p):
    p.keyboard.press("Shift+Backquote")
    return p.locator("#term-input")


def out(p):
    return p.locator(".term__out").inner_text()


def test_help_and_unknown(site):
    i = open_term(site)
    i.fill("help")
    i.press("Enter")
    assert "neofetch" in out(site)
    i.fill("sudo rm -rf /")
    i.press("Enter")
    assert "command not found: sudo. Try help." in out(site)


def test_neofetch_and_contact(site):
    i = open_term(site)
    i.fill("neofetch")
    i.press("Enter")
    assert "Contributions: 40 merged" in out(site)
    assert "Certs: PCEP, PCAP, Arduino" in out(site)
    i.fill("contact")
    i.press("Enter")
    assert "qasim75426@gmail.com" in out(site)


def test_ls_and_open_unknown(site):
    i = open_term(site)
    i.fill("ls")
    i.press("Enter")
    assert "bluetooth" in out(site)
    assert "fdroid-linux" in out(site)
    i.fill("open nope")
    i.press("Enter")
    assert "no such tile: nope. Try ls." in out(site)


def test_open_tile(site):
    tid = site.locator("#kde button.kde-row").first.get_attribute("data-id")
    i = open_term(site)
    i.fill(f"open {tid}")
    i.press("Enter")
    assert site.locator("dialog#panel[open]").is_visible()


def test_clear_and_exit(site):
    i = open_term(site)
    i.fill("help")
    i.press("Enter")
    i.fill("clear")
    i.press("Enter")
    assert out(site).strip() == ""
    i.fill("exit")
    i.press("Enter")
    assert site.locator("#terminal").is_hidden()


def test_typing_does_not_leak(site):  # Review Focus 3
    i = open_term(site)
    i.type("~")
    i.press("ArrowDown")
    i.press("ArrowRight")
    assert site.locator("#terminal").is_visible()
    assert site.evaluate("document.activeElement.id") == "term-input"
    assert i.input_value() == "~"


def test_esc_closes(site):
    open_term(site)
    site.keyboard.press("Escape")
    assert site.locator("#terminal").is_hidden()
