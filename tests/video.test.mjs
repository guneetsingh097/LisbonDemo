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
    assert.ok(path && statSync(path).isFile(), path);
  }
  for (const path of ["", "app.js", "styles.css", "images-pexels/bridge-river-aerial-1.jpg", "IMAGE-ATTRIBUTION.csv"]) {
    assert.equal((await fetch(`${base}/${path}`, { method: "HEAD" })).status, 200, path);
  }
  assert.doesNotMatch(app, /part00|createObjectURL|new Blob/);
  assert.match(app, /src="videos\/lisbon-aerial-4823566-4k-loop\.mp4"/);
});

function playbackHarness(playResult = () => Promise.resolve()) {
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
  video.play = playResult;
  video.pause = () => { video.paused = true; };
  video.load = () => { video.loads = (video.loads || 0) + 1; };
  const errors = [];
  const source = readFileSync("app.js", "utf8");
  const playbackCode = source.slice(source.indexOf("let stopLisbonVideo"), source.indexOf("function renderNavigator"));
  const context = {
    document: { querySelector: selector => nodes.get(selector) },
    AbortController, HTMLMediaElement: { HAVE_FUTURE_DATA: 3 },
    console: { error: (...args) => errors.push(args) },
  };
  runInNewContext(`${playbackCode}\nloadLisbonVideo(); globalThis.stop = () => stopLisbonVideo();`, context);
  const fire = name => video.dispatchEvent(new Event(name));
  return { nodes, video, fire, errors, stop: context.stop };
}

test("buffering uses real TimeRanges, hides on playback, and releases media on navigation", () => {
  const { nodes, video, fire, stop } = playbackHarness();
  const progress = nodes.get(".video-progress");
  assert.equal(progress.attributes.has("aria-valuenow"), false);
  video.duration = 30;
  video.buffered = { length: 2, start: i => [0, 20][i], end: i => [9, 26][i] };
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
  const { nodes, fire } = playbackHarness(() => {
    calls++;
    return calls === 1 ? Promise.reject({ name: "NotAllowedError" }) : Promise.resolve();
  });
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

test("media errors stay visible until Retry reloads playback", async () => {
  const { nodes, video, fire, errors } = playbackHarness();
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
  fire("playing");
  assert.equal(nodes.get("#video-loading").hidden, true);
  await new Promise(resolve => setImmediate(resolve));
});
