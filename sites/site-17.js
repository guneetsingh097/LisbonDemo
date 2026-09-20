const sections = [
  ['home', 'Break report'],
  ['about', 'Crew'],
  ['faq', 'Beach questions'],
  ['contact', 'Shack'],
  ['offerings', 'Lessons'],
  ['resources', 'Zine notes'],
  ['detail', '365 page']
];

const shots = [
  {
    src: '../images-pexels/surfing-lesson-beach-1.jpg',
    alt: 'A surfer carrying a board on the beach.',
    credit: 'Photo by Magda Ehlers / Pexels',
    caption: 'BEACH ENTRY / waxed and ready'
  },
  {
    src: '../images-pexels/surfing-lesson-beach-2.jpg',
    alt: 'Surfer heading into the water.',
    credit: 'Photo by Phoenix Main / Pexels',
    caption: 'PADDLE OUT / shoulders first'
  },
  {
    src: '../images-pexels/surfing-lesson-beach-3.jpg',
    alt: 'Surf lesson on a sandy beach.',
    credit: 'Photo by Kampus Production / Pexels',
    caption: 'GROUP SET / beginner zone'
  },
  {
    src: '../images-pexels/surfing-lesson-beach-6.jpg',
    alt: 'A surfer riding a breaking wave.',
    credit: 'Photo by Serg Alesenko / Pexels',
    caption: 'OPEN FACE / confidence day'
  },
  {
    src: '../images-pexels/cascais-beach-3.jpg',
    alt: 'Sunny beach scene on the coast.',
    credit: 'Photo by GUSTAVO CORREA / Pexels',
    caption: 'BEACH WINDOW / soft afternoon'
  },
  {
    src: '../images-pexels/cascais-coastline-6.jpg',
    alt: 'Waves along a dramatic coastline.',
    credit: 'Photo by Recep Tayyip Çelik / Pexels',
    caption: 'OUTSIDE READ / bigger water'
  }
];

const stats = [
  { label: 'Wave height', value: '1.2 m' },
  { label: 'Wind', value: '11 kn NNW' },
  { label: 'Water', value: '18°C' },
  { label: 'Group ratio', value: '1 : 5' }
];

const lessons = [
  {
    title: 'Beginner group lesson',
    price: '45 EUR / fictional demo rate',
    text: 'Pop-up drills, paddle timing, and whitewater courage with a board already waxed and waiting.'
  },
  {
    title: 'Private session',
    price: '75 EUR / fictional demo rate',
    text: 'For nervous first-timers, determined improvers, or anyone who wants line-by-line coaching without the crowd in their ear.'
  },
  {
    title: '5-day camp',
    price: '320 EUR / fictional demo rate',
    text: 'Five mornings of repetition, tide reading, and enough ocean time for the body to stop negotiating with the board.'
  },
  {
    title: '365 plaque paddle-out',
    price: 'club ritual / fictional tradition',
    text: 'A house story session about the instructor who surfed 365 consecutive days, followed by a playful endurance-themed warmup.'
  }
];

const resources = [
  { title: 'Whitewater is not failure, it is where the day begins', desc: 'A beginner note on why the first dozen rides should feel goofy, loud, and completely worthwhile.' },
  { title: 'How to read a windy beach without panicking', desc: 'Flags, texture on the water, and whether the lesson zone still has a clean teaching pocket.' },
  { title: 'Board carry, leash check, breath check', desc: 'The tiny rituals that make a surf lesson feel safe before it feels cool.' },
  { title: 'Why surf slang gets shorter when the waves get bigger', desc: 'A zine-page glossary from “inside shoulder” to “nah, not today.”' }
];

