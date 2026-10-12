"""Download screenshots from Qasim's KDE merge requests into assets/kde/ as WebP.

Run: .venv/bin/python -I scripts/fetch_screenshots.py
"""
import io
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

MRS = [
    "plasma/plasma-keyboard!170",
    "plasma/polkit-kde-agent-1!61",
    "plasma/plasma-bigscreen!227",
    "plasma/plasma-bigscreen!226",
    "plasma/plank-player!16",
    "plasma/plasma-keyboard!39",
    "plasma/plasma-bigscreen!153",
    "network/kdeconnect-android!540",
    "plasma/plasma-mobile!664",
]
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "kde"
IMG_RE = re.compile(r'!\[[^\]]*\]\(([^)\s]+)|<img[^>]+src="([^"]+)"')


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "qasim-portfolio-build"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for ref in MRS:
        path, iid = ref.split("!")
        api = f"https://invent.kde.org/api/v4/projects/{urllib.parse.quote(path, safe='')}/merge_requests/{iid}"
        mr = json.loads(get(api))
        desc = mr["description"] or ""
        urls = [a or b for a, b in IMG_RE.findall(desc)]
        for n, url in enumerate(urls, 1):
            if url.startswith("/uploads/"):
                url = f"https://invent.kde.org/-/project/{mr['project_id']}{url}"
            elif url.startswith("/"):
                url = f"https://invent.kde.org{url}"
            try:
                img = Image.open(io.BytesIO(get(url)))
            except Exception as e:  # videos and other non-images in the description
                print("skip", url, type(e).__name__)
                continue
            img = img.convert("RGBA" if img.mode in ("RGBA", "LA", "P") else "RGB")
            if img.width > 1280:
                img = img.resize((1280, round(img.height * 1280 / img.width)), Image.LANCZOS)
            name = f"{path.split('/')[1]}-{iid}-{n}.webp"
            img.save(OUT / name, "WEBP", quality=80)
            print(name, img.size)


if __name__ == "__main__":
    main()
