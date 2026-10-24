import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { sitesA } from "../sites-a.js";
import { sitesB } from "../sites-b.js";
import { siteSections } from "../route-catalog.js";
import { applyImageReplacements } from "../sites/experience-catalog.js";
import { candidates, replacementFor } from "./getty-photo-plan.mjs";

const provenance = JSON.parse(readFileSync(new URL("../images-getty/provenance.json", import.meta.url)));
const installed = new Map(provenance.assets.map(asset => [asset.id, asset]));
const selected = new Map(candidates.map(asset => [asset.id, asset]));
const encodeCsv = rows => "\uFEFF" + rows.map(row => row.map(value =>
  `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n") + "\r\n";

export async function photoAudit() {
  const photos = new Map();
  for (const site of [...sitesA, ...sitesB]) {
    const { render } = await import(`../sites/site-${String(site.id).padStart(2, "0")}.js`);
    for (const [section] of siteSections) {
      const markup = applyImageReplacements(render(site, section), site.id);
      for (const [, file] of markup.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/g)) {
        if (file.startsWith("images-getty/")) continue;
        if (!photos.has(file)) photos.set(file, { routes: new Set(), count: 0 });
        const photo = photos.get(file);
        photo.count++;
        photo.routes.add(`#/site/${site.id}/${section}`);
      }
    }
  }
  const rows = [["Current photo", "Rendered occurrences", "Affected routes", "Proposed Getty ID",
    "Getty detail URL", "Replacement subject", "Credit", "Collection", "Public license check",
    "Editorial-only notice", "Download status", "Website replacement status"]];
  const used = new Set();
  for (const [file, photo] of photos) {
    const id = replacementFor(file);
    if (!id) throw new Error(`No similar Getty candidate selected for ${file}`);
    used.add(id);
    const asset = installed.get(id) || selected.get(id);
    if (!asset) throw new Error(`Missing Getty detail evidence for ${id}`);
    rows.push([file, photo.count, [...photo.routes].join("; "), id, asset.source, asset.title,
      asset.credit, asset.collection, installed.has(id) ? "Previously verified Creative / Royalty-free" : `${asset.checkedOn}: Creative / Royalty-free`,
      "None observed on checked detail page",
      installed.has(id) ? "Licensed derivative already installed" : asset.downloadStatus,
      "Pending; current photo remains until the replacement is integrated"]);
  }
  const requestRows = [["Getty ID", "Detail URL", "Subject", "Credit", "Collection", "Release info",
    "Public detail check", "Affected old photo paths", "Download status"]];
  for (const asset of candidates.filter(asset => used.has(asset.id))) {
    const paths = [...photos.keys()].filter(file => replacementFor(file) === asset.id);
    requestRows.push([asset.id, asset.source, asset.title, asset.credit, asset.collection,
      asset.releaseInfo, `${asset.checkedOn}: Creative; Royalty-free; no editorial-only notice`,
      paths.join("; "), asset.downloadStatus]);
  }
  return { audit: encodeCsv(rows), requests: encodeCsv(requestRows), photos: photos.size,
    occurrences: [...photos.values()].reduce((sum, photo) => sum + photo.count, 0),
    downloads: requestRows.length - 1 };
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const result = await photoAudit();
  const outputs = [["../PHOTO-REPLACEMENT-AUDIT.csv", result.audit], ["../GETTY-DOWNLOAD-QUEUE.csv", result.requests]];
  for (const [file, content] of outputs) {
    const url = new URL(file, import.meta.url);
    if (process.argv.includes("--check")) {
      if (readFileSync(url, "utf8") !== content) throw new Error(`${file} is stale.`);
    } else writeFileSync(url, content);
  }
  console.log(`${result.photos} remaining photo paths; ${result.occurrences} rendered occurrences; ${result.downloads} verified new Getty candidates. Nothing downloaded or replaced by this export.`);
}
