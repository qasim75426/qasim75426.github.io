// Entry point: wires the page modules together.
import { profile, milestones, progressNote, startup, kde, built, life } from './data.js';
import { renderHero, renderMilestones, renderStartup, renderKde, renderBuilt, renderLife, renderContact } from './render.js';
import { initFocus } from './focus.js';
import { initPanel, openTile } from './panel.js';
import { initTerminal } from './terminal.js';

renderHero(profile, document.getElementById('hero'));
renderMilestones(milestones, progressNote, document.getElementById('progress'));
renderStartup(startup, document.getElementById('startup'));
renderKde(kde, document.getElementById('kde'));
renderBuilt(built, document.getElementById('built'));
renderLife(life, document.getElementById('life'));
renderContact(profile, document.getElementById('contact'));

initFocus(document.body);
const entries = [...kde.entries, ...built.projects];
initPanel({ dialog: document.getElementById('panel'), entries });
initTerminal({
  el: document.getElementById('terminal'),
  input: document.getElementById('term-input'),
  out: document.querySelector('.term__out'),
  profile,
  sections: [
    { title: 'KDE', entries: kde.entries },
    { title: 'Built', entries: built.projects },
    { title: 'Contact', entries: [
      { id: 'github', title: 'GitHub', href: profile.links.github },
      { id: 'kde-invent', title: 'KDE Invent', href: profile.links.kde },
      { id: 'email', title: 'Email', href: `mailto:${profile.email}` },
      { id: 'resume', title: 'Résumé', href: profile.links.resume },
    ] },
  ],
  openTile,
});

// Links shared from the first version of the site (#lumnitek, #cs50x, …) land on the section that holds that content now.
const MOVED = {
  lumnitek: 'startup', work: 'progress', cs50x: 'progress', certifications: 'progress', courses: 'progress',
  lab: 'built', 'raspberry-pi': 'built', 'pi-hole': 'built', 'home-assistant': 'built', 'dual-boot': 'built',
  github: 'contact', 'kde-invent': 'contact', email: 'contact', resume: 'contact',
};
function followMovedHash() {
  const to = MOVED[decodeURIComponent(location.hash.slice(1))];
  if (!to) return;
  history.replaceState(null, '', `#${to}`);
  document.getElementById(to).scrollIntoView({ behavior: 'instant' });
}
followMovedHash();
addEventListener('hashchange', followMovedHash);

document.getElementById('see-kde').addEventListener('click', (e) => {
  const first = document.querySelector('#kde [data-tile]');
  if (!first) return;
  e.preventDefault();
  first.focus({ preventScroll: true });
  document.getElementById('kde').scrollIntoView({
    block: 'start',
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
});

// Mobile scroll-to-top: the nav is hidden on phones, so this is the way back up. Shown once the hero is out of view.
const toTop = document.createElement('button');
toTop.className = 'to-top';
toTop.type = 'button';
toTop.setAttribute('aria-label', 'Back to top');
toTop.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
document.body.append(toTop);
new IntersectionObserver(([e]) => toTop.classList.toggle('is-visible', !e.isIntersecting))
  .observe(document.getElementById('hero'));
toTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  document.querySelector('.topbar__name')?.focus({ preventScroll: true });
});
