import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { speedDocuments } from "../scripts/export-speed-pages.mjs";
import { siteIdentities } from "../sites/identities.js";

test("dark canvas and native colour scheme precede every external resource and observer", () => {
  const documents = [["index.html", readFileSync("index.html", "utf8")],
    ...speedDocuments().filter(([file]) => file.endsWith(".html"))];
  for (const [file, html] of documents) {
    assert.match(html, /<meta name="color-scheme" content="dark"/, file);
    const early = html.indexOf("<style>");
    assert.ok(early >= 0 && html.indexOf("</style>", early) < html.search(/<link\b|<script\b/), file);
    assert.match(html.slice(early, html.indexOf("</style>", early)), /html\{color-scheme:dark;background:#0f1417/);
    assert.match(html, /href="sites\/palettes\.css\?v=dark-v1"/);
    if (file !== "index.html" || html.includes("speed/errors.js")) {
      assert.ok(html.indexOf("speed/errors.js") < html.indexOf("<link"), file);
    }
  }
});

test("identities select scoped semantic palettes without descendant paint resets or media filters", () => {
  const palettes = readFileSync("sites/palettes.css", "utf8");
  for (const name of new Set(siteIdentities.map(identity => identity.palette))) {
    assert.ok(palettes.includes(`[data-palette="${name}"]`), name);
  }
  const identity = readFileSync("sites/identities.js", "utf8");
  assert.match(identity, /root\.dataset\.palette = identity\.palette/);
  assert.doesNotMatch(identity, /"--site-(?:paper|panel|ink)":/);
  const css = readFileSync("sites/identities.css", "utf8");
  assert.doesNotMatch(css, /background-(?:color|image):\s*(?:transparent|none)\s*!important/);
  assert.doesNotMatch(css, /color-scheme:\s*light|filter:\s*invert/);
  for (let id = 1; id <= 31; id++) {
    const source = readFileSync(`sites/site-${String(id).padStart(2, "0")}.css`, "utf8");
    assert.match(source, /background(?:-color)?:\s*var\(--site-paper\)/);
    assert.doesNotMatch(source, /(?:^|[;{])\s*filter:\s*(?!\s*none\b)[^;}]+/);
  }
});

test("dynamic states use dark selected surfaces and explicit readable errors", () => {
  const shared = readFileSync("sites/portfolio-experience.css", "utf8");
  assert.match(shared, /button\[aria-pressed="true"\][^{]*\{[^}]*background: var\(--site-selected\)/);
  assert.doesNotMatch(shared, /background:\s*var\(--work-ink\)/);
  assert.match(shared, /\.portfolio-gallery-error\s*\{\s*color: var\(--site-error\)/);
  assert.match(shared, /\.portfolio-refine-button\s*\{[^}]*background:\s*var\(--work-paper\)/);
  assert.match(readFileSync("sites/portfolio-experience.js", "utf8"), /class="portfolio-refine-button"/);
  const hotel = readFileSync("sites/site-01.css", "utf8");
  assert.match(hotel, /\.hotel-field-error\s*\{\s*color: var\(--site-error\)/);
});
