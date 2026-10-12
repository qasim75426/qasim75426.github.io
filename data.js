// All site content. Edit this file to change what the page shows.
// Entry (opens the detail panel): { id, title, summary, body, why?, tech[], images[{src, alt}], links[{label, href}] }
// Img: { src, alt, fallback }. To use a real photo, change `src` to e.g. 'assets/photos/cairo.jpg' and keep `fallback`.

const mr = (project, iid) => ({
  label: `${project.split('/')[1]} #${iid}`,
  href: `https://invent.kde.org/${project}/-/merge_requests/${iid}`,
});
const repo = (name) => ({ label: `User8395/${name}`, href: `https://github.com/User8395/${name}` });
export const BREAK = { br: true };
const photo = (name, alt) => ({ src: `assets/photos/${name}.svg`, alt, fallback: `assets/photos/${name}.svg` });

export const profile = {
  name: 'Qasim K.',
  greeting: "Hi! I'm Qasim.",
  // BREAK starts a new line in the hero sentence.
  hero: [
    'I code in',
    { text: 'Python', href: '#built', image: photo('python', 'Python logo') },
    'and C++, ship code to',
    { text: 'KDE', href: '#kde', image: photo('kde', 'KDE logo') },
    'Plasma Bigscreen (TV for Linux), worked at',
    { text: 'Lumnitek', href: '#startup', image: photo('lumnitek', 'Lumnitek logo') },
    "(an EdTech startup), and I'm",
    { text: 'certified', href: '#progress', image: photo('certified', 'Certificate badge') },
    'in Python and Arduino (a microcontroller platform).',
    BREAK,
    'And I play the',
    { text: 'daf', href: '#life', image: photo('daf', 'A daf, a percussion frame drum') },
    '!',
  ],
  sub: "I'm an open-source enthusiast. I build software for TVs, phones, and Linux. Since 2024, 40 of my changes have been merged into KDE Plasma, most of them into Plasma Bigscreen, KDE's desktop for televisions.",
  merged: 40,
  email: 'qasim75426@gmail.com',
  status: 'Currently: building Bluetooth and KDE Connect settings for Plasma Bigscreen.',
  links: {
    github: 'https://github.com/User8395',
    kde: 'https://invent.kde.org/usereightthreeninefive',
    resume: 'https://bit.ly/qasim-cv',
  },
};

export const milestones = [
  { marker: '2019', age: 10, text: 'Taught myself web development: HTML, CSS, JavaScript, PHP and MySQL.' },
  { marker: '2020', age: 11, text: "Took Harvard's CS50x, the famous intro to computer science." },
  { marker: '2024', age: 15, text: 'Certified in Python (PCEP, then PCAP) and in Arduino.' },
  { marker: '2024', age: 15, text: 'First change merged into KDE Plasma.' },
  { marker: '2025', age: 15, text: 'Helped develop an AI course generator at Lumnitek, an EdTech startup.' },
  { marker: '2026', age: 16, text: "My Bluetooth settings module moved upstream into KDE's Bluedevil." },
  { marker: '2026', age: 16, text: 'Studying for CompTIA Security+, a cybersecurity certification.' },
];
export const progressNote = 'Full-stack developer and Linux enthusiast, at home on Fedora Linux and LineageOS.';

export const startup = {
  heading: 'I worked at an EdTech startup.',
  body: "At Lumnitek, I worked hand in hand with the technical founder to build an AI-powered course generator, hosted on Azure Function Apps and Static Web Apps. It's built to save universities hundreds of people-hours.",
  role: 'Programmer intern',
  dates: 'March to August 2025',
  stack: ['Azure Function Apps', 'Azure Static Web Apps', 'AI'],
  link: { label: 'lumnitek.com', href: 'https://lumnitek.com' },
  note: 'Reference available on request.',
};

