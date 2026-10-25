import { sitesA } from "./sites-a.js"; import { sitesB } from "./sites-b.js"; import { render as renderBespoke01 } from "./sites/site-01.js"; import { render as renderBespoke02 } from "./sites/site-02.js"; import { render as renderBespoke03 } from "./sites/site-03.js"; import { render as renderBespoke04 } from "./sites/site-04.js"; import { render as renderBespoke05 } from "./sites/site-05.js"; import { render as renderBespoke06 } from "./sites/site-06.js"; import { render as renderBespoke07 } from "./sites/site-07.js"; import { render as renderBespoke08 } from "./sites/site-08.js"; import { render as renderBespoke09 } from "./sites/site-09.js"; import { render as renderBespoke10 } from "./sites/site-10.js"; import { render as renderBespoke11 } from "./sites/site-11.js"; import { render as renderBespoke12 } from "./sites/site-12.js"; import { render as renderBespoke13 } from "./sites/site-13.js"; import { render as renderBespoke14 } from "./sites/site-14.js"; import { render as renderBespoke15 } from "./sites/site-15.js"; import { render as renderBespoke16 } from "./sites/site-16.js"; import { render as renderBespoke17 } from "./sites/site-17.js"; import { render as renderBespoke18 } from "./sites/site-18.js"; import { render as renderBespoke19 } from "./sites/site-19.js"; import { render as renderBespoke20 } from "./sites/site-20.js"; import { render as renderBespoke21 } from "./sites/site-21.js"; import { render as renderBespoke22 } from "./sites/site-22.js"; import { render as renderBespoke23 } from "./sites/site-23.js"; import { render as renderBespoke24 } from "./sites/site-24.js"; import { render as renderBespoke25 } from "./sites/site-25.js"; import { render as renderBespoke26 } from "./sites/site-26.js"; import { render as renderBespoke27 } from "./sites/site-27.js"; import { render as renderBespoke28 } from "./sites/site-28.js"; import { render as renderBespoke29 } from "./sites/site-29.js"; import { render as renderBespoke30 } from "./sites/site-30.js"; const bespokeSites = { 1: renderBespoke01, 2: renderBespoke02, 3: renderBespoke03, 4: renderBespoke04, 5: renderBespoke05, 6: renderBespoke06, 7: renderBespoke07, 8: renderBespoke08, 9: renderBespoke09, 10: renderBespoke10, 11: renderBespoke11, 12: renderBespoke12, 13: renderBespoke13, 14: renderBespoke14, 15: renderBespoke15, 16: renderBespoke16, 17: renderBespoke17, 18: renderBespoke18, 19: renderBespoke19, 20: renderBespoke20, 21: renderBespoke21, 22: renderBespoke22, 23: renderBespoke23, 24: renderBespoke24, 25: renderBespoke25, 26: renderBespoke26, 27: renderBespoke27, 28: renderBespoke28, 29: renderBespoke29, 30: renderBespoke30, }; const bespokeCssLoaded = new Set();
import { mount as mountHotelExperience } from "./sites/site-01.js";
import { siteSections, globalPages } from "./route-catalog.js?v=bridge-v1";
import { mountResponsiveNavigation } from "./responsive-navigation.js";
import { mountPortfolioExperience } from "./sites/portfolio-experience.js?v=dark-v1";
import { bridge, renderBridge, mountBridge } from "./sites/bridge.js?v=bridge-posters-100mb-v1";
import { applySiteIdentity, siteIdentities } from "./sites/identities.js?v=dark-v1";
import { applyImageReplacements } from "./sites/experience-catalog.js";
import { openRawVideo } from "./raw-video.js?v=safari-media-endpoint-v1";
let stopHotelExperience = () => {};
let stopBridgeExperience = () => {};
let stopResponsiveNavigation = () => {};
let stopPortfolioExperience = () => {};

