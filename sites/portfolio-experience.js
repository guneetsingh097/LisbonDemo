import { experiences, referenceForSite, filterExperience, parseSamplePrice } from "./experience-catalog.js";

const states = new Map();
const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const normalize = value => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const text = element => {
  const copy = element.cloneNode(true);
  copy.querySelectorAll("p,li,dt,dd,h2,h3,h4,div,strong,span,em").forEach(node => node.append(" "));
  return copy.textContent.replace(/\s+/g, " ").trim();
};

export function extractExperienceItems(markup, config) {
  const template = document.createElement("template");
  template.innerHTML = markup;
  const source = template.content;
  source.querySelectorAll(".rating,figcaption,.credit,.view-btn").forEach(element => element.remove());
  let nodes = [...source.querySelectorAll(config.selector)];
  if (config.listIndex !== undefined) nodes = [...nodes[config.listIndex].children];
  const headers = [...source.querySelectorAll("thead th")].map(element => element.textContent.trim());
  return nodes.map((node, index) => {
    const cells = [...node.querySelectorAll(":scope > td")].map(element => element.textContent.trim());
    const heading = node.querySelector("h2,h3,h4");
    const title = cells.length ? cells[config.titleColumn ?? 1] : heading?.textContent.trim()
      || node.querySelector("strong,b")?.textContent.trim()
      || node.textContent.trim().split(/ — | for | when /)[0];
    const searchText = text(node);
    const facts = cells.length ? cells.map((value, column) => [headers[column] || `Field ${column + 1}`, value])
      : [["Notes", searchText.replace(title, "").trim() || searchText]];
    const priceText = node.querySelector(".price")?.textContent || cells.at(-1) || searchText;
    const facets = config.facetColumn !== undefined ? [cells[config.facetColumn]]
      : config.titleFacet ? [title]
      : config.terms.filter(term => normalize(searchText).includes(normalize(term)));
    return { id: String(index), index, title, searchText, facts, facets: facets.filter(Boolean),
      second: config.secondColumn !== undefined ? cells[config.secondColumn] : "",
      price: parseSamplePrice(priceText) };
  });
}

function referenceFigure(id) {
  const image = referenceForSite(id);
  return `<figure class="portfolio-reference"><img src="images-getty/GettyImages-${image.id}-1600.jpg" alt="${escape(image.title)}"><figcaption><strong>${escape(image.title)}</strong><em>${escape(image.credit)}</em></figcaption></figure>`;
}

