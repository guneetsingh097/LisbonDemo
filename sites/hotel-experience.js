const day = 86_400_000;
export const defaultStay = { arrival: "2027-05-03", departure: "2027-05-06", guests: "2", style: "all" };
const styles = { all: "All rooms", desk: "Writing desk", balcony: "Balcony", salon: "Sitting corner" };
const roomRules = {
  roomBlue: { capacity: 2, style: "desk", closed: ["2027-05-14", "2027-05-15"] },
  roomOchre: { capacity: 2, style: "balcony", closed: ["2027-05-12", "2027-05-18", "2027-05-19"] },
  roomSalon: { capacity: 3, style: "salon", closed: ["2027-05-20", "2027-05-21", "2027-05-22"] },
};
const money = value => new Intl.NumberFormat("en-IE", {
  style: "currency", currency: "EUR", maximumFractionDigits: 0,
}).format(value);
const dateLabel = value => new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
}).format(new Date(`${value}T00:00:00Z`));
const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export function createHotelRooms(catalog, images) {
  return catalog.map(item => {
    const rule = roomRules[item.image];
    const base = Number(item.price.match(/\d+/)?.[0]);
    if (!rule || !Number.isFinite(base) || !images[item.image]) {
      throw new Error(`Missing sample room data for ${item.name}`);
    }
    return { ...item, ...rule, id: item.image, photo: images[item.image], base };
  });
}

function parseDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : null;
}

export function evaluateStay(rooms, input) {
  const errors = {};
  const arrival = parseDate(input.arrival);
  const departure = parseDate(input.departure);
  const guests = Number(input.guests);
  if (arrival === null || input.arrival < "2027-05-01" || input.arrival > "2027-05-31") {
    errors.arrival = "Choose an arrival from 1 to 31 May 2027.";
  }
  if (departure === null || input.departure < "2027-05-02" || input.departure > "2027-06-01") {
    errors.departure = "Choose a departure from 2 May to 1 June 2027.";
  }
  if (!errors.arrival && !errors.departure) {
    const nights = (departure - arrival) / day;
    if (nights < 1 || nights > 14) errors.departure = "Departure must be 1 to 14 nights after arrival.";
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > 3) {
    errors.guests = "Enter 1, 2 or 3 guests for this sample stay.";
  }
  if (!Object.hasOwn(styles, input.style)) errors.style = "Choose one of the listed room styles.";
  if (Object.keys(errors).length) return { ok: false, errors };
  const nights = (departure - arrival) / day;
  const dates = Array.from({ length: nights }, (_, index) =>
    new Date(arrival + index * day).toISOString().slice(0, 10));
  const weekendNights = dates.filter(value => [5, 6].includes(new Date(`${value}T00:00:00Z`).getUTCDay())).length;
  const results = rooms.filter(room => room.capacity >= guests
    && (input.style === "all" || room.style === input.style)
    && !dates.some(value => value === "2027-05-24" || room.closed.includes(value)))
    .map(room => ({ ...room, total: room.base * nights + weekendNights * 24 }));
  return { ok: true, query: { ...input, guests, nights, weekendNights }, results };
}

const stayLabel = query => `${dateLabel(query.arrival)} to ${dateLabel(query.departure)}`
  + ` / ${query.nights} ${query.nights === 1 ? "night" : "nights"} / ${query.guests} ${query.guests === 1 ? "guest" : "guests"}`;

function photoButton(image, key) {
  return `<button type="button" class="hotel-photo-trigger" data-hotel-photo="${key}" aria-label="Open photo gallery: ${escape(image.alt)}"><img src="${image.src}" alt="${escape(image.alt)}"><span>View photo</span></button>`;
}

function roomMarkup(room, query) {
  return `<li><article><div class="catalog-meta"><span>${escape(room.code)}</span><strong>${escape(room.price)}</strong></div>
    <h4>${escape(room.name)}</h4><p>${escape(room.text)}</p>
    <figure>${photoButton(room.photo, room.id)}<figcaption><strong>${escape(room.name)}</strong><span>Illustrative interior; not an actual hotel room.</span><em>${escape(room.photo.credit)}</em></figcaption></figure>
    <dl class="hotel-room-quote"><div><dt>Sample stay total</dt><dd>${money(room.total)}</dd></div><div><dt>Sample capacity</dt><dd>${room.capacity} guests</dd></div></dl>
    <button type="button" class="hotel-button hotel-compare-toggle" data-room-toggle="${room.id}" aria-pressed="false" aria-label="Add ${escape(room.name)} to comparison">Add to comparison</button>
    <small>${query.nights} nights; breakfast included in sample rates.</small></article></li>`;
}

