import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";
import { mediaPilots, renderMediaPilot } from "../sites/media-pilot.js";
import { pilotPhotos, pilotVideo } from "../sites/media-pilot-catalog.js";
import { waitForMedia } from "../speed/readiness.js";

const manifest = JSON.parse(readFileSync("images-pilot/provenance.json", "utf8").replace(/^\uFEFF/, ""));
const sources = JSON.parse(readFileSync("images-getty/provenance.json", "utf8"));

test("all 60 budgeted feature photographs retain verified provenance and natural proportions", () => {
  assert.equal(manifest.photos.length, 60);
  assert.equal(pilotPhotos.length, 60);
  assert.equal(new Set(Object.values(mediaPilots).flatMap(feature => feature.photos)).size, 60);
  for (const photo of manifest.photos) {
    const original = sources.assets.find(asset => asset.id === photo.id);
    assert.equal(photo.assetFamily, "Creative");
    assert.equal(photo.licenseType, "Royalty-free");
    assert.equal(photo.editorialOnlyNoticeObserved, false);
    assert.equal(photo.originalSha256, original.original.sha256);
    assert.equal(photo.originalWidth, original.original.width);
    assert.equal(photo.originalHeight, original.original.height);
    assert.equal(Math.max(photo.width, photo.height), 2560);
    assert.ok(photo.width <= original.original.width && photo.height <= original.original.height);
    assert.ok(Math.abs(photo.width / photo.height - original.original.width / original.original.height) < .002);
    assert.ok(photo.bytes < 2000000);
    assert.ok(readFileSync("IMAGE-ATTRIBUTION.csv", "utf8").includes(photo.file));
    const bytes = readFileSync(photo.file);
    assert.equal(bytes.length, photo.bytes);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), photo.sha256);
    let offset = 2;
    assert.equal(bytes.readUInt16BE(0), 0xffd8);
    while (![0xc0, 0xc1, 0xc2].includes(bytes[offset + 1])) offset += bytes.readUInt16BE(offset + 2) + 2;
    assert.equal(bytes.readUInt16BE(offset + 5), photo.height);
    assert.equal(bytes.readUInt16BE(offset + 7), photo.width);
    const catalog = pilotPhotos.find(asset => asset.id === photo.id);
    for (const key of ["file", "width", "height", "credit", "source", "title"]) assert.equal(catalog[key], photo[key]);
  }
});

test("the downloaded RF Creative surf film is actual fast-start H.264 MP4, not a Getty preview", () => {
  const video = manifest.video;
  assert.equal(video.assetFamily, "Creative");
  assert.equal(video.licenseType, "Royalty-free");
  assert.equal(video.editorialOnlyNoticeObserved, false);
  assert.match(video.evidence, /DOWNLOAD AGAIN/);
  assert.equal(video.file, pilotVideo.file);
  assert.equal(video.credit, pilotVideo.credit);
  assert.ok(existsSync(video.poster));
  const bytes = readFileSync(video.file);
  assert.equal(bytes.length, video.bytes);
  assert.ok(bytes.length > 80_000_000 && bytes.length < 100_000_000);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), video.sha256);
  const atoms = new Map();
  for (let offset = 0; offset < bytes.length;) {
    const size = bytes.readUInt32BE(offset);
    assert.ok(size >= 8);
    atoms.set(bytes.toString("ascii", offset + 4, offset + 8), offset);
    offset += size;
  }
  assert.ok(atoms.has("ftyp") && atoms.get("moov") < atoms.get("mdat"));
  assert.ok(bytes.subarray(atoms.get("moov"), atoms.get("mdat")).includes(Buffer.from("avc1")));
  assert.ok(readFileSync("IMAGE-ATTRIBUTION.csv", "utf8").includes(video.file));
  assert.ok(readFileSync("IMAGE-ATTRIBUTION.md", "utf8").includes(video.id));
});

