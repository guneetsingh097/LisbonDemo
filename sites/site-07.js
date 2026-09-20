const sections = ["home", "about", "faq", "contact", "offerings", "resources", "detail"];

const credits = {
  "../images-pexels/fado-music-1.jpg": "Photo by Tiff Ng / Pexels",
  "../images-pexels/fado-music-2.jpg": "Photo by Vinícius Trindade / Pexels",
  "../images-pexels/fado-music-3.jpg": "Photo by Mateus Castro / Pexels",
  "../images-pexels/fado-guitar-player-1.jpg": "Photo by Jonathan Mendoza / Pexels",
  "../images-pexels/fado-guitar-player-5.jpg": "Photo by Alena Darmel / Pexels",
  "../images-pexels/live-music-venue-night-2.jpg": "Photo by Helena Lopes / Pexels",
  "../images-pexels/live-music-venue-night-5.jpg": "Photo by Matheus Bertelli / Pexels",
  "../images-pexels/concert-crowd-silhouette-1.jpg": "Photo by Ludvig Hedenborg / Pexels",
  "../images-pexels/alfama-street-1.jpg": "Photo by Lajos Kristóf Kántor / Pexels",
  "../images-pexels/miradouro-viewpoint-2.jpg": "Photo by Mick Haupt / Pexels"
};

const faqItems = [
  ["How early should I arrive for an evening at Casa do Eco?", "Twenty quiet minutes is ideal. The room darkens early, and late arrivals feel louder than they are."],
  ["Is dinner part of the ticket?", "Sometimes the fictional programme pairs supper and song; sometimes the night belongs only to the voice. The page tells you which."],
  ["Do singers perform every night?", "No. Some evenings are guitarra-led, some are singer-led, and some are conversation-format listening sessions."],
  ["Can I take photographs during a set?", "Please do not. Here, silence is part of the performance and bright screens break the spell for everyone nearby."],
  ["Is this venue closer to Alfama or Baixa?", "Closer in feeling to Alfama: stone lanes, steep approaches, and that hour when the city begins to echo."],
  ["Will I understand the lyrics if I do not speak Portuguese?", "Yes—emotion first, then context. We offer brief English notes for themes, never intrusive translations mid-song."],
  ["Are there late sessions after dinner in Chiado or Baixa?", "Fictionally, yes. The later programmes are designed for people who want music after the city has thinned out."],
  ["Is the room appropriate for first-time fado listeners?", "Very much so. We explain applause, pauses, and the role of the guitarra portuguesa without sounding like a museum label."],
  ["What if I am continuing on to Belém, Sintra, or Cascais the next day?", "Choose an earlier sitting. The last set should leave you moved, not stranded and sleepy before a train."],
  ["Do group visits work for writers or music students?", "Yes, in the fictional world of this house. Small groups can request a pre-set briefing on repertoire, room etiquette, and Lisbon's nocturnal listening culture."],
  ["Is the room step-free?", "Access notes are provided as demo guidance only. Always verify live conditions before relying on them."],
  ["Why mention that one creaking floorboard?", "Because every singer learns it. The room keeps its own memory, and we would rather tell the truth than sand it away."]
];

const offerings = [
  {
    title: "Primeiro Silêncio seating",
    body: "An early programme built for listeners who want candlelight, a short supper, and the first set before the city grows noisy."
  },
  {
    title: "Mesa de Fado supper pairing",
    body: "A fictional dinner-and-performance format with compact courses timed around the stage, never over it."
  },
  {
    title: "Midnight warehouse session",
    body: "Later nights, fewer tables, darker light, longer pauses—meant for listeners willing to let the room breathe."
  },
  {
    title: "Guitarra close-listening brief",
    body: "A fifteen-minute prelude on phrasing, accompaniment, and what to notice when the singer falls back and the strings move forward."
  },
  {
    title: "Small-circle writer nights",
    body: "Notebook-friendly fictional evenings for critics, poets, translators, and anyone listening for language as much as melody."
  },
  {
    title: "Respectful group tables",
    body: "Quiet group placement for culture writers, conference guests, and visiting choirs who understand that this is not a loud dinner show."
  }
];

const resources = [
  ["A first listener's map to saudade", "A plain, unsentimental note on why the word matters, and why it still does not explain everything."],
  ["When to clap, when not to", "A practical etiquette sheet for evenings in Alfama, Mouraria, and any room where the singer is carrying the air alone."],
  ["The walk back through nighttime Lisbon", "A reflective route note for leaving a set and crossing the city without breaking the mood too quickly."],
  ["Guitarra portuguesa: what your ear is hearing", "A short field guide to brightness, ornament, and the sudden turn of a phrase."],
  ["Why small fado rooms feel larger than concert halls", "On architecture, hush, and the strange scale of a single voice in the dark."]
];

