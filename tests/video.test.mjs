import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { after, before, test } from "node:test";
import { runInNewContext } from "node:vm";
import { once } from "node:events";
import { createHash } from "node:crypto";

const clip = "videos/lisbon-aerial-4823566-4k-loop.mp4";
let server;
let base;

before(async () => {
  const reservation = createServer();
  reservation.listen(0, "127.0.0.1");
  await once(reservation, "listening");
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  base = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ["server.mjs"], {
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await Promise.race([
    once(server.stdout, "data"),
    once(server, "exit").then(([code]) => { throw new Error(`Server exited: ${code}`); }),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Server startup timeout")), 5000).unref()),
  ]);
});

after(async () => {
  if (server?.exitCode === null) {
    const exited = once(server, "exit");
    server.kill();
    await exited;
  }
});

test("4K loop is under 100 MB with metadata before media", () => {
  const buffer = readFileSync(clip);
  assert.ok(buffer.length < 100_000_000);
  assert.equal(buffer.length, 90_460_023);
  assert.equal(createHash("sha256").update(buffer).digest("hex"),
    "fb1ab0196ac12b14097626fe0f4b952fb50386bf3ca4bd62e923622a995e7d42");
  const boxes = [];
  for (let offset = 0; offset < buffer.length;) {
    const size = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    assert.ok(size >= 8 && offset + size <= buffer.length);
    boxes.push(type);
    offset += size;
  }
  assert.ok(boxes.includes("moov") && boxes.includes("mdat"));
  assert.ok(boxes.indexOf("moov") < boxes.indexOf("mdat"));
});

test("video serves proper MIME, HEAD, byte ranges, and invalid-range errors", async () => {
  const size = statSync(clip).size;
  const head = await fetch(`${base}/${clip}`, { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get("content-type"), "video/mp4");
  assert.equal(Number(head.headers.get("content-length")), size);
  assert.equal(head.headers.get("accept-ranges"), "bytes");
  for (const [range, expected, length] of [
    ["bytes=0-1023", `bytes 0-1023/${size}`, 1024],
    ["bytes=-256", `bytes ${size - 256}-${size - 1}/${size}`, 256],
    [`bytes=${size - 512}-`, `bytes ${size - 512}-${size - 1}/${size}`, 512],
  ]) {
    const response = await fetch(`${base}/${clip}`, { headers: { Range: range } });
    assert.equal(response.status, 206);
    assert.equal(response.headers.get("content-range"), expected);
    assert.equal((await response.arrayBuffer()).byteLength, length);
  }
  for (const range of [`bytes=${size}-`, "bytes=99-1", "bytes=-0", "bytes=-", "bytes=0-1,4-5"]) {
    const response = await fetch(`${base}/${clip}`, { headers: { Range: range } });
    assert.equal(response.status, 416);
    assert.equal(response.headers.get("content-range"), `bytes */${size}`);
  }
});

test("all bundled attribution media and script imports have valid paths", async () => {
  const app = readFileSync("app.js", "utf8");
  for (const [, path] of app.matchAll(/from "(\.\/[^"]+)"/g)) {
    assert.ok(statSync(path).isFile(), path);
  }
  for (const line of readFileSync("IMAGE-ATTRIBUTION.csv", "utf8").trim().split(/\r?\n/).slice(1)) {
    const path = /^"([^"]+)"/.exec(line)?.[1];
    assert.ok(path, line);
    if (path.startsWith("https://")) {
      assert.ok([
        "https://storage.googleapis.com/lisbongettyguneet/GettyImages-2267015510.mp4",
        "https://storage.googleapis.com/lisbongettyguneet/GettyImages-2267015510-4k-40mbps.mp4",
        "https://storage.googleapis.com/lisbongettyguneet/GettyImages-2210663321-4k-40mbps.mp4",
      ].includes(path), path);
    } else {
      assert.ok(statSync(path).isFile(), path);
    }
  }
  for (const path of ["", "app.js", "styles.css", "images-pexels/bridge-river-aerial-1.jpg", "IMAGE-ATTRIBUTION.csv"]) {
    assert.equal((await fetch(`${base}/${path}`, { method: "HEAD" })).status, 200, path);
  }
  assert.doesNotMatch(app, /part00|createObjectURL|new Blob/);
  assert.match(app, /src="https:\/\/storage\.googleapis\.com\/lisbongettyguneet\/GettyImages-2210663321-4k-40mbps\.mp4"/);
  assert.match(app, /GettyImages-2210663321-4k-40mbps\.mp4" autoplay muted playsinline/);
});

