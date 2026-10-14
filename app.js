import { sitesA } from "./sites-a.js"; import { sitesB } from "./sites-b.js"; import { render as renderBespoke01 } from "./sites/site-01.js"; import { render as renderBespoke02 } from "./sites/site-02.js"; import { render as renderBespoke03 } from "./sites/site-03.js"; import { render as renderBespoke04 } from "./sites/site-04.js"; import { render as renderBespoke05 } from "./sites/site-05.js"; import { render as renderBespoke06 } from "./sites/site-06.js"; import { render as renderBespoke07 } from "./sites/site-07.js"; import { render as renderBespoke08 } from "./sites/site-08.js"; import { render as renderBespoke09 } from "./sites/site-09.js"; import { render as renderBespoke10 } from "./sites/site-10.js"; import { render as renderBespoke11 } from "./sites/site-11.js"; import { render as renderBespoke12 } from "./sites/site-12.js"; import { render as renderBespoke13 } from "./sites/site-13.js"; import { render as renderBespoke14 } from "./sites/site-14.js"; import { render as renderBespoke15 } from "./sites/site-15.js"; import { render as renderBespoke16 } from "./sites/site-16.js"; import { render as renderBespoke17 } from "./sites/site-17.js"; import { render as renderBespoke18 } from "./sites/site-18.js"; import { render as renderBespoke19 } from "./sites/site-19.js"; import { render as renderBespoke20 } from "./sites/site-20.js"; import { render as renderBespoke21 } from "./sites/site-21.js"; import { render as renderBespoke22 } from "./sites/site-22.js"; import { render as renderBespoke23 } from "./sites/site-23.js"; import { render as renderBespoke24 } from "./sites/site-24.js"; import { render as renderBespoke25 } from "./sites/site-25.js"; import { render as renderBespoke26 } from "./sites/site-26.js"; import { render as renderBespoke27 } from "./sites/site-27.js"; import { render as renderBespoke28 } from "./sites/site-28.js"; import { render as renderBespoke29 } from "./sites/site-29.js"; import { render as renderBespoke30 } from "./sites/site-30.js"; const bespokeSites = { 1: renderBespoke01, 2: renderBespoke02, 3: renderBespoke03, 4: renderBespoke04, 5: renderBespoke05, 6: renderBespoke06, 7: renderBespoke07, 8: renderBespoke08, 9: renderBespoke09, 10: renderBespoke10, 11: renderBespoke11, 12: renderBespoke12, 13: renderBespoke13, 14: renderBespoke14, 15: renderBespoke15, 16: renderBespoke16, 17: renderBespoke17, 18: renderBespoke18, 19: renderBespoke19, 20: renderBespoke20, 21: renderBespoke21, 22: renderBespoke22, 23: renderBespoke23, 24: renderBespoke24, 25: renderBespoke25, 26: renderBespoke26, 27: renderBespoke27, 28: renderBespoke28, 29: renderBespoke29, 30: renderBespoke30, }; const bespokeCssLoaded = new Set();
function ensureBespokeCss(id) {
  if (bespokeCssLoaded.has(id)) return;
  bespokeCssLoaded.add(id);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `sites/site-${String(id).padStart(2, "0")}.css`;
  document.head.insertBefore(link, document.querySelector("#compact-sites-css"));
}
const sites = [...sitesA,...sitesB]; const app = document.querySelector("#app"); const scenarios = [ ["Where should I stay?", [1, 2, 3, 4, 10, 29]], ["What neighborhood is best for families?", [1, 4, 10, 22, 29]], ["Build a good 3-day itinerary", [8, 10, 13, 15, 16, 19]], ["Which museums are worth visiting?", [13, 15, 19, 26, 29]], ["Find restaurants near attractions", [5, 6, 9, 13, 15]], ["Get from the airport to downtown", [14, 25, 26, 29, 30]], ["Choose the best time to visit", [8, 17, 20, 22, 24]], ["Find accessible activities", [13, 14, 22, 24, 25, 29]], ["Plan a budget-friendly trip", [3, 5, 6, 11, 14]], ["After-work ideas for business travelers", [7, 8, 9, 24, 30]], ]; const licensing = { allowed: ["Original generated content", "CC0 / Public Domain", "CC BY", "CC BY-SA", "CC BY-ND", "Pexels License assets approved for this "], excluded: [ "Commercial guide copy", "Real user reviews or social posts", "Unlicensed paid or proprietary media", "Short-form or ephemeral social video", "Unlicensed logos, maps, or photography", ], }; function escapeHtml(value = "") { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); } function route() { const hash = location.hash.replace(/^#\/?/, ""); const [page, id, section] = hash.split("/"); if (page === "site" && id) return renderSite(Number(id), section || "home"); if (page === "watch") return renderWatch(); if (page === "navigate") return renderNavigator(); if (page === "docs") return renderDocs(); if (page === "matrix") return renderMatrix(); return renderPortal(); } function portalHeader(active = "") { return ` <header class="portal-header"><a class="portal-brand" href="#/"><span class="portal-monogram">LA</span><span><b>Lisbon Atlas</b><small>Travel content ecosystem</small></span></a><nav aria-label="Ecosystem navigation"><a class="${active === "sites"? "active": ""}" href="#/">30 sites</a><a class="${active === "watch"? "active": ""}" href="#/watch">Video</a><a class="${active === "navigate"? "active": ""}" href="#/navigate">Quick navigate</a><a class="${active === "matrix"? "active": ""}" href="#/matrix">Relationship matrix</a><a class="${active === "docs"? "active": ""}" href="#/docs">Standards & sources</a></nav><span class="-pill">30-site travel portfolio</span></header>`; } function renderPortal() { document.title = "Lisbon Atlas — 30 Travel Websites"; app.innerHTML = ` ${portalHeader("sites")} <main><section class="portal-hero"><div class="hero-grid"><div><p class="kicker">Microsoft Edge + Copilot travel corpus</p><h1>Thirty doors into one unforgettable city.</h1><p class="lead">An interconnected collection of original, static-first travel websites designed for retrieval, grounding, comparison, summarization, and itinerary creation.</p><div class="hero-actions"><a class="button dark" href="#/site/1">Explore the first site</a><a class="button ghost" href="#/watch">Watch the Lisbon video</a><a class="button ghost" href="#/matrix">See how the sources connect</a></div></div><div class="hero-stat-card"><div><strong>30</strong><span>independent properties</span></div><div><strong>${sites.reduce((n, s) => n + s.faqs.length, 0)}+</strong><span>traveler Q&As</span></div><div><strong>10</strong><span>reasoning scenarios</span></div><div><strong>0</strong><span>real commercial entities</span></div></div></div></section><section class="catalog-section"><div class="section-heading"><div><p class="kicker">Master inventory</p><h2>Browse the ecosystem</h2></div><label class="search-box"><span>Search</span><input id="site-search" type="search" placeholder="Try “accessible,” “family,” or “food”"></label></div><div class="site-grid" id="site-grid">${sites.map(siteCard).join("")}</div></section><section class="scenario-band"><div class="section-heading light"><div><p class="kicker">Built for synthesis</p><h2>Questions with more than one good source</h2></div></div><div class="scenario-grid">${scenarios.map(([q, ids]) => ` <article><h3>${q}</h3><p>${ids.map(id => sites.find(s => s.id === id)?.siteName).filter(Boolean).join(" · ")}</p></article>`).join("")}</div></section></main>`; document.querySelector("#site-search").addEventListener("input", event => { const query = event.target.value.toLowerCase().trim(); document.querySelector("#site-grid").innerHTML = sites.filter(site => JSON.stringify(site).toLowerCase().includes(query)).map(siteCard).join("") || `<p class="empty-state">No property matches that search.</p>`; }); } function siteCard(site) { return ` <a class="site-card" style="--brand:${site.theme.primary};--accent:${site.theme.accent}" href="#/site/${site.id}"><div class="site-card-top"><span>${String(site.id).padStart(2, "0")}</span><span class="arrow">↗</span></div><div class="site-icon">${site.siteName.split(/\s+/).slice(0, 2).map(x => x[0]).join("")}</div><p class="category">${escapeHtml(site.category)}</p><h3>${escapeHtml(site.siteName)}</h3><p>${escapeHtml(site.description)}</p><div class="site-meta"><span>${escapeHtml(site.domain)}</span><span>${escapeHtml(site.personality)}</span></div></a>`; }
function renderSite(id, section) {
  const site = sites.find(item => item.id === id);
  if (!site) return renderPortal();
  document.title = `${site.siteName} — Lisbon Atlas`;
  const bespoke = bespokeSites[id];
  if (bespoke) {
    ensureBespokeCss(id);
    const validSections = ["home", "about", "faq", "contact", "offerings", "resources", "detail"];
    const activeSection = validSections.includes(section) ? section : "home";
    app.innerHTML = bespoke(site, activeSection);
    prepareCompactSite(site, activeSection);
    return;
  }
  renderPortal();
}

const siteMastheads = [
  ".rail-header", ".hero-program", ".flyer-board-nav", ".persistent-nav, .sub-nav",
  ".index-header", ".scrap-header", ".ce-corner, .ce-header", ".hel-utility, .hel-header",
  ".cdl-sidebar",
];

function prepareCompactSite(site, section) {
  const root = app.querySelector(`.site-shell-${site.id}`);
  root.classList.add("demo-site");
  root.dataset.section = section;
  const masthead = site.id <= 9 ? siteMastheads[site.id - 1]
    : site.id === 12 ? ".nad-sidebar"
    : site.id === 19 ? ".archive-nav"
    : site.id === 30 ? ".memo-rail, .memo-header"
    : ":scope > header";
  root.querySelectorAll(masthead).forEach(element => element.classList.add("full-site-masthead"));
  const main = root.querySelector("main") || root.querySelector(`.section-${section}`);
  main.id ||= `site-content-${site.id}`;
  main.tabIndex = -1;
  main.classList.add("compact-content");
  const pages = [
    ["home", "Home"], ["about", "About"], ["offerings", "Offerings"],
    ["resources", "Resources"], ["detail", "Detail guide"], ["faq", "FAQ"], ["contact", "Contact"],
  ];
  const header = document.createElement("header");
  header.className = "compact-site-header";
  header.innerHTML = `<a class="compact-skip" href="#${main.id}">Skip to content</a><div class="compact-brand-row"><div><h1 class="compact-brand"><a href="#/site/${site.id}/home">${escapeHtml(site.companyName)}</a></h1><p class="compact-category">${escapeHtml(site.category)}</p></div><div class="compact-utilities"><a href="#/">All sites</a><a href="#/navigate">Index</a></div></div><nav class="compact-page-nav" aria-label="${escapeHtml(site.siteName)} pages">${pages.map(([key, label]) => `<a href="#/site/${site.id}/${key}"${section === key ? ' aria-current="page"' : ""}>${label}</a>`).join("")}</nav>`;
  header.querySelector(".compact-skip").addEventListener("click", event => {
    event.preventDefault();
    main.focus();
    main.scrollIntoView({ block: "start" });
  });
  root.prepend(header);
  requestAnimationFrame(() => {
    if (!header.isConnected) return;
    const nav = header.querySelector(".compact-page-nav");
    const active = nav.querySelector('[aria-current="page"]');
    nav.scrollLeft = Math.max(0, active.offsetLeft - nav.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2);
  });

  root.querySelectorAll("table").forEach(table => {
    const region = document.createElement("div");
    region.className = "compact-table-region";
    region.tabIndex = 0;
    region.setAttribute("role", "region");
    region.setAttribute("aria-label", table.caption?.textContent || `${site.siteName} table`);
    table.before(region);
    region.append(table);
  });

  const stylesheet = document.querySelector("#compact-sites-css");
  if (!stylesheet) {
    const link = document.createElement("link");
    link.id = "compact-sites-css";
    link.rel = "stylesheet";
    link.href = "sites/compact.css";
    document.head.append(link);
  }
}
let stopLisbonVideo = () => {};

function renderWatch() {
  renderSavedWatchPlayer();
}

function renderSavedWatchPlayer() {
  stopLisbonVideo();
  document.title = "Lisbon Aerial Loop — Lisbon Atlas";
  app.innerHTML = `<main class="watch-page full-bleed-video"><div class="video-frame" id="southridge-video-frame"><video id="lisbon-4k-video" src="https://storage.googleapis.com/lisbongettyguneet/GettyImages-2210663321-4k-40mbps.mp4" muted loop playsinline preload="auto" poster="images-pexels/bridge-river-aerial-1.jpg" aria-label="Looping 4K footage, Getty Images asset 2210663321"></video><div class="video-loading" id="video-loading"><span id="video-loading-label" role="status" aria-live="polite">Loading 4K video…</span><div class="video-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-label="Video buffered duration" aria-describedby="video-loading-label"><span id="video-progress-fill"></span></div><button id="video-loading-action" type="button" hidden>Play video</button></div></div></main>`;
  loadLisbonVideo();
  const badge = document.createElement("span");
  badge.className = "video-4k-badge";
  badge.setAttribute("role", "img");
  badge.setAttribute("aria-label", "4K Ultra HD video");
  badge.textContent = "4K";
  document.querySelector("#southridge-video-frame").append(badge);
}

function loadLisbonVideo() {
  const video = document.querySelector("#lisbon-4k-video");
  const status = document.querySelector("#video-loading");
  const statusLabel = document.querySelector("#video-loading-label");
  const progress = document.querySelector(".video-progress");
  const progressFill = document.querySelector("#video-progress-fill");
  const action = document.querySelector("#video-loading-action");
  const listeners = new AbortController();
  let waiting = true;
  let failed = false;
  let needsGesture = false;
  let buffering = true;
  let starting = false;

  const bufferAhead = () => {
    const time = video.currentTime || 0;
    for (let index = 0; index < video.buffered.length; index++) {
      if (video.buffered.start(index) <= time && video.buffered.end(index) > time) {
        return video.buffered.end(index) - time;
      }
    }
    return 0;
  };

  const updateProgress = () => {
    if (failed || needsGesture) return;
    const duration = video.duration;
    let bufferedSeconds = 0;
    for (let index = 0; index < video.buffered.length; index++) {
      bufferedSeconds += video.buffered.end(index) - video.buffered.start(index);
    }
    const percent = Number.isFinite(duration) && duration > 0
      ? Math.min(100, Math.round(bufferedSeconds / duration * 100))
      : null;
    if (percent === null) {
      progress.removeAttribute("aria-valuenow");
      progress.removeAttribute("aria-valuetext");
      progressFill.style.transform = "scaleX(0)";
    } else {
      progress.setAttribute("aria-valuenow", String(percent));
      progress.setAttribute("aria-valuetext", `${percent}% of video duration buffered`);
      progressFill.style.transform = `scaleX(${percent / 100})`;
    }
    if (buffering && Number.isFinite(duration) && duration > 0) {
      const target = Math.min(4, duration - (video.currentTime || 0));
      const ahead = bufferAhead();
      status.hidden = false;
      statusLabel.textContent = `Preparing smooth 4K playback — ${Math.min(target, ahead).toFixed(1)} / ${target.toFixed(1)} seconds ready`;
      if (target > 0 && ahead >= target && !starting) void play();
    } else if (waiting) {
      status.hidden = false;
      statusLabel.textContent = percent === null
        ? "Loading 4K video…"
        : `Loading 4K video — ${percent}% buffered`;
    }
  };

  const showAction = (message, label) => {
    status.hidden = false;
    statusLabel.textContent = message;
    progress.hidden = true;
    action.textContent = label;
    action.hidden = false;
  };

  const showError = () => {
    failed = true;
    starting = false;
    const code = video.error?.code;
    const message = code === 2 ? "The video download was interrupted."
      : code === 3 ? "Your browser could not decode the 4K video."
      : code === 4 ? "The 4K video is unavailable or unsupported by your browser."
      : "Unable to play the 4K video.";
    showAction(`${message} Try loading it again.`, "Retry video");
    console.error("Lisbon video playback failed", video.error);
  };

  const play = async () => {
    starting = true;
    buffering = false;
    needsGesture = false;
    waiting = true;
    progress.hidden = false;
    action.hidden = true;
    updateProgress();
    try {
      await video.play();
    } catch (error) {
      if (listeners.signal.aborted) return;
      if (failed) return;
      if (error.name === "AbortError" && buffering) return;
      if (error.name === "NotAllowedError") {
        needsGesture = true;
        showAction("Autoplay is blocked. Press play to start the 4K video.", "Play video");
      } else {
        showError();
        console.error(error);
      }
    } finally {
      starting = false;
    }
  };

  for (const event of ["progress", "loadedmetadata", "loadeddata", "durationchange", "canplaythrough", "seeked"]) {
    video.addEventListener(event, updateProgress, { signal: listeners.signal });
  }
  for (const event of ["waiting", "stalled"]) {
    video.addEventListener(event, () => {
      // A stalled download need not interrupt playback of already buffered frames.
      if (event === "stalled" && video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) return;
      if (failed || needsGesture) return;
      // Decode waits with sufficient downloaded footage should not cancel play().
      if (bufferAhead() >= Math.min(4, video.duration - (video.currentTime || 0))) {
        waiting = true;
        updateProgress();
        return;
      }
      buffering = true;
      waiting = true;
      video.pause();
      updateProgress();
    }, { signal: listeners.signal });
  }
  video.addEventListener("playing", () => {
    waiting = false;
    failed = false;
    needsGesture = false;
    buffering = false;
    status.hidden = true;
  }, { signal: listeners.signal });
  video.addEventListener("error", showError, { signal: listeners.signal });
  video.addEventListener("suspend", () => {
    if (buffering && !failed && !needsGesture && bufferAhead() > 0) {
      showAction("Your browser paused preloading. Press play to use the available buffer.", "Play video");
    }
  }, { signal: listeners.signal });
  action.addEventListener("click", () => {
    if (failed) {
      failed = false;
      buffering = true;
      waiting = true;
      progress.hidden = false;
      action.hidden = true;
      video.load();
      updateProgress();
      return;
    }
    void play();
  }, { signal: listeners.signal });

  stopLisbonVideo = () => {
    listeners.abort();
    video.pause();
    video.removeAttribute("src");
    video.load();
    stopLisbonVideo = () => {};
  };
  video.muted = true;
  video.pause();
  updateProgress();
}
function renderNavigator() { document.title = "Quick Navigation — Lisbon Atlas"; const sections = [ ["home", "Home"], ["about", "About"], ["offerings", "Offerings"], ["resources", "Resources"], ["detail", "Detail guide"], ["faq", "FAQ"], ["contact", "Contact"], ]; app.innerHTML = `${portalHeader("navigate")}<main class="navigator-main"><section class="navigator-hero"><div><p class="kicker">Ecosystem index</p><h1>Every property.<br>Every page. One stop.</h1></div><div><p>Jump directly to any of the 210 core pages across the Lisbon Atlas ecosystem.</p><label class="navigator-search"><span>Find a site or category</span><input id="navigator-search" type="search" placeholder="Search all 30 properties"></label></div></section><section class="navigator-tools"><div class="navigator-filters"><button class="active" data-filter="all">All 30</button><button data-filter="stay">Stay</button><button data-filter="food">Food & culture</button><button data-filter="plan">Planning</button><button data-filter="experience">Experiences</button></div><p><b id="navigator-count">30</b> properties shown</p></section><section class="navigator-list" id="navigator-list">${sites.map(site => navigatorRow(site, sections)).join("")}</section></main>`; const input = document.querySelector("#navigator-search"); const buttons = [...document.querySelectorAll(".navigator-filters button")]; let filter = "all"; const update = () => { const query = input.value.toLowerCase().trim(); const visible = sites.filter(site => { const matchesQuery = `${site.siteName} ${site.category} ${site.description}`.toLowerCase().includes(query); return matchesQuery && (filter === "all" || navigatorGroup(site.id) === filter); }); document.querySelector("#navigator-list").innerHTML = visible.map(site => navigatorRow(site, sections)).join("") || `<p class="empty-state">No pages match that search.</p>`; document.querySelector("#navigator-count").textContent = visible.length; }; input.addEventListener("input", update); buttons.forEach(button => button.addEventListener("click", () => { buttons.forEach(item => item.classList.remove("active")); button.classList.add("active"); filter = button.dataset.filter; update(); })); } function navigatorGroup(id) { if ([1, 2, 3, 4].includes(id)) return "stay"; if ([5, 6, 7, 8, 9, 13, 19, 21, 27].includes(id)) return "food"; if ([10, 11, 12, 14, 20, 25, 26, 28, 29, 30].includes(id)) return "plan"; return "experience"; } function navigatorRow(site, sections) { return `<article class="navigator-row" style="--brand:${site.theme.primary};--accent:${site.theme.accent}"><a class="navigator-identity" href="#/site/${site.id}"><span class="navigator-number">${String(site.id).padStart(2, "0")}</span><span class="navigator-mark">${site.siteName.split(/\s+/).slice(0, 2).map(word => word[0]).join("")}</span><span><small>${escapeHtml(site.category)}</small><strong>${escapeHtml(site.siteName)}</strong></span></a><nav aria-label="${escapeHtml(site.siteName)} pages"> ${sections.map(([key, label]) => `<a href="#/site/${site.id}/${key}">${label}</a>`).join("")} </nav></article>`; } function renderMatrix() { document.title = "Cross-site Relationship Matrix — Lisbon Atlas"; app.innerHTML = `${portalHeader("matrix")}<main class="docs-main"><section class="docs-hero"><p class="kicker">Cross-source reasoning</p><h1>Relationship matrix</h1><p>Each planning question is deliberately supported by several independently voiced properties, giving Copilot material to compare, reconcile, and summarize.</p></section><section class="matrix-list">${scenarios.map(([question, ids], index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><div><h2>${question}</h2><p>${ids.map(id => `<a href="#/site/${id}">${escapeHtml(sites.find(s => s.id === id)?.siteName || "")}</a>`).join("")}</p></div></article>`).join("")}</section><section class="coverage-table-wrap"><h2>Portfolio coverage</h2><table><thead><tr><th>#</th><th>Property</th><th>Category</th><th>Audience</th><th>Related sources</th></tr></thead><tbody>${sites.map(s => `<tr><td>${s.id}</td><td><a href="#/site/${s.id}">${escapeHtml(s.siteName)}</a></td><td>${escapeHtml(s.category)}</td><td>${escapeHtml(s.targetAudience)}</td><td>${(s.relatedSiteIds || []).join(", ")}</td></tr>`).join("")}</tbody></table></section></main>`; } function renderDocs() {
  document.title = "Standards & Sources — Lisbon Atlas";
  app.innerHTML = `${portalHeader("docs")}<main class="docs-main"><section class="docs-hero"><p class="kicker">Documentation</p><h1>Sources, licenses,<br>and attribution.</h1><p>This page records the content policy, media sources, commercial-use license basis, source links, and per-file attribution for every bundled image and video asset in Lisbon Atlas.</p></section><section class="docs-grid"><article><span>01</span><h2>Written-content policy</h2><p>All page copy, company profiles, service descriptions, comments, counts, schedules, prices, and contact details are original authored material for this project.</p><p>Real Lisbon place names and general geography are used as travel context. Commercial listings, staff names, operating details, and editorial claims are project-authored content.</p><h3>Excluded material</h3><ul>${licensing.excluded.map(x => `<li>${x}</li>`).join("")}</ul></article><article><span>02</span><h2>CELA-oriented naming checklist</h2><ul class="check-list"><li>Company names and email domains use only the approved-name/domain list.</li><li>Portuguese personal names use the approved Portuguese-name list.</li><li>Email usernames use a single approved first name, for example <code>raquel@contososuites.com</code>.</li><li>International phone numbers use sequential numbers: <code>+351 210 000 001</code> through <code>+351 210 000 031</code>.</li><li>No street addresses are required; if added later, use sequential numbers, common street names, and intentionally incorrect postal codes.</li><li>Real Lisbon place names appear only as geographic context.</li><li>No real reviews, endorsements, social posts, or testimonials are used.</li><li>Logo treatments are stylized logotypes of the approved company name or non-descript functional marks.</li><li>No contact form transmits or stores information.</li></ul></article><article><span>03</span><h2>Commercial-use conclusion</h2><p>Every bundled media asset is covered by a license that allows commercial use. The exact license for each file appears in the attribution ledger below, alongside direct links to the local file, original source page, and license reference.</p><ul><li><b>Pexels License:</b> permits free use, including commercial use, without requiring attribution. Attribution is still retained here for review traceability.</li><li><b>CC BY 2.0:</b> permits commercial use, sharing, and adaptation when attribution is provided.</li><li><b>CC BY-SA 2.0 / 4.0:</b> permits commercial use, sharing, and adaptation when attribution is provided and adapted material is shared under compatible ShareAlike terms.</li></ul></article><article><span>04</span><h2>Bundled media sources</h2><p>The watch player uses Getty Images asset 2210663321 from owner-managed Google Cloud Storage. This project re-encoded the full 46.52-second video as H.264 at 3840x2160 and 25 fps, averaging 40.61 Mbps. The 236,136,432-byte MP4 has faststart metadata and supports byte-range playback. Previous videos remain available separately. The owner confirmed a license permitting public website use; the agreement and contributor credit were not supplied for independent review. The previous short 4K Pexels loop remains bundled but is no longer the watch-page source.</p><ul><li><b>Pexels photos and video:</b> used under the <a href="https://www.pexels.com/license/" target="_blank" rel="noreferrer">Pexels License</a>.</li><li><b>Wikimedia Commons images:</b> retained only where the individual asset record permits commercial reuse under CC BY or CC BY-SA.</li><li><b>Attribution files:</b> downloadable source records are available as <a href="IMAGE-ATTRIBUTION.md" target="_blank" rel="noreferrer">Markdown</a> and <a href="IMAGE-ATTRIBUTION.csv" target="_blank" rel="noreferrer">CSV</a>.</li></ul></article></section><section class="license-notes"><h2>License descriptions and reference links</h2><div><article><h3><a href="https://www.pexels.com/license/" target="_blank" rel="noreferrer">Pexels License</a></h3><p>Allows free use of photos and videos, including for commercial projects. Attribution is not required by Pexels, but every bundled Pexels asset is still attributed in this project. The license does not allow selling unaltered copies as standalone stock assets or implying endorsement by depicted people or brands.</p></article><article><h3><a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noreferrer">Creative Commons Attribution 2.0</a></h3><p>Allows copying, redistribution, remixing, transformation, and commercial use when appropriate credit is provided, a license link is included, and changes are indicated where applicable.</p></article><article><h3><a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank" rel="noreferrer">Creative Commons Attribution-ShareAlike 2.0</a></h3><p>Allows copying, redistribution, remixing, transformation, and commercial use with attribution. Adapted versions must be distributed under the same or compatible ShareAlike license terms.</p></article><article><h3><a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">Creative Commons Attribution-ShareAlike 4.0</a></h3><p>Allows sharing and adaptation, including commercial use, with attribution and ShareAlike obligations for adapted material. The attribution ledger keeps source, creator, and license records for each CC BY-SA 4.0 item.</p></article><article><h3><a href="https://commons.wikimedia.org/wiki/Commons:Licensing" target="_blank" rel="noreferrer">Wikimedia Commons licensing overview</a></h3><p>Wikimedia Commons hosts files under many licenses, so each asset must be checked individually. This project uses only the specific Commons files listed in the ledger with their asset-level license records.</p></article><article><h3>Future sourcing rule</h3><p>For new assets, verify the individual file license at download time. Do not assume a whole repository, search result, or collection has a single license.</p></article></div></section><section class="attribution-template full-ledger"><div><p class="kicker">Complete bundled media ledger</p><h2>Image and video attribution</h2><p>The table below is loaded from   <code>IMAGE-ATTRIBUTION.csv</code>. Every row links to the bundled local file, license reference, and original resource URL inside the attribution statement when available.</p></div><div class="attribution-actions"><a class="button dark" href="IMAGE-ATTRIBUTION.md" target="_blank" rel="noreferrer">Open Markdown ledger</a><a class="button ghost" href="IMAGE-ATTRIBUTION.csv" target="_blank" rel="noreferrer">Download CSV ledger</a></div><div class="attribution-table-wrap"><table><thead><tr><th>Thumbnail</th><th>File</th><th>Type</th><th>Title</th><th>Creator</th><th>License</th><th>Attribution statement</th></tr></thead><tbody id="attribution-body"><tr><td colspan="7">Loading attribution records…</td></tr></tbody></table></div></section></main>`;
  loadAttributionTable();
}

