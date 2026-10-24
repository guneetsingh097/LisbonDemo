import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { after, before, test } from "node:test";
import { runInNewContext } from "node:vm";
import { once } from "node:events";
import { createHash } from "node:crypto";

const clip = "videos/lisbon-aerial-4823566-4k-loop.mp4";
const source = readFileSync("app.js", "utf8");
const watchCode = source.slice(source.indexOf("let stopLisbonVideo"), source.indexOf("function renderNavigator"));
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
  for (const [, path] of source.matchAll(/from "(\.\/[^"]+)"/g)) {
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
  assert.doesNotMatch(source, /part00|createObjectURL|new Blob/);
});

test("watch renders native controls and retains the exact Google Storage video URL", () => {
  const app = {};
  const badge = { setAttribute() {} };
  const video = new EventTarget();
  const document = {
    createElement: () => badge,
    querySelector: selector => selector === "#lisbon-4k-video" ? video : { append() {} },
  };
  runInNewContext(`${watchCode}\nrenderWatch();`, {
    app, document, AbortController, globalPages: [{ hash: "#/watch", title: "Video", documentTitle: "Lisbon by Tram — Lisbon Atlas" }],
    escapeHtml: value => value,
  });
  const videoTag = /<video\b[^>]*>/.exec(app.innerHTML)?.[0];
  assert.ok(videoTag);
  assert.match(videoTag, /src="https:\/\/storage\.googleapis\.com\/lisbongettyguneet\/GettyImages-2210663321-4k-40mbps\.mp4"/);
  for (const attribute of ["controls", "autoplay", "muted", "playsinline"]) {
    assert.match(videoTag, new RegExp(`\\s${attribute}(?:\\s|>)`), attribute);
  }
  assert.match(videoTag, /preload="auto"/);
  assert.match(videoTag, /aria-label="Lisbon by Tram/);
  assert.equal(document.title, "Lisbon by Tram — Lisbon Atlas");
  assert.equal(badge.textContent, "4K");
  assert.doesNotMatch(app.innerHTML, /video-loading|video-progress/);
});

test("native media owns startup and buffering without timers, buffer gates or reload recovery", () => {
  assert.doesNotMatch(watchCode, /setInterval|setTimeout|\.buffered|navigator|location\.replace/);
  assert.equal((watchCode.match(/\.play\(/g) || []).length, 1, "Only clip completion may request replay");
  assert.equal((watchCode.match(/addEventListener\(/g) || []).length, 1);
  assert.match(watchCode, /addEventListener\("ended"/);
  assert.equal((watchCode.match(/video\.load\(/g) || []).length, 1, "load() is only used to release the source on navigation");
  assert.doesNotMatch(readFileSync("styles.css", "utf8"), /video-loading|video-progress/);
});

test("navigation stops and releases the native video once, including on repeat cleanup", () => {
  const calls = [];
  const video = Object.assign(new EventTarget(), {
    autoplay: true,
    pause: () => calls.push("pause"),
    removeAttribute: name => calls.push(`remove:${name}`),
    load: () => calls.push("load"),
  });
  const context = { document: { querySelector: () => video }, AbortController };
  runInNewContext(`${watchCode}\nloadLisbonVideo(); globalThis.stop = () => stopLisbonVideo();`, context);
  assert.deepEqual(calls, [], "Mounting must not intervene in native playback");
  context.stop();
  context.stop();
  assert.equal(video.autoplay, false);
  assert.deepEqual(calls, ["pause", "remove:src", "load"]);
  video.dispatchEvent(new Event("ended"));
  assert.deepEqual(calls, ["pause", "remove:src", "load"], "Detached video must not restart");
});

test("clip completion replays without source reload and reports replay rejection", async () => {
  const errors = [];
  const video = Object.assign(new EventTarget(), {
    currentTime: 46.52,
    play: () => Promise.reject(new Error("Replay blocked")),
  });
  runInNewContext(`${watchCode}\nloadLisbonVideo();`, {
    document: { querySelector: () => video }, AbortController,
    console: { error: (...args) => errors.push(args) },
  });
  assert.equal(video.currentTime, 46.52);
  video.dispatchEvent(new Event("ended"));
  assert.equal(video.currentTime, 0);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(errors.length, 1);
  assert.match(errors[0][0], /replay failed/);
});
