import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { pages, allPages, pageForStep, pageFromUrl } from "../speed/pages.js";
import { sequenceUrl, sequenceConfig, openNextTab, recordReady, readRun, storageKey } from "../speed/sequence.js";
import { speedDocuments } from "../scripts/export-speed-pages.mjs";
import { readRunLog } from "../speed/run-log.js";
import { waitForPhotoThreshold } from "../speed/readiness.js";

const run = "32c07a72-43f9-44f7-b01b-4136391a0041";
const base = "https://example.test/LisbonDemo/speed/index.html";

function browser() {
  const values = new Map([[storageKey, JSON.stringify({ run, opened: [1], ready: [], stopped: false })]]);
  const opened = [];
  const win = {
    localStorage: { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) },
    location: { href: sequenceUrl(base, run, 1) },
    open: (url, name) => { opened.push({ url, name }); return { focus() {} }; },
    console,
  };
  return { win, values, opened };
}

test("97 run pages cover the first 24 complete sites and end at the bridge, preserving all 121 documents", () => {
  assert.equal(pages.length, 97);
  assert.equal(new Set(pages.map(page => page.file)).size, 97);
  assert.equal(allPages.length, 121);
  assert.equal(new Set(allPages.map(page => page.file)).size, 121);
  for (let site = 1; site <= 24; site++) {
    assert.deepEqual(pages.filter(page => page.site === site).map(page => page.section),
      ["home", "detail", "about", "offerings"]);
  }
  assert.deepEqual(pageForStep(1), { step: 1, site: 1, section: "home", file: "site-01-home.html" });
  assert.deepEqual(pageForStep(96), { step: 96, site: 24, section: "offerings", file: "site-24-offerings.html" });
  assert.deepEqual(pageForStep(97), { step: 97, site: 31, section: "home", file: "site-31-home.html" });
  assert.equal(pages.some(page => page.site >= 25 && page.site <= 30), false);
  for (const step of [0, 98, 121, 1.5, NaN]) assert.throws(() => pageForStep(step));
  assert.throws(() => pageFromUrl("https://example.test/LisbonDemo/#/site/1"));
});

test("speed URLs use real project-local HTML paths and never hash aliases", () => {
  for (const page of pages) {
    const url = new URL(sequenceUrl(base, run, page.step));
    assert.equal(url.pathname, `/LisbonDemo/speed/${page.file}`);
    assert.equal(url.hash, "");
    assert.deepEqual(sequenceConfig(url.href), { run, step: page.step });
    assert.equal(pageFromUrl(url.href).file, page.file);
  }
  assert.throws(() => sequenceUrl(base, "bad", 1));
  assert.throws(() => sequenceConfig(`${base}?speed-run=${run}`));
  assert.equal(sequenceConfig(base), null);
  for (let site = 25; site <= 30; site++) {
    const url = `https://example.test/LisbonDemo/speed/site-${site}-home.html`;
    assert.equal(pageFromUrl(url).site, site);
    assert.equal(sequenceConfig(url), null);
    assert.throws(() => sequenceConfig(`${url}?speed-run=${run}`), /not part of the 97-tab run/);
  }
});

function launcher(search, blocked = false) {
  const { win, values, opened } = browser();
  values.clear();
  win.location.href = `${base}${search}`;
  win.localStorage.removeItem = key => values.delete(key);
  win.addEventListener = () => {};
  if (blocked) win.open = () => null;
  const errors = [];
  const elements = Object.fromEntries(["#launch-status", "#start", "#stop", "#download-log"].map(id => [id, {
    addEventListener(event, handler) { this[event] = handler; },
  }]));
  runInNewContext(readFileSync("speed/launcher.js", "utf8").replace(/^import .+;\r?$/gm, ""), {
    pages, sequenceUrl, storageKey, readRun, readRunLog, window: win, location: win.location,
    localStorage: win.localStorage, crypto: { randomUUID: () => run }, URL,
    console: { error: (...args) => errors.push(args), warn() {} },
    document: { baseURI: "https://example.test/LisbonDemo/", querySelector: selector => elements[selector] },
  });
  return { values, opened, elements, errors };
}