const faqs = [
  { q: 'Is Onda Larga a real school?', a: 'Nope. Fictional school, real coast mood.' },
  { q: 'Do I need to know how to swim?', a: 'Yeah. Basic swim confidence is part of the fictional safety rule and should be treated as non-negotiable.' },
  { q: 'Where do lessons work best: Cascais side or a gentler beach break?', a: 'Beginners get the gentler call. Bigger coastline drama is for looking or for later.' },
  { q: 'What does the 1:5 ratio actually mean?', a: 'One instructor for every five students in group sessions, so nobody disappears into a board pile.' },
  { q: 'What is the 365 plaque story?', a: 'The school brags that even its least-experienced instructor once surfed 365 straight days. Naturally, there is a plaque page about it.' },
  { q: 'Can kids join?', a: 'Yes, if they hit the fictional minimum age and the beach mood is friendly. The good sessions are playful, not macho.' },
  { q: 'Are lessons canceled in bad conditions?', a: 'Absolutely. Unsafe water means free reschedule energy, not stubbornness.' },
  { q: 'What should I bring from Lisbon?', a: 'Swimwear, towel, water, sunscreen, and less ego than you think you need.' },
  { q: 'How long is the camp day?', a: 'The fictional camp is five days of progressive coaching, with enough repetition for paddling to stop feeling like paperwork.' },
  { q: 'What local expertise matters?', a: 'Knowing which beach is teaching-friendly that day, how wind reshapes the lesson plan, and when the coast is gorgeous but not useful.' }
];

function nav(site, current) {
  return `
    <nav class="wave-nav" aria-label="Section navigation">
      ${sections.map(([slug, label]) => `<a class="${current === slug ? 'is-active' : ''}" href="#/site/${site.id}/${slug}">${label}</a>`).join('')}
    </nav>
  `;
}

function utilityLinks() {
  return `
    <div class="shore-links">
      <a href="#/">home break</a>
      <a href="#/navigate">quick navigate</a>
    </div>
  `;
}

function shot(item, className = '') {
  return `
    <figure class="shot ${className}">
      <img src="${item.src}" alt="${item.alt}">
      <figcaption><strong>${item.caption}</strong><span>${item.credit}</span></figcaption>
    </figure>
  `;
}

function footer(site) {
  return `
    <footer class="zine-footer">
      <p>Demo break only. ${site.companyName} is invented surf-school content with fictional pricing, schedules, and staff.</p>
      <p>${site.contact.email} · ${site.contact.phone} · ${site.domain}</p>
    </footer>
  `;
}

function renderHome(site) {
  return `
    <main class="zine-main">
      <section class="conditions-board">
        <div class="intro-block">
          <p class="tag">90s beach zine / surf shack / est. 2013</p>
          <h1>${site.homepage.headline}</h1>
          <p>${site.homepage.dek}</p>
        </div>
        ${stats.map((stat) => `
          <article class="stat-tile">
            <p>${stat.label}</p>
            <strong>${stat.value}</strong>
          </article>
        `).join('')}
      </section>
      <section class="lesson-rack">
        ${lessons.map((lesson, index) => `
          <article class="lesson-strip ${index % 2 === 0 ? 'red-block' : 'sand-block'}">
            <h2>${lesson.title}</h2>
            <p class="price">${lesson.price}</p>
            <p>${lesson.text}</p>
          </article>
        `).join('')}
      </section>
      <section class="photo-wall">
        ${shots.map((item) => shot(item)).join('')}
      </section>
      <section class="plaque-block foam-block">
        <p class="tag">Plaque page</p>
        <h2>365 straight days in the water.</h2>
        <p>The braggiest house story is also the softest one: if someone can keep paddling for 365 consecutive days, then your first clumsy pop-up does not need to be elegant. It just needs to happen.</p>
      </section>
    </main>
  `;
}

function renderAbout(site) {
  return `
    <main class="zine-main">
      <section class="plaque-block ocean-block">
        <p class="tag">Crew origin</p>
        <h1>Small ratios. Big cheering. Zero weird macho energy.</h1>
        <p>${site.about.story}</p>
        <p>${site.about.mission} The school also clings affectionately to its favorite legend: even the least-experienced instructor once surfed 365 consecutive days, which is exactly the kind of impossible beach-hut fact that turns into a plaque.</p>
        <p>Local expertise means reading the Lisbon-side coast like a living chalkboard — which stretch is beginner-safe, which tide should stay a postcard, and when Cascais sparkle hides too much wind for a first lesson.</p>
      </section>
      <section class="crew-collage">
        ${site.about.team.map((member, index) => `
          <article class="crew-card ${index % 2 === 0 ? 'sand-block' : 'foam-block'}">
            ${shot(shots[index], 'crew-shot')}
            <h2>${member.name}</h2>
            <p class="price">${member.role}</p>
            <p>${member.bio}</p>
          </article>
        `).join('')}
      </section>
    </main>
  `;
}