function parseCsvRows(text) {
  const rows = [];
  let row = [], cell = "", quote = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quote) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') quote = false;
      else cell += char;
    } else if (char === '"') quote = true;
    else if (char === ',') { row.push(cell); cell = ""; }
    else if (char === '\n') { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (char !== '\r') cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function licenseReference(license = "") {
  const value = String(license).toLowerCase();
  if (value.includes("pexels")) return "https://www.pexels.com/license/";
  if (value.includes("getty")) return "https://www.gettyimages.com/eula";
  if (value.includes("cc by-sa 4.0")) return "https://creativecommons.org/licenses/by-sa/4.0/";
  if (value.includes("cc by-sa 2.0")) return "https://creativecommons.org/licenses/by-sa/2.0/";
  if (value.includes("cc by 2.0")) return "https://creativecommons.org/licenses/by/2.0/";
  if (value.includes("cc by 4.0")) return "https://creativecommons.org/licenses/by/4.0/";
  if (value.includes("cc0")) return "https://creativecommons.org/publicdomain/zero/1.0/";
  return "";
}

async function loadAttributionTable() {
  const body = document.querySelector("#attribution-body");
  if (!body) return;
  try {
    const response = await fetch("IMAGE-ATTRIBUTION.csv");
    if (!response.ok) throw new Error("Unable to load attribution CSV");
    const rows = parseCsvRows(await response.text());
    const header = rows.shift();
    const index = Object.fromEntries(header.map((name, i) => [name, i]));
    body.innerHTML = rows.filter(row => row.length > 1).map(row => {
      const file = row[index.File] || "";
      const type = row[index.Type] || "";
      const source = row[index["Source URL"]] || "";
      const license = row[index.License] || "";
      const licenseUrl = licenseReference(license);
      return `<tr><td>${thumbnailCell(file, type)}</td><td>${file ? `<a href="${escapeHtml(localFileHref(file))}" target="_blank" rel="noreferrer">${escapeHtml(file)}</a>` : ""}</td><td>${escapeHtml(type)}</td><td>${escapeHtml(row[index.Title])}</td><td>${escapeHtml(row[index.Creator])}</td><td>${licenseUrl ? `<a href="${escapeHtml(licenseUrl)}" target="_blank" rel="noreferrer">${escapeHtml(license)}</a>` : escapeHtml(license)}</td><td>${linkedAttribution(row[index.Attribution], source)}</td></tr>`;
    }).join("");
  } catch (error) {
    body.innerHTML = `<tr><td colspan="7">Attribution records could not be loaded. Use the Markdown or CSV ledger links above.</td></tr>`;
    console.error(error);
  }
}

function localFileHref(file = "") {
  return String(file);
}

function thumbnailCell(file = "", type = "") {
  const href = localFileHref(file);
  if (String(type).toLowerCase() === "video") {
    return `<a class="asset-thumb video-thumb" href="${escapeHtml(href)}" target="_blank" rel="noreferrer" aria-label="Open 4K video"><img src="images-pexels/bridge-river-aerial-1.jpg" alt="Video thumbnail for Lisbon aerial footage" loading="lazy"><span>4K video</span></a>`;
  }
  return href ? `<a class="asset-thumb" href="${escapeHtml(href)}" target="_blank" rel="noreferrer"><img src="${escapeHtml(href)}" alt="${escapeHtml(file)} thumbnail" loading="lazy"></a>` : "";
}

function linkedAttribution(value = "", source = "") {
  const text = escapeHtml(value);
  const linked = text.replace(/https?:\/\/[^\s<]+/g, url => {
    const cleanUrl = url.replace(/[),.;]+$/, "");
    const suffix = url.slice(cleanUrl.length);
    return `<a href="${cleanUrl}" target="_blank" rel="noreferrer">${cleanUrl}</a>${suffix}`;
  });
  if (linked === text && source) return `${linked} — <a href="${escapeHtml(source)}" target="_blank" rel="noreferrer">resource link</a>`;
  return linked || (source ? `<a href="${escapeHtml(source)}" target="_blank" rel="noreferrer">${escapeHtml(source)}</a>` : "");
}

window.addEventListener("hashchange", () => stopLisbonVideo());
window.addEventListener("hashchange", route); route(); 
