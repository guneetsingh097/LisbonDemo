import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { bridge, bridgePhotos, bridgePhotoUrl, bridgePhotoDimensions, bridgePhotoSize, renderBridge } from "../sites/bridge.js";
import { pages } from "../speed/pages.js";
import { globalPages } from "../route-catalog.js";

test("the regular collection and final speed step share one bridge document", () => {
  const html = renderBridge();
  assert.match(html, /SPAN/);
  assert.match(html, /Dom Luís I/);
  assert.match(html, /images-bridge\/Illustration\.jpg/);
  assert.equal(bridgePhotos.length, 14);
  assert.equal(new Set(bridgePhotos.map(photo => photo.id)).size, 14);
  assert.deepEqual(new Set(bridgePhotos.map(photo => photo.category)), new Set(["river", "structure", "night"]));
  for (const photo of bridgePhotos) {
    assert.ok(html.includes(`images-bridge/GettyImages-${photo.id}.jpg`));
    assert.ok(photo.alt && photo.note && photo.title);
  }
  assert.match(html, /site-shell-31 bridge-page" data-section="home"/);
  assert.match(html, /id="bridge-content" class="compact-content"/);
  assert.equal(pages.filter(page => page.site === 31).length, 1);
  assert.equal(pages.at(-1).site, 31);
  assert.equal(bridge.href.split("?")[0], `speed/${pages.at(-1).file}`);
  assert.equal(new URL(bridge.href, "https://example.test/").searchParams.get("v"), "bridge-posters-v1");
  for (const photo of bridgePhotos) assert.ok(bridgePhotoUrl(photo).endsWith("?v=bridge-posters-v1"));
  assert.ok(bridge.category && bridge.domain && bridge.personality);
  assert.deepEqual(bridge.theme, { primary: "#143f4b", accent: "#f5ca45" });
  assert.ok(globalPages.some(page => page.hash === "#/site/31/home"));
  assert.doesNotMatch(html, /fonts\.(?:googleapis|gstatic)|speed-run|sequence-panel|Start \d+-page/);
  assert.doesNotMatch(readFileSync(new URL("../sites/site-31.css", import.meta.url), "utf8"), /@import|@font-face/);
});

test("all selected bridge assets are unchanged originals recorded in the provenance manifest", () => {
  const base = new URL("../images-bridge/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("sources.json", base), "utf8"));
  assert.equal(manifest.files.length, bridgePhotos.length + 1);
  for (const asset of manifest.files) {
    const bytes = readFileSync(new URL(asset.file, base));
    assert.equal(bytes.subarray(0, 3).toString("hex"), "ffd8ff");
    assert.equal(bytes.length, asset.bytes);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
    if (asset.file !== "Illustration.jpg") {
      const photo = bridgePhotos.find(item => `GettyImages-${item.id}.jpg` === asset.file);
      assert.ok(photo);
      assert.deepEqual([photo.width, photo.height, photo.bytes], [asset.width, asset.height, asset.bytes]);
      assert.ok(asset.width >= 4000 && asset.height >= 4000, `${asset.file} must retain original resolution.`);
      let dimensions;
      for (let offset = 2; offset < bytes.length;) {
        assert.equal(bytes[offset], 0xff);
        const marker = bytes[offset + 1];
        if ([0xc0, 0xc1, 0xc2].includes(marker)) {
          dimensions = [bytes.readUInt16BE(offset + 7), bytes.readUInt16BE(offset + 5)];
          break;
        }
        if (marker === 0xda || marker === 0xd9) break;
        offset += 2 + bytes.readUInt16BE(offset + 2);
      }
      assert.deepEqual(dimensions, [asset.width, asset.height], `${asset.file}: JPEG dimensions must match its caption.`);
    }
  }
  assert.doesNotMatch(JSON.stringify(manifest), /C:\\|Downloads\\/);
});

test("small bridge posters keep full-size sources and accurate size-only captions, largest first", () => {
  const html = renderBridge();
  assert.ok(bridgePhotos.every((photo, index) => index === 0 || bridgePhotos[index - 1].bytes >= photo.bytes));
  assert.equal(bridgePhotos.reduce((sum, photo) => sum + photo.bytes, 0), 481180974);
  for (const photo of bridgePhotos) {
    assert.ok(html.includes(bridgePhotoDimensions(photo)));
    assert.ok(html.includes(bridgePhotoSize(photo)));
    assert.ok(html.includes(`width="${photo.width}" height="${photo.height}"`));
  }
  assert.equal(bridgePhotoSize(bridgePhotos[0]), "44.68 MB");
  assert.equal(bridgePhotoDimensions(bridgePhotos[0]), "8,192 × 5,464 px");
  assert.doesNotMatch(html.replace(/<[^>]*>/g, ""), /GettyImages-\d+|\.jpg/i);
  assert.doesNotMatch(html, /\bsrcset=|\bloading="lazy"|<canvas/);
  assert.match(html, /<img[^>]+decoding="async">\s*<figcaption class="bridge-photo-metrics">/);
});
