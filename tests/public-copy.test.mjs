import assert from "node:assert/strict";
import { test } from "node:test";
import { sitesA } from "../sites-a.js";
import { sitesB } from "../sites-b.js";
import { siteSections } from "../route-catalog.js";
import { applyImageReplacements } from "../sites/experience-catalog.js";

test("all 210 property sections use customer-facing language without prototype notices", async () => {
  let pages = 0;
  for (const site of [...sitesA, ...sitesB]) {
    const { render } = await import(`../sites/site-${String(site.id).padStart(2, "0")}.js`);
    for (const [section] of siteSections) {
      const markup = applyImageReplacements(render(site, section), site.id);
      const text = markup.replace(/<[^>]*>/g, " ");
      assert.doesNotMatch(text, /\b(?:sample|fictional|illustrative|imagined|mock|demonstration|demonstrative)\b|created for purposes|not a photograph of|for the Lisbon Atlas|Lisboa imagines|exists to demonstrate|written to model/i,
        `${site.id}/${section} contains prototype copy`);
      pages++;
    }
  }
  assert.equal(pages, 210);
});