const gallery = [
  {
    src: "../images-pexels/fado-music-1.jpg",
    alt: "Fado mural in Lisbon street art.",
    caption: "Street memory before the first note."
  },
  {
    src: "../images-pexels/fado-guitar-player-1.jpg",
    alt: "Musician with guitar on stage.",
    caption: "The room narrows around the strings."
  },
  {
    src: "../images-pexels/live-music-venue-night-2.jpg",
    alt: "Acoustic musicians performing at night.",
    caption: "Acoustics before amplification."
  },
  {
    src: "../images-pexels/concert-crowd-silhouette-1.jpg",
    alt: "Audience silhouettes under stage lights.",
    caption: "A crowd reduced to listening."
  }
];

const detailFlow = [
  {
    heading: "19:10 — the street outside still belongs to the city",
    text: "You arrive from Baixa or Chiado with the day's noise still clinging to you. There are scooters, cutlery, bright tram windows, perhaps one last uphill complaint. Then the doorway takes the light down a register. The house staff speak softly. Coats are folded away. The room does not ask for devotion—only for attention.",
    image: {
      src: "../images-pexels/alfama-street-1.jpg",
      alt: "Cobblestone lane in Lisbon.",
      caption: "The climb toward the room matters."
    }
  },
  {
    heading: "19:40 — plates arrive, conversation does not linger",
    text: "The supper format here is deliberately secondary. Bowls, bread, wine, steam. Enough to settle the body before the singing starts. Too much service would fracture the set, so the rhythm is simple: eat, pause, wait. If you have come for spectacle, the room gently disappoints you. If you have come for concentration, the room begins to open.",
    image: {
      src: "../images-pexels/fado-music-2.jpg",
      alt: "Musicians by the water in Lisbon.",
      caption: "Not every fado story begins indoors."
    }
  },
  {
    heading: "20:05 — one spotlight, no excess",
    text: "This is where the amber enters. Not gold, not glamour—just enough light to lift a hand, a cheekbone, the curve of a guitarra. The 1968 warehouse bones still show through: dark timber, rough edges, a floor that remembers weight. One board near the front creaks at the wrong frequency. Every singer learns the geography. Every regular knows exactly where not to step.",
    image: {
      src: "../images-pexels/fado-guitar-player-5.jpg",
      alt: "Guitarist performing under stage lights.",
      caption: "Amber used like a stage lamp—once, then gone."
    }
  },
  {
    heading: "20:22 — canção, pausa, respiração (song, pause, breath)",
    text: "The programme is built as a vertical sequence, not a variety show. Song, pause, another song, a half-whispered introduction, then silence again. The structure teaches newcomers how to listen: no chatter over the endings, no scrambling for the camera, no applause that arrives before the lyric has fully left the air.",
    image: {
      src: "../images-pexels/live-music-venue-night-5.jpg",
      alt: "Small club performance at night.",
      caption: "A room can become its own instrument."
    }
  },
  {
    heading: "21:10 — afterwards, the city sounds different",
    text: "Leaving a good fado house should alter the walk home. The tram bell feels thinner. Rua voices feel further away. A miradouro above Alfama seems to keep a little of the set in it. That is the point of Casa do Eco as a fictional venue: not simply to sell an evening, but to change the acoustics of the rest of the night.",
    image: {
      src: "../images-pexels/miradouro-viewpoint-2.jpg",
      alt: "Person photographing Lisbon sunset from a viewpoint.",
      caption: "The after-silence belongs to the city again."
    }
  }
];