function ensureBespokeCss(id) {
  if (bespokeCssLoaded.has(id)) return;
  bespokeCssLoaded.add(id);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  const standalone = document.body.hasAttribute("data-speed-page");
  link.id = `site-stylesheet-${id}`;
  link.href = `${standalone ? "speed" : "sites"}/site-${String(id).padStart(2, "0")}.css?v=dark-v1`;
  document.head.insertBefore(link, document.querySelector("#compact-sites-css"));
}
const sites = [...sitesA,...sitesB]; const app = document.querySelector("#app"); const scenarios = [ ["Where should I stay?", [1, 2, 3, 4, 10, 29]], ["What neighborhood is best for families?", [1, 4, 10, 22, 29]], ["Build a good 3-day itinerary", [8, 10, 13, 15, 16, 19]], ["Which museums are worth visiting?", [13, 15, 19, 26, 29]], ["Find restaurants near attractions", [5, 6, 9, 13, 15]], ["Get from the airport to downtown", [14, 25, 26, 29, 30]], ["Choose the best time to visit", [8, 17, 20, 22, 24]], ["Find accessible activities", [13, 14, 22, 24, 25, 29]], ["Plan a budget-friendly trip", [3, 5, 6, 11, 14]], ["After-work ideas for business travelers", [7, 8, 9, 24, 30]], ]; const licensing = { allowed: ["Original generated content", "CC0 / Public Domain", "CC BY", "CC BY-SA", "CC BY-ND", "Pexels License assets approved for this "], excluded: [ "Commercial guide copy", "Real user reviews or social posts", "Unlicensed paid or proprietary media", "Short-form or ephemeral social video", "Unlicensed logos, maps, or photography", ], }; function escapeHtml(value = "") { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); } function route() { const hash = location.hash.replace(/^#\/?/, ""); const [page, id, section] = hash.split("/"); if (page === "site" && id) return renderSite(Number(id), section || "home"); if (page === "watch") return renderWatch(); if (page === "navigate") return renderNavigator(); if (page === "docs") return renderDocs(); if (page === "matrix") return renderMatrix(); return renderPortal(); } function portalHeader(active = "") { return ` <header class="portal-header"><a class="portal-brand" href="#/"><span class="portal-monogram">LA</span><span><b>Lisbon Atlas</b><small>A city, well explored</small></span></a><nav aria-label="Lisbon Atlas navigation"><a class="${active === "sites"? "active": ""}" href="#/">30 sites</a><a class="${active === "watch"? "active": ""}" href="#/watch">Video</a><a class="${active === "navigate"? "active": ""}" href="#/navigate">Quick navigate</a><a class="${active === "matrix"? "active": ""}" href="#/matrix">Travel planning guide</a><a class="${active === "docs"? "active": ""}" href="#/docs">Photography & credits</a></nav><span class="-pill">30-site travel portfolio</span></header>`; }
function renderPortal() {
  const catalogSites = [...sites, bridge];
  document.title = "Lisbon Atlas — 30 Travel Websites";
  app.innerHTML = ` ${portalHeader("sites")} <main><section class="portal-hero"><div class="hero-grid"><div><p class="kicker">A local perspective on Lisbon</p><h1>Thirty doors into one unforgettable city.</h1><p class="lead">Find a place to stay, a table worth lingering at and a different side of the city. Thirty distinctive guides bring Lisbon together, one neighbourhood at a time.</p><div class="hero-actions"><a class="button dark" href="#/site/1">Explore the first site</a><a class="button ghost" href="#/watch">Watch the Lisbon video</a><a class="button ghost" href="#/matrix">See how the sources connect</a></div></div><div class="hero-stat-card"><div><strong>30</strong><span>independent properties</span></div><div><strong>${sites.reduce((n, s) => n + s.faqs.length, 0)}+</strong><span>traveler Q&As</span></div><div><strong>10</strong><span>travel planning themes</span></div><div><strong>7</strong><span>ways to explore each guide</span></div></div></div></section><section class="catalog-section"><div class="section-heading"><div><p class="kicker">Your Lisbon collection</p><h2>Find your way around Lisbon</h2></div><label class="search-box"><span>Search</span><input id="site-search" type="search" placeholder="Try “accessible,” “family,” or “food”"></label></div><div class="site-grid" id="site-grid">${catalogSites.map(siteCard).join("")}</div></section><section class="scenario-band"><div class="section-heading light"><div><p class="kicker">Make it yours</p><h2>A good trip starts with a good question</h2></div></div><div class="scenario-grid">${scenarios.map(([q, ids]) => ` <article><h3>${q}</h3><p>${ids.map(id => sites.find(s => s.id === id)?.siteName).filter(Boolean).join(" · ")}</p></article>`).join("")}</div></section></main>`;
  document.querySelector("#site-search").addEventListener("input", event => {
    const query = event.target.value.toLowerCase().trim();
    document.querySelector("#site-grid").innerHTML = catalogSites.filter(site => JSON.stringify(site).toLowerCase().includes(query)).map(siteCard).join("") || `<p class="empty-state">No property matches that search.</p>`;
  });
}
function siteCard(site) { return ` <a class="site-card" data-palette="${siteIdentities[site.id - 1].palette}" href="${escapeHtml(site.href || `#/site/${site.id}`)}"><div class="site-card-top"><span>${String(site.id).padStart(2, "0")}</span><span class="arrow">↗</span></div><div class="site-icon">${site.siteName.split(/\s+/).slice(0, 2).map(x => x[0]).join("")}</div><p class="category">${escapeHtml(site.category)}</p><h3>${escapeHtml(site.siteName)}</h3><p>${escapeHtml(site.description)}</p><div class="site-meta"><span>${escapeHtml(site.domain)}</span><span>${escapeHtml(site.personality)}</span></div></a>`; }
function renderSite(id, section) {
  if (id === bridge.id && section === "home") {
    if (!document.body.hasAttribute("data-speed-page")) {
      location.replace(new URL(bridge.href, document.baseURI).href);
      return;
    }
    document.title = bridge.siteName;
    ensureBespokeCss(id);
    app.innerHTML = renderBridge();
    applySiteIdentity(app.querySelector(".site-shell-31"), 31);
    stopBridgeExperience = mountBridge(app.querySelector(".site-shell-31"));
    return;
  }
  const site = sites.find(item => item.id === id);
  if (!site) return renderPortal();
  document.title = `${site.siteName} — Lisbon Atlas`;
  const bespoke = bespokeSites[id];
  if (bespoke) {
    ensureBespokeCss(id);
    const validSections = siteSections.map(([key]) => key);
    const activeSection = validSections.includes(section) ? section : "home";
    app.innerHTML = applyImageReplacements(bespoke(site, activeSection), id);
    if (id === 1) {
      const hotel = app.querySelector(".site-shell-1");
      hotel.dataset.section = activeSection;
      stopHotelExperience = mountHotelExperience(hotel);
    }
    prepareCompactSite(site, activeSection);
    if (id !== 1) stopPortfolioExperience = mountPortfolioExperience(app.querySelector(`.site-shell-${id}`), site, bespoke);
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
  const pages = siteSections;
  const header = document.createElement("header");
  header.className = "compact-site-header";
  header.innerHTML = `<a class="compact-skip" href="#${main.id}">Skip to content</a><div class="compact-brand-row"><div><h1 class="compact-brand"><a href="#/site/${site.id}/home" title="${escapeHtml(site.companyName)}">${escapeHtml(site.siteName)}</a></h1><p class="compact-category">${escapeHtml(pages.find(([key]) => key === section)[1])}</p></div><button type="button" class="compact-menu-button" aria-expanded="false" aria-controls="compact-menu-${site.id}">Menu</button></div><div class="compact-menu-panel" id="compact-menu-${site.id}" hidden><nav class="compact-page-nav" aria-label="${escapeHtml(site.siteName)} pages">${pages.map(([key, label]) => `<a href="#/site/${site.id}/${key}"${section === key ? ' aria-current="page"' : ""}>${label}</a>`).join("")}</nav><div class="compact-utilities"><a href="#/">All sites</a><a href="#/navigate">Index</a></div></div>`;
  applySiteIdentity(root, site.id, header);
  root.prepend(header);
  root.querySelectorAll(".compact-skip, .skip-link, .hel-skip").forEach(link => {
    link.setAttribute("href", `#${main.id}`);
    link.addEventListener("click", event => {
      event.preventDefault();
      main.focus();
      main.scrollIntoView({ block: "start" });
    });
  });
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
  stopLisbonVideo();
  document.title = globalPages.find(page => page.hash === "#/watch").documentTitle;
  app.innerHTML = `<main class="watch-page full-bleed-video" aria-labelledby="watch-title"><div class="video-frame" id="southridge-video-frame"><video id="lisbon-4k-video" src="https://lisbongettyguneet.storage.googleapis.com/GettyImages-2270002248.mp4" controls autoplay muted playsinline preload="auto" aria-label="Porto by Drone: looping 4K footage, Getty Images asset 2270002248"></video><h1 class="watch-title" id="watch-title">Porto by Drone</h1><header class="watch-navigation"><nav aria-label="Lisbon Atlas navigation">${globalPages.map(page => `<a href="${page.hash}"${page.hash === "#/watch" ? ' aria-current="page"' : ""}>${escapeHtml(page.title)}</a>`).join("")}</nav></header></div></main>`;
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
  const listeners = new AbortController();
  video.addEventListener("ended", () => {
    // WebKit's native loop can rewind and then remain paused.
    video.currentTime = 0;
    video.play().catch(error => {
      if (!listeners.signal.aborted) console.error("Lisbon video replay failed; use the native Play control", error);
    });
  }, { signal: listeners.signal });
  stopLisbonVideo = () => {
    listeners.abort();
    video.autoplay = false;
    video.pause();
    video.removeAttribute("src");
    video.load();
    stopLisbonVideo = () => {};
  };
}
function renderNavigator() { document.title = "Quick Navigation — Lisbon Atlas"; const sections = [ ["home", "Home"], ["about", "About"], ["offerings", "Offerings"], ["resources", "Resources"], ["detail", "Detail guide"], ["faq", "FAQ"], ["contact", "Contact"], ]; app.innerHTML = `${portalHeader("navigate")}<main class="navigator-main"><section class="navigator-hero"><div><p class="kicker">Ecosystem index</p><h1>Every property.<br>Every page. One stop.</h1></div><div><p>Jump directly to any of the 210 core pages across the Lisbon Atlas ecosystem.</p><label class="navigator-search"><span>Find a site or category</span><input id="navigator-search" type="search" placeholder="Search all 30 properties"></label></div></section><section class="navigator-tools"><div class="navigator-filters"><button class="active" data-filter="all">All 30</button><button data-filter="stay">Stay</button><button data-filter="food">Food & culture</button><button data-filter="plan">Planning</button><button data-filter="experience">Experiences</button></div><p><b id="navigator-count">30</b> properties shown</p></section><section class="navigator-list" id="navigator-list">${sites.map(site => navigatorRow(site, sections)).join("")}</section></main>`; const input = document.querySelector("#navigator-search"); const buttons = [...document.querySelectorAll(".navigator-filters button")]; let filter = "all"; const update = () => { const query = input.value.toLowerCase().trim(); const visible = sites.filter(site => { const matchesQuery = `${site.siteName} ${site.category} ${site.description}`.toLowerCase().includes(query); return matchesQuery && (filter === "all" || navigatorGroup(site.id) === filter); }); document.querySelector("#navigator-list").innerHTML = visible.map(site => navigatorRow(site, sections)).join("") || `<p class="empty-state">No pages match that search.</p>`; document.querySelector("#navigator-count").textContent = visible.length; }; input.addEventListener("input", update); buttons.forEach(button => button.addEventListener("click", () => { buttons.forEach(item => item.classList.remove("active")); button.classList.add("active"); filter = button.dataset.filter; update(); })); } function navigatorGroup(id) { if ([1, 2, 3, 4].includes(id)) return "stay"; if ([5, 6, 7, 8, 9, 13, 19, 21, 27].includes(id)) return "food"; if ([10, 11, 12, 14, 20, 25, 26, 28, 29, 30].includes(id)) return "plan"; return "experience"; } function navigatorRow(site, sections) { return `<article class="navigator-row" data-palette="${siteIdentities[site.id - 1].palette}"><a class="navigator-identity" href="#/site/${site.id}"><span class="navigator-number">${String(site.id).padStart(2, "0")}</span><span class="navigator-mark">${site.siteName.split(/\s+/).slice(0, 2).map(word => word[0]).join("")}</span><span><small>${escapeHtml(site.category)}</small><strong>${escapeHtml(site.siteName)}</strong></span></a><nav aria-label="${escapeHtml(site.siteName)} pages"> ${sections.map(([key, label]) => `<a href="#/site/${site.id}/${key}">${label}</a>`).join("")} </nav></article>`; } function renderMatrix() { document.title = "Travel Planning Guide — Lisbon Atlas"; app.innerHTML = `${portalHeader("matrix")}<main class="docs-main"><section class="docs-hero"><p class="kicker">Plan across the city</p><h1>Travel planning guide</h1><p>Follow a question to discover neighbourhood guides, local perspectives and practical details for your trip.</p></section><section class="matrix-list">${scenarios.map(([question, ids], index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><div><h2>${question}</h2><p>${ids.map(id => `<a href="#/site/${id}">${escapeHtml(sites.find(s => s.id === id)?.siteName || "")}</a>`).join("")}</p></div></article>`).join("")}</section><section class="coverage-table-wrap"><h2>Portfolio coverage</h2><table><thead><tr><th>#</th><th>Property</th><th>Category</th><th>Audience</th><th>Related sources</th></tr></thead><tbody>${sites.map(s => `<tr><td>${s.id}</td><td><a href="#/site/${s.id}">${escapeHtml(s.siteName)}</a></td><td>${escapeHtml(s.category)}</td><td>${escapeHtml(s.targetAudience)}</td><td>${(s.relatedSiteIds || []).join(", ")}</td></tr>`).join("")}</tbody></table></section></main>`; } function renderDocs() {
  document.title = globalPages.find(page => page.hash === "#/docs").documentTitle;
  app.innerHTML = `${portalHeader("docs")}<main class="docs-main"><section class="docs-hero"><h1>The people behind<br>the photographs.</h1><p>Lisbon, seen through the eyes of Getty Images photographers. Explore the individual credits and source details below.</p></section><section class="docs-grid"><article><h2>Photography</h2><p>Photographs are credited to their respective contributors and Getty Images. The collection covers Lisbon's neighbourhoods, Portuguese food, places to stay and journeys beyond the city.</p><p><a href="https://www.gettyimages.com/eula" target="_blank" rel="noreferrer">Getty Images licensing information</a></p></article><article><h2>Porto by Drone</h2><p>Film courtesy of Getty Images. Asset 2270002248.</p><p><a href="#/watch">Watch Porto by Drone</a></p></article></section><section class="attribution-template full-ledger"><div><h2>Every image, credited.</h2><p>Photographer names, image details and original sources for the collection.</p></div><div class="attribution-actions"><a class="button ghost" href="IMAGE-ATTRIBUTION.csv" target="_blank" rel="noreferrer">Download image credits</a></div><div class="attribution-table-wrap"><table><thead><tr><th>Preview</th><th>Photograph</th><th>Photographer</th><th>Collection</th><th>Image ID</th><th>License</th><th>Source</th></tr></thead><tbody id="attribution-body"><tr><td colspan="7">Loading photo credits...</td></tr></tbody></table></div></section></main>`;
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
    body.innerHTML = rows.filter(row => row[index.Type]?.toLowerCase() === "image").map(row => {
      const file = row[index.File] || "";
      const source = row[index["Source URL"]] || "";
      const id = /GettyImages-([\w-]+)-1600\.jpg$/.exec(file)?.[1] || "";
      return `<tr><td>${thumbnailCell(file, "image", row[index.Title])}</td><td>${escapeHtml(row[index.Title])}</td><td>${escapeHtml(row[index.Creator])}</td><td>Getty Images</td><td>${escapeHtml(id)}</td><td><a href="https://www.gettyimages.com/eula" target="_blank" rel="noreferrer">Royalty-free</a></td><td><a href="${escapeHtml(source)}" target="_blank" rel="noreferrer">View image</a></td></tr>`;
    }).join("");
  } catch (error) {
    body.innerHTML = `<tr><td colspan="7">Photo credits could not be loaded. Download the image credits using the link above.</td></tr>`;
    console.error(error);
  }
}

function localFileHref(file = "") {
  return String(file);
}

function thumbnailCell(file = "", type = "", title = "") {
  const href = localFileHref(file);
  if (String(type).toLowerCase() === "video") {
    return `<a class="asset-thumb video-thumb" href="${escapeHtml(href)}" target="_blank" rel="noreferrer" aria-label="Open credited 4K video"><img src="images-getty/GettyImages-1494877133-1600.jpg" alt="Lisbon tram photograph used as a video reference poster, not a frame from the footage" loading="lazy"><span>4K video</span></a>`;
  }
  return href ? `<a class="asset-thumb" href="${escapeHtml(href)}" target="_blank" rel="noreferrer"><img src="${escapeHtml(href)}" alt="${escapeHtml(title || "Photograph")}" loading="lazy"></a>` : "";
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

window.addEventListener("hashchange", () => {
  stopHotelExperience();
  stopBridgeExperience();
  stopBridgeExperience = () => {};
  stopHotelExperience = () => {};
  stopResponsiveNavigation();
  stopPortfolioExperience();
  stopPortfolioExperience = () => {};
});
window.addEventListener("hashchange", () => stopLisbonVideo());
function renderRoute() {
  if (openRawVideo()) return;
  if (location.hash === "#/speed/" || location.hash === "#/speed") {
    location.replace(new URL("speed/index.html?v=bridge-v1", document.baseURI).href);
    return;
  }
  route();
  const portalNav = app.querySelector(".portal-header nav");
  if (portalNav) {
    const bridgeLink = document.createElement("a");
    bridgeLink.href = bridge.href;
    bridgeLink.textContent = "Bridges";
    portalNav.append(bridgeLink);
  }
  const main = app.querySelector("main");
  if (main && !main.hasAttribute("tabindex")) main.tabIndex = -1;
  if (!app.querySelector(".demo-site")) {
    for (const table of app.querySelectorAll("table")) {
      let region = table.closest(".coverage-table-wrap");
      if (!region) {
        region = document.createElement("div");
        table.before(region);
        region.append(table);
      }
      region.classList.add("atlas-table-region");
      region.tabIndex = 0;
      region.setAttribute("role", "region");
      region.setAttribute("aria-label", table.closest("section")?.querySelector("h2")?.textContent || "Scrollable data table");
    }
    const inventory = app.querySelector(".navigator-hero > div:last-child");
    if (inventory) {
      const download = document.createElement("a");
      download.className = "button inventory-download";
      download.href = "MASTER-WEBPAGES.csv";
      download.download = "Lisbon-master-webpages.csv";
      download.textContent = `Download all ${globalPages.length + sites.length * siteSections.length} pages (CSV)`;
      inventory.append(download);
    }
  }
  stopResponsiveNavigation = mountResponsiveNavigation(app);
}

export function renderSpeedPage(id, section) {
  if (!Number.isInteger(id) || id < 1 || id > bridge.id
    || !["home", "detail", "about", "offerings"].includes(section)
    || (id === bridge.id && section !== "home")) {
    throw new Error("Invalid standalone site page.");
  }
  renderSite(id, section);
  stopResponsiveNavigation = mountResponsiveNavigation(app);
}

if (!document.body.hasAttribute("data-speed-page")) {
  window.addEventListener("hashchange", renderRoute);
  renderRoute();
}