test("only the explicit auto-start URL launches immediately and the normal Start button still works", () => {
  for (const search of ["", "?autostart=0", "?autostart=true", "?autostart=1"]) {
    const harness = launcher(search);
    assert.equal(harness.opened.length, search === "?autostart=1" ? 1 : 0);
    if (!harness.opened.length) harness.elements["#start"].click();
    assert.equal(harness.opened.length, 1);
    assert.equal(pageFromUrl(harness.opened[0].url).step, 1);
    assert.deepEqual(JSON.parse(harness.values.get(storageKey)),
      { run, opened: [1], ready: [], stopped: false, complete: false });
    harness.elements["#stop"].click();
    assert.equal(JSON.parse(harness.values.get(storageKey)).stopped, true);
    assert.equal(harness.opened.length, 1);
    assert.equal(harness.errors.length, 0);
  }
});

test("a blocked automatic launch reports the failure and does not leave a fake active run", () => {
  const harness = launcher("?autostart=1", true);
  assert.equal(harness.values.has(storageKey), false);
  assert.match(harness.elements["#launch-status"].textContent, /first tab was blocked/);
  assert.equal(harness.errors.length, 1);
});

test("all 97 pages must pass readiness in order before each unique successor opens", () => {
  const { win, values, opened } = browser();
  assert.throws(() => openNextTab(win, { run, step: 1 }), /loading checks/);
  assert.throws(() => recordReady(win, { run, step: 2 }), /not opened/);
  for (const page of pages) {
    win.location.href = sequenceUrl(base, run, page.step);
    assert.equal(recordReady(win, { run, step: page.step }), true);
    assert.equal(openNextTab(win, { run, step: page.step }), page.step === pages.length ? "finished" : "opened");
    assert.equal(openNextTab(win, { run, step: page.step }), page.step === pages.length ? "finished" : "already-opened");
  }
  assert.equal(opened.length, 96);
  assert.deepEqual(opened.map(item => sequenceConfig(item.url).step), pages.slice(1).map(page => page.step));
  assert.equal(new Set(opened.map(item => item.name)).size, 96);
  assert.equal(JSON.parse(values.get(storageKey)).complete, true);
  assert.equal(JSON.parse(values.get(storageKey)).ready.length, 97);
  assert.equal(pageFromUrl(opened.at(-1).url).site, 31);
  assert.doesNotMatch(readFileSync("speed/sequence.js", "utf8"), /\.close\s*\(/);
});

test("blocked or thrown popups roll back progress rather than pretending a tab opened", () => {
  const { win, values } = browser();
  recordReady(win, { run, step: 1 });
  win.open = () => null;
  assert.throws(() => openNextTab(win, { run, step: 1 }), /blocked page 2/);
  assert.deepEqual(JSON.parse(values.get(storageKey)).opened, [1]);
  win.open = () => { throw new Error("Popup denied"); };
  assert.throws(() => openNextTab(win, { run, step: 1 }), /Popup denied/);
  assert.deepEqual(JSON.parse(values.get(storageKey)).opened, [1]);
});

test("stopped, superseded and corrupted runs cannot open more tabs", () => {
  const { win, values, opened } = browser();
  values.set(storageKey, JSON.stringify({ run, opened: [1], ready: [], stopped: true }));
  assert.equal(recordReady(win, { run, step: 1 }), false);
  assert.equal(openNextTab(win, { run, step: 1 }), "stopped");
  values.set(storageKey, JSON.stringify({ run: "other", opened: [1], ready: [], stopped: false }));
  assert.throws(() => recordReady(win, { run, step: 1 }), /no longer active/);
  for (const state of ["{", JSON.stringify({ run, opened: [1, 3], ready: [], stopped: false }),
    JSON.stringify({ run, opened: [1], ready: [1, 2], stopped: false })]) {
    values.set(storageKey, state);
    assert.throws(() => openNextTab(win, { run, step: 1 }));
  }
  assert.equal(opened.length, 0);
});

test("all generated documents exist, exclude font downloads and contain no visible demo UI", () => {
  assert.equal(readdirSync("speed").filter(file => /^site-\d\d-\w+\.html$/.test(file)).length, 121);
  for (const [file, html] of speedDocuments()) {
    assert.equal(readFileSync(`speed/${file}`, "utf8").replaceAll("\r\n", "\n"), html, `${file} is stale`);
    assert.doesNotMatch(html, /fonts\.(?:googleapis|gstatic)\.com|@font-face/i);
    if (file.endsWith(".css")) {
      const original = readFileSync(`sites/${file}`, "utf8").replaceAll("\r\n", "\n")
        .replace(/@import\s+url\(\s*(["'])https:\/\/fonts\.googleapis\.com\/[^"']+\1\s*\)\s*;\s*/g, "")
        .replace(/\n+$/, "\n");
      assert.equal(html, original, `${file}: changed more than the font dependency`);
      continue;
    }
    assert.match(html, /<base href="\.\.\/" \/>/);
    assert.match(html, /href="speed\/system-fonts\.css\?v=compact-light-v1"/);
    assert.ok(html.indexOf('src="speed/errors.js?v=heavy90-v1"') < html.indexOf('href="styles.css'));
    for (const [, path] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      if (/^(?:https?:|#)/.test(path)) continue;
      const url = new URL(path.split("?")[0], new URL("../", new URL(`../speed/${file}`, import.meta.url)));
      assert.ok(existsSync(url), `${file}: ${path}`);
    }
    if (file !== "index.html") {
      const version = "heavy90-v1";
      assert.match(html, /<body data-speed-page="\d+"><div id="app"><\/div><script type="module" src="speed\/entry.js\?v=[^"]+"><\/script><\/body>/);
      assert.ok(html.includes(`src="speed/entry.js?v=${version}"`));
      assert.doesNotMatch(html, /speed\/launcher|role="status"|sequence-panel|data-continue|data-stop/);
    }
  }
  const original = readFileSync("index.html", "utf8");
  assert.match(original, /Fraunces:opsz,wght@9\.\.144,600;9\.\.144,700/);
  assert.doesNotMatch(original, /sequence-errors|speed\/errors|tab-sequence|speed\/entry/);
  const app = readFileSync("app.js", "utf8");
  assert.doesNotMatch(app, /mountTabSequence|tab-sequence|mountSpeedSequence/);
  assert.match(app, /if \(!document\.body\.hasAttribute\("data-speed-page"\)\)/);
  assert.doesNotMatch(readFileSync("styles.css", "utf8"), /tab-sequence/);
  for (const file of ["speed/sequence.js", "speed/entry.js", "speed/readiness.js"]) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /createElement|innerHTML|textContent/);
  }
});

test("system fonts are isolated to speed copies and all 30 original site stylesheets retain their fonts", () => {
  assert.equal(readdirSync("speed").filter(file => /^site-\d\d\.css$/.test(file)).length, 31);
  assert.match(readFileSync("speed/system-fonts.css", "utf8"), /font-family: var\(--site-body-font, system-ui\)/);
  assert.match(readFileSync("app.js", "utf8"), /standalone \? "speed" : "sites"/);
  for (let site = 1; site <= 30; site++) {
    assert.match(readFileSync(`sites/site-${String(site).padStart(2, "0")}.css`, "utf8"),
      /@import url\(['"]https:\/\/fonts\.googleapis\.com/);
  }
});

const readinessSource = readFileSync("speed/readiness.js", "utf8").replace(/^export /gm, "");
function readiness({ errors = [], entries = [], imageError = false, fontError = false, complete = true, root = true } = {}) {
  let releaseDecode;
  const image = {
    src: "https://example.test/LisbonDemo/photo.jpg", complete, naturalWidth: 1600, naturalHeight: 900,
    decode: () => imageError ? Promise.reject(new Error("Decode failed")) : new Promise(resolve => { releaseDecode = resolve; }),
  };
  const fonts = fontError ? [{ status: "error", family: "Test Font", weight: "400" }] : [];
  fonts.ready = Promise.resolve();
  const context = {
    window: { lisbonSpeedErrors: errors }, URL, Image: class {}, AbortController,
    performance: { getEntriesByType: () => entries },
    document: {
      readyState: "complete", querySelector: () => root ? {} : null, querySelectorAll: () => [],
      body: { getBoundingClientRect() {} }, fonts, images: [image],
    },
  };
  runInNewContext(`${readinessSource}\nglobalThis.ready = waitUntilReady;`, context);
  return { ready: () => context.ready(pageForStep(96), new AbortController().signal), release: () => releaseDecode(), image };
}

test("readiness waits for genuine decoded pixels and rejects wrong sections, font failures and HTTP errors", async () => {
  const harness = readiness();
  let finished = false;
  const pending = harness.ready().then(() => { finished = true; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(finished, false);
  assert.equal(harness.image.loading, "eager");
  harness.release();
  await pending;
  assert.equal(finished, true);
  await assert.rejects(readiness({ root: false }).ready(), /offerings page for site 24/);
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

test("a stylesheet object is not treated as loaded while its imports are still pending", async () => {
  const handlers = {};
  const link = { sheet: {}, href: "https://example.test/site.css",
    addEventListener: (name, handler) => { handlers[name] = handler; } };
  const fonts = [{ status: "error", family: "Pending imported font", weight: "400" }];
  fonts.ready = Promise.resolve();
  const loaded = new WeakSet();
  const context = {
    window: { lisbonSpeedErrors: [], lisbonSpeedStylesheets: loaded }, URL, Image: class {},
    performance: { getEntriesByType: () => [] },
    document: {
      readyState: "complete", querySelector: () => ({}),
      querySelectorAll: selector => selector === 'link[rel="stylesheet"]' ? [link] : [],
      body: { getBoundingClientRect() {} }, fonts, images: [],
    },
  };
  runInNewContext(`${readinessSource}\nglobalThis.ready = waitUntilReady;`, context);
  let finished = false;
  const pending = context.ready(pageForStep(5), new AbortController().signal).then(() => { finished = true; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(finished, false);
  assert.equal(typeof handlers.load, "function");
  fonts[0].status = "loaded";
  loaded.add(link);
  handlers.load();
  await pending;
  assert.equal(finished, true);
});

test("early errors are recorded and forwarded, with exact failures reported to the separate launcher", () => {
  const handlers = {};
  const { win, values } = browser();
  const printed = [];
  const window = { addEventListener: (name, handler) => { handlers[name] = handler; } };
  runInNewContext(readFileSync("speed/errors.js", "utf8"), {
    window, location: { search: `?speed-run=${run}`, pathname: "/LisbonDemo/speed/site-01-home.html", href: sequenceUrl(base, run, 1) }, URLSearchParams,
    document: { addEventListener: (name, handler) => { handlers[name] = handler; } },
    localStorage: win.localStorage, console: { error: (...args) => printed.push(args) },
  });
  handlers.error({ target: { src: "https://example.test/broken.js" } });
  handlers.error({ message: "Real exception", target: window });
  handlers.unhandledrejection({ reason: new Error("Async failure") });
  assert.deepEqual([...window.lisbonSpeedErrors], [
    "Resource failed: https://example.test/broken.js", "Real exception", "Unhandled error: Async failure",
  ]);
  assert.equal(JSON.parse(values.get(storageKey)).stopped, true);
  assert.match(JSON.parse(values.get(storageKey)).error, /site-01-home\.html.*\nUnhandled error: Async failure/);
  assert.equal(printed.length, 0);
});

test("90% rounds up, ignores a hanging remainder and keeps logging late genuine decodes", async () => {
  const releases = [];
  const photos = Array.from({ length: 13 }, (_, index) => ({
    src: `photo-${index}.jpg`, complete: true, naturalWidth: 1600, naturalHeight: 900,
    decode: () => new Promise(resolve => { releases[index] = resolve; }),
  }));
  const reports = [];
  let finished = false;
  const pending = waitForPhotoThreshold(photos, new AbortController().signal, report => reports.push(report))
    .then(result => { finished = true; return result; });
  for (let index = 0; index < 11; index++) releases[index]();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(finished, false);
  releases[11]();
  const result = await pending;
  assert.equal(result.required, 12);
  assert.equal(result.loaded, 12);
  assert.equal(result.pending.length, 1);
  assert.equal(result.policy, "90%-photos");
  assert.equal(result.reason, "threshold-met");
  releases[12]();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(reports.at(-1).loaded, 13);
});

test("90% requires all photographs for small inventories and none for an empty inventory", async () => {
  for (const total of [0, 1, 3, 9, 10, 11]) {
    const photos = Array.from({ length: total }, () => ({
      src: "photo.jpg", complete: true, naturalWidth: 3840, naturalHeight: 2560,
      decode: () => Promise.resolve(),
    }));
    const result = await waitForPhotoThreshold(photos, new AbortController().signal, () => {});
    assert.equal(result.required, Math.ceil(total * 9 / 10));
  }
});

test("failed photos do not fake decoded pixels and an unreachable threshold is explicitly reported", async () => {
  const result = await waitForPhotoThreshold([{
    src: "broken.jpg", decode: () => Promise.reject(new Error("Real decode failure")),
  }], new AbortController().signal, () => {});
  assert.equal(result.loaded, 0);
  assert.equal(result.required, 1);
  assert.equal(result.reason, "photos-failed-below-threshold");
  assert.match(result.failed[0].error, /Real decode failure/);
  const controller = new AbortController();
  const pending = waitForPhotoThreshold([{ src: "pending.jpg", decode: () => new Promise(() => {}) }],
    controller.signal, () => {});
  controller.abort(new Error("Stopped by user"));
  await assert.rejects(pending, /Stopped by user/);
});

test("early image/icon failures keep site runs moving, log late errors and keep the bridge strict", () => {
  for (const bridge of [false, true]) {
    const { win, values } = browser();
    const handlers = {};
    const pathname = `/LisbonDemo/speed/${bridge ? "site-31-home" : "site-01-home"}.html`;
    const window = { addEventListener: (name, handler) => { handlers[name] = handler; } };
    runInNewContext(readFileSync("speed/errors.js", "utf8"), {
      window, location: { search: `?speed-run=${run}`, pathname, href: `${base}?speed-run=${run}` }, URLSearchParams,
      document: { addEventListener() {} }, localStorage: win.localStorage, console: { error() {} },
    });

    handlers.error({ target: { tagName: "IMG", src: "https://example.test/failed-photo.jpg" } });
    assert.equal(JSON.parse(values.get(storageKey)).stopped, bridge);
    assert.match(JSON.parse(values.get(`lisbon-speed-log-v1:${pathname}`)).events[0].message, /failed-photo.jpg/);
    if (!bridge) {
      recordReady(win, { run, step: 1 });
      openNextTab(win, { run, step: 1 });
      handlers.error({ target: { tagName: "LINK", href: "https://example.test/favicon.ico" } });
      const log = readRunLog(win, readRun(win, run));
      assert.equal(log.reports.length, 1);
      assert.equal(log.reports[0].events.length, 2);
      assert.match(log.reports[0].events[1].message, /favicon.ico/);
      assert.equal(log.state.stopped, false);
      values.set(storageKey, JSON.stringify({ run: "superseded", opened: [1], ready: [], stopped: false }));
      handlers.error({ target: { tagName: "IMG", src: "old-run.jpg" } });
      assert.equal(JSON.parse(values.get(`lisbon-speed-log-v1:${pathname}`)).events.length, 2);
    }
  }
});

test("a 45-second site timeout advances with an explicit log while a bridge timeout stays stopped", () => {
  for (const bridge of [false, true]) {
    const { win, values, opened } = browser();
    const reports = [];
    let timeout;
    win.addEventListener = () => {};
    win.lisbonSpeedReport = report => reports.push(report);
    if (bridge) {
      win.location.href = sequenceUrl(base, run, 97);
      values.set(storageKey, JSON.stringify({ run, opened: pages.map(page => page.step),
        ready: pages.slice(0, 96).map(page => page.step), stopped: false }));
    }
    const context = {
      window: win, location: win.location, localStorage: win.localStorage, URL, AbortController,
      pages, pageFromUrl, pageForStep, console: { error() {}, warn() {} },
      checkErrors() {}, waitUntilReady: () => new Promise(() => {}),
      waitUntilPartlyReady: () => new Promise(() => {}),
      setTimeout: (handler, delay) => { assert.equal(delay, 45000); timeout = handler; },
      clearTimeout() {},
    };
    const source = readFileSync("speed/sequence.js", "utf8").replace(/^import .+;\r?$/gm, "").replace(/^export /gm, "");
    runInNewContext(`${source}\nglobalThis.mount = mountSpeedSequence;`, context);
    context.mount(bridge ? allPages.at(-1) : pages[0]);
    timeout();
    const state = JSON.parse(values.get(storageKey));
    assert.equal(state.stopped, bridge);
    assert.equal(opened.length, bridge ? 0 : 1);
    if (bridge) assert.match(state.error, /45 seconds/);
    else {
      assert.equal(state.ready.length, 1);
      assert.equal(reports[0].readiness.reason, "timeout-below-threshold");
      assert.match(reports[1].event.message, /continuing with incomplete content/);
    }
  }
});