export function mountPortfolioExperience(root, site, renderer) {
  if (!document.querySelector("#portfolio-experience-css")) {
    const stylesheet = document.createElement("link");
    stylesheet.id = "portfolio-experience-css";
    stylesheet.rel = "stylesheet";
    stylesheet.href = "sites/portfolio-experience.css";
    document.head.insertBefore(stylesheet, document.querySelector("#compact-sites-css"));
  }
  const controller = new AbortController();
  const listen = (element, name, handler, options = {}) => element.addEventListener(name, handler, { ...options, signal: controller.signal });
  const main = root.querySelector("main, .compact-content");
  const config = experiences[site.id];
  const section = root.dataset.section;
  if (!config) return () => {};
  const applyPalette = () => {
    let surface = main;
    while (surface.parentElement && getComputedStyle(surface).backgroundColor === "rgba(0, 0, 0, 0)") surface = surface.parentElement;
    root.style.setProperty("--work-ink", getComputedStyle(main).color);
    root.style.setProperty("--work-paper", getComputedStyle(surface).backgroundColor);
  };
  const siteStylesheet = document.querySelector(`link[href="sites/site-${String(site.id).padStart(2, "0")}.css"]`);
  applyPalette();
  if (!siteStylesheet.sheet) listen(siteStylesheet, "load", applyPalette, { once: true });
  listen(matchMedia("(max-width: 980px), (max-height: 650px)"), "change", applyPalette);
  if (site.id === 4) prepareApartmentContent(root);

  if (["home", "offerings"].includes(section)) {
    const items = extractExperienceItems(renderer(site, config.source), config);
    if (!items.length || items.some(item => !item.title)) throw new Error(`Missing planning entries for site ${site.id}`);
    if (!states.has(site.id)) states.set(site.id, { selected: [], completed: new Set() });
    const state = states.get(site.id);
    const workspace = document.createElement("section");
    workspace.className = "portfolio-workspace";
    workspace.id = `planning-desk-${site.id}`;
    workspace.setAttribute("aria-labelledby", `planning-title-${site.id}`);
    const facets = [...new Set(items.flatMap(item => item.facets))];
    const secondary = [...new Set(items.map(item => item.second).filter(Boolean))];
    const hasPrices = items.filter(item => item.price !== null).length > 1;
    const secondLabel = config.secondColumn !== undefined ? items[0].facts[config.secondColumn][0] : "";
    const isCompare = config.mode === "compare";
    const selectionLabel = isCompare ? "Your comparison" : config.mode === "read" ? "Your reading queue"
      : config.mode === "checklist" ? "Your preparation checklist" : "Your itinerary";
    workspace.innerHTML = `<div class="portfolio-work-heading"><div><h2 id="planning-title-${site.id}" tabindex="-1">${escape(config.title)}</h2>
      <p>${isCompare ? "Compare your favourites side by side and find the right fit." : config.mode === "read" ? "Save the stories you want to read, in the order that suits you." : config.mode === "checklist" ? "Gather the details that matter before you set out." : "Find your favourites and arrange them into a day of your own."}</p></div>
      <a href="#/site/${site.id}/offerings">Read the full notes</a></div>
      <form class="portfolio-filters" role="search" aria-label="${escape(config.title)}" novalidate>
      <label>Search these entries<input name="text" type="search" placeholder="Search names and notes"></label>
      <label>${escape(config.facetLabel)}<select name="facet"><option value="">All ${escape(config.facetLabel.toLowerCase())} options</option>${facets.map(value => `<option>${escape(value)}</option>`).join("")}</select></label>
      ${secondary.length ? `<label>${escape(secondLabel)}<select name="second"><option value="">All options</option>${secondary.map(value => `<option>${escape(value)}</option>`).join("")}</select></label>` : ""}
      <label>Order<select name="sort"><option value="source">Editorial order</option><option value="name">Name A-Z</option>${hasPrices ? '<option value="price">Price: low to high</option>' : ""}</select></label>
      ${hasPrices ? '<label>Maximum price (EUR)<input name="maxPrice" type="number" min="0" step="0.01" placeholder="No maximum" aria-describedby="portfolio-budget-note"></label>' : ""}
      <button type="button" data-work-action="reset">Reset filters</button></form>
      ${hasPrices ? '<p class="portfolio-small" id="portfolio-budget-note">Budget filters use fixed prices. Open-ended "from" prices are excluded; check the duration and inclusions when comparing.</p>' : ""}
      <p class="portfolio-search-status" role="status" aria-live="polite"></p>
      <div class="portfolio-work-layout"><div><ol class="portfolio-results"></ol></div><aside class="portfolio-selection" aria-label="${selectionLabel}">
      <h3>${selectionLabel}</h3><p class="portfolio-selection-status" aria-live="polite"></p>
      ${isCompare ? '<button type="button" data-work-action="compare" disabled>Compare selected entries</button>' : ""}
      <ol class="portfolio-selected"></ol><button type="button" data-work-action="clear">Clear selection</button>
      <p class="portfolio-small">${config.mode === "checklist" ? "Tick off each detail as you prepare." : "Keep your favourites together while you explore."}</p></aside></div>
      <section class="portfolio-comparison" hidden aria-labelledby="portfolio-compare-title"><div class="portfolio-work-heading"><h3 id="portfolio-compare-title" tabindex="-1">Compare the original notes</h3><button type="button" data-work-action="close-comparison">Close comparison</button></div><div class="portfolio-compare-grid"></div></section>
      ${referenceFigure(site.id)}`;
    const jump = document.createElement("div");
    jump.className = "portfolio-jump";
    jump.innerHTML = `<button type="button" aria-label="Open ${escape(config.title.toLowerCase())}">${escape(config.title)}</button>`;
    main.prepend(jump);
    const firstSection = [...main.children].find(element => element !== jump && !element.matches("dialog"));
    if (firstSection) firstSection.after(workspace);
    else main.append(workspace);
    listen(jump.querySelector("button"), "click", () => {
      workspace.scrollIntoView({ block: "start", behavior: "instant" });
      workspace.querySelector("h2").focus({ preventScroll: true });
    });
    const form = workspace.querySelector("form");
    if (state.pendingQuery) {
      form.elements.namedItem("text").value = state.pendingQuery;
      delete state.pendingQuery;
    }
    const resultList = workspace.querySelector(".portfolio-results");
    const selectedList = workspace.querySelector(".portfolio-selected");
    const status = workspace.querySelector(".portfolio-search-status");
    const compare = workspace.querySelector('[data-work-action="compare"]');
    const comparison = workspace.querySelector(".portfolio-comparison");
    const factsMarkup = item => `<dl>${item.facts.map(([key, value]) =>
      `<div><dt>${escape(key)}</dt><dd>${escape(value)}</dd></div>`).join("")}</dl>`;
    const readQuery = () => {
      const query = Object.fromEntries(new FormData(form));
      return { text: "", facet: "", second: "", maxPrice: "", ...query };
    };
    let appliedQuery = readQuery();
    function render() {
      const draft = readQuery();
      const invalid = form.elements.namedItem("maxPrice")?.validity.badInput
        || (draft.maxPrice !== "" && (!Number.isFinite(Number(draft.maxPrice)) || Number(draft.maxPrice) < 0));
      form.elements.namedItem("maxPrice")?.setAttribute("aria-invalid", String(invalid));
      if (!invalid) appliedQuery = draft;
      const query = appliedQuery;
      const matches = filterExperience(items, query);
      status.textContent = invalid ? "Enter a maximum price of zero or more. The last valid results are retained."
        : `${matches.length} of ${items.length} entries shown. ${state.selected.length} saved.`;
      const groupHead = (item, index) => config.mode === "calendar" && (index === 0 || item.facets[0] !== matches[index - 1].facets[0])
        ? `<p class="portfolio-day">${escape(item.facets[0])}</p>` : "";
      resultList.innerHTML = matches.length ? matches.map((item, index) => `<li data-entry-id="${item.id}">${groupHead(item, index)}<article>
        <h3>${escape(item.title)}</h3>${factsMarkup(item)}
        <button type="button" data-work-toggle="${item.id}" aria-pressed="${state.selected.includes(item.id)}">${state.selected.includes(item.id) ? "Remove from" : "Add to"} ${isCompare ? "comparison" : config.mode === "read" ? "reading queue" : config.mode === "checklist" ? "checklist" : "itinerary"}</button></article></li>`).join("")
        : '<li class="portfolio-empty"><h3>No entries match these filters.</h3><p>Try another search, choose All options, or reset the filters. Your saved selection is retained.</p><button type="button" data-work-action="reset">Reset filters</button></li>';
      const chosen = state.selected.map(id => items.find(item => item.id === id));
      workspace.querySelector(".portfolio-selection-status").textContent = `${chosen.length} saved${isCompare ? "; choose at least two to compare" : "; arrange them in your preferred order"}.`;
      selectedList.innerHTML = chosen.map((item, index) => `<li><strong>${escape(item.title)}</strong>
        ${["read", "checklist"].includes(config.mode) ? `<label class="portfolio-complete"><input type="checkbox" data-work-complete="${item.id}"${state.completed.has(item.id) ? " checked" : ""}>${config.mode === "read" ? "Read" : "Prepared"}</label>` : ""}
        <div class="portfolio-entry-actions">${!isCompare ? `<button type="button" data-work-up="${item.id}"${index === 0 ? " disabled" : ""} aria-label="Move ${escape(item.title)} earlier">Earlier</button><button type="button" data-work-down="${item.id}"${index === chosen.length - 1 ? " disabled" : ""} aria-label="Move ${escape(item.title)} later">Later</button>` : ""}
        <button type="button" data-work-remove="${item.id}" aria-label="Remove ${escape(item.title)} from saved entries">Remove</button></div></li>`).join("");
      workspace.querySelector('[data-work-action="clear"]').disabled = chosen.length === 0;
      if (compare) {
        compare.disabled = chosen.length < 2;
        compare.textContent = `Compare selected entries (${chosen.length})`;
        if (chosen.length < 2) comparison.hidden = true;
        comparison.querySelector(".portfolio-compare-grid").innerHTML = chosen.map(item =>
          `<article><h4>${escape(item.title)}</h4>${factsMarkup(item)}</article>`).join("");
      }
    }
    listen(form, "submit", event => { event.preventDefault(); render(); });
    listen(form, "input", render);
    listen(workspace, "change", event => {
      const id = event.target.dataset.workComplete;
      if (id !== undefined) {
        if (event.target.checked) state.completed.add(id);
        else state.completed.delete(id);
        workspace.querySelector(".portfolio-selection-status").textContent =
          `${state.selected.length} saved; ${state.selected.filter(key => state.completed.has(key)).length} ${config.mode === "read" ? "read" : "prepared"}.`;
      }
    });
    listen(workspace, "click", event => {
      const button = event.target.closest("button");
      if (!button) return;
      const { workToggle, workRemove, workUp, workDown, workAction } = button.dataset;
      if (workAction === "reset") { form.reset(); render(); form.querySelector("input").focus(); return; }
      if (workAction === "compare") {
        comparison.hidden = false;
        comparison.scrollIntoView({ block: "start", behavior: "instant" });
        comparison.querySelector("h3").focus({ preventScroll: true });
        return;
      }
      if (workAction === "close-comparison") { comparison.hidden = true; compare.focus(); return; }
      if (workAction === "clear") { state.selected = []; state.completed.clear(); render(); form.querySelector("input").focus(); return; }
      const id = workToggle ?? workRemove ?? workUp ?? workDown;
      if (id === undefined) return;
      const index = state.selected.indexOf(id);
      if (workToggle !== undefined) {
        if (index === -1) state.selected.push(id);
        else { state.selected.splice(index, 1); state.completed.delete(id); }
      } else if (workRemove !== undefined) {
        state.selected.splice(index, 1); state.completed.delete(id);
      } else {
        const next = index + (workUp !== undefined ? -1 : 1);
        [state.selected[index], state.selected[next]] = [state.selected[next], state.selected[index]];
      }
      render();
      const target = workToggle !== undefined ? workspace.querySelector(`[data-work-toggle="${id}"]`)
        : workspace.querySelector(`[data-work-remove="${id}"]`) || form.querySelector("input");
      target?.focus({ preventScroll: true });
    });
    render();
  }
  if (site.id === 4) {
    const search = input => {
      const form = root.querySelector(".portfolio-filters");
      if (!form) {
        if (!states.has(site.id)) states.set(site.id, { selected: [], completed: new Set() });
        states.get(site.id).pendingQuery = input.value;
        location.hash = "#/site/4/offerings";
        return;
      }
      form.elements.namedItem("text").value = input.value;
      form.dispatchEvent(new Event("input"));
      form.scrollIntoView({ block: "start", behavior: "instant" });
      form.querySelector("input").focus({ preventScroll: true });
    };
    root.querySelectorAll(".search-form").forEach(form => listen(form, "submit", event => {
      event.preventDefault(); search(form.querySelector("input"));
    }));
    const navigationSearch = root.querySelector(".search-nav-input");
    if (navigationSearch) {
      listen(root.querySelector(".search-nav-btn"), "click", () => search(navigationSearch));
      listen(navigationSearch, "keydown", event => {
        if (event.key === "Enter") { event.preventDefault(); search(navigationSearch); }
      });
    }
    const sidebar = root.querySelector(".filter-sidebar");
    if (sidebar) {
      sidebar.innerHTML = '<h3>Find your apartment</h3><p>Explore neighbourhoods, set your budget and compare your favourites.</p><button type="button">Refine your search</button>';
      listen(sidebar.querySelector("button"), "click", () => {
        const form = root.querySelector(".portfolio-filters");
        form.scrollIntoView({ block: "start", behavior: "instant" });
        form.querySelector("input").focus({ preventScroll: true });
      });
    }
  }

  if (section === "faq") {
    const groups = [...main.querySelectorAll("details, .faq-item, .hel-faq-item, .uml-faq, .faq-register article, .faq-ledger article, dl > div")];
    if (groups.length) {
      groups.forEach(group => group.classList.add("portfolio-filtered"));
      const label = document.createElement("label");
      label.className = "portfolio-faq-search";
      label.innerHTML = 'Find a question<input type="search" placeholder="Search questions and answers"><span role="status" aria-live="polite"></span>';
      main.prepend(label);
      listen(label.querySelector("input"), "input", event => {
        const query = normalize(event.target.value.trim());
        groups.forEach(group => { group.hidden = !normalize(group.textContent).includes(query); });
        label.querySelector("span").textContent = `${groups.filter(group => !group.hidden).length} questions shown.`;
      });
    }

  }
  mountPageGallery(root, main, listen);
  return () => {
    controller.abort();
    root.querySelector(".portfolio-gallery")?.close();
  };
}

