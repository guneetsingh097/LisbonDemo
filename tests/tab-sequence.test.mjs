import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const source = readFileSync("tab-sequence.js", "utf8");
const { sequenceUrl, sequenceConfig, openNextTab } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const run = "32c07a72-43f9-44f7-b01b-4136391a0041";
const storageKey = "lisbon-five-tab-sequence-v1";

function browser() {
  const values = new Map([[storageKey, JSON.stringify({ run, opened: [1], stopped: false })]]);
  const opened = [];
  const win = {
    localStorage: { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) },
    location: { href: sequenceUrl("https://example.test/LisbonDemo/", run, 1) },
    open: (url, name) => { opened.push({ url, name }); return { focus() {} }; },
    console,
  };
  return { win, values, opened };
}

test("trial URLs preserve the Pages base path and are limited to sites 1–5", () => {
  for (let step = 1; step <= 5; step++) {
    const url = new URL(sequenceUrl("https://example.test/LisbonDemo/?existing=1#/navigate", run, step));
    assert.equal(url.pathname, "/LisbonDemo/");
    assert.equal(url.hash, `#/site/${step}`);
    assert.equal(url.searchParams.get("existing"), "1");
    assert.deepEqual(sequenceConfig(url.href), { run, step });
  }
  for (const step of [0, 6, 1.5, NaN]) assert.throws(() => sequenceUrl("https://example.test/", run, step));
  assert.throws(() => sequenceConfig("https://example.test/?tab-step=1"));
  assert.throws(() => sequenceConfig("https://example.test/?tab-sequence=bad&tab-step=1"));
  assert.equal(sequenceConfig("https://example.test/LisbonDemo/#/site/1"), null);
});

test("one tab opens each successor exactly once, keeping five tabs and never opening site 6", () => {
  const { win, opened } = browser();
  for (let step = 1; step <= 5; step++) {
    win.location.href = sequenceUrl(win.location.href, run, step);
    assert.equal(openNextTab(win, { run, step }), step === 5 ? "finished" : "opened");
    assert.equal(openNextTab(win, { run, step }), step === 5 ? "finished" : "already-opened");
  }
  assert.equal(opened.length, 4);
  assert.deepEqual(opened.map(item => new URL(item.url).hash), ["#/site/2", "#/site/3", "#/site/4", "#/site/5"]);
  assert.equal(new Set(opened.map(item => item.name)).size, 4);
});

test("blocked popups do not advance saved progress; a user-gesture retry can open the next tab", () => {
  const { win, values } = browser();
  win.open = () => null;
  assert.equal(openNextTab(win, { run, step: 1 }), "blocked");
  assert.deepEqual(JSON.parse(values.get(storageKey)).opened, [1]);
  win.open = () => ({ focus() {} });
  assert.equal(openNextTab(win, { run, step: 1 }), "opened");
  assert.deepEqual(JSON.parse(values.get(storageKey)).opened, [1, 2]);
});

test("stopped, superseded and invalid trials cannot open more tabs", () => {
  const { win, values, opened } = browser();
  assert.throws(() => openNextTab(win, { run, step: 4 }), /not opened/);
  values.set(storageKey, JSON.stringify({ run, opened: [1], stopped: true }));
  assert.equal(openNextTab(win, { run, step: 1 }), "stopped");
  values.set(storageKey, JSON.stringify({ run: "other", opened: [1], stopped: false }));
  assert.throws(() => openNextTab(win, { run, step: 1 }), /no longer active/);
  values.set(storageKey, "{");
  assert.throws(() => openNextTab(win, { run, step: 1 }));
  assert.equal(opened.length, 0);
});

test("a thrown popup error does not falsely record a new tab as opened", () => {
  const { win, values } = browser();
  win.open = () => { throw new Error("Popup denied"); };
  assert.throws(() => openNextTab(win, { run, step: 1 }), /Popup denied/);
  assert.deepEqual(JSON.parse(values.get(storageKey)).opened, [1]);
});

function readiness({ errors = [], entries = [], imageError = false, fontError = false, complete = true } = {}) {
  let releaseDecode;
  const image = {
    src: "https://example.test/LisbonDemo/photo.jpg", complete, naturalWidth: 1600, naturalHeight: 900,
    decode: () => imageError ? Promise.reject(new Error("Decode failed")) : new Promise(resolve => { releaseDecode = resolve; }),
  };
  const fonts = fontError ? [{ status: "error", family: "Test Font", weight: "400" }] : [];
  fonts.ready = Promise.resolve();
  const context = {
    window: { lisbonSequenceErrors: errors }, URL, Image: class {}, AbortController,
    performance: { getEntriesByType: () => entries },
    document: {
      readyState: "complete", querySelector: () => ({}), querySelectorAll: () => [],
      body: { getBoundingClientRect() {} }, fonts, images: [image],
    },
  };
  runInNewContext(`${source.replace(/^export /gm, "")}\nglobalThis.ready = waitUntilReady;`, context);
  return { ready: () => context.ready(1, new AbortController().signal), release: () => releaseDecode(), image };
}

test("readiness really waits for image decoding and rejects failed images, fonts and resources", async () => {
  const harness = readiness();
  let finished = false;
  const pending = harness.ready().then(() => { finished = true; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(finished, false);
  assert.equal(harness.image.loading, "eager");
  harness.release();
  await pending;
  assert.equal(finished, true);
  await assert.rejects(readiness({ imageError: true }).ready(), /Image failed:.*photo\.jpg/);
  await assert.rejects(readiness({ fontError: true }).ready(), /Font failed: Test Font/);
  await assert.rejects(readiness({ errors: ["Resource failed: https://example.test/missing.css"] }).ready(), /missing\.css/);
  await assert.rejects(readiness({ entries: [{ responseStatus: 404, name: "https://example.test/missing.js" }] }).ready(), /HTTP 404/);
  const incomplete = readiness({ complete: false });
  const invalid = incomplete.ready();
  await new Promise(resolve => setImmediate(resolve));
  incomplete.release();
  await assert.rejects(invalid, /no decoded pixels/);
});

test("resource and JavaScript errors are captured before the shared stylesheet loads", () => {
  const html = readFileSync("index.html", "utf8");
  assert.ok(html.indexOf('src="./sequence-errors.js"') < html.indexOf("fonts.googleapis.com"));
  const handlers = {};
  const window = { addEventListener: (name, handler) => { handlers[name] = handler; } };
  runInNewContext(readFileSync("sequence-errors.js", "utf8"), {
    window, location: { search: `?tab-sequence=${run}&tab-step=1` }, URLSearchParams,
  });
  handlers.error({ target: { src: "https://example.test/broken.js" } });
  handlers.error({ message: "Real exception", target: window });
  handlers.unhandledrejection({ reason: new Error("Async failure") });
  assert.deepEqual([...window.lisbonSequenceErrors], [
    "Resource failed: https://example.test/broken.js", "Real exception", "Unhandled error: Async failure",
  ]);
});
