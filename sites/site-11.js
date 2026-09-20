const sections = ["home", "about", "faq", "contact", "offerings", "resources", "detail"];

const credits = {
  "../images-pexels/woman-traveling-alone-city-4.jpg": "Photo by Min An / Pexels",
  "../images-pexels/miradouro-viewpoint-2.jpg": "Photo by Mick Haupt / Pexels",
  "../images-pexels/outdoor-cafe-terrace-5.jpg": "Photo by Haberdoedas Photography / Pexels",
  "../images-pexels/alfama-street-1.jpg": "Photo by Lajos Kristóf Kántor / Pexels",
  "../images-pexels/solo-traveler-1.jpg": "Photo by Yan Krukau / Pexels",
  "../images-pexels/woman-traveling-alone-city-2.jpg": "Photo by ArtHouse Studio / Pexels",
  "../images-pexels/coffee-shop-interior-4.jpg": "Photo by Daniel Dang / Pexels",
  "../images-pexels/city-map-guide-1.jpg": "Photo by Porapak Apichodilok / Pexels",
  "../images-pexels/outdoor-cafe-terrace-2.jpg": "Photo by Rafael Gonzales / Pexels",
  "../images-pexels/alfama-street-3.jpg": "Photo by Mateus Castro / Pexels"
};

const faqItems = [
  ["Is Uma Mesa Lisboa a real travel service?", "No. It is a fictional solo-travel journal created for the demo ecosystem."],
  ["Why is everything arranged like dated essays?", "Because this site follows the shape of a literary journal, where dates do the organizing and silence does some of the speaking."],
  ["Are the routes and budgets real?", "No. Every itinerary, timing, and cost cue is fictional."],
  ["Does the site focus on safety?", "Yes, but in a practical way. Light, route confidence, battery, transit comfort, and seating—not fear."],
  ["Is this only for women traveling alone?", "No. The notes are written for any solo traveler, while recognizing that different readers carry different concerns."],
  ["Can I use this for a first Lisbon trip?", "Yes as orientation and tone. No as a replacement for current transport, venue, or safety information."],
  ["What neighborhoods show up most often?", "Chiado, Baixa, Alfama, riverfront routes, and quieter corners where being alone feels natural rather than conspicuous."],
  ["Why no cards or grid blocks?", "The brand brief calls for an essay shape: one column, one date, one thought carried far enough to matter."],
  ["Does it recommend places to eat alone?", "Often. Café counters, early dinners, terrace corners, and rooms where a book looks welcome."],
  ["Are the notebook pages real?", "The notebook-first origin story is fictional brand lore, but the pages are meant to feel handwritten in spirit."],
  ["What if I only have one evening in Lisbon?", "Read the detail page. It is built around exactly that kind of quiet, self-directed evening."],
  ["Is there advice for Sintra or Cascais day trips?", "Only lightly. This journal stays closest to the solo moods of the city itself."]
];

const offerings = [
  {
    title: "Solo day essays",
    body: "Reflective city routes for one person moving at their own pace and changing plans without committee approval."
  },
  {
    title: "Tables for one",
    body: "Dining-alone notes centered on comfort, atmosphere, reading friendliness, and the freedom of an early meal."
  },
  {
    title: "After-dark guidance",
    body: "Calm evening plans that keep well-lit returns and transit clarity in view."
  },
  {
    title: "Quiet-corner notebooks",
    body: "Gardens, viewpoints, libraries, and cafés where solitude feels companionable rather than empty."
  }
];

const resources = [
  ["What I carry after sunset", "Phone battery, thin scarf, backup route, and one café option in case the evening turns too sharp."],
  ["The soft skill of choosing an easier route", "A short essay on when independence looks like ambition and when it looks like kindness to yourself."],
  ["How to ask for a table for one without apology", "Language, body posture, and why taking up exactly one seat is not a moral event."],
  ["Quiet corners between Baixa and Alfama", "Places to stop when the city feels full but you still want to stay out a little longer."],
  ["Museum-to-dinner transitions for solo days", "How to move from inward-looking afternoons into evenings that do not require a crowd."]
];

const gallery = [
  {
    src: "../images-pexels/woman-traveling-alone-city-4.jpg",
    alt: "Woman with backpack in an alley.",
    caption: "A lane that feels kind."
  },
  {
    src: "../images-pexels/outdoor-cafe-terrace-5.jpg",
    alt: "Quiet terrace with greenery.",
    caption: "A table that leaves you alone properly."
  },
  {
    src: "../images-pexels/miradouro-viewpoint-2.jpg",
    alt: "Person photographing Lisbon from a viewpoint.",
    caption: "A pause large enough for thought."
  },
  {
    src: "../images-pexels/alfama-street-1.jpg",
    alt: "Cobblestone Lisbon street.",
    caption: "Streets that ask for slower feet."
  }
];

