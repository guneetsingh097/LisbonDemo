const navItems = [
  ['home', 'Cellar Door'],
  ['about', 'House Story'],
  ['faq', 'Tasting Q&A'],
  ['contact', 'Reservations'],
  ['offerings', 'Wine List'],
  ['resources', 'Cellar Notes'],
  ['detail', 'Long Pour']
];

const figures = {
  vineyard: { src: '../images-pexels/wine-vineyard-1.jpg', alt: 'Aerial view of vineyards and river.', credit: 'Photo by Matheus De Moraes Gugelmim / Pexels', title: 'Vineyards arranged like patient handwriting' },
  sunsetRows: { src: '../images-pexels/vineyard-rows-sunset-5.jpg', alt: 'Vineyard landscape at golden hour.', credit: 'Photo by Lorenza Magnaghi / Pexels', title: 'Rows taking the late gold' },
  barrels: { src: '../images-pexels/wine-cellar-barrels-4.jpg', alt: 'Wooden wine barrels in a cellar.', credit: 'Photo by Tim Durand / Pexels', title: 'Barrel room hush' },
  tasting: { src: '../images-pexels/wine-tasting-glasses-5.jpg', alt: 'Wine tasting setup with cheese platter and notes.', credit: 'Photo by Pavel Danilyuk / Pexels', title: 'Glasses, notes, and good intentions' },
  shelf: { src: '../images-pexels/wine-glass-restaurant-2.jpg', alt: 'Wine glasses and bottles on wooden shelves.', credit: 'Photo by Xuân Thống Trần / Pexels', title: 'Bottle wall with low light' },
  valley: { src: '../images-pexels/douro-valley-vineyard-5.jpg', alt: 'River and vineyard landscape.', credit: 'Photo by Finn Ruijter / Pexels', title: 'River bends beyond the vines' },
  plates: { src: '../images-pexels/restaurant-plating-fine-dining-1.jpg', alt: 'Dishes and wine on a restaurant table.', credit: 'Photo by Taha Samet Arslan / Pexels', title: 'Pairing table set correctly' },
  terrace: { src: '../images-pexels/outdoor-cafe-terrace-4.jpg', alt: 'Elegant bistro setting outdoors.', credit: 'Photo by Ivett M / Pexels', title: 'The table after the tasting' }
};

const team = [
  { name: 'Beatriz Xavier', role: 'Founder & lead guide', bio: 'Prefers smaller vineyards, slower pours, and conversation over performance.', image: 'tasting' },
  { name: 'Hugo Cerveira', role: 'Tour logistics manager', bio: 'Knows which route is scenic, which route is sensible, and when they can be the same road.', image: 'valley' },
  { name: 'Leonor Aboim', role: 'Tasting host', bio: 'Translates acidity, tannin, and restraint into language that doesn’t frighten newcomers.', image: 'shelf' }
];

const faqItems = [
  { q: 'Are your vineyards real?', a: 'No. The company and all specific partners are fictional. The landscapes, however, borrow their mood from real Portuguese wine country.' },
  { q: 'What is the difference between the half-day and full-day tours?', a: 'The half-day stays focused and brisk; the full-day relaxes enough to include a regional lunch, more conversation, and one less glance at the clock.' },
  { q: 'Do I need wine knowledge to join?', a: 'Not at all. Curiosity is the house requirement. Vocabulary can arrive later, preferably after the first pour.' },
  { q: 'Do you visit Setúbal-style producers?', a: 'In the fictional itinerary, yes, especially on the fuller day where lunch and sweeter regional notes fit the pacing.' },
  { q: 'Can non-drinkers still come?', a: 'Yes. We keep the day companionable and can arrange non-alcoholic alternatives when requested in advance.' },
  { q: 'Will I have time to buy bottles?', a: 'Yes, though our editorial advice is to buy less and choose better.' },
  { q: 'Do you pair wine with food or only talk about it?', a: 'Both. Light regional bites appear on standard tastings, while the longer route adds a proper seated meal.' },
  { q: 'How formal is the experience?', a: 'Less formal than the typefaces suggest. We like good manners, relaxed pacing, and accurate information without stiffness.' },
  { q: 'How early should I book weekend departures?', a: 'The fictional booking guidance recommends at least a week ahead, especially for smaller-group weekend dates.' },
  { q: 'Is transport included?', a: 'Yes. The fictional tour structure includes round-trip transport from central Lisbon so nobody has to think about driving after tasting.' }
];