function prepareApartmentContent(root) {
      const corrections = new Map([
        ["312 verified apartments. All with keys. All with stories.", "Find your neighbourhood. Make yourself at home."],
        ["312 verified apartments. Filter by your needs.", "City studios, characterful lofts and coastal stays. Find your fit."],
        ["🔑 Every Photo Shows the Key", "Spaces with character"],
        ["Literally. Every listing includes our signature key-fob in the shot. Transparency. Authenticity. Real spaces, real keys.", "Light-filled rooms, thoughtful details and neighbourhoods worth getting to know. A good stay begins with the right space."],
        ["Ready to Book?", "Ready to Compare?"],
        ["Browse our full collection of 312 verified apartments, or search by neighborhood, dates, and budget.", "Explore by neighbourhood and budget, then compare the places you love."],
        ["Browse our 312 verified apartments. Find your key. Book your Lisbon story.", "Find your key. Make Lisbon your own."],
        ["The Signature Listing: Every Photo Tells the Truth", "A Closer Look at Life in Lisbon"],
        ["Why Show the Key?", "Your Neighbourhood, Unlocked"],
        ["Every Chave Lisboa listing includes a photo of the apartment's actual key fob. It's our signature. Our promise. Real space, real key, real transparency.", "A quiet street, a favourite cafe, a place to leave your keys. We look for the little things that make a city feel like home."],
        ["This is what sets us apart: We don't hide. We show you exactly what you're getting. No surprises. No filters. Just honest listings from verified hosts.", "From Príncipe Real to the coast, discover spaces with their own rhythm and a neighbourhood to match."],
      ]);
      root.querySelectorAll("h1,h2,h3,p").forEach(element => {
        const replacement = corrections.get(element.textContent.trim());
        if (replacement) element.textContent = replacement;
      });
}