function playbackHarness(playResult = () => Promise.resolve(), vendor = "") {
  class Node extends EventTarget {
    hidden = false;
    textContent = "";
    style = {};
    attributes = new Map();
    setAttribute(name, value) { this.attributes.set(name, value); }
    removeAttribute(name) { this.attributes.delete(name); }
  }

  const nodes = new Map([
    "#lisbon-4k-video", "#video-loading", "#video-loading-label",
    ".video-progress", "#video-progress-fill", "#video-loading-action",
  ].map(selector => [selector, new Node()]));
  const video = nodes.get("#lisbon-4k-video");
  video.duration = NaN;
  video.buffered = { length: 0 };
  video.readyState = 0;
  video.paused = true;
  video.play = () => { video.paused = false; return playResult(); };
  video.pause = () => { video.paused = true; video.pauses = (video.pauses || 0) + 1; };
  video.load = () => { video.loads = (video.loads || 0) + 1; };
  const errors = [];
  const warnings = [];
  const timers = new Set();
  let now = 0;
  const source = readFileSync("app.js", "utf8");
  const playbackCode = source.slice(source.indexOf("let stopLisbonVideo"), source.indexOf("function renderNavigator"));
  const context = {
    document: { hidden: false, querySelector: selector => nodes.get(selector) },
    navigator: { vendor },
    AbortController, HTMLMediaElement: { HAVE_FUTURE_DATA: 3, HAVE_ENOUGH_DATA: 4 },
    Date: { now: () => now },
    setInterval: callback => { timers.add(callback); return callback; },
    clearInterval: callback => timers.delete(callback),
    console: { error: (...args) => errors.push(args), warn: (...args) => warnings.push(args) },
  };
  runInNewContext(`${playbackCode}\nloadLisbonVideo(); globalThis.stop = () => stopLisbonVideo();`, context);
  const fire = name => video.dispatchEvent(new Event(name));
  const advance = milliseconds => {
    now += milliseconds;
    for (const callback of timers) callback();
  };
  return { nodes, video, fire, errors, warnings, advance, timers, document: context.document, stop: context.stop };
}

test("watch uses the restored custom player with the lighter 4K video", () => {
  const source = readFileSync("app.js", "utf8");
  const redirect = source.slice(source.indexOf("function renderWatch()"), source.indexOf("function renderSavedWatchPlayer()"));
  let rendered = false;
  runInNewContext(`${redirect}\nrenderWatch();`, {
    renderSavedWatchPlayer: () => { rendered = true; },
  });
  assert.equal(rendered, true);
  assert.doesNotMatch(redirect, /location\.replace/);
  assert.match(source, /function renderSavedWatchPlayer\(\)/);
});

