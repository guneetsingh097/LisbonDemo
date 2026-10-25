import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { siteIdentities } from "../sites/identities.js";
import { gettyPhotos } from "../sites/getty-photo-catalog.js";

test("all sites have distinct visual worlds, and each compact travel masthead uses a different existing photograph", () => {
  assert.deepEqual(siteIdentities.map(item => item.id), Array.from({ length: 31 }, (_, index) => index + 1));
  assert.equal(new Set(siteIdentities.map(item => item.world)).size, 31);
  const travel = siteIdentities.filter(item => item.id <= 30);
  assert.equal(new Set(travel.map(item => item.photo)).size, 30);
  const css = readFileSync(new URL("../sites/identities.css", import.meta.url), "utf8");
  for (const identity of travel) {
    assert.ok(css.includes(`[data-identity="${identity.world}"]`), `Missing composition: ${identity.world}`);
    assert.ok(existsSync(new URL(`../${gettyPhotos[identity.photo].file}`, import.meta.url)));
  }
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /<link rel="stylesheet" href="sites\/identities\.css\?v=compact-light-v1"/);
  assert.ok(html.indexOf("sites/identities.css") < html.indexOf("</head>"));
  assert.doesNotMatch(readFileSync(new URL("../speed/system-fonts.css", import.meta.url), "utf8"), /@import|@font-face|https:/);
});
