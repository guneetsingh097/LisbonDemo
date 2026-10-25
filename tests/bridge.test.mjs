import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { bridge, bridgePhotos, renderBridge } from "../sites/bridge.js";
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
  assert.equal(bridge.href, `speed/${pages.at(-1).file}`);
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
  }
  assert.doesNotMatch(JSON.stringify(manifest), /C:\\|Downloads\\/);
});
