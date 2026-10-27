import { readFileSync, writeFileSync } from "node:fs";

const source = JSON.parse(readFileSync("images-porto/provenance.json", "utf8").replace(/^\uFEFF/, ""));
const replacements = Object.fromEntries(source.photos.map(photo => [photo.oldFile, photo]));
const output = `// Generated from individually licensed and geolocated sources in images-porto/provenance.json.\nexport const portoPhotoReplacements = ${JSON.stringify(replacements, null, 2)};\n\nexport function activePhoto(photo) {\n  return portoPhotoReplacements[photo.file] || photo;\n}\n`;
if (process.argv.includes("--check")) {
  if (readFileSync("sites/porto-photo-catalog.js", "utf8").replaceAll("\r\n", "\n") !== output) throw new Error("Porto photo catalogue is stale.");
} else {
  writeFileSync("sites/porto-photo-catalog.js", output);
  const manifest = JSON.parse(readFileSync("images-speed/provenance.json", "utf8"));
  const replacementIds = new Map(source.photos.map(photo => [photo.replaces, photo.sourceId]));
  for (const photo of manifest.photos) {
    const updated = replacements[photo.oldFile];
    if (updated) replacementIds.set(photo.sourceId, updated.sourceId);
  }
  manifest.photos = manifest.photos.map(photo => replacements[photo.oldFile || photo.file] || photo);
  for (const route of Object.values(manifest.routes)) {
    for (const [phase, ids] of Object.entries(route)) route[phase] = ids.map(id => replacementIds.get(id) || id);
  }
  const counts = Object.groupBy(manifest.photos, photo => photo.sourceId.split(":")[0]);
  manifest.licenses = [
    { license: "Pexels License", url: "https://www.pexels.com/license/", sources: counts.pexels.length },
    { license: "Getty Creative Royalty-free", url: "https://www.gettyimages.com/eula", sources: counts.getty.length },
    { license: "Individually verified CC BY / CC BY-SA / CC0 / Public domain", sources: counts.commons.length, manifest: "images-porto/provenance.json" },
  ];
  manifest.note = "870 distinct photographic sources across 120 Porto property pages. Lisbon-specific sources were replaced, never relabelled; remaining nonlocal interiors and activity images are reference photographs with original credits.";
  writeFileSync("images-speed/provenance.json", JSON.stringify(manifest, null, 2) + "\n");
  const quote = value => `"${String(value).replaceAll('"', '""')}"`;
  const ledger = readFileSync("IMAGE-ATTRIBUTION.csv", "utf8").replace(/^\uFEFF/, "").trimEnd().split(/\r?\n/)
    .filter(line => !source.photos.some(photo => line.startsWith(quote(photo.oldFile) + ",")
      || photo.replaces.startsWith("getty:") && line.startsWith(quote(`images-pilot/GettyImages-${photo.replaces.slice(6)}-feature.jpg`) + ","))
      && !line.startsWith('"images-porto/'));
  const rows = source.photos.map(photo => [
    photo.file, "image", photo.title, photo.photographer, photo.license, photo.source,
    `${photo.processing} License: ${photo.licenseUrl}; location coordinates and SHA256: images-porto/provenance.json`,
  ].map(quote).join(","));
  writeFileSync("IMAGE-ATTRIBUTION.csv", [...ledger, ...rows].join("\n") + "\n");
  const markdown = readFileSync("IMAGE-ATTRIBUTION.md", "utf8");
  const start = markdown.indexOf("\n## Porto conversion photographs");
  const body = source.photos.map(photo => `- \`${photo.file}\`: ${photo.title}. ${photo.credit}. [Original source](${photo.source}); [${photo.license}](${photo.licenseUrl}). ${photo.processing}`).join("\n");
  writeFileSync("IMAGE-ATTRIBUTION.md", (start >= 0 ? markdown.slice(0, start) : markdown)
    + `\n## Porto conversion photographs\n\nHistorical Getty and Pexels records above preserve the original evidence; they do not imply those replaced files remain in active use. The following uncropped derivatives replace Lisbon-specific photographs. Each caption retains its real subject, creator and license; CC BY-SA derivatives retain that license.\n\n${body}\n`);
}
console.log(`${source.photos.length} individually attributed Porto-area replacements recorded.`);