function renderFaq() {
  return `
    <main class="zine-main">
      <section class="faq-grid">
        ${faqs.map((item, index) => `
          <article class="faq-chip ${index % 3 === 0 ? 'ocean-block' : index % 3 === 1 ? 'sand-block' : 'foam-block'}">
            <p class="tag">Q${String(index + 1).padStart(2, '0')}</p>
            <h2>${item.q}</h2>
            <p>${item.a}</p>
          </article>
        `).join('')}
      </section>
    </main>
  `;
}

function renderOfferings() {
  return `
    <main class="zine-main">
      <section class="lesson-rack">
        ${lessons.map((lesson, index) => `
          <article class="lesson-strip ${index % 2 === 0 ? 'ocean-block' : 'red-block'}">
            <h2>${lesson.title}</h2>
            <p class="price">${lesson.price}</p>
            <p>${lesson.text}</p>
          </article>
        `).join('')}
      </section>
    </main>
  `;
}

function renderResources() {
  return `
    <main class="zine-main">
      <section class="faq-grid">
        ${resources.map((item, index) => `
          <article class="faq-chip ${index % 2 === 0 ? 'sand-block' : 'foam-block'}">
            <p class="tag">Zine page ${index + 1}</p>
            <h2>${item.title}</h2>
            <p>${item.desc}</p>
          </article>
        `).join('')}
      </section>
    </main>
  `;
}

function renderContact(site) {
  return `
    <main class="zine-main">
      <section class="plaque-block sand-block">
        <p class="tag">Beach shack contact</p>
        <h1>Tell us if you want whitewater, a reset, or a proper challenge.</h1>
        <p>${site.description}</p>
      </section>
      <section class="contact-grid">
        <article class="foam-block">
          <h2>${site.contact.name}</h2>
          <p class="price">${site.contact.email}</p>
          <p>${site.contact.phone}<br>${site.domain}</p>
        </article>
        <article class="ocean-block">
          <h2>Best message format</h2>
          <p>Send age range, swim confidence, lesson mood, and whether this is a first-ever board day or a “please fix my pop-up” day.</p>
        </article>
      </section>
    </main>
  `;
}

function renderDetail(site) {
  return `
    <main class="zine-main">
      <section class="detail-swell">
        <article class="foam-block intro-detail">
          <p class="tag">Plaque page / long read</p>
          <h1>${site.detailPage.title}</h1>
          <p>${site.detailPage.summary}</p>
        </article>
        <article class="ocean-block detail-chunk">
          <h2>Day 1: board carry, laugh it off, go again.</h2>
          <p>The first morning is mostly choreography: wax, leash, carry angle, where to stand, where not to stand. The school treats those details as style, because calm procedures make brave beginners.</p>
          ${shot(shots[0])}
        </article>
        <article class="sand-block detail-chunk">
          <h2>Day 2: read the water before it reads you.</h2>
          <p>By the second session the teacher starts naming wave shape, wind texture, and how the break reorganizes itself. Progress is not just standing up; it is seeing the beach differently.</p>
          ${shot(shots[2])}
        </article>
        <article class="red-block detail-chunk">
          <h2>Day 3 and beyond: confidence gets quieter.</h2>
          <p>The glamorous version of surfing is loud. The real one gets steady. Shoulders relax, paddling smooths out, and the coast stops looking like chaos. That is when the obsession begins.</p>
          ${shot(shots[3])}
        </article>
      </section>
    </main>
  `;
}

export function render(site, section) {
  const pages = {
    home: renderHome(site),
    about: renderAbout(site),
    faq: renderFaq(site),
    contact: renderContact(site),
    offerings: renderOfferings(site),
    resources: renderResources(site),
    detail: renderDetail(site)
  };

  return `
    <div class="site-shell-17">
      <header class="zine-header">
        <div class="logo-burst">${site.companyName}</div>
        <div class="header-copy">
          <p class="tag">Escola de Surf Onda Larga</p>
          <p class="tag">conditions board / lesson zine / coast report</p>
        </div>
        ${nav(site, section)}
        ${utilityLinks()}
      </header>
      ${pages[section] || pages.home}
      ${footer(site)}
    </div>
  `;
}
