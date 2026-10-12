// TV-remote navigation: arrow keys move real DOM focus between [data-tile] elements anywhere on the page.

const KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const DIRS = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};
const CONE = Math.tan((60 * Math.PI) / 180);
const center = (el) => {
  const r = el.getBoundingClientRect();
  return [(r.left + r.right) / 2, (r.top + r.bottom) / 2];
};
const isVisible = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';

const BAND = 40; // px: candidates this close to the nearest one count as the same "row"

// Spatial navigation. Among [data-tile]s whose centre lies in the arrow's direction (60° cone):
// 1. find the nearest ones by edge-to-edge gap along the arrow (the next "row" or "column"),
// 2. among those, take the one best aligned sideways.
// Edge gaps (not centres) keep long titles and short links in one column from skipping each other,
// and the banding keeps a narrow side panel (e.g. the Startup box) from being jumped over.
export function nextTarget(current, key, root) {
  const [dx, dy] = DIRS[key];
  const a = current.getBoundingClientRect();
  const [cx, cy] = center(current);
  const cands = [];
  for (const tile of root.querySelectorAll('[data-tile]')) {
    if (tile === current || !isVisible(tile)) continue;
    const [tx, ty] = center(tile);
    const primary = dx ? (tx - cx) * dx : (ty - cy) * dy;
    const crossCentre = Math.abs(dx ? ty - cy : tx - cx);
    if (primary <= 4 || crossCentre > primary * CONE) continue;
    const b = tile.getBoundingClientRect();
    const edge = Math.max(0, dx > 0 ? b.left - a.right : dx < 0 ? a.left - b.right : dy > 0 ? b.top - a.bottom : a.top - b.bottom);
    const crossGap = dx
      ? Math.max(0, b.top - a.bottom, a.top - b.bottom)
      : Math.max(0, b.left - a.right, a.left - b.right);
    cands.push({ tile, edge, crossGap, crossCentre });
  }
  if (!cands.length) return null;
  const nearest = Math.min(...cands.map((c) => c.edge));
  return cands
    .filter((c) => c.edge <= nearest + BAND)
    .sort((m, n) => m.crossGap - n.crossGap || m.crossCentre - n.crossCentre)[0].tile;
}

function firstInView(root) {
  // Ignore anything tucked under the sticky header (the page's scroll-padding-top).
  const top = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  for (const tile of root.querySelectorAll('[data-tile]')) {
    const r = tile.getBoundingClientRect();
    if (r.top >= top && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && isVisible(tile)) return tile;
  }
  return root.querySelector('#see-kde');
}

export function initFocus(root) {
  document.addEventListener('keydown', (e) => {
    if (!KEYS.has(e.key) || e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target;
    if (t.closest?.('input, textarea, select, dialog[open], #terminal')) return;
    if (document.querySelector('dialog[open]')) return;

    const active = document.activeElement;
    const next = active?.matches?.('[data-tile]')
      ? nextTarget(active, e.key, root)
      : firstInView(root);
    if (!next) return;

    e.preventDefault();
    next.focus({ preventScroll: true });
    next.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
  });
}
