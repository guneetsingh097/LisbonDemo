import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const provenance = JSON.parse(readFileSync(new URL("images-getty/provenance.json", root), "utf8"));
const renderers = new Map(await Promise.all([1, 5, 8].map(async id => {
  const source = readFileSync(new URL(`sites/site-${String(id).padStart(2, "0")}.js`, root), "utf8");
  const module = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
  return [id, module.render];
})));
const sections = ["home", "about", "offerings", "resources", "detail", "faq", "contact"];
const site = id => ({
  id,
  companyName: "Pilot property",
  description: "Sample travel-planning property",
  domain: "example.test",
  contact: { name: "Sample contact", email: "contact@example.test", phone: "+351 210 000 001" },
});

function jpegDimensions(bytes) {
  assert.equal(bytes.readUInt16BE(0), 0xffd8, "Expected JPEG signature");
  let offset = 2;
  while (offset < bytes.length) {
    assert.equal(bytes[offset], 0xff);
    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
    }
    offset += length + 2;
  }
  throw new Error("JPEG dimensions not found");
}

test("four Getty web derivatives match provenance, dimensions and size budgets", () => {
  assert.deepEqual(provenance.assets.map(asset => asset.id),
    ["1172009391", "183584154", "945023048", "1494877133"]);
  let totalBytes = 0;
  for (const asset of provenance.assets) {
    const bytes = readFileSync(new URL(asset.file, root));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
    assert.equal(bytes.length, asset.bytes);
    assert.ok(bytes.length < 800_000, `${asset.id} exceeds the per-image budget`);
    assert.deepEqual(jpegDimensions(bytes), { width: 1600, height: 1067 });
    assert.equal(asset.width, 1600);
    assert.equal(asset.height, 1067);
    assert.equal(asset.licenseType, "Royalty-free");
    assert.equal(asset.assetFamily, "Creative");
    assert.equal(asset.releaseInfo, "No release required");
    assert.match(asset.source, new RegExp(`-royalty-free-image/${asset.id}$`));
    totalBytes += bytes.length;
  }
  assert.ok(totalBytes < 2_500_000, "Combined web derivatives exceed 2.5 MB");
  assert.deepEqual(readdirSync(new URL("images-getty/", root)).filter(name => name.endsWith(".jpg")).sort(),
    provenance.assets.map(asset => asset.file.split("/").at(-1)).sort());
});

test("pilot uses local credited Getty images without misidentifying locations", () => {
  const expected = new Map([[1, ["1172009391", "183584154"]], [5, ["945023048"]], [8, ["1494877133"]]]);
  for (const [id, render] of renderers) {
    const home = render(site(id), "home");
    for (const assetId of expected.get(id)) {
      const asset = provenance.assets.find(item => item.id === assetId);
      assert.ok(home.includes(`src="${asset.file}"`), `Site ${id} is missing Getty ${assetId}`);
      assert.ok(home.includes(`Photo by ${asset.credit}`), `Missing contributor credit for ${assetId}`);
    }
    for (const section of sections) {
      const markup = render(site(id), section);
      assert.doesNotMatch(markup, /(?:src|alt)="undefined"|media\.gettyimages\.com/);
      if (id === 1) assert.doesNotMatch(markup, /bridge-river-aerial-1|Tejo light, early and silver/);
      if (id === 8) assert.doesNotMatch(markup, /Lisbon tram at dusk|final uphill connection/);
    }
  }
  assert.match(renderers.get(1)(site(1), "home"), /not a photograph of the sample hotel/);
  assert.match(renderers.get(5)(site(5), "home"), /not a photograph of a listed restaurant/);
  assert.match(renderers.get(8)(site(8), "home"), /Daytime Lisbon tram reference/);
});

test("every installed Getty file has both attribution records and its source", () => {
  const ledgers = ["IMAGE-ATTRIBUTION.csv", "IMAGE-ATTRIBUTION.md"].map(file =>
    readFileSync(new URL(file, root), "utf8"));
  for (const asset of provenance.assets) {
    for (const ledger of ledgers) {
      assert.ok(ledger.includes(asset.file));
      assert.ok(ledger.includes(asset.credit));
      assert.ok(ledger.includes(asset.source));
    }
  }
});
