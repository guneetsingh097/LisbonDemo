import { bridgePhotoAssets } from "./bridge-photo-assets.js?v=bridge-posters-v1";

export const bridge = {
  id: 31,
  siteName: "Span Society — Dom Luís I Bridge",
  description: "A photographic field guide to Porto's double-deck iron bridge, for people who love bridges everywhere.",
  href: "speed/site-31-home.html?v=bridge-posters-v1",
  category: "Bridge field guide",
  domain: "Porto, Portugal",
  personality: "For bridge enthusiasts",
  theme: { primary: "#143f4b", accent: "#f5ca45" },
};

export const bridgePhotos = [
  { id: "1430965030", category: "structure", title: "Above the arch", note: "The upper crossing and the city beyond.", alt: "Pedestrians on the upper deck above the iron arch and Porto rooftops" },
  { id: "2217948128", category: "river", title: "A river panorama", note: "Two riverbanks, joined by the iron crossing.", alt: "Wide panorama of the Douro, Porto waterfront and Dom Luís I Bridge" },
  { id: "2192429256", category: "river", title: "Across the rooftops", note: "The bridge in its wider landscape.", alt: "Elevated view across red rooftops toward the bridge and Douro River" },
  { id: "2264678305", category: "structure", title: "A lattice of iron", note: "Look along the curve of the central arch.", alt: "Close side view of the iron arch against the Porto waterfront" },
  { id: "2296274051", category: "structure", title: "The stone beneath the iron", note: "Come closer: there is more here than the arch.", alt: "Close view of a stone entrance and plaque beneath the iron bridge" },
  { id: "2072912520", category: "structure", title: "Arch to abutment", note: "Follow the curve all the way back to solid ground.", alt: "Side view of the iron arch and stone support of Dom Luís I Bridge" },
  { id: "2237134900", category: "river", title: "Two levels, one landmark", note: "An elevated angle makes the double-deck design unmistakable.", alt: "Elevated side view showing both levels and the iron arch of Dom Luís I Bridge" },
  { id: "2279264099", category: "structure", title: "Columns and crossings", note: "The structure frames the life of the waterfront.", alt: "Iron bridge columns and the lower deck against the Porto waterfront" },
  { id: "2296274053", category: "structure", title: "Under the crossing", note: "Stone and iron, seen from below.", alt: "Vertical view of a stone bridge entrance with iron lattice stretching overhead" },
  { id: "1397078831", category: "river", title: "Along the quay", note: "Another approach to the arch.", alt: "View along the quayside road toward Dom Luís I Bridge and the river" },
  { id: "2299700052", category: "structure", title: "Through the framework", note: "Follow the lower crossing into the city.", alt: "The lower bridge roadway framed by iron beams with Porto buildings beyond" },
  { id: "2299699525", category: "river", title: "By the Douro", note: "The waterfront beneath the arch.", alt: "The Douro waterfront and Porto skyline beside the sweeping iron arch" },
  { id: "2264720109", category: "night", title: "After the lights come on", note: "A ribbon of light above the dark river.", alt: "Elevated night view of the illuminated bridge and Porto waterfront" },
  { id: "2296274094", category: "structure", title: "Iron meets stone", note: "Look up at the meeting of arch and support.", alt: "Looking up at the iron arch and its stone support from the riverbank" },
].map(photo => ({ ...photo, ...bridgePhotoAssets[photo.id] }));

export const bridgePhotoUrl = photo => `images-bridge/GettyImages-${photo.id}.jpg?v=bridge-posters-v1`;
const number = value => value.toLocaleString("en-US");
export const bridgePhotoDimensions = photo => `${number(photo.width)} × ${number(photo.height)} px`;
export const bridgePhotoSize = photo => `${(photo.bytes / 1000000).toFixed(2)} MB`;
const photoMetrics = photo => `<span>${bridgePhotoDimensions(photo)}</span><span title="${number(photo.bytes)} bytes">${bridgePhotoSize(photo)}</span>`;

export function renderBridge() {
  const photo = bridgePhotos[0];
  return `<!--
THESIS: A photographic field guide for people who take a detour for a bridge.
OWN-WORLD: Light paper, river-coloured type and small photographic posters.
STORY: Discover the silhouette, compare perspectives, understand the structure, plan a walk.
FIRST VIEWPORT: Bridge name and illustration beside a small, full-resolution poster.
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
      <figure class="bridge-cover"><img src="${bridgePhotoUrl(photo)}" width="${photo.width}" height="${photo.height}" alt="${photo.alt}" fetchpriority="high"><figcaption class="bridge-photo-metrics">${photoMetrics(photo)}</figcaption></figure>
    </section>
    <section id="bridge-gallery" class="bridge-gallery-section" aria-labelledby="bridge-gallery-title" tabindex="-1">
      <div class="bridge-section-heading"><h2 id="bridge-gallery-title">Never the same<br>bridge twice.</h2><p>Original-resolution photographs, displayed small. Right-click a photograph and choose Copy image to copy it at full size. Largest files first.</p></div>
      <div class="bridge-filters" role="group" aria-label="Filter photographs">
        ${[["all", "All photographs"], ["river", "River & skyline"], ["structure", "Up close"], ["night", "Light & shadow"]].map(([key, label]) => `<button type="button" data-bridge-filter="${key}" aria-pressed="${key === "all"}">${label.replace("&", "&amp;")}</button>`).join("")}
      </div>
      <p class="bridge-gallery-status" role="status" aria-live="polite">${bridgePhotos.length} photographs</p>
      <div class="bridge-photo-grid">${bridgePhotos.map(item => `<figure data-bridge-category="${item.category}">
        <img src="${bridgePhotoUrl(item)}" width="${item.width}" height="${item.height}" alt="${item.alt}" decoding="async">
        <figcaption class="bridge-photo-metrics">${photoMetrics(item)}<button type="button" data-bridge-photo="${item.id}" aria-label="Enlarge: ${item.title}">View full size <span aria-hidden="true">↗</span></button></figcaption>
      </figure>`).join("")}</div>
    </section>
    <section id="bridge-story" class="bridge-story" aria-labelledby="bridge-story-title" tabindex="-1">
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
      dialog.innerHTML = `<button type="button" class="bridge-dialog-close" aria-label="Close photograph">Close ×</button><img src="${bridgePhotoUrl(photo)}" width="${photo.width}" height="${photo.height}" alt="${photo.alt}"><h2 id="bridge-photo-title">${photo.title}</h2><p class="bridge-photo-metrics">${photoMetrics(photo)}</p>`;
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
