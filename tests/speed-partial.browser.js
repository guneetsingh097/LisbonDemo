import { pages } from "../speed/pages.js";
import { storageKey } from "../speed/sequence.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export async function runPartialPhotoAudit(browser, baseUrl) {
  const context = await browser.newContext({ acceptDownloads: true });
  const releases = new Map();
  try {
    const probe = await context.newPage();
    await probe.goto(new URL("speed/site-01-home.html", baseUrl).href);
    await probe.waitForLoadState("networkidle");
    const inventory = await probe.evaluate(async () => {
      const { photoCandidates } = await import("./speed/readiness.js?v=heavy90-v1");
      return { photos: photoCandidates().map(image => image.currentSrc || image.src),
        icon: document.querySelector('link[rel~="icon"]').href };
    });
    await probe.close();
    const groups = [...new Set(inventory.photos)];
    const required = Math.ceil(inventory.photos.length * 9 / 10);
    let allowedCount = 0;
    const allowed = new Set();
    for (const url of groups) {
      const count = inventory.photos.filter(photo => photo === url).length;
      if (allowedCount + count >= required) break;
      allowed.add(url);
      allowedCount += count;
    }
    const held = groups.filter(url => !allowed.has(url));
    assert(held.length >= 2, "The fixture needs a threshold photo and a separate late failure.");
    const routesReady = Promise.withResolvers();
    const intercepted = new Set();
    for (const url of held) {
      const gate = Promise.withResolvers();
      releases.set(url, fail => gate.resolve(fail));
      await context.route(url, async route => {
        intercepted.add(url);
        if (intercepted.size === held.length) routesReady.resolve();
        const fail = await gate.promise;
        if (fail) await route.fulfill({ status: 404, contentType: "text/plain", body: "Test photo missing" });
        else await route.continue();
      });
    }
    await context.route(inventory.icon, route => route.fulfill({ status: 404, contentType: "text/plain", body: "Test icon missing" }));
    let releaseNext;
    await context.route("**/speed/site-01-detail.html?*", route => new Promise(resolve => {
      releaseNext = async () => { await route.continue(); resolve(); };
    }));
    const launcher = await context.newPage();
    await launcher.goto(new URL("speed/index.html", baseUrl).href);
    const firstPromise = context.waitForEvent("page");
    await launcher.locator("#start").click();
    const first = await firstPromise;
    await first.waitForURL("**/speed/site-01-home.html?*");
    const reportKey = `lisbon-speed-log-v1:${new URL(first.url()).pathname}`;
    await first.waitForFunction(({ reportKey, allowedCount }) => {
      const report = JSON.parse(localStorage.getItem(reportKey) || "null");
      return report?.readiness?.loaded === allowedCount;
    }, { reportKey, allowedCount });
    assert(await launcher.evaluate(key => JSON.parse(localStorage.getItem(key)).opened.length, storageKey) === 1,
      "A successor opened before 90% of photographs decoded.");
    await routesReady.promise;
    await releases.get(held[0])(false);
    releases.delete(held[0]);
    await launcher.waitForFunction(key => JSON.parse(localStorage.getItem(key)).opened.length === 2, storageKey);
    const state = await launcher.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
    assert(!state.stopped && state.ready.length === 1, "A missing icon stopped partial progression.");
    await releases.get(held[1])(true);
    releases.delete(held[1]);
    await launcher.waitForFunction(({ key, failed }) => {
      const report = JSON.parse(localStorage.getItem(key) || "null");
      return report?.events.some(event => event.message.includes(failed));
    }, { key: reportKey, failed: held[1] });
    assert(!await launcher.evaluate(key => JSON.parse(localStorage.getItem(key)).stopped, storageKey),
      "A late resource failure stopped the run.");
    await launcher.locator("#stop").click();
    const downloadPromise = launcher.waitForEvent("download");
    await launcher.locator("#download-log").click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const log = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const report = log.reports.find(item => item.step === 1);
    assert(report?.readiness.policy === "90%-photos" && report.readiness.loaded >= required
      && report.readiness.failed.some(photo => photo.url === held[1]),
      "The downloaded log did not preserve actual partial loading counts.");
    assert(report.events.some(event => event.message.includes(held[1])), "The late failed photo is missing from the log.");
    assert(report.events.some(event => event.message.includes(inventory.icon)), "The failed icon is missing from the log.");
    if (releaseNext) await releaseNext();
    return { total: inventory.photos.length, required, loadedBeforeAdvance: allowedCount,
      partial: report.readiness, lateFailedPhoto: held[1], downloadedLog: download.suggestedFilename() };
  } finally {
    for (const release of releases.values()) await release(false);
    await context.close();
  }
}

export async function runStrictBridgeAudit(browser, baseUrl, fail = false) {
  const context = await browser.newContext();
  let release;
  try {
    await context.route("**/images-bridge/*", async route => {
      if (release) return route.continue();
      await new Promise(resolve => {
        release = async () => {
          if (fail) await route.fulfill({ status: 404, contentType: "text/plain", body: "Test bridge photo missing" });
          else await route.continue();
          resolve();
        };
      });
    });
    const page = await context.newPage();
    await page.goto(new URL("speed/index.html", baseUrl).href);
    const run = await page.evaluate(({ key, steps }) => {
      const run = crypto.randomUUID();
      localStorage.setItem(key, JSON.stringify({ run, opened: steps, ready: steps.slice(0, -1),
        stopped: false, complete: false }));
      return run;
    }, { key: storageKey, steps: pages.map(page => page.step) });
    await page.goto(new URL(`speed/site-31-home.html?speed-run=${run}`, baseUrl).href, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelectorAll(".bridge-page img").length >= 14);
    await page.waitForFunction(() => [...document.querySelectorAll(".bridge-page img")].filter(image => image.complete && image.naturalWidth).length >= 13);
    assert(release, "A real bridge photo was not held.");
    assert(!await page.evaluate(key => JSON.parse(localStorage.getItem(key)).complete, storageKey),
      "Bridge completed before every photograph loaded.");
    await release();
    release = null;
    await page.waitForFunction(({ key, fail }) => {
      const state = JSON.parse(localStorage.getItem(key));
      return fail ? state.stopped && !state.complete : state.complete && !state.stopped;
    }, { key: storageKey, fail });
    assert(context.pages().length === 1, "Bridge opened an extra successor.");
    return { seededBoundary: true, heldBridgePhoto: true, failureStopsBridge: fail, noSuccessor: true };
  } finally {
    if (release) await release();
    await context.close();
  }
}
