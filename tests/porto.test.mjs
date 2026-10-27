import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { sitesA } from "../sites-a.js";
import { sitesB } from "../sites-b.js";
import { siteSections, globalPages } from "../route-catalog.js";
import { applyImageReplacements, referenceForSite } from "../sites/experience-catalog.js";
import { portoPhotoReplacements, activePhoto } from "../sites/porto-photo-catalog.js";
import { gettyPhotos } from "../sites/getty-photo-catalog.js";
import { mediaPilots, renderMediaPilot } from "../sites/media-pilot.js";
import { speedPhotoAssets, speedPhotoRoutes } from "../speed/photo-catalog.js";

const oldCity = /\b(?:Lisbon|Lisboa|Alfama|Sintra|Cascais|Tejo|Tagus|Chiado|Bel[eé]m|Viva Viagem|Tram 28|Baixa Pombalina|Praça do Comércio|Terreiro do Paço|Rua Augusta|Castelo de São Jorge|Castle of São Jorge|Quinta da Regaleira|Campo de Ourique|Óbidos)\b/i;
const visible = markup => markup.replace(/<[^>]*>/g, " ").replace(/https?:\/\/\S+/g, "");

test("all 210 regular sections and every property record are Porto content, not a city-name-only relabel", async () => {
  for (const site of [...sitesA, ...sitesB]) {
    assert.doesNotMatch(JSON.stringify(site), oldCity, `Structured content: ${site.id}`);
    assert.doesNotMatch(JSON.stringify(site), /1755|Porto earthquake/i, `City-specific history: ${site.id}`);
    const { render } = await import(`../sites/site-${String(site.id).padStart(2, "0")}.js`);
    for (const [section] of siteSections) {
      const markup = applyImageReplacements(render(site, section), site.id);
      assert.doesNotMatch(visible(markup), oldCity, `${site.id}/${section}`);
      assert.doesNotMatch(visible(renderMediaPilot(site.id, section)), oldCity, `Feature ${site.id}/${section}`);
    }
    assert.doesNotMatch(referenceForSite(site.id).title, oldCity);
  }
  for (const page of globalPages) assert.doesNotMatch(page.documentTitle, oldCity);
  const transit = await import("../sites/site-14.js");
  assert.match(visible(transit.render(sitesA.find(site => site.id === 14), "faq")), /line E.*Trindade/);
  const history = await import("../sites/site-19.js");
  const story = visible(history.render(sitesB.find(site => site.id === 19), "detail"));
  assert.match(story, /Almadas/);
  assert.match(story, /1832–1833/);
  assert.match(story, /1886/);
  assert.doesNotMatch(story, /earthquake|sea surge|Pombalin/i);
});

test("every replaced photograph is a distinct, licensed, geolocated Porto-area source with exact local byte evidence", () => {
  const replacements = Object.values(portoPhotoReplacements);
  assert.equal(replacements.length, 226);
  assert.equal(new Set(replacements.map(photo => photo.sourceId)).size, 226);
  assert.equal(new Set(replacements.map(photo => photo.originalSha1)).size, 226);
  assert.equal(new Set(replacements.map(photo => photo.sha256)).size, 226);
  let bytes = 0;
  for (const photo of replacements) {
    assert.match(photo.license, /^(CC BY(?:-SA)? [234]\.0|CC0(?: 1\.0)?|Public domain)$/);
    assert.match(photo.licenseUrl, /^https?:\/\/(?:creativecommons\.org|[a-z]+\.wikipedia\.org)/);
    assert.equal(new URL(photo.source).hostname, "commons.wikimedia.org");
    assert.ok(photo.coordinates.lat > 41 && photo.coordinates.lat < 41.7);
    assert.ok(photo.coordinates.lon > -8.8 && photo.coordinates.lon < -7.4);
    assert.ok(photo.photographer && photo.originalTitle && photo.processing);
    assert.ok(Math.max(photo.width, photo.height) <= 1600);
    const scale = Math.max(photo.width, photo.height) / Math.max(photo.sourceWidth, photo.sourceHeight);
    assert.ok(Math.abs(photo.width - photo.sourceWidth * scale) <= 1
      && Math.abs(photo.height - photo.sourceHeight * scale) <= 1, `Uncropped aspect ratio: ${photo.id}`);
    const data = readFileSync(photo.file);
    assert.equal(data.length, photo.bytes);
    assert.equal(createHash("sha256").update(data).digest("hex"), photo.sha256);
    bytes += photo.bytes;
  }
  assert.ok(bytes < 140_000_000, `Porto photo replacements exceed the remaining Pages space: ${bytes}`);
});

test("870 active speed sources remain distinct and all regular surfaces resolve replaced Getty sources before rendering", () => {
  assert.equal(Object.keys(speedPhotoAssets).length, 870);
  const sources = Object.values(speedPhotoRoutes).flatMap(route => Object.values(route).flat());
  assert.equal(new Set(sources).size, 870);
  for (const photo of Object.values(speedPhotoAssets)) assert.doesNotMatch(photo.title, oldCity);
  for (const [file, photo] of Object.entries(portoPhotoReplacements)) {
    assert.ok(!Object.values(speedPhotoAssets).some(asset => asset.file === file), `Old source still active: ${file}`);
    if (photo.replaces.startsWith("getty:")) {
      const original = gettyPhotos[photo.replaces.slice(6)];
      assert.equal(activePhoto(original).file, photo.file);
    }
  }
  for (const pilot of Object.values(mediaPilots)) assert.doesNotMatch(pilot.title + " " + pilot.intro, oldCity);
});

test("deployment path, 4K object and 97-tab progression remain unchanged while customer-facing titles become Porto", () => {
  const app = readFileSync("app.js", "utf8");
  assert.ok(app.includes("https://lisbongettyguneet.storage.googleapis.com/GettyImages-2270002248.mp4"));
  assert.ok(app.includes('id="lisbon-4k-video"'));
  assert.match(readFileSync("index.html", "utf8"), /Porto Atlas/);
  assert.match(readFileSync("speed/index.html", "utf8"), /Porto/);
  assert.doesNotMatch(readFileSync("speed/index.html", "utf8"), /Lisbon/);
  assert.match(readFileSync("speed/launcher.js", "utf8"), /porto-speed-\$\{state\.run\}\.json/);
  for (const file of ["README.md", "PUBLIC-URLS.csv"]) {
    assert.ok(readFileSync(file, "utf8").includes("https://guneetsingh097.github.io/LisbonDemo/"));
  }
});
