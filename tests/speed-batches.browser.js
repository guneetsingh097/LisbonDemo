import assert from "node:assert/strict";
import { pages } from "../speed/pages.js";
import { storageKey } from "../speed/sequence.js";

export async function verifySpeedBatches(context, { baseUrl, autostart = false } = {}) {
  const tabs = [];
  const errors = [];
  const held = new Map();
  const releases = new Map();
  const pendingHolds = new Map();
  const reached = new Map([2, 6].map(step => [step, new Promise(resolve => pendingHolds.set(step, resolve))]));
  const gates = new Map([2, 6].map(step => [step, new Promise(resolve => releases.set(step, resolve))]));
  context.on("weberror", error => errors.push(error.error().message));
  await context.route("**/*", async route => {
    const request = route.request();
    if (request.resourceType() !== "image") return route.continue();
    const frameUrl = request.frame().url();
    const step = [2, 6].find(step => frameUrl.includes(`/speed/${pages[step - 1].file}?`));
    if (step && !held.has(step)) {
      held.set(step, request.url());
      pendingHolds.get(step)();
      await gates.get(step);
    }
    await route.continue();
  });
  const launcher = await context.newPage();
  await launcher.goto(new URL("speed/index.html", baseUrl).href);
  context.on("page", page => tabs.push(page));
  try {
    if (autostart) await launcher.goto(new URL("speed/index.html?autostart=1", baseUrl).href);
    else await launcher.locator("#start").click();
    await launcher.waitForFunction(key => {
      const state = JSON.parse(localStorage.getItem(key) || "null");
      return state?.ready.includes(1) && state.ready.includes(3);
    }, storageKey);
    let state = await launcher.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
    assert.deepEqual(state.opened, [1, 2, 3]);
    assert.deepEqual(state.ready, [1, 3]);
    assert.equal(tabs.length, 3);
    assert.ok(held.has(2));
    releases.get(2)();
    await launcher.waitForFunction(key => {
      const state = JSON.parse(localStorage.getItem(key) || "null");
      return state?.ready.includes(4) && state.ready.includes(5);
    }, storageKey);
    let timeout;
    try {
      await Promise.race([reached.get(6), new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error("Page 6 did not request its real photo.")), 40000);
      })]);
    } finally {
      clearTimeout(timeout);
    }
    state = await launcher.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
    assert.deepEqual(state.opened, [1, 2, 3, 4, 5, 6]);
    assert.deepEqual(state.ready, [1, 2, 3, 4, 5]);
    assert.equal(tabs.length, 6);
    assert.ok(held.has(6));
    for (const [index, tab] of tabs.entries()) {
      assert.ok(new URL(tab.url()).pathname.endsWith(`/speed/${pages[index].file}`));
      assert.equal(tab.isClosed(), false);
    }
    await launcher.locator("#stop").click();
    releases.get(6)();
    await tabs[5].waitForLoadState("load");
    await tabs[5].evaluate(async () => {
      await Promise.all([...document.images].map(image => image.decode()));
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    state = await launcher.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
    assert.equal(state.stopped, true);
    assert.equal(state.opened.length, 6);
    assert.equal(tabs.length, 6);
    assert.deepEqual(errors, []);
    return { opened: state.opened, outOfOrderReady: [1, 3], waitedForSlowest: true,
      stoppedWithoutClosingTabs: tabs.every(tab => !tab.isClosed()), autostart, errors };
  } finally {
    for (const release of releases.values()) release();
    await context.unrouteAll({ behavior: "wait" });
  }
}

export async function verifySpeedBatchFailure(context, { baseUrl } = {}) {
  await context.addInitScript(() => {
    window.addEventListener("load", () => {
      if (!location.pathname.endsWith("/speed/site-01-detail.html")) return;
      const image = document.createElement("img");
      image.src = new URL("speed-batch-missing-image.jpg", location.href).href;
      document.body.append(image);
    }, { once: true });
  });
  const launcher = await context.newPage();
  const tabs = [];
  await launcher.goto(new URL("speed/index.html", baseUrl).href);
  context.on("page", page => tabs.push(page));
  await launcher.locator("#start").click();
  await launcher.waitForFunction(key => {
    const state = JSON.parse(localStorage.getItem(key) || "null");
    return state?.stopped;
  }, storageKey);
  const state = await launcher.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
  assert.deepEqual(state.opened, [1, 2, 3]);
  assert.ok(!state.ready.includes(2));
  assert.ok(!state.complete);
  assert.match(state.error, /speed-batch-missing-image.jpg/);
  assert.match(await launcher.locator("#launch-status").innerText(), /speed-batch-missing-image.jpg/);
  for (const tab of tabs) {
    await tab.waitForLoadState("load");
    assert.equal(tab.isClosed(), false);
  }
  assert.equal(tabs.length, 3);
  assert.deepEqual((await launcher.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey)).opened, [1, 2, 3]);
  return { actualMissingImageStoppedBatch: true, retainedTabs: tabs.length };
}
