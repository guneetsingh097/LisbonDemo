import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { speedPhotoAssets, speedPhotoRoutes } from "../speed/photo-catalog.js";

const heavy = JSON.parse(readFileSync("images-heavy/provenance.json", "utf8"));

test("the first 12 tabs have at least 2.5x real decoded photo pixels without changing source inventory", () => {
  assert.equal(heavy.routes.length, 12);
  const activeHeavy = new Set();
  for (let id = 1; id <= 30; id++) {
    for (const section of ["home", "detail", "about", "offerings"]) {
      const route = `${id}/${section}`;
      const photos = Object.values(speedPhotoRoutes[route]).flat().map(source => speedPhotoAssets[source]);
      const upgraded = photos.filter(photo => photo.file.startsWith("images-heavy/"));
      if (id > 3) {
        assert.equal(upgraded.length, 0, `Unexpected change to ${route}`);
        continue;
      }
      const record = heavy.routes.find(item => item.route === route);
      const bytes = photos.reduce((sum, photo) => sum + photo.width * photo.height * 4, 0);
      assert.equal(bytes, record.decodedPixelBytes);
      assert.ok(bytes >= record.baselineDecodedBytes * 2.5, route);
      for (const photo of upgraded) activeHeavy.add(photo.sourceId);
    }
  }
  assert.equal(activeHeavy.size, heavy.photos.length);
  assert.equal(new Set(heavy.photos.map(photo => photo.sha256)).size, heavy.photos.length);
});

test("higher-resolution derivatives preserve source subjects, licenses and uncropped native dimensions", () => {
  for (const photo of heavy.photos) {
    const baseline = JSON.parse(readFileSync(photo.sourceId.startsWith("commons:")
      ? "images-porto/provenance.json" : "images-speed/provenance.json", "utf8")).photos
      .find(source => source.sourceId === photo.sourceId);
    assert.equal(photo.title, baseline.title);
    assert.equal(photo.source, baseline.source);
    assert.equal(photo.license, baseline.license);
    assert.equal(photo.licenseUrl, baseline.licenseUrl);
    assert.ok(photo.width * photo.height > photo.baseline.width * photo.baseline.height);
    const scale = Math.max(photo.width, photo.height) / Math.max(photo.sourceWidth, photo.sourceHeight);
    assert.ok(scale <= 1);
    assert.ok(Math.abs(photo.width - photo.sourceWidth * scale) <= 2);
    assert.ok(Math.abs(photo.height - photo.sourceHeight * scale) <= 2);
    assert.deepEqual(speedPhotoAssets[photo.sourceId], photo);
  }
  assert.match(heavy.measurement, /not a measured browser-process memory guarantee/);
});