test("all 30 properties' four sequence sections gain distinct eager photo features, with film only on surf home/detail", () => {
  assert.deepEqual(Object.keys(mediaPilots), Array.from({ length: 30 }, (_, index) => String(index + 1)));
  assert.equal(new Set(Object.values(mediaPilots).map(pilot => pilot.style)).size, 30);
  assert.equal(new Set(Object.values(mediaPilots).map(pilot => pilot.title)).size, 30);
  const styles = readFileSync("sites/media-pilot.css", "utf8");
  for (const feature of Object.values(mediaPilots)) assert.ok(styles.includes(`.media-pilot--${feature.style}`));
  for (let id = 1; id <= 31; id++) {
    for (const section of ["home", "about", "detail", "offerings", "faq", "contact", "resources"]) {
      const markup = renderMediaPilot(id, section);
      const selected = id <= 30 && ["home", "about", "detail", "offerings"].includes(section);
      assert.equal(!!markup, selected);
      if (!selected) continue;
      assert.equal([...markup.matchAll(/<img /g)].length, 2);
      assert.equal([...markup.matchAll(/loading="eager"/g)].length, 2);
      assert.doesNotMatch(markup, /display:none|loading="lazy"|media\.gettyimages|undefined|null/);
      assert.match(markup, /Getty Images/);
      assert.equal(markup.includes("<video"), id === 17 && ["home", "detail"].includes(section));
      if (markup.includes("<video")) assert.match(markup, /controls muted playsinline preload="auto" data-ready-media/);
    }
  }
});

test("speed surf detail omits film sources and readiness targets while retaining its photographs", () => {
  const markup = renderMediaPilot(17, "detail", undefined, false);
  assert.equal([...markup.matchAll(/<img /g)].length, 2);
  assert.match(markup, /Before the paddle out/);
  assert.doesNotMatch(markup, /<video|<source|data-ready-media|media-pilot-film|media-pilot-status|\.mp4/);
  assert.match(renderMediaPilot(17, "detail"), /<video/);
  assert.match(renderMediaPilot(17, "home"), /<video/);
  const app = readFileSync("app.js", "utf8");
  assert.match(app, /const includeFilm = !\(document\.body\.hasAttribute\("data-speed-page"\) && id === 17 && activeSection === "detail"\)/);
  assert.match(app, /mountMediaPilot\(root, id, activeSection, photos\?\.feature, includeFilm\)/);
});

class Media extends EventTarget {
  readyState = 1;
  videoWidth = 0;
  videoHeight = 0;
  networkState = 1;
  currentSrc = "https://example.test/surf.mp4";
  error = null;
  source = new EventTarget();
  querySelector() { return this.source; }
  loaded() {
    this.readyState = 2;
    this.videoWidth = 1920;
    this.videoHeight = 1080;
    this.dispatchEvent(new Event("loadeddata"));
  }
}

test("video readiness waits for a real first frame, not metadata or playback permission", async () => {
  const video = new Media();
  let done = false;
  const promise = waitForMedia(video, new AbortController().signal).then(() => { done = true; });
  video.dispatchEvent(new Event("loadedmetadata"));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(done, false);
  video.loaded();
  await promise;
  assert.equal(done, true);
  await waitForMedia(video, new AbortController().signal);
});

test("video readiness exposes native/source failures and rejects aborts instead of advancing", async () => {
  const video = new Media();
  const controller = new AbortController();
  const failed = waitForMedia(video, controller.signal);
  video.error = { code: 4 };
  video.dispatchEvent(new Event("error"));
  await assert.rejects(failed, /Video failed:.*surf\.mp4.*media error 4/);
  await assert.rejects(waitForMedia(video, controller.signal), /media error 4/);
  const sourceFailure = new Media();
  const sourcePending = waitForMedia(sourceFailure, controller.signal);
  sourceFailure.source.dispatchEvent(new Event("error"));
  await assert.rejects(sourcePending, /Video failed:/);
  const aborted = waitForMedia(new Media(), controller.signal);
  controller.abort(new Error("Sequence stopped"));
  await assert.rejects(aborted, /Sequence stopped/);
});