const detailEntries = [
  {
    heading: "13 March — 10:10",
    text: "I begin in a neighborhood where I do not feel watched. That matters more than the first monument of the day. Solo travel is not only about bravery. It is also about choosing the street that lets your shoulders lower.",
    image: {
      src: "../images-pexels/woman-traveling-alone-city-4.jpg",
      alt: "Backpacker walking in an alley.",
      caption: "A beginning without performance."
    }
  },
  {
    heading: "13 March — 14:25",
    text: "Lunch alone is easiest when the table does not pretend to be a stage. I look for a room that tolerates a notebook, a phone face down, and a slower sip of water. The city is generous when you stop asking it to entertain you every minute.",
    image: {
      src: "../images-pexels/outdoor-cafe-terrace-2.jpg",
      alt: "Cafe tables from above.",
      caption: "One chair, enough company."
    }
  },
  {
    heading: "13 March — 18:40",
    text: "A viewpoint at dusk is a good place to test the day. Not whether it was productive. Whether it let you notice anything. Whether the route back is clear. Whether staying out another hour feels like curiosity or fatigue pretending to be courage.",
    image: {
      src: "../images-pexels/miradouro-viewpoint-2.jpg",
      alt: "Photographer at Lisbon sunset.",
      caption: "Dusk asks gentler questions."
    }
  },
  {
    heading: "13 March — 21:05",
    text: "By evening I want warmth, a known route home, and one last room where being alone is not remarkable. The best solo city days end without fanfare. You return a little quieter than you left, which is its own kind of souvenir.",
    image: {
      src: "../images-pexels/coffee-shop-interior-4.jpg",
      alt: "Cozy bookshop cafe interior.",
      caption: "A last room before home."
    }
  }
];

function figure(image, extraClass = "") {
  return `
    <figure class="uml-figure ${extraClass}">
      <img src="${image.src}" alt="${image.alt}">
      <figcaption>
        <strong>${image.caption}</strong>
        <span>${credits[image.src]}</span>
      </figcaption>
    </figure>
  `;
}

function nav(site, section) {
  const labels = {
    home: "Journal",
    about: "About",
    offerings: "Themes",
    resources: "Notes",
    detail: "One day alone",
    faq: "Questions",
    contact: "Contact"
  };

  return `
    <header class="uml-header">
      <p class="uml-kicker">Quiet journal for solo travelers</p>
      <h1>${site.companyName}</h1>
      <p class="uml-dek">Present tense. Soft routes. Tables for one.</p>
      <nav class="uml-nav" aria-label="Section navigation">
        ${sections
          .map(
            (item) => `
              <a class="${item === section ? "is-active" : ""}" href="#/site/${site.id}/${item}">
                ${labels[item]}
              </a>
            `
          )
          .join("")}
      </nav>
      <div class="uml-links">
        <a href="#/">Ecosystem home</a>
        <a href="#/navigate">Quick navigate</a>
      </div>
    </header>
  `;
}

function footer(site) {
  return `
    <footer class="uml-footer">
      <p>This journal is fictional demonstration prose. The routes and reassurances are invented, though the need for both is real enough.</p>
      <div class="uml-footer-meta">
        <span>${site.companyName}</span>
        <a href="mailto:${site.contact.email}">${site.contact.email}</a>
        <span>${site.contact.phone}</span>
        <span>${site.domain}</span>
      </div>
    </footer>
  `;
}

function homeSection(site) {
  return `
    <article class="uml-entry">
      <p class="uml-date">14 September</p>
      <h2>Arriving alone is not the same as arriving unaccompanied.</h2>
      <p>${site.description} This page keeps to one column because I want the reading pace to resemble a walk: not rushed, not fragmented, easy to continue.</p>
      <p>I write for the traveler who wants Lisbon without a performance of spontaneity. A good solo day is often made of small decisions done well: the right café at the right hour, the less dramatic route uphill, the moment you choose to sit instead of push on.</p>
      <div class="uml-pull">Some cities reward a crowd. Lisbon often rewards one attentive person moving a little slower.</div>
      <section class="uml-gallery">
        ${[
          {
            src: "../images-pexels/woman-traveling-alone-city-4.jpg",
            alt: "Woman walking with backpack in an alley.",
            caption: "Morning route."
          },
          {
            src: "../images-pexels/outdoor-cafe-terrace-5.jpg",
            alt: "Terrace seating with greenery.",
            caption: "Lunch alone."
          },
          {
            src: "../images-pexels/miradouro-viewpoint-2.jpg",
            alt: "Sunset over Lisbon from a viewpoint.",
            caption: "Evening pause."
          },
          {
            src: "../images-pexels/coffee-shop-interior-4.jpg",
            alt: "Bookshop cafe interior.",
            caption: "A final room."
          }
        ].map((image) => figure(image, "uml-gallery-item")).join("")}
      </section>
      <section class="uml-mini-notes">
        <h3>Quiet corner file</h3>
        <p>Chiado for a mid-afternoon coffee. Baixa for straight lines when your energy dips. Alfama only when you want the climb and not when the climb wants you. The riverfront when you need space instead of stimulation.</p>
      </section>
      <section class="uml-gallery">
        ${gallery.map((image) => figure(image, "uml-gallery-item")).join("")}
      </section>
    </article>
  `;
}

