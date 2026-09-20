export function render(site, section) {
  const current = section || "home";
  const links = [["home","Home"],["about","About"],["faq","FAQ"],["contact","Contact"],["offerings","Offerings"],["resources","Resources"],["detail","Detail"]];
  const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  const images = {
    meet: { src: "../images-pexels/business-meeting-1.jpg", alt: "Business meeting around a table", credit: "Photo by Christina Morillo / Pexels" },
    room: { src: "../images-pexels/conference-room-meeting-3.jpg", alt: "Conference room with chairs and projection setup", credit: "Photo by Werner Pfennig / Pexels" },
    cowork: { src: "../images-pexels/coworking-space-1.jpg", alt: "Coworking workspace interior", credit: "Photo by Kindel Media / Pexels" },
    center: { src: "../images-pexels/hotel-business-center-4.jpg", alt: "Hotel business center work area", credit: "Photo by Stephen Leonardi / Pexels" },
    lounge: { src: "../images-pexels/airport-lounge-1.jpg", alt: "Airport lounge seating and work area", credit: "Photo by Valeria Drozdova / Pexels" },
    laptop: { src: "../images-pexels/remote-work-laptop-4.jpg", alt: "Laptop set up for remote work", credit: "Photo by Ivan S / Pexels" },
    handshake: { src: "../images-pexels/business-handshake-3.jpg", alt: "Business handshake between colleagues", credit: "Photo by Ketut Subiyanto / Pexels" },
    taxi: { src: "../images-pexels/taxi-airport-1.jpg", alt: "Airport taxi scene", credit: "Photo by YL Lew / Pexels" }
  };
  const faqItems = [
    ["Is this guide trying to sell corporate travel services?", "No. It is an editorial-style fictional resource organized like an internal briefing memo, not a booking engine."],
    ["Why are walk times mentioned so precisely?", "Because the brand's favorite quirk is stopwatch timing: after-hours recommendations are measured from business-hotel districts instead of described vaguely as nearby."],
    ["What should a traveler budget for airport-to-city timing?", "The guide uses a general 25-45 minute range and still advises checking live traffic or transit conditions before depending on the estimate."],
    ["Does the guide assume I will stay in Baixa?", "No. It discusses common business-hotel districts, including central corridors and Parque das Nações, then builds timing advice from those anchors."],
    ["Are the meeting venues real?", "No. Venue examples are illustrative only, shaped to show how a consultancy-style resource might classify options by formality, size, and logistics."],
    ["What if I need a client dinner after meetings in Chiado?", "The guide frames that as a logistics question first: walking time, reservation lead, noise profile, and return route back to the hotel district."],
    ["Is coworking only relevant for longer stays?", "Not necessarily. The memo treats day-pass coworking as a useful buffer for short trips with awkward gaps between meetings."],
    ["Does the guide cover airport lounge strategy?", "Yes, at a category level only. It discusses when lounge time can protect the schedule but does not endorse specific real programs."],
    ["What about visas or work permits?", "Those topics are explicitly outside scope. The guide points readers to official sources instead of pretending to be an authority."],
    ["How often is the guide reviewed?", "Quarterly in the fictional narrative, which reinforces the publication's memo-like, updateable character."],
    ["Is this a real consultancy publication?", "No. It is fictional, created for the Lisbon Atlas demo." ]
  ];
  const offerings = [
    ["1.0", "Airport-to-city timing guide", "General travel windows, transfer modes, and buffer logic for meetings scheduled close to arrival."],
    ["1.1", "Meeting venue brief", "Illustrative venue categories organized by formality, capacity, and travel friction."],
    ["1.2", "Coworking access brief", "Short-term workspace options for the traveler with a laptop, a call, and a schedule gap."],
    ["1.3", "After-hours planning", "Walk-time based recommendations measured from business-hotel districts."],
    ["1.4", "Client dining notes", "General venue-type guidance for conversations that need moderate noise and reliable service." ]
  ];
  const resources = [
    ["One-day Lisbon work trip: buffer math that actually matters", "An executive-summary approach to flight timing, hotel check-in, and first-meeting risk."],
    ["Coworking versus hotel business center", "A comparison for travelers who need focus, printing, calls, or just a dependable chair for two hours."],
    ["Client dinner near Chiado or Avenida? Start with the walk time", "A note on why after-hours planning belongs in the same memo as airport transfer logic."],
    ["How to read a venue brief in under three minutes", "A fast framework for scanning capacity, privacy, access, and transport fit." ]
  ];
  const detailSteps = [
    ["1.0", "Arrival and first meeting", "The fictional publication assumes time pressure. That means airport exit time matters more than airport aesthetics, hotel drop time matters more than room décor, and the first meeting should be planned with failure margins rather than optimism."],
    ["1.1", "Workspace between commitments", "Coworking and hotel business centers are treated as decision tools, not lifestyle symbols. If a traveler needs reliable Wi‑Fi, a call booth, and coffee within twelve minutes, that requirement should govern the choice."],
    ["1.2", "Venue posture", "A client breakfast, a boardroom presentation, and an internal debrief each ask for different acoustic and seating conditions. The guide sorts venue categories accordingly."],
    ["1.3", "After-hours without schedule drift", "The stopwatch quirk appears here in full. A recommendation is only useful if the traveler knows whether it is a six-minute reset or a nineteen-minute detour from the hotel district."],
    ["1.4", "Departure discipline", "Business travel ends well when departure timing is treated with the same seriousness as arrival timing. That is the memo's final thesis." ]
  ];
  const fig = (img, label, note) => `<figure class="memo-figure"><img src="${img.src}" alt="${esc(img.alt)}"><figcaption><strong>${label}</strong><span>${note}</span><span>${img.credit}</span></figcaption></figure>`;
  const nav = links.map(([slug, label], i) => `<a class="${current === slug ? "active" : ""}" href="#/site/${site.id}/${slug}">${i + 1}. ${label}</a>`).join("");
  const sections = {
    home: () => `
      <section class="memo-body">
        <article class="memo-section"><p class="memo-id">1.0</p><h1>${esc(site.siteName)}</h1><p>${esc(site.description)}</p><ul><li>Audience: short-stay professionals, event planners, working visitors.</li><li>Tone: briefing memo, not glossy city guide.</li><li>Bias: schedule integrity over sightseeing romance.</li></ul></article>
        <article class="memo-section"><p class="memo-id">1.1</p><h2>Executive summary</h2><p>Use this site when the trip has meetings, timing pressure, and limited attention. The layout mimics an early-2010s enterprise briefing because the intended reader wants the point before the flourish.</p></article>
      </section>
      <section class="memo-grid">
        ${fig(images.taxi, "Airport-to-city timing", "General estimate: 25–45 minutes depending on mode and conditions.")}
        ${fig(images.cowork, "Coworking buffer plan", "Day-pass thinking for the in-between hours.")}
        ${fig(images.room, "Meeting format selection", "Venue posture changes with audience, privacy, and AV needs.")}
        ${fig(images.lounge, "Lounge time as schedule insurance", "Useful when the airport becomes the last quiet workspace.")}
      </section>
      <section class="memo-body two-col">
        <article class="memo-section"><p class="memo-id">1.2</p><h2>After-hours note</h2><p>Every evening recommendation includes a stopwatch-style walk time from the nearest business-hotel district. That quirk is not decoration; it is the publication's way of respecting tired travelers.</p></article>
        <article class="memo-section"><p class="memo-id">1.3</p><h2>District fit</h2><p>Baixa offers centrality, Chiado blends meetings and dining, and Parque das Nações can reduce airport friction. Different schedules want different anchors.</p></article>
      </section>
    `,
    about: () => `
      <section class="memo-body two-col">
        <article class="memo-section"><p class="memo-id">2.0</p><h2>Origin</h2><p>${esc(site.about.story)} The stopwatch habit then hardened into a signature: after-hours suggestions must earn their place with a measured walk time, not with vague claims of convenience.</p><p><strong>Mission:</strong> ${esc(site.about.mission)}</p></article>
        ${fig(images.laptop, "Publishing logic", "If it cannot be scanned fast, it probably does not belong in the memo.")}
      </section>
      <section class="memo-grid">
        ${fig(images.meet, `${esc(site.about.team[0].name)} — ${esc(site.about.team[0].role)}. ${esc(site.about.team[0].bio)}`, "Editorial lead")}
        ${fig(images.room, `${esc(site.about.team[1].name)} — ${esc(site.about.team[1].role)}. ${esc(site.about.team[1].bio)}`, "Venue research")}
        ${fig(images.taxi, `${esc(site.about.team[2].name)} — ${esc(site.about.team[2].role)}. ${esc(site.about.team[2].bio)}`, "Transit timing")}
      </section>
      <section class="memo-body"><article class="memo-section"><p class="memo-id">2.1</p><h2>Local expertise</h2><p>The fictional editorial specialty lies in understanding how airport timing, hotel districts, coworking options, and after-hours client obligations all interact inside a short Lisbon trip.</p></article></section>
    `,
    faq: () => `<section class="faq-memo"><h2>Frequently raised executive questions</h2><dl>${faqItems.map(([q,a]) => `<div><dt>${q}</dt><dd>${a}</dd></div>`).join("")}</dl></section>`,
    contact: () => `<section class="memo-body two-col"><article class="memo-section"><p class="memo-id">3.0</p><h2>Editorial contact</h2><p>Readers may contact the fictional editorial desk regarding guide structure, logistics notes, or suggested future topics.</p><ul><li><strong>Contact:</strong> ${esc(site.contact.name)}</li><li><strong>Email:</strong> <a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a></li><li><strong>Phone:</strong> <a href="tel:${esc(site.contact.phone)}">${esc(site.contact.phone)}</a></li><li><strong>Domain:</strong> ${esc(site.domain)}</li></ul></article>${fig(images.handshake, "The publication is consultative in tone, editorial in function.", "Contact is for content, not for booking real venues.")}</section>`,
    offerings: () => `<section class="offer-table"><h2>Guide set</h2><table><thead><tr><th>Section</th><th>Brief</th><th>Purpose</th></tr></thead><tbody>${offerings.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></section>`,
    resources: () => `<section class="resource-memo"><h2>Briefing papers</h2>${resources.map(([title,text], i) => `<article><p class="memo-id">R${i + 1}</p><div><h3>${title}</h3><p>${text}</p></div></article>`).join("")}</section>`,
    detail: () => `<section class="detail-memo"><h2>${esc(site.detailPage.title)}</h2><p class="detail-summary">${esc(site.detailPage.summary)}</p>${detailSteps.map((item, index) => `<section class="memo-body two-col"><article class="memo-section"><p class="memo-id">${item[0]}</p><h3>${item[1]}</h3><p>${item[2]}</p></article>${fig([images.taxi, images.cowork, images.room, images.center, images.lounge][index], item[1], ["Buffer logic", "Work between meetings", "Venue posture", "After-hours control", "Departure discipline"][index])}</section>`).join("")}</section>`
  };
  return `
    <div class="site-shell-30">
      <aside class="memo-rail">
        <p class="rail-title">Briefing rail</p>
        <a href="#/">Atlas home</a>
        <a href="#/navigate">Quick navigate</a>
        <nav>${nav}</nav>
      </aside>
      <div class="memo-content">
        <header class="memo-header"><p class="memo-id">MEMO</p><strong>${esc(site.companyName)}</strong><p>Business traveler resource, consultancy tone.</p></header>
        <main>${(sections[current] || sections.home)()}</main>
        <footer class="memo-footer"><p>${esc(site.contact.email)} · ${esc(site.contact.phone)} · ${esc(site.domain)}</p><p>Demo note: fictional publication, fictional venues and timing examples, real Lisbon districts used as geographic anchors only.</p></footer>
      </div>
    </div>
  `;
}
