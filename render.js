// Builds each page section from data.js. Knows the data shape and the DOM, nothing about keys.

export const el = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'style') node.style.cssText = v;
    else node.setAttribute(k, v === true ? '' : v);
  }
  node.append(...children.filter((c) => c !== null && c !== undefined && c !== false));
  return node;
};

// Swap a broken image for its placeholder, once. If the placeholder fails too, leave it.
export function attachFallback(img, fallback) {
  if (!fallback) return;
  img.addEventListener('error', () => {
    if (!img.getAttribute('src').endsWith(fallback)) img.src = fallback;
  });
}

export function image({ src, alt, fallback }, attrs = {}) {
  const img = el('img', { src, alt, loading: 'lazy', decoding: 'async', ...attrs });
  attachFallback(img, fallback);
  return img;
}

export function sectionHead(id, title, sub) {
  return el('div', { class: 'section__head' },
    el('span', { class: 'section__marker', 'aria-hidden': 'true' }),
    el('h2', { class: 'section__title', id: `${id}-title` }, ...[].concat(title)),
    sub ? el('p', { class: 'section__sub', text: sub }) : null,
  );
}

export function renderHero(profile, root) {
  // Leading punctuation after a chip ("startup" + ", and I'm") stays glued to the chip so it can't wrap alone.
  const sentence = [];
  let chipIndex = 0;
  profile.hero.forEach((part, i) => {
    if (part && part.br) { sentence.push(el('br')); return; }
    if (typeof part !== 'string') {
      const next = profile.hero[i + 1];
      const glue = typeof next === 'string' ? (next.match(/^[,.;:!?]+/) || [''])[0] : '';
      sentence.push(' ', el('a', { class: 'chip', href: part.href, 'data-tile': true, style: `--i: ${chipIndex++}` },
        image(part.image, { class: 'chip__img', loading: 'eager', width: '64', height: '64', alt: '' }), // the word beside it says the same thing
        el('span', { class: 'chip__word', text: part.text }),
        glue ? el('span', { class: 'chip__glue', text: glue }) : null,
      ));
      return;
    }
    const prev = profile.hero[i - 1];
    const text = prev && typeof prev !== 'string' ? part.replace(/^[,.;:!?]+/, '') : part;
    if (text.trim()) sentence.push(` ${text.trim()}`);
  });

  root.replaceChildren(
    el('h1', { class: 'hero__title', id: 'hero-title' },
      el('strong', { text: profile.greeting }),
      el('br'),
      ...sentence.map((x) => (typeof x === 'string' ? document.createTextNode(x) : x)),
    ),
    el('p', { class: 'hero__sub', text: profile.sub }),
    el('div', { class: 'hero__actions' },
      el('a', { id: 'see-kde', class: 'button button--sun', href: '#kde', 'data-tile': true, text: 'See my KDE work' }),
      el('a', { class: 'button', href: profile.links.resume, target: '_blank', rel: 'noopener', 'data-tile': true, text: 'Résumé' }),
    ),
  );
}

export function renderContact(profile, root) {
  root.replaceChildren(
    sectionHead('contact', 'Say hi.'),
    el('a', { class: 'contact__email', href: `mailto:${profile.email}`, 'data-tile': true, text: profile.email }),
    el('ul', { class: 'contact__links' },
      el('li', {}, el('a', { class: 'button', href: profile.links.github, target: '_blank', rel: 'noopener', 'data-tile': true, text: 'GitHub' })),
      el('li', {}, el('a', { class: 'button', href: profile.links.kde, target: '_blank', rel: 'noopener', 'data-tile': true, text: 'KDE Invent' })),
      el('li', {}, el('a', { class: 'button', href: profile.links.resume, target: '_blank', rel: 'noopener', 'data-tile': true, text: 'Résumé' })),
    ),
    el('p', { class: 'contact__status', text: profile.status }),
    el('footer', { class: 'footer' },
      el('span', { text: `© ${new Date().getFullYear()} ${profile.name}` }),
    ),
  );
}

export function renderMilestones(milestones, note, root) {
  root.replaceChildren(
    sectionHead('progress', 'Steady progress, fueled by passion.'),
    el('ol', { class: 'timeline' }, ...milestones.map((m) =>
      el('li', { class: 'milestone' },
        el('span', { class: 'milestone__dot', 'aria-hidden': 'true' }),
        el('span', { class: 'milestone__marker' }, m.marker, m.age ? el('span', { class: 'milestone__age', text: `age ${m.age}` }) : null),
        el('p', { class: 'milestone__text', text: m.text }),
      ))),
    el('p', { class: 'timeline__note', text: note }),
  );
}

export function renderStartup(startup, root) {
  root.replaceChildren(
    el('div', { class: 'startup' },
      el('div', { class: 'startup__copy' },
        sectionHead('startup', startup.heading),
        el('p', { class: 'startup__body', text: startup.body }),
        el('p', { class: 'startup__meta', text: `${startup.role}, ${startup.dates}. ${startup.note}` }),
      ),
      el('div', { class: 'startup__side' },
        el('p', { class: 'startup__label', text: 'Built with' }),
        el('ul', { class: 'pills' }, ...startup.stack.map((s) => el('li', { text: s }))),
        el('a', { class: 'button', href: startup.link.href, target: '_blank', rel: 'noopener', 'data-tile': true, text: `Visit ${startup.link.label}` }),
      ),
    ),
  );
}

