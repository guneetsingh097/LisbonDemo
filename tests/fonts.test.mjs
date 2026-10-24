import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("shared Google Fonts link preserves every family and HTML-escapes separators", () => {
  const links = [...html.matchAll(/<link\b[^>]*>/g)]
    .filter(([tag]) => /rel="stylesheet"/.test(tag) && tag.includes("fonts.googleapis.com"));
  assert.equal(links.length, 1);
  const href = /href="([^"]+)"/.exec(links[0][0])?.[1];
  assert.ok(href);
  assert.doesNotMatch(href, /&(?!amp;)/);
  const url = new URL(href.replaceAll("&amp;", "&"));
  assert.equal(url.origin + url.pathname, "https://fonts.googleapis.com/css2");
  assert.deepEqual(url.searchParams.getAll("family"), [
    "Bebas Neue",
    "Cormorant Garamond:wght@500;600;700",
    "DM Sans:wght@400;500;600;700",
    "Fraunces:opsz,wght@9..144,600;9..144,700",
    "Libre Franklin:wght@400;500;600;700",
    "Playfair Display:wght@600;700",
    "Space Grotesk:wght@400;500;600;700",
  ]);
  assert.equal(url.searchParams.get("display"), "swap");
});

test("shared and per-site Google Fonts tuples supply a value for every axis", () => {
  const sources = [
    ["index.html", html.replaceAll("&amp;", "&")],
    ...readdirSync(new URL("../sites/", import.meta.url))
      .filter(name => name.endsWith(".css"))
      .map(name => [name, readFileSync(new URL(`../sites/${name}`, import.meta.url), "utf8")]),
  ];
  let checked = 0;
  for (const [name, source] of sources) {
    for (const [href] of source.matchAll(/https:\/\/fonts\.googleapis\.com\/css2\?[^"'<> \s)]+/g)) {
      for (const family of new URL(href).searchParams.getAll("family")) {
        if (!family.includes(":")) continue;
        const [axes, tuples] = family.slice(family.indexOf(":") + 1).split("@");
        assert.ok(tuples, `${name}: missing tuples for ${family}`);
        for (const tuple of tuples.split(";")) {
          assert.equal(tuple.split(",").length, axes.split(",").length,
            `${name}: incomplete axis tuple in ${family}`);
        }
      }
      checked++;
    }
  }
  assert.equal(checked, 31, "Check the shared link and all 30 site stylesheets");
});
