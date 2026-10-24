import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const html = readFileSync(new URL("index.html", root), "utf8");

test("shared favicon is a self-contained SVG beneath the Pages project path", () => {
  const links = [...html.matchAll(/<link\b[^>]*>/g)]
    .map(([tag]) => tag)
    .filter(tag => /\brel="icon"/.test(tag));
  assert.equal(links.length, 1);
  assert.match(links[0], /\btype="image\/svg\+xml"/);
  const href = /\bhref="([^"]+)"/.exec(links[0])?.[1];
  assert.equal(href, "./favicon.svg");
  for (const route of ["#/", "#/watch", ...Array.from({ length: 30 }, (_, i) => `#/site/${i + 1}`)]) {
    assert.equal(new URL(href, `https://example.test/LisbonDemo/${route}`).href,
      "https://example.test/LisbonDemo/favicon.svg");
  }
  const svg = readFileSync(new URL(href, root), "utf8");
  assert.match(svg, /<svg\b[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg, /viewBox="0 0 64 64"/);
  assert.doesNotMatch(svg, /<(?:script|image|foreignObject)\b|\b(?:href|onload)=|url\(/i);
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
