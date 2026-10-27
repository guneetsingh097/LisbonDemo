import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { sitesA } from "../sites-a.js";
import { sitesB } from "../sites-b.js";
import { enumeratePages, siteSections, globalPages } from "../route-catalog.js";
import { experiences, referenceForSite, filterExperience, parseSamplePrice, applyImageReplacements } from "../sites/experience-catalog.js";
import { masterPageCsv, experienceCsv } from "../scripts/export-pages.mjs";
import { gettyPhotos } from "../sites/getty-photo-catalog.js";
import { activePhoto } from "../sites/porto-photo-catalog.js";

test("master inventory derives 216 unique canonical routes and 30 landing aliases", () => {
  const sites = [...sitesA, ...sitesB];
  const pages = enumeratePages(sites);
  assert.equal(sites.length, 30);
  assert.equal(siteSections.length, 7);
  assert.equal(globalPages.length, 6);
  assert.equal(pages.length, 216);
  assert.equal(new Set(pages.map(page => page.hash)).size, 216);
  assert.equal(pages.filter(page => page.alias).length, 30);
  for (const site of sites) assert.equal(pages.filter(page => page.siteId === site.id).length, 7);
  assert.equal(readFileSync(new URL("../MASTER-WEBPAGES.csv", import.meta.url), "utf8"), masterPageCsv());
  assert.match(masterPageCsv(), /GitHub Pages publishes main\/root/);
  assert.doesNotMatch(masterPageCsv(), /Not deployed/);
  assert.match(masterPageCsv(), /Porto by Drone/);
});

test("every non-hotel property has an explicit purpose-specific source adapter and licensed reference", () => {
  const provenance = JSON.parse(readFileSync(new URL("../images-getty/provenance.json", import.meta.url)));
  assert.equal(Object.keys(experiences).length, 29);
  for (let id = 2; id <= 30; id++) {
    assert.ok(experiences[id].selector);
    assert.ok(["compare", "plan", "calendar", "read", "checklist"].includes(experiences[id].mode));
    const reference = referenceForSite(id);
    assert.ok(reference.sourceId?.startsWith("commons:")
      || provenance.assets.some(asset => asset.id === reference.id));
  }
});

test("all 30 experience and retained-image records match the actual renderers", async () => {
  const csv = await experienceCsv();
  assert.equal(readFileSync(new URL("../PORTFOLIO-EXPERIENCES.csv", import.meta.url), "utf8"), csv);
  assert.equal(csv.trim().split("\r\n").length, 31);
});

test("planning filters combine accent-insensitive words, facets, secondary facets and real numeric sample prices", () => {
  const items = [
    { index: 0, title: "Z", searchText: "Príncipe Real sunny studio", facets: ["Centre"], second: "Small", price: 85 },
    { index: 1, title: "A", searchText: "Alfama sunny loft", facets: ["Hill"], second: "Small", price: 95 },
    { index: 2, title: "B", searchText: "River apartment", facets: ["Centre"], second: "Large", price: null },
  ];
  const base = { text: "", facet: "", second: "", maxPrice: "", sort: "source" };
  assert.equal(filterExperience(items, base).length, 3);
  assert.equal(filterExperience(items, { ...base, text: "principe sunny" })[0].title, "Z");
  assert.equal(filterExperience(items, { ...base, facet: "Centre", second: "Small", maxPrice: "90" }).length, 1);
  assert.equal(filterExperience(items, { ...base, maxPrice: "0" }).length, 0);
  assert.deepEqual(filterExperience(items, { ...base, sort: "name" }).map(item => item.title), ["A", "B", "Z"]);
  assert.deepEqual(filterExperience(items, { ...base, sort: "price" }).map(item => item.title), ["Z", "A", "B"]);
  assert.equal(filterExperience(items, { ...base, text: "not-present" }).length, 0);
  assert.equal(items[0].title, "Z", "Sorting must not mutate source order");
});

test("sample price parsing preserves decimals and does not invent fixed prices from estimates", () => {
  assert.equal(parseSamplePrice("€2.90 / ride"), 2.9);
  assert.equal(parseSamplePrice("45,50 EUR"), 45.5);
  assert.equal(parseSamplePrice("from 65 EUR"), null);
  assert.equal(parseSamplePrice("€45–75"), null);
  assert.equal(parseSamplePrice("€€"), null);
  assert.equal(parseSamplePrice("Bundle rate"), null);
});

test("the civic portal's incorrect estuary photo is replaced before it can load", async () => {
  const { render } = await import("../sites/site-26.js");
  const site = [...sitesA, ...sitesB].find(site => site.id === 26);
  const markup = applyImageReplacements(render(site, "home"), 26);
  assert.doesNotMatch(markup, /bridge-river-aerial-1|Estuary overview record/);
  const photo = activePhoto(gettyPhotos["1172009391"]);
  assert.ok(markup.includes(photo.file));
  assert.ok(markup.includes(photo.credit.replaceAll("&", "&amp;")));
});