const offerings = [
  { code: '01', title: 'Tagus valley half-day', text: 'A smaller-format outing with two vineyard stops, guided tastings, and enough time to return to Lisbon before evening plans become impossible.' },
  { code: '02', title: 'Setúbal full-day', text: 'A slower, lunch-inclusive route with broader regional context and more room for comparative tasting.' },
  { code: '03', title: 'Private tasting experience', text: 'A tailored group format for travelers who want the day to bend toward one table, one producer mood, or one celebration.' },
  { code: '04', title: 'Pairing and purchase notes', text: 'Friendly guidance on bottles to buy, cheeses to remember, and how not to confuse polite enthusiasm with obligation.' }
];

const resources = [
  { title: 'How to taste without inventing adjectives', text: 'A short note on describing wine honestly, without forcing every sip to become blackberries and cedar.' },
  { title: 'Regional cheese deserves equal billing', text: 'A practical reminder that wine tours are also texture tours, salt tours, bread tours, and table-setting tours.' },
  { title: 'Buying bottles home: weight, wrapping, wisdom', text: 'Carry less than you dream, unless you have already solved the luggage question.' },
  { title: 'A beginner’s note on Portuguese wine styles', text: 'Not exhaustive, simply welcoming.' }
];

function figure(key, note = '') {
  const item = figures[key];
  return `<figure class="wine-figure wine-${key}"><img src="${item.src}" alt="${item.alt}"><figcaption><strong>${note || item.title}</strong><span>${item.credit}</span></figcaption></figure>`;
}

function nav(site, section) {
  return `<header class="cellar-header"><div class="crest"><p class="small">${site.logoMark}</p><h1>${site.companyName}</h1></div><nav class="engraved-nav" aria-label="Section navigation">${navItems.map(([slug, label]) => `<a class="${section === slug ? 'is-active' : ''}" href="#/site/${site.id}/${slug}">${label}</a>`).join('')}</nav><div class="utility-links"><a href="#/">Ecosystem home</a><a href="#/navigate">Quick navigator</a></div></header>`;
}

function renderHome(site) {
  return `
    <section class="wine-home">
      <section class="intro-pour"><div><p class="eyebrow">Old-world wine-list house</p><h2>${site.homepage.headline}</h2><p class="dek">${site.homepage.dek}</p><p>${site.homepage.valueProposition}</p></div>${figure('vineyard', 'Opening pour — landscape first, language second')}</section>
      <section class="menu-board">${offerings.map((item) => `<article><span>${item.code}</span><h3>${item.title}</h3><p>${item.text}</p></article>`).join('')}</section>
      <section class="pairing-row">${figure('plates', 'Service note — lunch matters to the memory')}<div><h3>House preference</h3><p>${site.homepage.featured[0].text}</p><p>${site.homepage.featured[1].text}</p><p>${site.homepage.featured[2].text}</p></div></section>
      <section class="gallery-grid">${figure('sunsetRows', 'Gallery plate — late light on the rows')}${figure('barrels', 'Gallery plate — dark wood and patient time')}${figure('tasting', 'Gallery plate — cheese, notes, and glasses')}${figure('terrace', 'Gallery plate — the table after the route')}</section>
    </section>
  `;
}

function renderAbout(site) {
  return `<section class="page-stack"><header class="page-head"><p class="eyebrow">House story</p><h2>Why the guide moves at tasting pace</h2></header><div class="two-col"><div><p>${site.about.story} The house quirk remains the oldest partner vine still producing, planted the year the founder was born; the company treats that fact less like marketing and more like a family anecdote worth repeating.</p><p><strong>Mission.</strong> ${site.about.mission} The tone stays indulgent, but never snobbish. Wine should broaden a day, not intimidate it.</p><p>Local expertise means knowing which regional roads suit conversation, how Setúbal differs in mood from the Tagus valley, and when lunch should pause the itinerary before anyone pretends they are spitting for discipline.</p></div>${figure('barrels', 'Cellar hush as brand atmosphere')}</div><div class="team-grid">${team.map((member) => `<article>${figure(member.image, `${member.name} — ${member.role}`)}<h3>${member.name}</h3><p class="role">${member.role}</p><p>${member.bio}</p></article>`).join('')}</div></section>`;
}