function mountPageGallery(root, main, listen) {
  const photos = [...new Map([...main.querySelectorAll("img")].map(image => [image.getAttribute("src"), {
    src: image.getAttribute("src"), alt: image.alt,
    caption: image.closest("figure")?.querySelector("figcaption") ? text(image.closest("figure").querySelector("figcaption"))
      : image.closest(".listing-item")?.querySelector("figcaption") ? text(image.closest(".listing-item").querySelector("figcaption")) : image.alt,
  }])).values()];
  if (!photos.length) return;
  const opener = document.createElement("button");
  opener.type = "button";
  opener.className = "portfolio-gallery-opener";
  opener.textContent = `Photos (${photos.length})`;
  opener.setAttribute("aria-label", `View page photographs (${photos.length})`);
  (main.querySelector(".portfolio-jump") || main).append(opener);
  const dialog = document.createElement("dialog");
  dialog.className = "portfolio-gallery";
  dialog.setAttribute("aria-label", "Page photographs and credits");
  root.append(dialog);
  let index = 0;
  const show = value => {
    index = (value + photos.length) % photos.length;
    const photo = photos[index];
    dialog.querySelector(".portfolio-gallery-image").innerHTML = `<figure><img src="${escape(photo.src)}" alt="${escape(photo.alt)}"><figcaption>${escape(photo.caption)}</figcaption></figure>`;
    dialog.querySelector('[role="status"]').textContent = `Photo ${index + 1} of ${photos.length}`;
    dialog.querySelectorAll("[data-gallery-index]").forEach((button, value) => button.setAttribute("aria-current", String(value === index)));
    dialog.querySelector(".portfolio-gallery-error").textContent = "";
  };
  listen(opener, "click", () => {
    dialog.innerHTML = `<div class="portfolio-gallery-header"><h2>Page photographs</h2><button type="button" data-gallery-close>Close gallery</button></div>
      <p class="portfolio-gallery-note"><a href="#/docs">Photography &amp; credits</a></p>
      <div class="portfolio-gallery-controls"><button type="button" data-gallery-previous>Previous photo</button><span role="status" aria-live="polite"></span><button type="button" data-gallery-next>Next photo</button></div>
      <div class="portfolio-gallery-image"></div><p class="portfolio-gallery-error" role="alert"></p>
      <div class="portfolio-gallery-thumbs" role="group" aria-label="Choose a photograph">${photos.map((photo, index) => `<button type="button" data-gallery-index="${index}" aria-label="${escape(photo.alt)}"><img src="${escape(photo.src)}" alt=""></button>`).join("")}</div>`;
    show(0);
    dialog.showModal();
    dialog.querySelector("[data-gallery-close]").focus();
  });
  listen(dialog, "click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.hasAttribute("data-gallery-close")) dialog.close();
    else if (button.hasAttribute("data-gallery-next")) show(index + 1);
    else if (button.hasAttribute("data-gallery-previous")) show(index - 1);
    else if (button.dataset.galleryIndex !== undefined) show(Number(button.dataset.galleryIndex));
  });
  listen(dialog, "keydown", event => {
    const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: photos.length - 1 }[event.key];
    if (next !== undefined) {
      event.preventDefault(); show(next);
      if (event.target.hasAttribute("data-gallery-index")) dialog.querySelector(`[data-gallery-index="${index}"]`).focus();
    }
    if (event.key === "Tab") {
      const controls = dialog.querySelectorAll("button,a[href]");
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  listen(dialog, "error", event => {
    if (event.target.tagName === "IMG") dialog.querySelector(".portfolio-gallery-error").textContent = "This photograph did not load. Choose another thumbnail or reopen the gallery.";
  }, { capture: true });
  listen(dialog, "close", () => { dialog.replaceChildren(); if (opener.isConnected) opener.focus({ preventScroll: true }); });
}
