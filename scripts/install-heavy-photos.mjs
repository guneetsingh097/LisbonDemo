import { copyFileSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { basename } from "node:path";

const metadata = process.argv[2];
if (!metadata) throw new Error("Supply independently prepared higher-resolution photo metadata.");
const input = JSON.parse(readFileSync(metadata, "utf8").replace(/^\uFEFF/, ""));
const manifest = JSON.parse(readFileSync("images-speed/provenance.json", "utf8"));
const sources = new Map(manifest.photos.map(photo => [photo.sourceId, photo]));
const selected = new Set(input.photos.map(photo => photo.sourceId));
if (selected.size !== input.photos.length) throw new Error("Heavy photos must have distinct sources.");
const earlySources = new Set(Object.entries(manifest.routes)
  .filter(([route]) => /^[1-3]\/(?:home|detail|about|offerings)$/.test(route))
  .flatMap(([, slots]) => Object.values(slots).flat()));
for (const photo of input.photos) {
  const source = sources.get(photo.sourceId);
  if (!source || !earlySources.has(photo.sourceId)
    || !/^images-heavy\/(?:commons|pexels)-\d+-\d+\.jpg$/.test(photo.file)) throw new Error(`Invalid heavy source: ${photo.sourceId}`);
  if (source.source !== photo.source || source.license !== photo.license) throw new Error(`Source/license changed: ${photo.sourceId}`);
  for (const key of ["file", "width", "height", "bytes", "sha256"]) {
    if (photo.baseline?.[key] !== source[key]) throw new Error(`Baseline changed: ${photo.sourceId} ${key}`);
  }
  const bytes = readFileSync(photo.preparedFile);
  if (bytes.length !== photo.bytes || createHash("sha256").update(bytes).digest("hex") !== photo.sha256) throw new Error(`Prepared photo changed: ${photo.sourceId}`);
  const scale = Math.max(photo.width, photo.height) / Math.max(photo.sourceWidth, photo.sourceHeight);
  if (scale > 1 || Math.abs(photo.width - photo.sourceWidth * scale) > 2
    || Math.abs(photo.height - photo.sourceHeight * scale) > 2) throw new Error(`Upscaled or cropped source: ${photo.sourceId}`);
}
const routes = [];
for (let id = 1; id <= 3; id++) {
  for (const section of ["home", "detail", "about", "offerings"]) {
    const route = `${id}/${section}`;
    const photos = Object.values(manifest.routes[route]).flat().map(source => sources.get(source));
    const baseline = photos.reduce((sum, photo) => sum + photo.width * photo.height * 4, 0);
    const after = photos.reduce((sum, photo) => {
      const active = input.photos.find(item => item.sourceId === photo.sourceId) || photo;
      return sum + active.width * active.height * 4;
    }, 0);
    if (!baseline || after < baseline * 2.5) throw new Error(`Insufficient native photo pixels for ${route}`);
    routes.push({ route, baselineDecodedBytes: baseline, decodedPixelBytes: after });
  }
}
const photos = input.photos.map(({ preparedFile, plannedWidth, plannedHeight, requestWidth, ...photo }) => ({
  ...photo, downloadedUrl: photo.downloadUrl,
}));
const output = JSON.stringify({
  scope: "Speed tabs 1–12 only (sites 1–3). Real higher-resolution derivatives of the same distinct licensed sources; no synthetic allocations, duplicated photographs or cache-busting copies.",
  measurement: "Decoded pixel bytes = width × height × 4, not a measured browser-process memory guarantee. Browser decoding, eviction and tab discard remain native.",
  routes, photos,
}, null, 2) + "\n";
const paths = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
const current = [...new Set(paths)].reduce((sum, file) => sum + statSync(file).size, 0);
const added = photos.reduce((sum, photo) => sum + photo.bytes, 0) + Buffer.byteLength(output) * 3;
if (current + added > 850000000) throw new Error(`Higher-resolution assets exceed the 850 MB publication budget: ${current + added}. Reduce JPEG byte size, not native dimensions.`);
mkdirSync("images-heavy", { recursive: true });
for (const photo of input.photos) copyFileSync(photo.preparedFile, `images-heavy/${basename(photo.file)}`);
writeFileSync("images-heavy/provenance.json", output);
console.log(`${photos.length} higher-resolution derivatives installed; every early route has at least 2.5x native decoded pixels.`);
