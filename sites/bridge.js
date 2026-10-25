export const bridge = {
  id: 31,
  siteName: "Span Society — Dom Luís I Bridge",
  description: "A photographic field guide to Porto's double-deck iron bridge, for people who love bridges everywhere.",
  href: "speed/site-31-home.html",
  category: "Bridge field guide",
  domain: "Porto, Portugal",
  personality: "For bridge enthusiasts",
  theme: { primary: "#143f4b", accent: "#f5ca45" },
};

export const bridgePhotos = [
  { id: "1064748620", category: "river", title: "The whole crossing", note: "The iron arch, the river and two cities in one frame.", alt: "Elevated view of Dom Luís I Bridge across the Douro beneath a pink and blue sky" },
  { id: "1433534115", category: "river", title: "A city built around a river", note: "Pull back and the bridge becomes part of the skyline.", alt: "Wide daytime panorama of Porto and the two decks of Dom Luís I Bridge" },
  { id: "1095969670", category: "structure", title: "Look up", note: "An entirely different bridge is hiding underneath.", alt: "Looking straight up through the steel cross-bracing beneath the bridge deck" },
  { id: "2256260021", category: "river", title: "Down by the water", note: "Boats, riverside life and the curve of the arch.", alt: "Dom Luís I Bridge arch above boats and the Douro waterfront" },
  { id: "1766963202", category: "river", title: "The long view", note: "The crossing seen from farther along the quay.", alt: "Dom Luís I Bridge in the distance across blue Douro water" },
  { id: "2072912520", category: "structure", title: "Arch to abutment", note: "Follow the curve all the way back to solid ground.", alt: "Side view of the iron arch and stone support of Dom Luís I Bridge" },
  { id: "2299606271", category: "structure", title: "A working bridge", note: "The Metro shares the upper deck with pedestrian paths.", alt: "A yellow Porto Metro train on the upper deck of Dom Luís I Bridge" },
  { id: "2296274051", category: "structure", title: "The stone beneath the iron", note: "Come closer: there is more here than the arch.", alt: "Close view of a stone entrance and plaque beneath the iron bridge" },
  { id: "2260015761", category: "night", title: "Crossings in silhouette", note: "People and overhead lines against a luminous sky.", alt: "Silhouettes of pedestrians crossing the upper bridge deck in warm low light" },
  { id: "2264720109", category: "night", title: "After the lights come on", note: "A ribbon of light above the dark river.", alt: "Elevated night view of the illuminated bridge and Porto waterfront" },
  { id: "2299457299", category: "structure", title: "Straight down", note: "The deck becomes a line drawn across the water.", alt: "Top-down aerial photograph of the bridge deck crossing the Douro" },
  { id: "2237134900", category: "river", title: "Two levels, one landmark", note: "An elevated angle makes the double-deck design unmistakable.", alt: "Elevated side view showing both levels and the iron arch of Dom Luís I Bridge" },
  { id: "1138428592", category: "structure", title: "The shape, without the colour", note: "Black and white leaves the structure to do the talking.", alt: "Black-and-white view beneath the sweeping bridge arch above the river" },
  { id: "644104660", category: "night", title: "Iron, in another light", note: "Warm illumination picks out the lattice overhead.", alt: "Close-up of the bridge's iron lattice glowing in warm light" },
];

export const bridgePhotoUrl = photo => `images-bridge/GettyImages-${photo.id}.jpg`;