export function renderStayPlanner(rooms) {
  const initial = evaluateStay(rooms, defaultStay);
  return `<section class="catalog-stack hotel-stay-planner" aria-labelledby="hotel-stay-title">
    <div class="catalog-heading"><span class="section-label">room catalog</span><h3 id="hotel-stay-title">Three entries from the house ledger.</h3></div>
    <p id="hotel-stay-rules" class="hotel-demo-note">Plan a sample stay, not a reservation. Demo calendar: May 2027, 1-14 nights, 1-3 guests. Availability blocks and capacities are demonstration assumptions, not live inventory.</p>
    <form id="hotel-stay-form" class="hotel-stay-form" aria-describedby="hotel-stay-rules" novalidate>
      <label>Arrival<input name="arrival" type="date" value="${defaultStay.arrival}" min="2027-05-01" max="2027-05-31" required aria-describedby="hotel-error-arrival"><span class="hotel-field-error" id="hotel-error-arrival"></span></label>
      <label>Departure<input name="departure" type="date" value="${defaultStay.departure}" min="2027-05-02" max="2027-06-01" required aria-describedby="hotel-error-departure"><span class="hotel-field-error" id="hotel-error-departure"></span></label>
      <label>Guests<input name="guests" type="number" min="1" max="3" step="1" value="2" required aria-describedby="hotel-error-guests"><span class="hotel-field-error" id="hotel-error-guests"></span></label>
      <label>Room style<select name="style" aria-describedby="hotel-error-style">${Object.entries(styles).map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}</select><span class="hotel-field-error" id="hotel-error-style"></span></label>
      <button class="hotel-button" type="submit">Update rooms</button>
    </form>
    <details class="hotel-pricing-notes"><summary>How sample pricing and availability work</summary><p>Existing sample nightly rates are used as the base. Friday and Saturday nights add ${money(24)} per room per night. Breakfast is included; taxes and other charges are not modelled. All rooms are blocked on 24 May in this demo, with additional fixed blocks by room. Nothing is checked against a real reservation system.</p></details>
    <p id="hotel-search-status" class="hotel-search-status" role="status" aria-live="polite">${initial.results.length} sample rooms / ${stayLabel(initial.query)}</p>
    <ol id="hotel-room-results" class="hotel-room-results">${initial.results.map(room => roomMarkup(room, initial.query)).join("")}</ol>
    <div class="hotel-comparison-bar"><span id="hotel-selection-status" aria-live="polite">Choose 2 or 3 rooms to compare.</span><button type="button" class="hotel-button" data-hotel-action="compare" disabled>Compare rooms (0)</button></div>
  </section>`;
}

export function renderHotelDialogs() {
  return `<dialog class="hotel-dialog hotel-comparison-dialog" id="hotel-comparison" aria-labelledby="hotel-compare-title" aria-describedby="hotel-compare-description">
    <div class="hotel-dialog-header"><h2 id="hotel-compare-title">Compare your rooms</h2><button type="button" class="hotel-button hotel-button-outline" data-hotel-action="close-comparison">Close comparison</button></div>
    <p id="hotel-compare-description">Sample room comparison only. No reservation, payment or availability guarantee.</p><div class="hotel-comparison-body"></div>
  </dialog>
  <dialog class="hotel-dialog hotel-gallery-dialog" id="hotel-gallery" aria-labelledby="hotel-gallery-title" aria-describedby="hotel-gallery-description">
    <div class="hotel-dialog-header"><h2 id="hotel-gallery-title">Location &amp; room photos</h2><button type="button" class="hotel-button hotel-button-outline" data-hotel-action="close-gallery">Close gallery</button></div>
    <p id="hotel-gallery-description">Stock Lisbon views and illustrative interiors; not photographs of a real hotel. Use Left/Right arrows to browse, Home/End to jump, or Escape to close.</p><div class="hotel-gallery-body"></div>
  </dialog>`;
}