for (const vendor of ["Apple Computer, Inc.", "Google Inc.", ""]) {
  test(`native autoplay starts immediately with vendor ${JSON.stringify(vendor)}, without metadata or buffered ranges`, async () => {
    let calls = 0;
    const { nodes, video, fire, stop } = playbackHarness(() => {
      calls++;
      return Promise.resolve();
    }, vendor);
    assert.equal(calls, 1);
    assert.equal(video.autoplay, true);
    assert.equal(video.muted, true);
    assert.equal(video.defaultMuted, true);
    assert.equal(video.playsInline, true);
    assert.equal(video.pauses || 0, 0);
    assert.equal(nodes.get("#video-loading-action").hidden, true);
    assert.match(nodes.get("#video-loading-label").textContent, /Loading 4K video/);
    video.duration = 46.52;
    video.buffered = { length: 1, start: () => 0, end: () => .5 };
    fire("loadedmetadata");
    fire("waiting");
    fire("suspend");
    assert.equal(calls, 1, "Partial preloading must not trigger repeated play requests");
    assert.equal(video.pauses || 0, 0);
    await new Promise(resolve => setImmediate(resolve));
    fire("playing");
    assert.equal(nodes.get("#video-loading").hidden, true);
    video.currentTime = .4;
    fire("waiting");
    assert.equal(video.pauses || 0, 0, "Native rebuffering must not be paused");
    assert.equal(nodes.get("#video-loading").hidden, false);
    stop();
    assert.equal(video.autoplay, false);
    assert.equal(video.pauses, 1);
    assert.equal(video.loads, 1);
  });
}

test("Safari policy rejection keeps Play inside the user gesture and recovers without the buffer gate", async () => {
  let calls = 0;
  const { nodes, video, fire } = playbackHarness(() =>
    ++calls === 1 ? Promise.reject({ name: "NotAllowedError" }) : Promise.resolve(),
  "Apple Computer, Inc.");
  await new Promise(resolve => setImmediate(resolve));
  const action = nodes.get("#video-loading-action");
  assert.equal(action.hidden, false);
  assert.match(nodes.get("#video-loading-label").textContent, /Autoplay is blocked/);
  fire("waiting");
  fire("suspend");
  assert.equal(calls, 1);
  action.dispatchEvent(new Event("click"));
  assert.equal(calls, 2);
  assert.equal(video.pauses || 0, 0);
  fire("playing");
  assert.equal(nodes.get("#video-loading").hidden, true);
  await new Promise(resolve => setImmediate(resolve));
});

test("Safari source failures stay visible and Retry reloads and requests native playback immediately", async () => {
  let calls = 0;
  const { nodes, video, fire, errors } = playbackHarness(() => {
    calls++;
    return Promise.resolve();
  }, "Apple Computer, Inc.");
  await new Promise(resolve => setImmediate(resolve));
  video.error = { code: 4, message: "Source could not be loaded" };
  fire("error");
  fire("progress");
  const action = nodes.get("#video-loading-action");
  assert.equal(action.hidden, false);
  assert.equal(action.textContent, "Retry video");
  assert.match(nodes.get("#video-loading-label").textContent, /could not be loaded on this page/);
  assert.equal(errors.length, 1);
  action.dispatchEvent(new Event("click"));
  assert.equal(video.loads, 1);
  assert.equal(calls, 2);
  assert.equal(video.pauses || 0, 0);
  fire("playing");
  assert.equal(nodes.get("#video-loading").hidden, true);
  await new Promise(resolve => setImmediate(resolve));
});

test("progress events never gate or restart native playback at any buffer threshold", () => {
  let calls = 0;
  const { video, fire } = playbackHarness(() => {
    calls++;
    return Promise.resolve();
  }, "Google Inc.");
  assert.equal(video.autoplay, true);
  assert.equal(calls, 1);
  video.duration = 46.52;
  for (const seconds of [.5, 3, 4, 10]) {
    video.buffered = { length: 1, start: () => 0, end: () => seconds };
    fire("canplay");
    fire("progress");
  }
  assert.equal(calls, 1);
  assert.equal(video.pauses || 0, 0);
});