export function renderBridge() {
  const photo = bridgePhotos[0];
  return `<!--
THESIS: A photographic field guide for people who take a detour for a bridge.
OWN-WORLD: White, deep river blue and yellow; strong system type, generous photographs.
STORY: Discover the silhouette, compare perspectives, understand the structure, plan a walk.
FIRST VIEWPORT: Illustration and bridge name beside a large Douro photograph.
FORM: A photo-led addition to the existing collection; no demo controls or downloaded fonts.
-->
<div class="site-shell-31 bridge-page" data-section="home">
  <a class="bridge-skip" href="#bridge-content">Skip to content</a>
  <header class="bridge-header">
    <a class="bridge-brand" href="#/site/31/home"><span>SPAN<br>SOCIETY</span><small>A world of bridges.</small></a>
    <nav aria-label="Bridge guide"><a href="#bridge-gallery">Photographs</a><a href="#bridge-story">The structure</a><a href="#bridge-visit">Take a walk</a></nav>
    <a class="bridge-atlas" href="#/">Back to Atlas <span aria-hidden="true">↗</span></a>
  </header>
  <main id="bridge-content" class="compact-content" tabindex="-1">
    <section class="bridge-hero" aria-labelledby="bridge-title">
      <div class="bridge-intro"><h1 id="bridge-title">Dom Luís I<br>Bridge.</h1>
        <p class="bridge-location">Porto &amp; Vila Nova de Gaia, Portugal</p>
        <p>Some of us plan a trip around a bridge.<br>This one is worth the detour.</p>
        <a class="bridge-jump" href="#bridge-gallery">Find your favourite angle <span aria-hidden="true">↓</span></a>
        <figure class="bridge-illustration"><img src="images-bridge/Illustration.jpg" width="5000" height="5001" alt="Illustration of the bridge's distinctive iron arch and two decks"><figcaption>That unmistakable silhouette.</figcaption></figure>
      </div>
      <figure class="bridge-cover"><img src="${bridgePhotoUrl(photo)}" alt="${photo.alt}" fetchpriority="high"><figcaption><span>The Douro. Two cities. One extraordinary crossing.</span><span>Porto, Portugal</span></figcaption></figure>
    </section>
    <section id="bridge-gallery" class="bridge-gallery-section" aria-labelledby="bridge-gallery-title" tabindex="-1">
      <div class="bridge-section-heading"><h2 id="bridge-gallery-title">Never the same<br>bridge twice.</h2><p>From the quayside, from above, from right underneath. A collection for the people who notice the rivets.</p></div>
      <div class="bridge-filters" role="group" aria-label="Filter photographs">
        ${[["all", "All photographs"], ["river", "River & skyline"], ["structure", "Up close"], ["night", "Light & shadow"]].map(([key, label]) => `<button type="button" data-bridge-filter="${key}" aria-pressed="${key === "all"}">${label.replace("&", "&amp;")}</button>`).join("")}
      </div>
      <p class="bridge-gallery-status" role="status" aria-live="polite">${bridgePhotos.length} photographs</p>
      <div class="bridge-photo-grid">${bridgePhotos.map((item, index) => `<figure data-bridge-category="${item.category}" class="${index === 0 || index === 9 ? "bridge-photo-wide" : ""}">
        <button type="button" data-bridge-photo="${item.id}" aria-label="Enlarge: ${item.title}"><img src="${bridgePhotoUrl(item)}" alt="${item.alt}" decoding="async"><span class="bridge-enlarge" aria-hidden="true">View photograph ↗</span></button>
        <figcaption><h3>${item.title}</h3><p>${item.note}</p></figcaption>
      </figure>`).join("")}</div>
    </section>
    <section id="bridge-story" class="bridge-story" aria-labelledby="bridge-story-title" tabindex="-1">
      <img src="${bridgePhotoUrl(bridgePhotos[2])}" alt="${bridgePhotos[2].alt}">
      <div><h2 id="bridge-story-title">A closer look at<br>the clever bit.</h2><p>The arch is the headline. But spend a little longer looking and the double deck, the diagonal bracing and the stone supports begin to tell their own story.</p>
        <dl><div><dt>Opened</dt><dd>1886</dd></div><div><dt>Central arch span</dt><dd>172 metres</dd></div><div><dt>Engineer</dt><dd>Théophile Seyrig</dd></div><div><dt>Across</dt><dd>The Douro River</dd></div></dl>
        <p>One level connects the high ground. Another meets the riverside. It is a landmark you can admire from a distance, then walk into the everyday life of two cities.</p>
      </div>
    </section>
    <section id="bridge-visit" class="bridge-visit" aria-labelledby="bridge-visit-title" tabindex="-1">
      <div class="bridge-section-heading"><h2 id="bridge-visit-title">Walk it.<br>Then look back.</h2><p>The best view is not always the first one. Cross the river, change your height, and give the bridge another look.</p></div>
      <div class="bridge-walk-notes"><article><h3>Take the upper path</h3><p>Look along the Douro and across Porto's rooftops. Stay on the signed pedestrian paths and keep clear of the Metro tracks.</p></article><article><h3>Follow the waterfront</h3><p>The Porto and Gaia quays let you see the whole arch. Walk a little farther than the first viewpoint to find a different relationship between iron, water and skyline.</p></article></div>
      <a class="bridge-map" href="https://www.google.com/maps/search/?api=1&amp;query=Dom+Luis+I+Bridge+Porto" target="_blank" rel="noopener noreferrer">Find the bridge on a map <span aria-hidden="true">↗</span></a>
      <p class="bridge-practical">Follow current local access signs. Give other walkers space, and never step into the tracks for a photograph.</p>
    </section>
  </main>
  <footer class="bridge-footer"><div><strong>SPAN SOCIETY</strong><p>The world's bridges.<br>One crossing at a time.</p></div><div><a href="#/">Lisbon Atlas</a><a href="https://en.wikipedia.org/wiki/Dom_Lu%C3%ADs_I_Bridge" target="_blank" rel="noopener noreferrer">Bridge history &amp; references ↗</a><small>Photography: Getty Images.</small></div></footer>
</div>`;
}

export function mountBridge(root) {
  const controller = new AbortController();
  const { signal } = controller;
  let dialog;
  let returnFocus;
  root.querySelectorAll('a[href^="#bridge-"]').forEach(link => {
    const target = root.querySelector(link.getAttribute("href"));
    link.addEventListener("click", event => {
      event.preventDefault();
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: "start" });
    }, { signal });
  });
  root.querySelectorAll("[data-bridge-filter]").forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.bridgeFilter;
      root.querySelectorAll("[data-bridge-filter]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
      let count = 0;
      root.querySelectorAll("[data-bridge-category]").forEach(figure => {
        figure.hidden = filter !== "all" && figure.dataset.bridgeCategory !== filter;
        if (!figure.hidden) count++;
      });
      root.querySelector(".bridge-gallery-status").textContent = `${count} photographs`;
    }, { signal });
  });
  root.querySelectorAll("[data-bridge-photo]").forEach(button => {
    button.addEventListener("click", () => {
      const photo = bridgePhotos.find(item => item.id === button.dataset.bridgePhoto);
      returnFocus = button;
      dialog = document.createElement("dialog");
      dialog.className = "bridge-photo-dialog";
      dialog.setAttribute("aria-labelledby", "bridge-photo-title");
      dialog.innerHTML = `<button type="button" class="bridge-dialog-close" aria-label="Close photograph">Close ×</button><img src="${bridgePhotoUrl(photo)}" alt="${photo.alt}"><h2 id="bridge-photo-title">${photo.title}</h2><p>${photo.note}</p>`;
      dialog.querySelector("button").addEventListener("click", () => dialog.close(), { signal });
      dialog.addEventListener("close", () => {
        dialog.remove();
        dialog = undefined;
        returnFocus.focus({ preventScroll: true });
      }, { once: true, signal });
      document.body.append(dialog);
      dialog.showModal();
    }, { signal });
  });
  return () => {
    controller.abort();
    dialog?.remove();
  };
}
