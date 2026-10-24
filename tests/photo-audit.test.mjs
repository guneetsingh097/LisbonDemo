import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { candidates, replacementFor } from "../scripts/getty-photo-plan.mjs";
import { photoAudit } from "../scripts/export-photo-audit.mjs";
import { gettyPhotos, gettyPhotoReplacements } from "../sites/getty-photo-catalog.js";
import { replaceGettyPhotos, resolveGettyPhoto } from "../sites/getty-photos.js";
import { sitesA } from "../sites-a.js";
import { sitesB } from "../sites-b.js";
import { siteSections } from "../route-catalog.js";
import { applyImageReplacements } from "../sites/experience-catalog.js";

test("every selected replacement records an individual public RF check, not a licensed-download claim", () => {
  assert.equal(new Set(candidates.map(asset => asset.id)).size, candidates.length);
  for (const asset of candidates) {
    assert.equal(asset.family, "Creative");
    assert.equal(asset.licenseType, "Royalty-free");
    assert.equal(asset.editorialOnlyNoticeObserved, false);
    assert.equal(asset.checkedOn, "2026-10-24");
    assert.equal(new URL(asset.source).hostname, "www.gettyimages.com");
    assert.equal(new URL(asset.source).pathname.split("/").at(-1), asset.id);
    assert.match(asset.downloadStatus, /Completed download evidence/);
    assert.ok(asset.credit && asset.collection && asset.releaseInfo);
  }
  for (const rejected of ["1266155634", "1395507586", "2139173440"]) {
    assert.ok(!candidates.some(asset => asset.id === rejected), `Rejected CGI ${rejected} must not reappear`);
  }
});

test("photo matching preserves specific room, street and guitar choices over shared subjects", () => {
  assert.equal(replacementFor("images-pexels/boutique-hotel-room-1.jpg"), "1321502100");
  assert.equal(replacementFor("images-pexels/boutique-hotel-room-2.jpg"), "1795754166");
  assert.equal(replacementFor("images-pexels/boutique-hotel-room-3.jpg"), "1453121684");
  assert.equal(replacementFor("images-pexels/alfama-street-2.jpg"), "1172009391");
  assert.equal(replacementFor("images-pexels/fado-music-2.jpg"), "2220476619");
  assert.equal(replacementFor("images-pexels/fado-music-1.jpg"), "1124710877");
  assert.equal(replacementFor("images-pexels/new-unreviewed-subject-1.jpg"), undefined);
});

test("the generated audit retains all original slots and proves no non-Getty photographs remain", async () => {
  const result = await photoAudit();
  assert.ok(result.photos > 0);
  assert.ok(result.occurrences >= result.photos);
  assert.equal(result.downloads, candidates.length);
  assert.equal(result.photos, 181);
  assert.equal(result.occurrences, 453);
  assert.equal(result.remaining, 0);
  assert.match(result.audit, /Integrated before DOM insertion/);
  assert.match(result.requests, /Downloaded; original hash\/dimensions verified/);
  assert.doesNotMatch(result.audit + result.requests, /Pending|ERROR/);
  assert.equal(readFileSync(new URL("../PHOTO-REPLACEMENT-AUDIT.csv", import.meta.url), "utf8"), result.audit);
  assert.equal(readFileSync(new URL("../GETTY-DOWNLOAD-QUEUE.csv", import.meta.url), "utf8"), result.requests);
});

test("every slot resolves to a verified local derivative and rejects unreviewed subjects", () => {
  for (const [src, id] of Object.entries(gettyPhotoReplacements)) {
    const image = resolveGettyPhoto({ src, alt: "Old alt", credit: "Old source" });
    assert.equal(image.src, gettyPhotos[id].file);
    assert.equal(image.alt, gettyPhotos[id].title);
    assert.equal(image.credit, gettyPhotos[id].credit);
    assert.equal(image.caption, gettyPhotos[id].title);
    assert.equal(image.referenceNote, undefined);
    assert.deepEqual(resolveGettyPhoto(image), image, "Already-installed Getty files preserve complete IDs and credits");
  }
  assert.throws(() => resolveGettyPhoto({ src: "images-pexels/unreviewed.jpg" }), /Unmapped photo/);
  const input = '<figure class="kept"><a href="#/kept"><img loading="lazy" src="images-pexels/fado-music-1.jpg" alt="Old"></a><figcaption class="kept-caption">Old credit</figcaption></figure>';
  const output = replaceGettyPhotos(input);
  assert.match(output, /figure class="kept"/);
  assert.match(output, /href="#\/kept"/);
  assert.match(output, /loading="lazy"/);
  assert.match(output, /figcaption class="kept-caption"/);
  assert.match(output, /Fado musician playing Portuguese guitar/);
  assert.doesNotMatch(output, /Old|Pexels/);
});

test("all210rendered sections use installed Getty photos with matching per-figure credits", async () => {
  const provenance = JSON.parse(readFileSync(new URL("../images-getty/provenance.json", import.meta.url), "utf8"));
  const assets = new Map(provenance.assets.map(asset => [asset.file, asset]));
  for (const site of [...sitesA, ...sitesB]) {
    const { render } = await import(`../sites/site-${String(site.id).padStart(2, "0")}.js`);
    for (const [section] of siteSections) {
      const markup = applyImageReplacements(render(site, section), site.id);
      for (const [, src] of markup.matchAll(/<img\b[^>]*src="([^"]+)"/g)) {
        assert.ok(assets.has(src), `Unverified photo on ${site.id}/${section}: ${src}`);
      }
      for (const [figure] of markup.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/g)) {
        const caption = /<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/.exec(figure)?.[1];
        assert.ok(caption, `Missing photo caption on ${site.id}/${section}`);
        for (const [, src] of figure.matchAll(/<img\b[^>]*src="([^"]+)"/g)) {
          assert.ok(caption.replaceAll("&amp;", "&").includes(assets.get(src).credit),
            `Wrong photographer on ${site.id}/${section}: ${src}`);
        }
        assert.doesNotMatch(caption, /Pexels|Wikimedia/);
      }
      if (site.id === 4 && section === "offerings") {
        assert.equal([...markup.matchAll(/<figcaption class="credit">[\s\S]*?Getty Images[\s\S]*?<\/figcaption>/g)].length, 6);
      }
    }
  }
});
