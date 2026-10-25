import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";
import { mediaPilots, renderMediaPilot } from "../sites/media-pilot.js";
import { pilotPhotos, pilotVideo } from "../sites/media-pilot-catalog.js";
import { waitForMedia } from "../speed/readiness.js";

const manifest = JSON.parse(readFileSync("images-pilot/provenance.json", "utf8").replace(/^\uFEFF/, ""));
const sources = JSON.parse(readFileSync("images-getty/provenance.json", "utf8"));

test("six full-resolution pilot derivatives retain verified licensed originals' dimensions and provenance", () => {
  assert.equal(manifest.photos.length, 6);
  assert.equal(pilotPhotos.length, 6);
  for (const photo of manifest.photos) {
    const original = sources.assets.find(asset => asset.id === photo.id);
    assert.equal(photo.assetFamily, "Creative");
    assert.equal(photo.licenseType, "Royalty-free");
    assert.equal(photo.editorialOnlyNoticeObserved, false);
    assert.equal(photo.originalSha256, original.original.sha256);
    assert.equal(photo.width, original.original.width);
    assert.equal(photo.height, original.original.height);
    assert.ok(photo.width * photo.height > 14_000_000);
    assert.ok(photo.bytes > original.bytes * 3);
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

test("only three selected sites' four sequence sections gain eager real images, with film on surf home/detail", () => {
  assert.deepEqual(Object.keys(mediaPilots), ["1", "5", "17"]);
  assert.equal(new Set(Object.values(mediaPilots).map(pilot => pilot.style)).size, 3);
  for (let id = 1; id <= 31; id++) {
    for (const section of ["home", "about", "detail", "offerings", "faq", "contact", "resources"]) {
      const markup = renderMediaPilot(id, section);
      const selected = [1, 5, 17].includes(id) && ["home", "about", "detail", "offerings"].includes(section);
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