function renderFaq() {
  return `<section class="page-stack"><header class="page-head"><p class="eyebrow">Tasting Q&A</p><h2>Questions poured before the first glass</h2></header><div class="faq-list">${faqItems.map((item, index) => `<article><span class="faq-no">${String(index + 1).padStart(2, '0')}</span><h3>${item.q}</h3><p>${item.a}</p></article>`).join('')}</div></section>`;
}

function renderOfferings() {
  return `<section class="page-stack"><header class="page-head"><p class="eyebrow">Wine list</p><h2>Services written like a menu</h2></header><div class="menu-board">${offerings.map((item) => `<article><span>${item.code}</span><h3>${item.title}</h3><p>${item.text}</p></article>`).join('')}</div></section>`;
}

function renderResources() {
  return `<section class="page-stack"><header class="page-head"><p class="eyebrow">Cellar notes</p><h2>Short reads to improve the pour</h2></header><div class="faq-list">${resources.map((item) => `<article><h3>${item.title}</h3><p>${item.text}</p></article>`).join('')}</div></section>`;
}

function renderContact(site) {
  return `<section class="page-stack"><header class="page-head"><p class="eyebrow">Reservations</p><h2>Book the fictional table</h2></header><div class="two-col"><div><p>${site.description}</p><p>Write for departures, private tastings, or the common question: half-day now, full-day later, or full-day immediately because restraint was never the plan.</p></div><dl><div><dt>Contact</dt><dd>${site.contact.name}</dd></div><div><dt>Email</dt><dd><a href="mailto:${site.contact.email}">${site.contact.email}</a></dd></div><div><dt>Phone</dt><dd><a href="tel:${site.contact.phone.replace(/\s+/g, '')}">${site.contact.phone}</a></dd></div><div><dt>Domain</dt><dd><a href="https://${site.domain}" target="_blank" rel="noreferrer">${site.domain}</a></dd></div></dl></div></section>`;
}

function renderDetail(site) {
  return `<section class="page-stack"><header class="page-head"><p class="eyebrow">Long pour</p><h2>${site.detailPage.title}</h2><p class="dek">${site.detailPage.summary}</p></header><article class="story-row">${figure('valley', 'Morning: landscape sets the palate before the glass does')}<div><h3>Start outside</h3><p>The best wine day begins with landscape rather than jargon. Hills, rows, light on the river, and a road that teaches pacing before anyone says tannin.</p><p>That is why the house always begins with a view if it can.</p></div></article><article class="story-row reverse"><div><h3>Then move indoors</h3><p>Cellars slow the pulse. Wood, shadow, temperature, and quiet make tasting easier because the room itself suggests attentiveness.</p><p>${site.detailPage.facts[1].label}: <strong>${site.detailPage.facts[1].value}</strong>. We print the number plainly and let the slower pleasures do the rest.</p></div>${figure('barrels', 'Midday: the cellar asks for attention, not speed')}</article><article class="story-row">${figure('tasting', 'End well — cheese, notes, and one last comparison')}<div><h3>Finish at the table, not at the clock</h3><p>The lasting memory is usually not the most technical sentence. It is the glass beside lunch, the companionable disagreement about favorites, the bottle you almost bought, and the road back to Lisbon with enough quiet left in it.</p></div></article></section>`;
}

function footer(site) {
  return `<footer class="cellar-footer"><p><strong>${site.companyName}</strong> prefers a slower pour and smaller groups.</p><p class="compliance">Fictional cellar-door presentation only; the company, vineyards, staff, and booking details here are invented for the Lisbon Atlas demo.</p></footer>`;
}

export function render(site, section = 'home') {
  const sections = { home: renderHome(site), about: renderAbout(site), faq: renderFaq(site), contact: renderContact(site), offerings: renderOfferings(site), resources: renderResources(site), detail: renderDetail(site) };
  return `<div class="site-shell-23">${nav(site, section)}<main class="wine-main">${sections[section] || sections.home}</main>${footer(site)}</div>`;
}
