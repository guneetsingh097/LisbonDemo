import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { speedPhotoAssets, speedPhotoRoutes } from "../speed/photo-catalog.js";
import { speedPhotosForRoute } from "../speed/photos.js";
import { bridgePhotos } from "../sites/bridge.js";

test("120 speed pages allocate 870 genuinely distinct sources without cache-busting copies", () => {
  assert.equal(Object.keys(speedPhotoRoutes).length, 120);
  assert.equal(Object.keys(speedPhotoAssets).length, 870);
  const sources = [];
  const counts = { content: 0, identity: 0, reference: 0, feature: 0 };
  for (let id = 1; id <= 30; id++) {
    for (const section of ["home", "detail", "about", "offerings"]) {
      const phases = speedPhotosForRoute(id, section);
      for (const [phase, photos] of Object.entries(phases)) {
        counts[phase] += photos.length;
        sources.push(...photos.map(photo => photo.sourceId));
      }
    }
  }
  assert.deepEqual(counts, { content: 452, identity: 120, reference: 58, feature: 240 });
  assert.equal(new Set(sources).size, 870);
  assert.equal(sources.filter(source => source.startsWith("getty:")).length, 75);
  assert.equal(sources.filter(source => source.startsWith("pexels:")).length, 795);
  assert.throws(() => speedPhotosForRoute(31, "home"), /Missing distinct photo plan/);
  assert.throws(() => speedPhotosForRoute(1, "contact"), /Missing distinct photo plan/);
  const reserved = new Set(bridgePhotos.map(photo => `getty:${photo.id}`));
  assert.ok(sources.every(source => !reserved.has(source)));
});

test("photo files match real dimensions, unique hashes, attribution and the storage budget", () => {
  const hashes = new Set();
  const files = new Set();
  let addedBytes = 0;
  const ledger = readFileSync("IMAGE-ATTRIBUTION.csv", "utf8");
  for (const photo of Object.values(speedPhotoAssets)) {
    assert.match(photo.file, /^images-(?:speed|getty)\//);
    assert.doesNotMatch(photo.file, /[?]|\.\./);
    const data = readFileSync(photo.file);
    assert.equal(data.length, photo.bytes);
    assert.equal(createHash("sha256").update(data).digest("hex"), photo.sha256);
    assert.ok(!hashes.has(photo.sha256), `Repeated photograph bytes: ${photo.sourceId}`);
    assert.ok(!files.has(photo.file), `Repeated photograph path: ${photo.file}`);
    hashes.add(photo.sha256);
    files.add(photo.file);
    assert.equal(data.readUInt16BE(0), 0xffd8);
    let offset = 2;
    while (![0xc0, 0xc1, 0xc2].includes(data[offset + 1])) offset += data.readUInt16BE(offset + 2) + 2;
    assert.deepEqual([data.readUInt16BE(offset + 7), data.readUInt16BE(offset + 5)], [photo.width, photo.height]);
    assert.ok(Math.max(photo.width, photo.height) <= 2560);
    assert.ok(ledger.includes(photo.file));
    if (photo.sourceId.startsWith("pexels:")) {
      addedBytes += photo.bytes;
      assert.equal(photo.license, "Pexels License");
      assert.equal(photo.licenseUrl, "https://www.pexels.com/license/");
      assert.equal(new URL(photo.source).hostname, "www.pexels.com");
      assert.equal(new URL(photo.photographerUrl).hostname, "www.pexels.com");
      assert.ok(Math.max(photo.width, photo.height) <= Math.max(photo.sourceWidth, photo.sourceHeight));
    }
  }
  assert.ok(addedBytes < 400000000, `The new photographs exceed their 400 MB allocation: ${addedBytes}`);
  assert.equal(readdirSync("images-speed").filter(file => file.endsWith(".jpg")).length, 795);
  const manifest = JSON.parse(readFileSync("images-speed/provenance.json", "utf8"));
  assert.deepEqual(manifest.licenses.map(license => license.sources), [795, 75]);
  assert.deepEqual(Object.fromEntries(manifest.photos.map(photo => [photo.sourceId, photo])), speedPhotoAssets);
});