export const kde = {
  count: 40,
  title: 'changes merged into KDE Plasma',
  sub: "Most of them for Plasma Bigscreen, KDE's desktop for TVs.",
  allHref: 'https://invent.kde.org/usereightthreeninefive',
  entries: [
      {
        id: 'bluetooth',
        title: 'Bluetooth settings for Bigscreen',
        summary: 'A remote-friendly Bluetooth settings page, later merged upstream into Bluedevil.',
        body: 'Plasma Bigscreen had no way to manage Bluetooth from the couch. In 2025 I wrote a Bluetooth settings module for it: turn Bluetooth on and off, list paired devices, connect and disconnect them. I later added a clear message for TVs with no Bluetooth adapter, and in October 2026 moved the whole module into Bluedevil, KDE\'s Bluetooth project, so desktop and TV share one codebase instead of two copies.',
        why: 'Pairing a controller or headphones is one of the first things anyone does with a TV.',
        tech: ['QML', 'C++', 'Kirigami', 'BlueZ'],
        images: [{ src: 'assets/kde/plasma-bigscreen-227-1.webp', alt: 'Plasma Bigscreen settings with the Bluetooth page open, showing the message "No Bluetooth adapters found".' }],
        links: [mr('plasma/plasma-bigscreen', 147), mr('plasma/plasma-bigscreen', 227), mr('plasma/plasma-bigscreen', 256), mr('plasma/bluedevil', 266)],
      },
      {
        id: 'kde-connect',
        title: 'KDE Connect on the TV',
        summary: 'Pairing fixes and a new page for managing KDE Connect plugins per device.',
        body: 'KDE Connect links a phone to a computer, or here, to a TV. I fixed the Bigscreen settings sidebar so it switches devices correctly, made it possible to unpair devices that are out of range, let pair requests be accepted right from the sidebar, added a "No devices found" message, and built a page to turn individual KDE Connect plugins on and off for each device.',
        why: 'On a TV, your phone is the keyboard and remote. This is the setup screen for that.',
        tech: ['QML', 'KDE Connect'],
        images: [],
        links: [mr('plasma/plasma-bigscreen', 172), mr('plasma/plasma-bigscreen', 222), mr('plasma/plasma-bigscreen', 226)],
      },
      {
        id: 'polkit',
        title: 'Password prompt for the TV',
        summary: 'Ported the system authentication dialog to Bigscreen.',
        body: 'When an app needs administrator rights, Plasma shows a password prompt. On a TV that desktop-sized dialog was hard to use with a remote. I ported it to Bigscreen with large controls, including a "Change user" picker, and added the Kirigami dependency it needed to KDE\'s build and CI configuration.',
        tech: ['QML', 'Kirigami', 'polkit', 'CMake'],
        images: [
          { src: 'assets/kde/polkit-kde-agent-1-61-1.webp', alt: 'Authentication Required dialog on Bigscreen asking for a password to run a command as the super user, with OK and Cancel buttons.' },
          { src: 'assets/kde/polkit-kde-agent-1-61-2.webp', alt: 'The same dialog with an extra Change user button.' },
          { src: 'assets/kde/polkit-kde-agent-1-61-3.webp', alt: 'The Change user list open, showing two accounts to choose from.' },
        ],
        links: [mr('plasma/polkit-kde-agent-1', 61), mr('plasma/polkit-kde-agent-1', 62)],
      },
      {
        id: 'keyboard',
        title: 'On-screen keyboard settings',
        summary: 'A TV version of the keyboard settings, then a redesign with new options.',
        body: 'I added a TV layout for the Plasma on-screen keyboard settings, with language selection and sound and vibration toggles. A year later I redesigned the page with descriptions for every option and added settings for the hold-a-key popup of alternate characters and its delay.',
        tech: ['QML', 'Kirigami'],
        images: [
          { src: 'assets/kde/plasma-keyboard-170-2.webp', alt: 'Redesigned On-Screen Keyboard settings in Bigscreen with sections for languages, key press feedback, general and alternate characters.' },
          { src: 'assets/kde/plasma-keyboard-170-1.webp', alt: 'The earlier On-Screen Keyboard settings page, with fewer options and no descriptions.' },
          { src: 'assets/kde/plasma-keyboard-39-2.webp', alt: 'The first TV version of the settings, with a list of keyboard languages to switch on.' },
        ],
        links: [mr('plasma/plasma-keyboard', 39), mr('plasma/plasma-keyboard', 170)],
      },
      {
        id: 'plank-player',
        title: 'Plank Player refresh',
        summary: 'Moved the Bigscreen media player onto the new Bigscreen components.',
        body: 'Plank Player plays local video files on Plasma Bigscreen using only a remote. I updated its buttons and menus to use the shared Bigscreen components so it looks and behaves like the rest of the TV interface.',
        tech: ['QML'],
        images: [{ src: 'assets/kde/plank-player-16-1.webp', alt: 'Plank Player file browser on a TV, listing home folders with the first item focused.' }],
        links: [mr('plasma/plank-player', 16)],
      },
      {
        id: 'lockscreen',
        title: 'Lockscreen quick actions on Plasma Mobile',
        summary: 'Shortcut buttons on the Plasma Mobile lockscreen.',
        body: 'Added quick action buttons to the Plasma Mobile lockscreen, so common actions are one tap away without unlocking the phone.',
        tech: ['QML', 'Plasma Mobile'],
        images: [{ src: 'assets/kde/plasma-mobile-664-1.webp', alt: 'Plasma Mobile lockscreen showing the time 1:17 and the date, with small action buttons in the bottom corners.' }],
        links: [mr('plasma/plasma-mobile', 664)],
      },
  ],
};