function aboutSection() {
  const team = [
    {
      name: "Amália Cardoso",
      role: "Editor",
      bio: "Writes the entries first in a paper notebook, then edits them down until only the honest parts remain.",
      image: {
        src: "../images-pexels/city-map-guide-1.jpg",
        alt: "Traveler holding a map.",
        caption: "Lara keeps the map folded until needed."
      }
    },
    {
      name: "Noé Rua",
      role: "Quiet-corner writer",
      bio: "Finds libraries, terraces, and river benches that allow solitude without theatrical loneliness.",
      image: {
        src: "../images-pexels/outdoor-cafe-terrace-5.jpg",
        alt: "Terrace seating with plants.",
        caption: "Noé notices which rooms let silence sit comfortably."
      }
    },
    {
      name: "Guilherme Sarmento",
      role: "Transit confidence note-taker",
      bio: "Turns stations, trams, and route choices into calm instructions instead of stress multipliers.",
      image: {
        src: "../images-pexels/alfama-street-1.jpg",
        alt: "Lisbon street with sea view.",
        caption: "Carmo prefers the clearer route to the cleverer one."
      }
    }
  ];

  return `
    <article class="uml-entry">
      <p class="uml-date">About</p>
      <h2>An essay-shaped guide for one person at a time.</h2>
      <p>Uma Mesa Lisboa belongs to a contemporary indie-journal lineage: narrow column, reflective prose, generous white space, and no need to shout. The site is built around the feeling that the reader and writer are sitting across one small table.</p>
      <p>The brand quirk—every entry handwritten first in a notebook—matters because it explains the pace. Nothing here is optimized for speed except reassurance. The mission is to make solo travel feel companionable without pretending the city or the writer can accompany you everywhere.</p>
      <p>Local expertise shows up quietly: when to linger in Chiado, when Baixa is better for straight-line confidence, when Alfama will feel atmospheric and when it will simply feel uphill, when dusk asks for a café instead of another landmark.</p>
      <div class="uml-team">
        ${team
          .map(
            (member) => `
              <section class="uml-team-card">
                ${figure(member.image, "uml-team-image")}
                <h3>${member.name}</h3>
                <p class="uml-role">${member.role}</p>
                <p>${member.bio}</p>
              </section>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}

function faqSection() {
  return `
    <article class="uml-entry">
      <p class="uml-date">Questions</p>
      <h2>Things readers ask before they set out alone.</h2>
      <div class="uml-stack">
        ${faqItems
          .map(
            ([q, a]) => `
              <section>
                <h3>${q}</h3>
                <p>${a}</p>
              </section>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}

function offeringsSection() {
  return `
    <article class="uml-entry">
      <p class="uml-date">Themes</p>
      <h2>What the journal returns to.</h2>
      <div class="uml-stack">
        ${offerings
          .map(
            (item) => `
              <section>
                <h3>${item.title}</h3>
                <p>${item.body}</p>
              </section>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}

function resourcesSection() {
  return `
    <article class="uml-entry">
      <p class="uml-date">Notes</p>
      <h2>Small guidance for independent days.</h2>
      <div class="uml-stack">
        ${resources
          .map(
            ([title, text]) => `
              <section>
                <h3>${title}</h3>
                <p>${text}</p>
              </section>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}

function contactSection(site) {
  return `
    <article class="uml-entry">
      <p class="uml-date">Contact</p>
      <h2>Write to the journal.</h2>
      <p>For fictional reader notes, essay ideas, or questions about traveling alone without turning it into a self-improvement competition, use the details below.</p>
      <dl class="uml-contact">
        <div><dt>Editor</dt><dd>${site.contact.name}</dd></div>
        <div><dt>Email</dt><dd><a href="mailto:${site.contact.email}">${site.contact.email}</a></dd></div>
        <div><dt>Phone</dt><dd><a href="tel:${site.contact.phone.replace(/\s+/g, "")}">${site.contact.phone}</a></dd></div>
        <div><dt>Domain</dt><dd>${site.domain}</dd></div>
      </dl>
    </article>
  `;
}

function detailSection() {
  return `
    <article class="uml-entry">
      <p class="uml-date">One day alone</p>
      <h2>A full fictional solo day, written in the order it was felt.</h2>
      <div class="uml-stack">
        ${detailEntries
          .map(
            (item) => `
              <section>
                <h3>${item.heading}</h3>
                <p>${item.text}</p>
                ${figure(item.image, "uml-detail-image")}
              </section>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}

export function render(site, section) {
  const current = sections.includes(section) ? section : "home";
  const content = {
    home: homeSection(site),
    about: aboutSection(),
    faq: faqSection(),
    contact: contactSection(site),
    offerings: offeringsSection(),
    resources: resourcesSection(),
    detail: detailSection()
  };

  return `
    <div class="site-shell-11">
      ${nav(site, current)}
      <main class="uml-main">
        ${content[current]}
      </main>
      ${footer(site)}
    </div>
  `;
}
