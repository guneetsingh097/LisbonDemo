import { replaceGettyPhotos } from "./getty-photos.js";

const entry = (title, selector, mode, facetLabel, terms, extra = {}) =>
  ({ title, selector, mode, facetLabel, terms, source: "offerings", ...extra });

export const experiences = {
  2: entry("Find your suite", "ul", "compare", "Setting", ["garden", "river", "reception", "gallery"], { source: "home", listIndex: 1 }),
  3: entry("Choose your crash space", ".offering-block", "compare", "Sleep style", ["dorm", "private", "micro", "experiences"]),
  4: entry("Compare sample apartments", ".listing-item", "compare", "Neighbourhood", ["Príncipe Real", "Alfama", "Ribeira", "Graça", "Belém", "Cascais"]),
  5: entry("Build a dining shortlist", "tbody tr", "compare", "Neighbourhood", [], { source: "home", facetColumn: 2, secondColumn: 3 }),
  6: entry("Arrange a pastry walk", "ul", "plan", "District", ["Baixa", "Chiado", "Belém", "Alfama"], { source: "home", listIndex: 0 }),
  7: entry("Shape your fado evening", ".ce-offering-list article", "plan", "Format", ["early", "supper", "midnight", "guitarra", "writer", "group"]),
  8: entry("Plan a sample week", ".hel-table tbody tr", "calendar", "Day", [], { source: "home", facetColumn: 0, secondColumn: 2 }),
  9: entry("Your food reading queue", ".cdl-index-list article", "read", "Theme", ["market", "cafe", "pastry", "dining", "meal"]),
  10: entry("Choose a family pace", ".ppl-age-card", "plan", "Age group", ["0–3", "4–7", "8–12", "teens"], { source: "home" }),
  11: entry("Make a solo-day notebook", ".uml-stack > section", "read", "Mood", ["solo", "tables", "dark", "quiet"]),
  12: entry("Build a workday checklist", ".nad-grid .nad-card", "checklist", "Workday need", ["workspace", "neighborhood", "community", "boundary", "backup"]),
  13: entry("Compare museum planning sheets", ".catalog-record", "compare", "Planning lens", ["museum", "theme", "family", "access"]),
  14: entry("Choose a transit scenario", ".offer-stop", "plan", "Journey", ["airport", "Belém", "hill", "family"]),
  15: entry("Assemble a walking day", ".route-catalog article", "plan", "Route character", ["miradouro", "Alfama", "Chiado", "family"]),
  16: entry("Compare day-trip routes", "article", "compare", "Destination", ["Sintra", "Cascais", "Arrábida", "private"]),
  17: entry("Compare lesson formats", ".lesson-strip", "compare", "Session", ["beginner", "private", "camp", "ritual"]),
  18: entry("Prepare a photography brief", "article", "plan", "Photographic task", ["light", "street", "lens", "consultation"]),
  19: entry("Build a history reading file", ".finding-row", "read", "Reference type", ["era", "neighborhood", "glossary", "walk", "source"]),
  20: entry("Compare seasonal notes", ".month-tile", "compare", "Month", [], { source: "home", titleFacet: true }),
  21: entry("Make a shopping notebook", ".offer-list article", "plan", "Shopping task", ["district", "category", "packing", "walking"]),
  22: entry("Build an outdoor plan", ".offer-list article", "plan", "Activity", ["hiking", "water", "cycling", "family"]),
  23: entry("Compare wine-day formats", "article", "compare", "Format", ["half-day", "full-day", "private", "pairing"]),
  24: entry("Compare river experiences", ".deck-grid article", "compare", "On the water", ["sunset", "daytime", "private", "narration"]),
  25: entry("Compare arrival options", "tbody tr", "compare", "Transport option", [], { facetColumn: 1, secondColumn: 2 }),
  26: entry("Find an orientation circular", "tbody tr", "read", "Register", [], { facetColumn: 0, titleColumn: 0 }),
  27: entry("Build a course shortlist", "tbody tr", "compare", "Level", [], { source: "home", facetColumn: 3, secondColumn: 2 }),
  28: entry("Prepare policy-reading questions", ".panel-copy", "checklist", "Topic", ["cancellation", "baggage", "medical", "exclusions", "providers"]),
  29: entry("Prepare access questions", ".checklist-block", "checklist", "Preparation", ["entry", "transit", "venue", "companion"]),
  30: entry("Build a business-trip brief", "tbody tr", "plan", "Brief", [], { facetColumn: 1 }),
};

