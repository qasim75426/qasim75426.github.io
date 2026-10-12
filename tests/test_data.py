import re


def load(site):
    return site.evaluate("import('/data.js').then(m => JSON.parse(JSON.stringify(m)))")


def test_shape(site):
    d = load(site)
    assert set(d) >= {"profile", "milestones", "startup", "kde", "built", "life"}
    assert [(m["marker"], m.get("age")) for m in d["milestones"]] == [("2019", 10), ("2020", 11), ("2024", 15), ("2024", 15), ("2025", 15), ("2026", 16)]
    assert d["kde"]["count"] == 40 and len(d["kde"]["entries"]) == 6
    assert len(d["built"]["projects"]) == 3
    assert [t["city"] for t in d["life"]["trips"]] == ["Cairo", "Jordan", "Istanbul"]
    assert all(t["href"].startswith("https://") for t in d["life"]["trips"])
    assert [t["craft"].lower() for t in d["life"]["trips"]] == ["woodworking", "permaculture design", "calligraphy"]
    ids = [e["id"] for e in d["kde"]["entries"] + d["built"]["projects"]]
    assert len(ids) == len(set(ids))


def test_hero_copy(site):
    p = load(site)["profile"]
    text = " ".join(x if isinstance(x, str) else x.get("text", "|") for x in p["hero"])
    assert p["greeting"] == "Hi! I'm Qasim."
    assert " ".join(text.split()).replace(" ,", ",") .replace(" !", "!") == "I code in Python and C, ship code to KDE Plasma Bigscreen (TV for Linux), worked at Lumnitek (an EdTech startup), and I'm certified in Python and Arduino (a microcontroller platform). | Oh, and I play the daf!"
    assert [c["href"] for c in p["hero"] if isinstance(c, dict) and "href" in c] == ["#built", "#kde", "#startup", "#progress", "#life"]


def test_accuracy_rules(site):
    blob = site.evaluate("import('/data.js').then(m => JSON.stringify(m))")
    assert "456-4321" not in blob
    assert not re.search(r"I'm \d+|\d+ years old", blob)
    d = load(site)
    s = d["startup"]
    assert "technical founder" in s["body"] and "Azure Function Apps" in s["body"]
    assert "Python" not in s["stack"]
    for img in [c["image"] for c in d["profile"]["hero"] if isinstance(c, dict) and "image" in c]:
        assert img["alt"] and img["fallback"].endswith(".svg")