function figure(image, extraClass = "") {
  return `
    <figure class="ce-figure ${extraClass}">
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
    home: "Programme",
    about: "House",
    offerings: "Evenings",
    resources: "Notes",
    detail: "Long Night",
    faq: "Questions",
    contact: "Listen"
  };

  return `
    <div class="ce-corner">
      <div class="ce-drawer-mark">≡</div>
      <div class="ce-drawer">
        ${sections
          .map(
            (item) => `
              <a class="${item === section ? "is-active" : ""}" href="#/site/${site.id}/${item}">
                ${labels[item]}
              </a>
            `
          )
          .join("")}
        <div class="ce-return-links">
          <a href="#/">Ecosystem home</a>
          <a href="#/navigate">Quick navigate</a>
        </div>
      </div>
    </div>
  `;
}

function header(site) {
  return `
    <header class="ce-header">
      <p class="ce-kicker">Casa do Eco — casa de fado inventada</p>
      <h1>${site.companyName}</h1>
      <p class="ce-subtitle">No excess. No chatter. Only the room, the voice, and the echo.</p>
    </header>
  `;
}

function footer(site) {
  return `
    <footer class="ce-footer">
      <p class="ce-footer-line">Fictional demonstration venue; the songs, seatings, and suppers here are invented — but the hush is taken seriously.</p>
      <div class="ce-footer-meta">
        <span>${site.companyName}</span>
        <a href="mailto:${site.contact.email}">${site.contact.email}</a>
        <span>${site.contact.phone}</span>
        <span>${site.domain}</span>
      </div>
    </footer>
  `;
}

function homeSection(site) {
  const homeImages = [
    {
      src: "../images-pexels/fado-music-3.jpg",
      alt: "Night guitarist performing outdoors.",
      caption: "Poster wall no. 1 — the city leans closer."
    },
    {
      src: "../images-pexels/fado-guitar-player-1.jpg",
      alt: "Performer playing guitar on stage.",
      caption: "Poster wall no. 2 — strings before speech."
    },
    {
      src: "../images-pexels/live-music-venue-night-2.jpg",
      alt: "Two musicians playing at night.",
      caption: "Poster wall no. 3 — acoustic light."
    },
    {
      src: "../images-pexels/concert-crowd-silhouette-1.jpg",
      alt: "Audience in silhouette at a concert.",
      caption: "Poster wall no. 4 — an audience learning silence."
    }
  ];

  return `
    <section class="ce-home">
      <div class="ce-poster">
        <p class="ce-date">WAREHOUSE 1968 / REOPENED 2009</p>
        <h2>Tonight the room keeps the city outside.</h2>
        <p>${site.description}</p>
      </div>
      <div class="ce-scroll-note">
        <p><em>Saudade</em> (longing) is not a theme night. It is a temperature. We programme accordingly.</p>
      </div>
      <section class="ce-program-block">
        <h3>Three ways to enter the evening</h3>
        <div class="ce-program-lines">
          <article>
            <span>01</span>
            <h4>Listen first</h4>
            <p>Brief cultural notes, clear etiquette, and exact arrival cues for first-time listeners who would rather not guess.</p>
          </article>
          <article>
            <span>02</span>
            <h4>Supper quietly</h4>
            <p>A restrained dinner rhythm timed so plates never compete with lyric or guitarra.</p>
          </article>
          <article>
            <span>03</span>
            <h4>Leave altered</h4>
            <p>Night-walk notes for Alfama, Baixa, and miradouro detours after the last set has finished changing the air.</p>
          </article>
        </div>
      </section>
      <section class="ce-poster-strip">
        ${homeImages.map((image, index) => figure(image, `poster-${index + 1}`)).join("")}
      </section>
      <section class="ce-gallery-block">
        <h3>Archive of the room</h3>
        <div class="ce-gallery">
          ${gallery.map((image) => figure(image, "gallery-tile")).join("")}
        </div>
      </section>
    </section>
  `;
}

function aboutSection() {
  const team = [
    {
      name: "Iria Falcão",
      role: "Venue director",
      bio: "Knows which chair legs scrape, which light needs dimming, and where that infamous 1968 floorboard still betrays the careless foot.",
      image: {
        src: "../images-pexels/fado-music-2.jpg",
        alt: "Two musicians by the water.",
        caption: "Iria programmes the room for concentration, never for noise."
      }
    },
    {
      name: "Tomás Varela",
      role: "House guitarist and music host",
      bio: "Explains the guitarra portuguesa in three sentences, then lets the strings do the rest of the speaking.",
      image: {
        src: "../images-pexels/fado-guitar-player-1.jpg",
        alt: "Musician with guitar on stage.",
        caption: "Tomás introduces structure without breaking the spell."
      }
    },
    {
      name: "Marta Seabra",
      role: "Floor lead",
      bio: "Times supper drops to the second set and can settle a table with one raised eyebrow.",
      image: {
        src: "../images-pexels/live-music-venue-night-5.jpg",
        alt: "Live performance in a small venue.",
        caption: "Marta makes service disappear at the right moment."
      }
    },
    {
      name: "Rui Nogueira",
      role: "Night editor",
      bio: "Writes the house notes in fragments, because too many words before a song are already too many words.",
      image: {
        src: "../images-pexels/fado-music-1.jpg",
        alt: "Fado-themed mural art.",
        caption: "Rui keeps the printed notes spare and sharp."
      }
    }
  ];

  return `
    <section class="ce-about">
      <article class="ce-essay">
        <h2>The house keeps its own tempo.</h2>
        <p>Casa do Eco began with a warehouse room and a stubborn idea: that a website for a fado house should prepare the listener, not merely tempt them. The fictional founders kept the raw bones of the 1968 space—dark beams, imperfect floor, sound that carries sideways before it rises. They even kept the one board that creaks near the front, because every singer who matters learns where the room objects.</p>
        <p>That quirk became a matter of pride. New vocalists are told about it on the first afternoon. Guitarists grin when guests never notice. Regulars look for the slight shift in the singer's step and understand they are watching someone who already belongs to the room.</p>
        <p>Our mission is simple: to make an invented fado venue feel as specific and usable as a real one. We explain etiquette without sermonizing, programme fictional evenings without empty glamour, and frame Lisbon night life as something to enter reverently rather than consume loudly.</p>
        <p>Local expertise matters here. We write for people moving between Alfama, Mouraria, Baixa, Chiado, Belém day trips, Sintra mornings, and late returns from the riverfront. A good night of fado depends on the hours before it as much as on the songs themselves.</p>
      </article>
      <section class="ce-team">
        <h3>People behind the hush</h3>
        <div class="ce-team-list">
          ${team
            .map(
              (member) => `
                <article class="ce-team-card">
                  ${figure(member.image, "team-shot")}
                  <div>
                    <h4>${member.name}</h4>
                    <p class="ce-role">${member.role}</p>
                    <p>${member.bio}</p>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    </section>
  `;
}

function faqSection() {
  return `
    <section class="ce-faq">
      <h2>Questions asked in a lower voice</h2>
      <div class="ce-faq-list">
        ${faqItems
          .map(
            ([q, a], index) => `
              <details ${index === 0 ? "open" : ""}>
                <summary>${q}</summary>
                <p>${a}</p>
              </details>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function offeringsSection() {
  return `
    <section class="ce-offerings">
      <h2>Evening formats</h2>
      <div class="ce-offering-list">
        ${offerings
          .map(
            (item, index) => `
              <article>
                <span>${String(index + 1).padStart(2, "0")}</span>
                <h3>${item.title}</h3>
                <p>${item.body}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function resourcesSection() {
  return `
    <section class="ce-resources">
      <h2>Printed notes tucked under the programme</h2>
      <div class="ce-resource-stack">
        ${resources
          .map(
            ([title, text], index) => `
              <article>
                <p class="ce-resource-no">${String(index + 1).padStart(2, "0")}</p>
                <h3>${title}</h3>
                <p>${text}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function contactSection(site) {
  return `
    <section class="ce-contact">
      <h2>Ask before the lights fall</h2>
      <p>For invented ticket formats, house rules, group etiquette briefings, or which sitting best suits a next-day train to Sintra or Cascais, write to the house directly.</p>
      <dl class="ce-contact-list">
        <div><dt>Contact</dt><dd>${site.contact.name}</dd></div>
        <div><dt>Email</dt><dd><a href="mailto:${site.contact.email}">${site.contact.email}</a></dd></div>
        <div><dt>Phone</dt><dd><a href="tel:${site.contact.phone.replace(/\s+/g, "")}">${site.contact.phone}</a></dd></div>
        <div><dt>Domain</dt><dd>${site.domain}</dd></div>
      </dl>
      <p class="ce-contact-note">This is not a booking engine. It is an atmospheric demonstration property with a very specific idea of how the night should sound.</p>
    </section>
  `;
}

function detailSection() {
  return `
    <section class="ce-detail">
      <h2>One full fictional night at Casa do Eco</h2>
      <div class="ce-detail-flow">
        ${detailFlow
          .map(
            (item) => `
              <article class="ce-detail-stop">
                <div class="ce-detail-text">
                  <h3>${item.heading}</h3>
                  <p>${item.text}</p>
                </div>
                ${figure(item.image, "detail-shot")}
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

export function render(site, section) {
  const current = sections.includes(section) ? section : "home";
  const content = {
    home: homeSection(site),
    about: aboutSection(site),
    faq: faqSection(site),
    contact: contactSection(site),
    offerings: offeringsSection(site),
    resources: resourcesSection(site),
    detail: detailSection(site)
  };

  return `
    <div class="site-shell-7">
      <div class="ce-stage">
        ${nav(site, current)}
        ${header(site)}
        <main class="ce-main">
          ${content[current]}
        </main>
        ${footer(site)}
      </div>
    </div>
  `;
}
