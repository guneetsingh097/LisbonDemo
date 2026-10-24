import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const html = readFileSync(new URL("index.html", root), "utf8");

test("shared favicon is the supplied 16px PNG beneath the Pages project path", () => {
  const links = [...html.matchAll(/<link\b[^>]*>/g)]
    .map(([tag]) => tag)
    .filter(tag => /\brel="icon"/.test(tag));
  assert.equal(links.length, 1);
  assert.match(links[0], /\btype="image\/png"/);
  assert.match(links[0], /\bsizes="16x16"/);
  const href = /\bhref="([^"]+)"/.exec(links[0])?.[1];
  assert.equal(href, "./favicon.png");
  for (const route of ["#/", "#/watch", ...Array.from({ length: 30 }, (_, i) => `#/site/${i + 1}`)]) {
    assert.equal(new URL(href, `https://example.test/LisbonDemo/${route}`).href,
      "https://example.test/LisbonDemo/favicon.png");
  }
  const png = readFileSync(new URL(href, root));
  assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(png.toString("ascii", 12, 16), "IHDR");
  assert.equal(png.readUInt32BE(16), 16);
  assert.equal(png.readUInt32BE(20), 16);
  assert.doesNotMatch(html, /href="\/favicon\.ico"/);
});

test("literal local resource references and module imports exist", () => {
  const files = ["index.html", "app.js", "sites-a.js", "sites-b.js", "styles.css",
    ...readdirSync(new URL("sites/", root)).map(name => `sites/${name}`)];
  let checked = 0;
  for (const file of files) {
    const source = readFileSync(new URL(file, root), "utf8");
    const references = [
      ...source.matchAll(/\b(?:src|poster|href)\s*=\s*["']([^"'<>]+)["']/g),
      ...source.matchAll(/\bfrom\s+["']([^"']+)["']/g),
      ...source.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g),
    ];
    for (const [, reference] of references) {
      if (/^(?:#|[a-z][\w+.-]*:|\/\/)/i.test(reference)
        || /[${}]/.test(reference)) continue;
      const base = reference.startsWith(".") || file.endsWith(".css") ? new URL(file, root) : root;
      const url = new URL(reference.replaceAll("&amp;", "&"), base);
      url.search = "";
      url.hash = "";
      assert.ok(statSync(url).isFile(), `${file}: ${reference}`);
      checked++;
    }
  }
  assert.ok(checked > 40, `Only ${checked} resource references checked`);
});
