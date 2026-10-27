import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { sitesA } from "../sites-a.js";
import { sitesB } from "../sites-b.js";
import { enumeratePages } from "../route-catalog.js";
import { experiences, referenceForSite, applyImageReplacements } from "../sites/experience-catalog.js";

const encodeCsv = rows => "\uFEFF" + rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n") + "\r\n";

export function masterPageCsv() {
  const live = "https://guneetsingh097.github.io/LisbonDemo/";
  const local = "http://localhost:4193/";
  const rows = [["Site ID", "Property", "Company", "Category", "Page", "Document title",
    "Canonical route", "Home alias", "Live URL reference", "Local preview URL", "Status"]];
  for (const page of enumeratePages([...sitesA, ...sitesB])) {
    rows.push([page.siteId, page.siteName, page.companyName, page.category, page.title,
      page.documentTitle, page.hash, page.alias, new URL(page.hash, live).href,
      new URL(page.hash, local).href, "GitHub Pages publishes main/root; local URL is a development preview."]);
  }
  return encodeCsv(rows);
}

export async function experienceCsv() {
  const rows = [["Site ID", "Property", "Local preview URL", "Interactive desk", "Mode", "Existing source section",
    "Getty still IDs used across sections", "Retained unique Pexels image paths", "Other retained image paths", "Scope"]];
  for (const site of [...sitesA, ...sitesB]) {
    const { render } = await import(`../sites/site-${String(site.id).padStart(2, "0")}.js`);
    const markup = enumeratePages([site]).filter(page => page.siteId === site.id)
      .map(page => applyImageReplacements(render(site, page.hash.split("/").at(-1)), site.id)).join("");
    const pexels = new Set([...markup.matchAll(/src="(images-pexels\/[^"]+)"/g)].map(match => match[1]));
    const getty = new Set([...markup.matchAll(/src="images-getty\/GettyImages-([\d-]+)-1600.jpg"/g)].map(match => match[1]));
    const other = new Set([...markup.matchAll(/src="(images\/[^"]+)"/g)].map(match => match[1]));
    if (site.id !== 1) getty.add(referenceForSite(site.id).id);
    const config = experiences[site.id];
    rows.push([site.id, site.siteName, `http://localhost:4193/#/site/${site.id}/home`,
      config?.title || "Sample stay search, room comparison and photo gallery", config?.mode || "stay planner",
      config?.source || "home", [...getty].join("; "), pexels.size, other.size,
      "GitHub Pages publishes main/root; active photographs use local Getty Creative RF and individually attributed Porto-area Commons derivatives; see images-porto/provenance.json."]);
  }
  return encodeCsv(rows);
}

const output = new URL("../MASTER-WEBPAGES.csv", import.meta.url);
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const csv = masterPageCsv();
  const coverage = await experienceCsv();
  const coverageOutput = new URL("../PORTFOLIO-EXPERIENCES.csv", import.meta.url);
  if (process.argv.includes("--check")) {
    if (readFileSync(output, "utf8") !== csv) throw new Error("MASTER-WEBPAGES.csv is stale. Run node scripts\\export-pages.mjs.");
    if (readFileSync(coverageOutput, "utf8") !== coverage) throw new Error("PORTFOLIO-EXPERIENCES.csv is stale. Run node scripts\\export-pages.mjs.");
  } else {
    writeFileSync(output, csv);
    writeFileSync(coverageOutput, coverage);
    console.log(`Exported ${enumeratePages([...sitesA, ...sitesB]).length} canonical pages; 30 home aliases are recorded separately. No deployment performed.`);
  }
}