test("a 64-percent midstream stall reloads the same video once and restores its position", async () => {
  let calls = 0;
  const { nodes, video, fire, advance, warnings } = playbackHarness(() => {
    calls++;
    return Promise.resolve();
  }, "Apple Computer, Inc.");
  video.duration = 46.52;
  video.currentTime = 29.5;
  video.buffered = { length: 1, start: () => 0, end: () => 29.7728 };
  fire("playing");
  fire("waiting");
  fire("progress");
  assert.match(nodes.get("#video-loading-label").textContent, /64% buffered/);
  advance(11000);
  assert.equal(video.loads || 0, 0);
  fire("progress");
  advance(1000);
  assert.equal(video.loads, 1, "Progress events without playback must not hide a stall");
  assert.equal(calls, 2);
  assert.equal(warnings.length, 1);
  video.currentTime = 0;
  fire("loadedmetadata");
  assert.equal(video.currentTime, 29.5);
  fire("playing");
  assert.equal(nodes.get("#video-loading").hidden, true);
  video.currentTime = 30.5;
  advance(5000);
  assert.equal(video.loads, 1);
  await new Promise(resolve => setImmediate(resolve));
});

test("failed automatic stall recovery offers a persistent Retry rather than a reload loop", () => {
  const { nodes, video, fire, advance, warnings } = playbackHarness();
  video.duration = 46.52;
  video.currentTime = 29.5;
  fire("playing");
  fire("waiting");
  advance(12000);
  fire("loadedmetadata");
  advance(12000);
  const action = nodes.get("#video-loading-action");
  assert.equal(video.loads, 1);
  assert.equal(action.hidden, false);
  assert.equal(action.textContent, "Retry video");
  assert.match(nodes.get("#video-loading-label").textContent, /stopped advancing/);
  fire("progress");
  fire("canplay");
  advance(60000);
  assert.match(nodes.get("#video-loading-label").textContent, /stopped advancing/);
  assert.equal(video.loads, 1);
  assert.equal(warnings.length, 2);
  action.dispatchEvent(new Event("click"));
  assert.equal(video.loads, 2);
  fire("playing");
  assert.equal(nodes.get("#video-loading").hidden, true);
});

test("retry preserves the original position even when recovery metadata never arrived", () => {
  const { nodes, video, fire, advance } = playbackHarness();
  video.duration = 46.52;
  video.currentTime = 29.5;
  fire("playing");
  fire("waiting");
  advance(12000);
  video.currentTime = 0;
  advance(12000);
  advance(12000);
  nodes.get("#video-loading-action").dispatchEvent(new Event("click"));
  fire("loadedmetadata");
  assert.equal(video.currentTime, 29.5);
  assert.equal(video.loads, 2);
});

test("stall monitoring respects hidden tabs, manual pauses, autoplay policy, and navigation cleanup", async () => {
  const { video, fire, advance, document, timers, stop } = playbackHarness();
  video.currentTime = 12;
  advance(60000);
  assert.equal(video.loads || 0, 0, "Startup must not be repeatedly reloaded");
  fire("playing");
  video.paused = true;
  advance(60000);
  assert.equal(video.loads || 0, 0, "A manual pause is not a stalled stream");
  video.paused = false;
  fire("waiting");
  document.hidden = true;
  advance(60000);
  assert.equal(video.loads || 0, 0);
  document.hidden = false;
  advance(1000);
  assert.equal(video.loads || 0, 0);
  stop();
  assert.equal(timers.size, 0);
  advance(60000);
  assert.equal(video.loads, 1, "Only normal navigation cleanup called load()");

  const blocked = playbackHarness(() => Promise.reject({ name: "NotAllowedError" }));
  await new Promise(resolve => setImmediate(resolve));
  blocked.advance(60000);
  assert.equal(blocked.video.loads || 0, 0);
});