export const built = {
  projects: [
      {
        id: 'fdroid-linux',
        category: 'Linux tools',
        language: 'Python',
        status: 'Working',
        title: 'F-Droid for Waydroid',
        summary: 'Browse and install F-Droid apps into Waydroid from Linux.',
        body: 'A desktop F-Droid client for Waydroid, which runs Android apps on Linux. It brings the open-source Android app catalog to a Linux desktop.',
        tech: ['Python'],
        images: [],
        links: [repo('F-Droid_Linux')],
      },
      {
        id: 'adm',
        category: 'Android tools',
        language: 'Python',
        status: 'Working',
        title: 'Android Device Manager',
        summary: 'A graphical front end for adb and fastboot.',
        body: 'Android Device Manager wraps adb and fastboot, the command-line tools for talking to Android phones, in a graphical interface.',
        tech: ['Python', 'adb', 'fastboot'],
        images: [],
        links: [repo('adm')],
      },
      {
        id: 'license-plates',
        category: 'Computer vision',
        language: 'Python',
        status: 'Working',
        title: 'License plate recognition',
        summary: 'Reads license plates from a depth camera and logs them to SQL.',
        body: 'Uses a DepthAI camera and OpenALPR to detect U.S. license plates in real time and log each plate number to an SQL database. It can be extended to plates from other countries.',
        tech: ['Python', 'DepthAI', 'OpenALPR', 'SQL'],
        images: [],
        links: [repo('license-plate-recognition-with-opencv')],
      },
  ],
  also: [
    'Pi-Hole for the whole house',
    'Home Assistant automations',
    'LineageOS and Windows on a Raspberry Pi',
    'a dual-boot ThinkPad',
  ],
};

export const life = {
  title: "I'm homeschooled, so I've been learning outside the box my whole life.",
  table: photo('table', 'The things on my desk'),
  // Life photos: 900x1200 WebP, location data removed.
  gallery: [
    { caption: '2016. Same setup, smaller parts.', image: { src: 'assets/photos/life-2016.webp', alt: 'Qasim at age seven, building with an electronics kit at the dining table.' } },
    { caption: "If it has screws, I've opened it.", image: { src: 'assets/photos/life-laptop-repair.webp', alt: 'Qasim unscrewing the back panel of an open laptop at the kitchen table.' } },
    { caption: 'Met the guy whose kernel I build on. Well, his poster.', image: { src: 'assets/photos/life-linus.webp', alt: 'Qasim at a computer museum, pointing to an exhibit photo of Linus Torvalds.' } },
    { caption: 'Teaching a robot arm to pick things up. Harder than it looks.', image: { src: 'assets/photos/life-robot-arm.webp', alt: 'Qasim in headphones at his desk, adjusting a small robotic arm next to his laptop.' } },
  ],
  trips: [
    { id: 'cairo', city: 'Cairo', link: { label: 'cairosworkshop.com', href: 'https://cairosworkshop.com/' }, craft: 'Woodworking', note: "Took the five-day Zero to Hero course at Cairo's Workshop, the woodworking school founded by architect and master furniture maker Yahya El Hosafy.", image: photo('cairo', 'Woodworking in Cairo') },
    { id: 'jordan', city: 'Jordan', link: { label: 'greeningthedesertproject.org', href: 'https://www.greeningthedesertproject.org/' }, craft: 'Permaculture design', note: 'In 2023, spent two weeks full time under Geoff Lawton at Greening the Desert, a permaculture farm in the Jordan River Valley, with daily instruction and hands-on training.', image: photo('jordan', 'Permaculture in Jordan') },
    { id: 'istanbul', city: 'Istanbul', link: { label: 'deenartsfoundation.org', href: 'https://deenartsfoundation.org/team/shahryanshah-sirajuddin/' }, craft: 'Calligraphy', note: 'Studied calligraphy under the guidance of master calligrapher Shahryanshah Sirajuddin.', image: photo('istanbul', 'Calligraphy in Istanbul') },
  ],
  hobbies: [
    { id: 'daf', title: 'The daf', text: 'I play the daf, a percussion frame drum.', image: { src: 'assets/photos/daf.webp', alt: 'Qasim on the sofa playing a daf, a large frame drum', fallback: 'assets/photos/daf.svg' } },
    { id: 'smoker', title: 'The smoker', text: 'I smoke brisket and pastrami, and make jerky for family and friends.', image: { src: 'assets/photos/smoker.webp', alt: 'Smoked brisket sliding off a pan into a foil tray', fallback: 'assets/photos/smoker.svg' } },
  ],
};
