// Detail panel: a modal <dialog> that slides in when a tile is chosen. Back, Esc and Close all dismiss it.

const SITE_TITLE = 'Qasim K.';
const ANIMATION_MS = 280;

let dialog;
let tilesById = new Map();
let opener = null;
let skipNextPop = false;
let closing = false;

const el = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  node.append(...children.filter(Boolean));
  return node;
};

function fill(tile) {
  const closeBtn = el('button', { type: 'button', class: 'panel__close', text: 'Close' });
  closeBtn.addEventListener('click', closePanel);

  dialog.replaceChildren(
    el('div', { class: 'panel__inner' },
      closeBtn,
      el('h2', { id: 'panel-title', class: 'panel__title', text: tile.title }),
      el('p', { class: 'panel__summary', text: tile.summary }),
      tile.images.length
        ? el('div', { class: 'panel__gallery' }, ...tile.images.map((img) => {
            const image = el('img', { src: img.src, alt: img.alt, loading: 'lazy', decoding: 'async' });
            const fig = el('figure', { class: 'panel__figure' }, image);
            image.addEventListener('error', () => fig.remove());
            return fig;
          }))
        : null,
      el('p', { class: 'panel__body', text: tile.body }),
      tile.why ? el('p', { class: 'panel__why', text: tile.why }) : null,
      tile.tech.length
        ? el('ul', { class: 'panel__tech', 'aria-label': 'Built with' }, ...tile.tech.map((t) => el('li', { text: t })))
        : null,
      tile.links.length
        ? el('ul', { class: 'panel__links', 'aria-label': 'Links' }, ...tile.links.map((l) =>
            el('li', {}, el('a', { href: l.href, target: '_blank', rel: 'noopener', text: l.label }))))
        : null,
    ),
  );
}

function finishClose() {
  if (!dialog.open) return;
  closing = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  dialog.classList.add('is-closing');
  setTimeout(() => {
    closing = false;
    dialog.classList.remove('is-closing');
    dialog.close();
    document.title = SITE_TITLE;
    opener?.focus({ preventScroll: true });
    opener = null;
  }, reduce ? 0 : ANIMATION_MS);
}

export function openTile(id, { push = true } = {}) {
  const tile = tilesById.get(id);
  if (!tile) return false;
  if (dialog.open && !closing) {
    fill(tile);
    history.replaceState({ panel: id }, '', `#${id}`);
  } else {
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    fill(tile);
    if (!dialog.open) dialog.showModal();
    if (push) history.pushState({ panel: id }, '', `#${id}`);
  }
  document.title = `${tile.title} — ${SITE_TITLE}`;
  return true;
}

export function closePanel() {
  if (!dialog.open || closing) return;
  if (history.state?.panel) {
    // Consume the history entry openTile pushed, so Back doesn't land on a stale "#tile" URL.
    skipNextPop = true;
    history.back();
  }
  finishClose();
}

export function initPanel({ dialog: dialogEl, entries }) {
  dialog = dialogEl;
  tilesById = new Map(entries.map((t) => [t.id, t]));

  document.addEventListener('click', (e) => {
    const tile = e.target.closest?.('button[data-id]');
    if (tile) openTile(tile.dataset.id);
  });

  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    closePanel();
  });
  // Clicking the dimmed backdrop (the dialog element itself, outside .panel__inner) closes it.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) closePanel();
  });

  addEventListener('popstate', () => {
    if (skipNextPop) {
      skipNextPop = false;
      return;
    }
    const id = history.state?.panel;
    if (id && (!dialog.open || closing)) openTile(id, { push: false });
    else if (!id && !openFromHash() && dialog.open) finishClose();
  });

  openFromHash();
}

// A #tile-id link (on load or typed into the address bar): swap it for a clean entry,
// then open normally so Back closes the panel instead of leaving the site.
function openFromHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!tilesById.has(id)) return false;
  history.replaceState(null, '', location.pathname + location.search);
  openTile(id);
  return true;
}
