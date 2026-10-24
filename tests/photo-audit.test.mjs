import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { candidates, replacementFor } from "../scripts/getty-photo-plan.mjs";
import { photoAudit } from "../scripts/export-photo-audit.mjs";

test("every selected replacement records an individual public RF check, not a licensed-download claim", () => {
  assert.equal(new Set(candidates.map(asset => asset.id)).size, candidates.length);
  for (const asset of candidates) {
    assert.equal(asset.family, "Creative");
    assert.equal(asset.licenseType, "Royalty-free");
    assert.equal(asset.editorialOnlyNoticeObserved, false);
    assert.equal(asset.checkedOn, "2026-10-24");
    assert.equal(new URL(asset.source).hostname, "www.gettyimages.com");
    assert.equal(new URL(asset.source).pathname.split("/").at(-1), asset.id);
    assert.match(asset.downloadStatus, /Pending authenticated/);
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

test("the generated audit covers every remaining rendered photograph without hiding unlicensed replacements", async () => {
  const result = await photoAudit();
  assert.ok(result.photos > 0);
  assert.ok(result.occurrences >= result.photos);
  assert.equal(result.downloads, candidates.length);
  assert.match(result.audit, /Pending; current photo remains/);
  assert.match(result.requests, /Pending authenticated agreement check and download/);
  assert.equal(readFileSync(new URL("../PHOTO-REPLACEMENT-AUDIT.csv", import.meta.url), "utf8"), result.audit);
  assert.equal(readFileSync(new URL("../GETTY-DOWNLOAD-QUEUE.csv", import.meta.url), "utf8"), result.requests);
});