test("real media errors and autoplay rejection stay actionable during stall recovery", async () => {
  let calls = 0;
  const { nodes, video, fire, advance } = playbackHarness(() =>
    ++calls === 1 ? Promise.resolve() : Promise.reject({ name: "NotAllowedError" }));
  video.currentTime = 29.5;
  fire("playing");
  fire("waiting");
  advance(12000);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(nodes.get("#video-loading-action").textContent, "Play video");
  advance(60000);
  assert.equal(video.loads, 1);
  video.error = { code: 2 };
  fire("error");
  fire("progress");
  advance(60000);
  assert.match(nodes.get("#video-loading-label").textContent, /download was interrupted/);
  assert.equal(nodes.get("#video-loading-action").textContent, "Retry video");
  assert.equal(video.loads, 1);
});

test("buffering uses real TimeRanges, hides on playback, and releases media on navigation", () => {
  const { nodes, video, fire, stop } = playbackHarness();
  const progress = nodes.get(".video-progress");
  assert.equal(progress.attributes.has("aria-valuenow"), false);
  video.duration = 30;
  video.buffered = { length: 2, start: i => [0, 20][i], end: i => [3, 32][i] };
  fire("progress");
  assert.equal(progress.attributes.get("aria-valuenow"), "50");
  assert.match(nodes.get("#video-loading-label").textContent, /50% buffered/);
  fire("playing");
  assert.equal(nodes.get("#video-loading").hidden, true);
  video.readyState = 4;
  fire("stalled");
  assert.equal(nodes.get("#video-loading").hidden, true);
  fire("waiting");
  assert.equal(nodes.get("#video-loading").hidden, false);
  stop();
  assert.equal(video.paused, true);
  assert.equal(video.loads, 1);
});

test("autoplay block shows a working Play action", async () => {
  let calls = 0;
  const { nodes, video, fire } = playbackHarness(() => {
    calls++;
    return calls === 1 ? Promise.reject({ name: "NotAllowedError" }) : Promise.resolve();
  });
  video.duration = 30;
  video.buffered = { length: 1, start: () => 0, end: () => 10 };
  fire("progress");
  await new Promise(resolve => setImmediate(resolve));
  const action = nodes.get("#video-loading-action");
  assert.equal(action.hidden, false);
  assert.equal(action.textContent, "Play video");
  assert.match(nodes.get("#video-loading-label").textContent, /Autoplay is blocked/);
  action.dispatchEvent(new Event("click"));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls, 2);
  fire("playing");
  assert.equal(nodes.get("#video-loading").hidden, true);
});

test("disjoint buffers and the end of the clip never pause or restart native playback", async () => {
  let calls = 0;
  const { nodes, video, fire } = playbackHarness(() => { calls++; return Promise.resolve(); });
  video.duration = 100;
  video.currentTime = 0;
  video.buffered = { length: 2, start: i => [0, 20][i], end: i => [3, 80][i] };
  fire("progress");
  assert.equal(calls, 1, "Playback is requested before any ranges are available");
  video.buffered = { length: 1, start: () => 0, end: () => 4 };
  fire("progress");
  assert.equal(calls, 1);
  await new Promise(resolve => setImmediate(resolve));
  fire("playing");
  video.currentTime = 12;
  video.buffered = { length: 1, start: () => 0, end: () => 13 };
  fire("waiting");
  assert.equal(video.paused, false);
  assert.equal(nodes.get("#video-loading").hidden, false);
  assert.equal(calls, 1);
  video.buffered = { length: 1, start: () => 0, end: () => 16 };
  fire("progress");
  assert.equal(calls, 1);
  await new Promise(resolve => setImmediate(resolve));
  fire("playing");
  video.currentTime = 98;
  video.buffered = { length: 1, start: () => 0, end: () => 99 };
  fire("waiting");
  assert.equal(calls, 1);
  video.buffered = { length: 1, start: () => 0, end: () => 100 };
  fire("progress");
  assert.equal(calls, 1, "End of clip is handled natively without another play request");
});

