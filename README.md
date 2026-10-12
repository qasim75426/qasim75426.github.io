# Qasim K. — portfolio

A bright, single-page portfolio. Plain HTML, CSS and JavaScript modules, no build step. Arrow keys move around the page like a TV remote, and pressing `~` opens a small terminal.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. (Opening `index.html` directly from disk won't work because ES modules need a server.)

## Edit content

Everything on the page comes from `data.js`, grouped by section:

- `profile`: the hero sentence (plain strings and linked "chips"), the supporting line, email, links and the "Currently:" status line
- `milestones` and `progressNote`: the Steady progress timeline
- `startup`: the Lumnitek section
- `kde`: the (40) merged-changes list; each entry opens a detail panel. Screenshots are in `assets/kde/`
- `built`: project cards and the "Also" line
- `life`: homeschooling intro, travel cards and hobbies

### Adding real photos

Every photo slot uses a placeholder icon from `assets/photos/`. To use a real photo, put it in `assets/photos/` (for example `cairo.jpg`) and change that slot's `src` in `data.js`, keeping its `fallback`:

```js
image: { src: 'assets/photos/cairo.jpg', alt: 'Carving wood at a workshop in Cairo', fallback: 'assets/photos/cairo.svg' }
```

If the photo ever fails to load, the placeholder shows instead. The wide desk photo (`life.table`) stays hidden until it points at a real photo.

## Tests

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
.venv/bin/playwright install chromium
.venv/bin/pytest -q
```

## Deploy to GitHub Pages

Push this repo to GitHub, then in the repo's Settings → Pages choose "Deploy from a branch", branch `main`, folder `/ (root)`. Naming the repo `User8395.github.io` serves it at https://user8395.github.io.