export function mountHotelExperience(root, rooms, images) {
  if (root.dataset.section !== "home") return () => {};
  const controller = new AbortController();
  const listen = (element, event, handler, options = {}) =>
    element.addEventListener(event, handler, { ...options, signal: controller.signal });
  const form = root.querySelector("#hotel-stay-form");
  const results = root.querySelector("#hotel-room-results");
  const status = root.querySelector("#hotel-search-status");
  const selectionStatus = root.querySelector("#hotel-selection-status");
  const compareButton = root.querySelector('[data-hotel-action="compare"]');
  const comparison = root.querySelector("#hotel-comparison");
  const gallery = root.querySelector("#hotel-gallery");
  const selected = new Set();
  let applied = evaluateStay(rooms, defaultStay);
  let comparisonOpener;
  let galleryOpener;
  let photoIndex = 0;
  const photos = [
    { key: "city", title: "Lisbon old town rooftops", note: "Getty location reference, not the hotel's exterior or room view." },
    { key: "tiles", title: "Azulejo study", note: "Getty material reference photographed in Lisbon." },
    ...rooms.map(room => ({ key: room.id, title: room.name, note: "Illustrative Getty stock interior, not an actual room at this sample hotel." })),
  ].map(photo => ({ ...photo, image: images[photo.key] }));

  for (const photo of photos) {
    root.querySelectorAll(`img[src="${photo.image.src}"]`).forEach(image => {
      if (!image.closest("[data-hotel-photo]")) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = photoButton(photo.image, photo.key);
        image.replaceWith(wrapper.firstElementChild);
      }
    });
  }

  function restoreFocus(opener) {
    const target = opener?.isConnected && !opener.disabled ? opener
      : root.querySelector("[data-room-toggle]") || form.querySelector('[type="submit"]');
    target.focus({ preventScroll: true });
  }

  function updateSelection() {
    root.querySelectorAll("[data-room-toggle]").forEach(button => {
      const active = selected.has(button.dataset.roomToggle);
      const room = rooms.find(item => item.id === button.dataset.roomToggle);
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-label", `${active ? "Remove" : "Add"} ${room.name} ${active ? "from" : "to"} comparison`);
      button.textContent = active ? "Remove from comparison" : "Add to comparison";
    });
    compareButton.disabled = selected.size < 2;
    compareButton.textContent = `Compare rooms (${selected.size})`;
    selectionStatus.textContent = selected.size ? `${selected.size} selected. Choose 2 or 3 rooms to compare.`
      : "Choose 2 or 3 rooms to compare.";
  }

  function updateComparison() {
    const chosen = applied.results.filter(room => selected.has(room.id));
    comparison.querySelector(".hotel-comparison-body").innerHTML =
      `<p class="hotel-comparison-dates">${stayLabel(applied.query)}</p><div class="hotel-comparison-grid">${chosen.map(room =>
        `<article><h3>${escape(room.name)}</h3><dl><dt>Base sample rate / night</dt><dd>${money(room.base)}</dd>
        <dt>Sample stay total</dt><dd>${money(room.total)}</dd><dt>Sample capacity</dt><dd>${room.capacity} guests</dd>
        <dt>Room notes</dt><dd>${escape(room.text)}</dd><dt>Breakfast</dt><dd>Included in sample rates</dd>
        <dt>Access</dt><dd>Stairs; not fully step-free</dd></dl>
        <button type="button" class="hotel-button hotel-button-outline" data-remove-room="${room.id}" aria-label="Remove ${escape(room.name)} from comparison">Remove room</button></article>`).join("")}</div>`;
  }

  listen(form, "input", () => {
    status.textContent = `Changes not applied. Update rooms to search. Displayed results and comparison: ${stayLabel(applied.query)}.`;
  });
  listen(form, "submit", event => {
    event.preventDefault();
    const input = Object.fromEntries(new FormData(form));
    const next = evaluateStay(rooms, input);
    for (const name of ["arrival", "departure", "guests", "style"]) {
      const error = next.errors?.[name] || "";
      form.elements.namedItem(name).setAttribute("aria-invalid", String(Boolean(error)));
      root.querySelector(`#hotel-error-${name}`).textContent = error;
    }
    if (!next.ok) {
      status.textContent = `Check the highlighted fields. Results are unchanged: ${stayLabel(applied.query)}.`;
      form.elements.namedItem(Object.keys(next.errors)[0]).focus();
      return;
    }
    const cleared = selected.size > 0;
    selected.clear();
    applied = next;
    results.innerHTML = next.results.map(room => roomMarkup(room, next.query)).join("");
    if (!next.results.length) {
      results.innerHTML = '<li class="hotel-no-results"><h4>No sample rooms match this stay.</h4><p>Try other May dates, fewer guests, or a different room style. No real hotel inventory has been checked.</p><button class="hotel-button hotel-button-outline" type="button" data-hotel-action="reset">Reset to sample stay</button></li>';
    }
    status.textContent = `${next.results.length} sample ${next.results.length === 1 ? "room" : "rooms"} / ${stayLabel(next.query)}.`
      + (cleared ? " Previous comparison selection cleared." : "");
    updateSelection();
  });

  function showPhoto(index, focusThumbnail = false) {
    photoIndex = (index + photos.length) % photos.length;
    const photo = photos[photoIndex];
    const body = gallery.querySelector(".hotel-gallery-body");
    body.querySelector(".hotel-gallery-main").innerHTML =
      `<figure><img src="${photo.image.src}" alt="${escape(photo.image.alt)}"><figcaption><strong>${escape(photo.title)}</strong><span>${escape(photo.note)}</span><em>${escape(photo.image.credit)}</em></figcaption></figure>`;
    body.querySelector(".hotel-gallery-error").textContent = "";
    body.querySelector(".hotel-photo-position").textContent = `Photo ${photoIndex + 1} of ${photos.length}`;
    body.querySelectorAll("[data-photo-index]").forEach((button, index) => {
      if (index === photoIndex) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
    if (focusThumbnail) body.querySelector(`[data-photo-index="${photoIndex}"]`).focus();
  }

  function openGallery(key, opener) {
    galleryOpener = opener;
    gallery.querySelector(".hotel-gallery-body").innerHTML =
      `<div class="hotel-gallery-controls"><button type="button" class="hotel-button hotel-button-outline" data-hotel-action="previous-photo">Previous photo</button><span class="hotel-photo-position" role="status" aria-live="polite"></span><button type="button" class="hotel-button hotel-button-outline" data-hotel-action="next-photo">Next photo</button></div>
      <div class="hotel-gallery-main"></div><p class="hotel-gallery-error" role="alert"></p><div class="hotel-thumbnails" role="group" aria-label="Choose a photo">${photos.map((photo, index) =>
        `<button type="button" data-photo-index="${index}" aria-label="View ${escape(photo.title)}"><img src="${photo.image.src}" alt=""><span>${escape(photo.title)}</span></button>`).join("")}</div>`;
    showPhoto(photos.findIndex(photo => photo.key === key));
    gallery.showModal();
    gallery.querySelector('[data-hotel-action="close-gallery"]').focus();
  }

  listen(root, "click", event => {
    const button = event.target.closest("button");
    if (!button || !root.contains(button)) return;
    if (button.dataset.roomToggle) {
      const id = button.dataset.roomToggle;
      if (selected.has(id)) selected.delete(id);
      else selected.add(id);
      updateSelection();
    } else if (button.dataset.removeRoom) {
      selected.delete(button.dataset.removeRoom);
      updateSelection();
      updateComparison();
      if (!selected.size) comparison.close();
      else comparison.querySelector('[data-hotel-action="close-comparison"]').focus();
    } else if (button.dataset.hotelPhoto) {
      openGallery(button.dataset.hotelPhoto, button);
    } else if (button.dataset.photoIndex !== undefined) {
      showPhoto(Number(button.dataset.photoIndex));
    } else {
      switch (button.dataset.hotelAction) {
        case "plan-stay":
          form.scrollIntoView({ block: "start", behavior: "instant" });
          form.elements.namedItem("arrival").focus({ preventScroll: true });
          break;
        case "compare":
          comparisonOpener = button;
          updateComparison();
          comparison.showModal();
          comparison.querySelector('[data-hotel-action="close-comparison"]').focus();
          break;
        case "close-comparison": comparison.close(); break;
        case "close-gallery": gallery.close(); break;
        case "previous-photo": showPhoto(photoIndex - 1); break;
        case "next-photo": showPhoto(photoIndex + 1); break;
        case "reset":
          for (const [name, value] of Object.entries(defaultStay)) form.elements.namedItem(name).value = value;
          form.requestSubmit();
          form.querySelector('[type="submit"]').focus();
          break;
      }
    }
  });
  listen(gallery, "keydown", event => {
    const index = { ArrowLeft: photoIndex - 1, ArrowRight: photoIndex + 1, Home: 0, End: photos.length - 1 }[event.key];
    if (index === undefined) return;
    event.preventDefault();
    showPhoto(index, event.target.hasAttribute("data-photo-index"));
  });
  for (const dialog of [comparison, gallery]) {
    listen(dialog, "keydown", event => {
      if (event.key !== "Tab") return;
      const buttons = dialog.querySelectorAll("button:not([disabled])");
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }
  listen(gallery, "error", event => {
    if (event.target.tagName === "IMG") {
      gallery.querySelector(".hotel-gallery-error").textContent = "This photo could not be loaded. Choose another thumbnail or try reopening the gallery.";
    }
  }, { capture: true });
  listen(comparison, "close", () => restoreFocus(comparisonOpener));
  listen(gallery, "close", () => {
    gallery.querySelector(".hotel-gallery-body").replaceChildren();
    restoreFocus(galleryOpener);
  });
  return () => {
    controller.abort();
    if (comparison.open) comparison.close();
    if (gallery.open) gallery.close();
  };
}
