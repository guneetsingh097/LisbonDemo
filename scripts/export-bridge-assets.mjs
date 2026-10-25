import { readFileSync, writeFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../images-bridge/sources.json", import.meta.url), "utf8"));
const photos = manifest.files.filter(file => file.file !== "Illustration.jpg");
const assets = Object.fromEntries(photos.map(({ file, bytes, width, height }) => [
  /^GettyImages-(\d+)\.jpg$/.exec(file)[1], { bytes, width, height },
]));
const output = `// Generated from images-bridge/sources.json by scripts/export-bridge-assets.mjs.\nexport const bridgePhotoAssets = ${JSON.stringify(assets, null, 2)};\n`;
const destination = new URL("../sites/bridge-photo-assets.js", import.meta.url);
if (process.argv.includes("--check")) {
  if (readFileSync(destination, "utf8").replaceAll("\r\n", "\n") !== output) throw new Error("Bridge photo metadata is stale.");
} else writeFileSync(destination, output);
console.log(`${photos.length} bridge originals recorded without resizing or recompression.`);
