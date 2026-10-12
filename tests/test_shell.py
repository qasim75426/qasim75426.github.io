def test_shell_loads_clean(site):
    assert site.title() == "Qasim K."
    for sid in ["hero", "progress", "startup", "kde", "built", "life", "contact"]:
        assert site.locator(f"section#{sid}").count() == 1
    assert site.locator("#boot").count() == 0
    assert site.locator("#clock").count() == 0
    for sel in ["header.topbar", "dialog#panel", "#terminal"]:
        assert site.locator(sel).count() == 1
    assert site.console_errors == []
