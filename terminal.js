// The ~ terminal: a small easter egg for people who'd rather type.

const HELP = `Commands:
  help          show this list
  neofetch      system information
  ls            list sections and entries
  open <id>     open a tile, e.g. open bluetooth
  contact       ways to reach Qasim
  clear         clear the screen
  exit          close the terminal`;

const LOGO = [
  '   ▄████▄   ',
  '  ██    ██  ',
  '  ██    ██  ',
  '  ██  ▀▄██  ',
  '   ▀████▀▄  ',
  '          ▀ ',
];

export function runCommand(input, ctx) {
  const [cmd = '', ...args] = input.trim().split(/\s+/);
  switch (cmd) {
    case '':
      return { output: '' };
    case 'help':
      return { output: HELP };
    case 'neofetch': {
      const info = [
        'qasim@bigscreen',
        '---------------',
        'OS: Fedora Linux',
        'DE: KDE Plasma',
        `Contributions: ${ctx.profile.merged} merged`,
        'Languages: Python, C, JavaScript, QML',
        'Certs: PCEP, PCAP, Arduino',
      ];
      return { output: info.map((line, i) => `${LOGO[i] ?? ' '.repeat(LOGO[0].length)}  ${line}`).join('\n') };
    }
    case 'ls':
      return {
        output: ctx.sections
          .map((sec) => `${sec.title}\n${sec.entries.map((t) => `  ${t.id}`).join('\n')}`)
          .join('\n'),
      };
    case 'open': {
      const id = args[0] ?? '';
      if (!id) return { output: 'usage: open <id>. Try ls.' };
      const tile = ctx.sections.flatMap((sec) => sec.entries).find((t) => t.id === id);
      if (!tile) return { output: `no such tile: ${id}. Try ls.` };
      if (tile.href) {
        window.open(tile.href, tile.href.startsWith('mailto:') ? '_self' : '_blank', 'noopener');
        return { output: `opening ${tile.href}` };
      }
      ctx.openTile(id);
      return { output: `opening ${id}` };
    }
    case 'contact':
      return {
        output: [
          `email   ${ctx.profile.email}`,
          `github  ${ctx.profile.links.github}`,
          `kde     ${ctx.profile.links.kde}`,
          `resume  ${ctx.profile.links.resume}`,
        ].join('\n'),
      };
    case 'clear':
      return { output: '', action: 'clear' };
    case 'exit':
      return { output: '', action: 'exit' };
    default:
      return { output: `command not found: ${cmd}. Try help.` };
  }
}

export function initTerminal({ el, input, out, profile, sections, openTile }) {
  let returnFocus = null;

  const print = (text) => {
    out.textContent += (out.textContent ? '\n' : '') + text;
    out.scrollTop = out.scrollHeight;
  };
  const open = () => {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    el.hidden = false;
    if (!out.textContent) print('Type help to see commands.');
    input.focus();
  };
  const close = () => {
    el.hidden = true;
    returnFocus?.focus({ preventScroll: true });
  };

  document.addEventListener('keydown', (e) => {
    if (e.key !== '~' || e.target.closest?.('input, textarea, select, dialog[open]')) return;
    e.preventDefault();
    el.hidden ? open() : close();
  });

  input.addEventListener('keydown', (e) => {
    e.stopPropagation(); // keep arrows and ~ away from the arrow-key navigation
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  });

  input.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value;
    input.value = '';
    print(`$ ${value}`);
    const { output, action } = runCommand(value, { profile, sections, openTile });
    if (action === 'clear') out.textContent = '';
    else if (action === 'exit') close();
    else if (output) print(output);
  });
}