const repoLabel = (entry) => {
  const repos = [...new Set(entry.links.map((l) => l.label.replace(/\s+#\d+$/, '')))];
  return repos.length > 2 ? `${repos.length} repos` : repos[0] || '';
};

export function renderKde(kde, root) {
  const previewImg = el('img', { alt: '', width: '640', height: '400', hidden: true });
  const previewSummary = el('p', { class: 'kde-preview__summary', hidden: true });
  const show = (entry) => {
    const shot = entry.images[0];
    previewImg.hidden = !shot;
    previewSummary.hidden = Boolean(shot);
    if (shot && !previewImg.src.endsWith(shot.src)) {
      previewImg.src = shot.src;
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        previewImg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: 'ease-out' });
      }
    }
    previewSummary.textContent = entry.summary;
  };
  // A screenshot that fails to load falls back to the summary text.
  previewImg.addEventListener('error', () => { previewImg.hidden = true; previewSummary.hidden = false; });

  const rows = kde.entries.map((entry, i) => {
    const row = el('button', { type: 'button', class: 'kde-row', 'data-tile': true, 'data-id': entry.id, 'aria-haspopup': 'dialog', 'aria-label': `${entry.title}, ${repoLabel(entry)}` },
      el('span', { class: 'kde-row__num', text: String(i + 1).padStart(2, '0') }),
      el('span', { class: 'kde-row__project', text: repoLabel(entry) }),
      el('span', { class: 'kde-row__title', text: entry.title }),
      el('span', { class: 'kde-row__arrow', 'aria-hidden': 'true', text: '+' }),
    );
    // pointermove (not mouseenter): rows sliding under a resting pointer during keyboard scrolling don't steal the preview.
    row.addEventListener('pointermove', () => show(entry));
    row.addEventListener('focus', () => show(entry));
    return el('li', {}, row);
  });

  root.replaceChildren(
    sectionHead('kde', [el('span', { class: 'kde__count', text: `(${kde.count})` }), ` ${kde.title}`], kde.sub),
    el('div', { class: 'kde' },
      el('ol', { class: 'kde-list' }, ...rows),
      el('aside', { class: 'kde-preview', 'aria-hidden': 'true' }, previewImg, previewSummary),
    ),
    el('a', { class: 'kde__all', href: kde.allHref, target: '_blank', rel: 'noopener', 'data-tile': true, text: 'More on my KDE Invent profile ↗' }),
  );
  show(kde.entries[0]);
}

export function renderBuilt(built, root) {
  const cards = built.projects.map((p) => {
    const code = p.links.find((l) => l.href.includes('github.com'));
    const live = p.links.find((l) => !l.href.includes('github.com'));
    return el('article', { class: 'project' },
      el('span', { class: 'project__category', text: p.category }),
      el('h3', { class: 'project__title' },
        el('button', { type: 'button', class: 'project__open', 'data-tile': true, 'data-id': p.id, 'aria-haspopup': 'dialog', text: p.title })),
      el('p', { class: 'project__summary', text: p.summary }),
      el('dl', { class: 'project__meta' },
        el('div', {}, el('dt', { text: 'Language' }), el('dd', { text: p.language })),
        el('div', {}, el('dt', { text: 'Status' }), el('dd', { text: p.status })),
      ),
      el('p', { class: 'project__links' },
        code ? el('a', { href: code.href, target: '_blank', rel: 'noopener', 'data-tile': true, text: 'Read the code' }) : null,
        live ? el('a', { href: live.href, target: '_blank', rel: 'noopener', 'data-tile': true, text: 'See it' }) : null,
      ),
    );
  });
  root.replaceChildren(
    sectionHead('built', 'Things I built'),
    el('div', { class: 'projects' }, ...cards),
    el('p', { class: 'also', text: `Also: ${built.also.join(' · ')}` }),
  );
}

export function renderLife(life, root) {
  root.replaceChildren(
    el('div', {},
      sectionHead('life', life.title),
      life.gallery?.length ? el('ul', { class: 'life__gallery' }, ...life.gallery.map((g) =>
        el('li', {},
          el('figure', { class: 'shot' },
            image(g.image, { width: '900', height: '1200' }),
            el('figcaption', { class: 'shot__caption', text: g.caption }),
          )))) : null,
      el('figure', { class: 'life__table' }, image(life.table)),
      el('h3', { class: 'life__subhead', text: 'Travel' }),
      el('ul', { class: 'trips' }, ...life.trips.map((t) =>
        el('li', { class: 'trip' },
          image(t.image, { width: '64', height: '64' }),
          el('h4', { class: 'trip__city', text: t.city }),
          el('p', { class: 'trip__craft', text: t.craft }),
          el('p', { class: 'trip__note', text: t.note }),
          t.link ? el('p', { class: 'trip__link' },
            el('a', { href: t.link.href, target: '_blank', rel: 'noopener', 'data-tile': true, text: `${t.link.label} ↗` })) : null,
        ))),
      el('h3', { class: 'life__subhead', text: 'Also me' }),
      el('ul', { class: 'hobbies' }, ...life.hobbies.map((h) =>
        el('li', { class: 'hobby' },
          image(h.image, { width: '120', height: '150' }),
          el('div', {}, el('h4', { class: 'hobby__title', text: h.title }), el('p', { text: h.text })),
        ))),
    ),
  );
}