export const gettyReferences = {
  city: { id: "1172009391", title: "Lisbon old town rooftops", credit: "Photo by fhm / Getty Images", note: "Lisbon location reference, not a photograph of the sample business or its premises." },
  tiles: { id: "183584154", title: "Azulejo study, Lisbon", credit: "Photo by fumumpa / Getty Images", note: "Lisbon material and cultural context; not a photograph of the sample venue." },
  food: { id: "945023048", title: "Traditional Portuguese dishes, Lisbon", credit: "Photo by Lingxiao Xie / Getty Images", note: "Cuisine reference, not food served by a listed sample business." },
  tram: { id: "1494877133", title: "Old yellow tram in Lisbon", credit: "Photo by Alexander Spatari / Getty Images", note: "Lisbon transport context, not a current service or accessibility guarantee." },
  surf: { id: "1277370721", title: "Surfers at sunset, Ericeira, Portugal", credit: "Photo by Cavan Images / Getty Images", note: "Ericeira surf context, not the sample school's customers, lesson location or current conditions." },
  coast: { id: "1315418850", title: "Coast of Sintra-Cascais Natural Park", credit: "Photo by Santiago Urquijo / Getty Images", note: "Portuguese coastal context, not a verified itinerary, beach-access assessment or current conditions." },
};

export const imageReplacements = {
  26: [{ from: "images-pexels/bridge-river-aerial-1.jpg", image: gettyReferences.city }],
};

export function applyImageReplacements(markup, id) {
  const escape = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
  for (const { from, image } of imageReplacements[id] || []) {
    if (!markup.includes(`src="${from}"`)) continue;
    let replaced = false;
    markup = markup.replace(/<figure\b([^>]*)>[\s\S]*?<\/figure>/g, (figure, attributes) => {
      if (!figure.includes(`src="${from}"`)) return figure;
      replaced = true;
      return `<figure${attributes}><img src="images-getty/GettyImages-${image.id}-1600.jpg" alt="${escape(image.title)}"><figcaption><strong>${escape(image.title)}</strong><span>${escape(image.note)}</span><em>${escape(image.credit)} / Creative #${image.id}</em></figcaption></figure>`;
    });
    if (!replaced) throw new Error(`Image replacement has no matching figure on site ${id}: ${from}`);
  }
  return replaceGettyPhotos(markup);
}

export function referenceForSite(id) {
  if (id === 17) return gettyReferences.surf;
  if ([16, 20, 22].includes(id)) return gettyReferences.coast;
  if ([5, 9, 23].includes(id)) return gettyReferences.food;
  if ([6, 7, 13, 18, 19, 21, 27].includes(id)) return gettyReferences.tiles;
  if ([3, 8, 10, 11, 12, 14, 25, 26, 28, 29, 30].includes(id)) return gettyReferences.tram;
  return gettyReferences.city;
}

export function filterExperience(items, query) {
  const normalize = value => String(value).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const words = normalize(query.text || "").trim().split(/\s+/).filter(Boolean);
  const filtered = items.filter(item => words.every(word => normalize(item.searchText).includes(word))
    && (!query.facet || item.facets.includes(query.facet))
    && (!query.second || item.second === query.second)
    && (query.maxPrice === "" || (item.price !== null && item.price <= Number(query.maxPrice))));
  if (query.sort === "name") filtered.sort((a, b) => a.title.localeCompare(b.title, "en"));
  if (query.sort === "price") filtered.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity) || a.index - b.index);
  return filtered;
}

export function parseSamplePrice(value) {
  if (/\b(?:from|starting at|about)\s+(?:€\s*)?\d|\d\s*[-–]\s*\d/i.test(value)) return null;
  const match = /(?:€\s*(\d+(?:[.,]\d{1,2})?)|(\d+(?:[.,]\d{1,2})?)\s*(?:EUR|€))/i.exec(value);
  return match ? Number((match[1] || match[2]).replace(",", ".")) : null;
}