test("browser preload suspension does not restart an already requested native stream", async () => {
  let calls = 0;
  const { nodes, video, fire } = playbackHarness(() => { calls++; return Promise.resolve(); });
  video.duration = 30;
  video.buffered = { length: 1, start: () => 0, end: () => 2 };
  fire("progress");
  fire("suspend");
  assert.equal(calls, 1);
  fire("playing");
  assert.equal(nodes.get("#video-loading").hidden, true);
  await new Promise(resolve => setImmediate(resolve));
});

test("metadata-only preloading can start and rebuffer without canceling native playback", async () => {
  const pending = Promise.withResolvers();
  let calls = 0;
  const { nodes, video, fire } = playbackHarness(() => { calls++; return pending.promise; });
  assert.equal(nodes.get("#video-loading-action").hidden, true, "No manual Play is needed during native startup");
  video.duration = 30;
  fire("loadedmetadata");
  fire("suspend");
  assert.equal(calls, 1, "Zero buffered seconds must not block the native play request");
  fire("waiting");
  assert.equal(video.paused, false, "Startup waiting must not abort the pending play request");
  video.buffered = { length: 1, start: () => 0, end: () => .5 };
  fire("canplay");
  fire("playing");
  pending.resolve();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(nodes.get("#video-loading").hidden, true);
  video.currentTime = .4;
  fire("waiting");
  assert.equal(video.paused, false, "Native rebuffering must keep the download active");
  assert.equal(nodes.get("#video-loading").hidden, false);
  video.buffered = { length: 1, start: () => 0, end: () => 2 };
  fire("progress");
  assert.equal(nodes.get(".video-progress").attributes.get("aria-valuenow"), "7");
  fire("playing");
  assert.equal(calls, 1);
  assert.equal(nodes.get("#video-loading").hidden, true);
});

test("native playback does not depend on the media engine exposing buffered TimeRanges", async () => {
  let calls = 0;
  const { nodes, video, fire } = playbackHarness(() => { calls++; return Promise.resolve(); });
  video.duration = 46.52;
  video.readyState = 4;
  fire("canplay");
  assert.equal(video.buffered.length, 0);
  assert.equal(calls, 1, "HAVE_ENOUGH_DATA must not deadlock on unavailable TimeRanges");
  fire("playing");
  assert.equal(nodes.get("#video-loading").hidden, true);
  await new Promise(resolve => setImmediate(resolve));
});

test("zero-buffer native autoplay rejection offers a working user-gesture Play action", async () => {
  let calls = 0;
  const { nodes, fire } = playbackHarness(() =>
    ++calls === 1 ? Promise.reject({ name: "NotAllowedError" }) : Promise.resolve());
  fire("suspend");
  await new Promise(resolve => setImmediate(resolve));
  const action = nodes.get("#video-loading-action");
  assert.equal(action.hidden, false);
  assert.match(nodes.get("#video-loading-label").textContent, /Autoplay is blocked/);
  action.dispatchEvent(new Event("click"));
  assert.equal(calls, 2, "play() is called in the click handler, without waiting for metadata");
  fire("playing");
  assert.equal(nodes.get("#video-loading").hidden, true);
  await new Promise(resolve => setImmediate(resolve));
});

test("waiting cannot cancel a pending automatic play request", async () => {
  const pending = Promise.withResolvers();
  const { video, fire } = playbackHarness(() => pending.promise);
  video.duration = 30;
  video.buffered = { length: 1, start: () => 0, end: () => 4 };
  fire("canplay");
  video.buffered = { length: 0 };
  fire("waiting");
  assert.equal(video.paused, false);
  pending.resolve();
  await new Promise(resolve => setImmediate(resolve));
});

test("decode waiting with adequate buffer does not pause playback", async () => {
  const { video, fire } = playbackHarness();
  video.duration = 100;
  video.currentTime = 0;
  video.buffered = { length: 1, start: () => 0, end: () => 20 };
  fire("progress");
  await new Promise(resolve => setImmediate(resolve));
  fire("playing");
  video.paused = false;
  fire("waiting");
  assert.equal(video.paused, false);
});

test("each completed clip rewinds and requests playback without native loop or a buffer gate", async () => {
  let calls = 0;
  const { nodes, video, fire } = playbackHarness(() => { calls++; return Promise.resolve(); });
  for (let loop = 0; loop < 2; loop++) {
    video.currentTime = 46.52;
    video.buffered = { length: 0 };
    fire("ended");
    assert.equal(video.currentTime, 0);
    assert.equal(calls, loop + 2);
    assert.equal(video.pauses || 0, 0);
    assert.equal(video.loads || 0, 0, "Looping must not reload the source");
    fire("playing");
    assert.equal(nodes.get("#video-loading").hidden, true);
    await new Promise(resolve => setImmediate(resolve));
  }
});

test("loop restart respects autoplay rejection and preserves real source errors", async () => {
  let calls = 0;
  const { nodes, video, fire } = playbackHarness(() =>
    ++calls === 1 ? Promise.resolve() : Promise.reject({ name: "NotAllowedError" }));
  fire("playing");
  await new Promise(resolve => setImmediate(resolve));
  fire("ended");
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls, 2);
  assert.match(nodes.get("#video-loading-label").textContent, /Autoplay is blocked/);
  fire("ended");
  assert.equal(calls, 2, "Blocked looping must wait for a real user gesture");
  video.error = { code: 3 };
  fire("error");
  fire("ended");
  assert.equal(calls, 2);
  assert.match(nodes.get("#video-loading-label").textContent, /could not decode/);
});

test("media errors stay visible until Retry reloads playback", async () => {
  let calls = 0;
  const { nodes, video, fire, errors } = playbackHarness(() => { calls++; return Promise.resolve(); });
  video.error = { code: 2 };
  fire("error");
  fire("progress");
  fire("waiting");
  const action = nodes.get("#video-loading-action");
  assert.equal(action.hidden, false);
  assert.equal(action.textContent, "Retry video");
  assert.match(nodes.get("#video-loading-label").textContent, /download was interrupted/);
  assert.equal(nodes.get(".video-progress").hidden, true);
  assert.equal(errors.length, 1);
  action.dispatchEvent(new Event("click"));
  assert.equal(video.loads, 1);
  assert.equal(calls, 2, "Retry starts native playback inside the user gesture even with no buffer");
  fire("playing");
  assert.equal(nodes.get("#video-loading").hidden, true);
  await new Promise(resolve => setImmediate(resolve));
});

test("a canceled previous play attempt cannot overwrite a successful Retry", async () => {
  const pending = Promise.withResolvers();
  let calls = 0;
  const { nodes, video, fire, errors } = playbackHarness(() =>
    ++calls === 1 ? pending.promise : Promise.resolve());
  video.error = { code: 2 };
  fire("error");
  nodes.get("#video-loading-action").dispatchEvent(new Event("click"));
  fire("playing");
  pending.reject({ name: "AbortError" });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls, 2);
  assert.equal(errors.length, 1, "Only the real media error is reported, not the superseded attempt");
  assert.equal(nodes.get("#video-loading").hidden, true);
});

test("leaving the route stops autoplay, releases the source, and ignores pending play rejection", async () => {
  const pending = Promise.withResolvers();
  const { nodes, video, fire, errors, stop } = playbackHarness(() => pending.promise);
  video.setAttribute("src", "video.mp4");
  stop();
  pending.reject({ name: "AbortError" });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(video.autoplay, false);
  assert.equal(video.paused, true);
  assert.equal(video.attributes.has("src"), false);
  assert.equal(video.loads, 1);
  assert.equal(errors.length, 0);
  fire("error");
  fire("ended");
  assert.equal(video.currentTime, undefined, "An ended event after navigation must not rewind or restart media");
  assert.equal(nodes.get("#video-loading-action").hidden, true);
});
