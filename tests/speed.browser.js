import { pages } from "../speed/pages.js";
import { storageKey } from "../speed/sequence.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export async function runSpeedAudit(context, { baseUrl, mode = "auto", autostart = false, screenshot } = {}) {
  const errors = [];
  const expectedErrors = [];
  const seen = [];
  const results = [];
  const tasks = [];
  const active = new Map();
  const harnessClosing = new WeakSet();
  let maximumRetainedPages = 0;
  let cleanup = Promise.resolve();
  const isFixture = url => url.includes("speed-audit-missing-image.jpg");
  const observeError = error => (mode === "failure" && (isFixture(error.url || "")
    || error.type === "console") ? expectedErrors : errors).push(error);
  context.on("response", response => {
    if (response.status() >= 400) observeError({ type: "http", route: response.request().frame().url(),
      url: response.url(), status: response.status() });
  });
  context.on("requestfailed", request => {
    if (!harnessClosing.has(request.frame().page())) observeError({ type: "request",
      route: request.frame().url(), url: request.url(), error: request.failure()?.errorText });
  });
  context.on("weberror", error => observeError({ type: "javascript", url: error.page()?.url(), error: error.error().message }));
  context.on("console", message => {
    if (message.type() === "error") observeError({ type: "console", url: message.page()?.url(), error: message.text() });
  });

  if (mode === "failure") {
    await context.addInitScript(() => {
      window.addEventListener("DOMContentLoaded", () => {
        if (!location.pathname.endsWith("/speed/site-01-detail.html")) return;
        const image = document.createElement("img");
        image.src = new URL("speed-audit-missing-image.jpg", location.href).href;
        document.body.append(image);
      }, { once: true });
    });
  }

  const launcher = await context.newPage();
  await launcher.goto(new URL("#/navigate", baseUrl).href);
  await launcher.waitForSelector(".navigator-main");
  await launcher.waitForLoadState("networkidle");
  assert(!await launcher.locator(".tab-sequence-launcher, .tab-sequence-panel").count(), "Original launcher was not restored.");
  await launcher.goto(new URL("?tab-sequence=32c07a72-43f9-44f7-b01b-4136391a0041&tab-step=1#/site/1", baseUrl).href);
  await launcher.waitForSelector(".site-shell-1 .compact-content");
  await launcher.waitForLoadState("networkidle");
  assert(!await launcher.evaluate(() => "lisbonSequenceErrors" in window || "lisbonSpeedErrors" in window),
    "Original pages still load sequence diagnostics.");
  assert(context.pages().length === 1, "An original page opened another tab.");

  const originals = new Map();
  for (const page of pages.slice(0, 4)) {
    await launcher.goto(new URL(`#/site/${page.site}/${page.section}`, baseUrl).href);
    await launcher.waitForSelector(`.site-shell-${page.site}[data-section="${page.section}"] .compact-content`);
    await launcher.waitForLoadState("networkidle");
    originals.set(page.step, await launcher.locator("#app").innerText());
  }
  await launcher.goto(new URL("#/speed/", baseUrl).href);
  await launcher.waitForURL(url => url.pathname.endsWith("/speed/index.html"));
  await launcher.waitForSelector("#start");
  await launcher.waitForLoadState("networkidle");
  if (screenshot) {
    await screenshot(launcher, "launcher-desktop");
    await launcher.setViewportSize({ width: 390, height: 844 });
    await screenshot(launcher, "launcher-mobile");
    assert(await launcher.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Mobile launcher overflows.");
    await launcher.setViewportSize({ width: 1440, height: 1000 });
  }

  context.on("page", tab => {
    maximumRetainedPages = Math.max(maximumRetainedPages, context.pages().length);
    const task = (async () => {
      await tab.waitForURL("**/speed/site-*.html?speed-run=*", { timeout: 60000 });
      const page = pages.find(item => new URL(tab.url()).pathname.endsWith(`/${item.file}`));
      assert(page, `Unexpected new tab: ${tab.url()}`);
      seen.push(page.step);
      active.set(page.step, tab);
      await tab.waitForFunction(({ key, step }) => {
        const state = JSON.parse(localStorage.getItem(key) || "null");
        return state && (state.ready.includes(step) || state.stopped);
      }, { key: storageKey, step: page.step }, { timeout: 60000 });
      const state = await tab.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
      if (mode === "failure" && page.step === 2) {
        assert(state.stopped && !state.ready.includes(2), "The real 404 did not stop page 2.");
        assert(state.error.includes("speed-audit-missing-image.jpg"), "The exact missing resource was not reported.");
        return;
      }
      assert(state.ready.includes(page.step), `Page ${page.step} stopped before passing checks: ${state.error}`);
      const result = await tab.evaluate(async () => {
        await document.fonts.ready;
        const images = await Promise.all([...document.images].map(async image => {
          await image.decode();
          return { url: image.currentSrc || image.src, complete: image.complete,
            width: image.naturalWidth, height: image.naturalHeight };
        }));
        const icon = document.querySelector('link[rel~="icon"]');
        const response = await fetch(icon.href, { cache: "no-store" });
        return {
          url: location.href, complete: document.readyState, fonts: document.fonts.status,
          section: document.querySelector(".demo-site, .bridge-page")?.dataset.section,
          images, icon: { url: icon.href, status: response.status, type: response.headers.get("content-type") },
          children: [...document.body.children].map(element => `${element.tagName}:${element.id}`),
          text: document.querySelector("#app").innerText, title: document.title,
          fontRequests: performance.getEntriesByType("resource").map(entry => entry.name)
            .filter(url => /fonts\.(?:googleapis|gstatic)\.com|\.(?:woff2?|ttf|otf)(?:\?|$)/i.test(url)),
          fontFamily: getComputedStyle(document.querySelector(".compact-content")).fontFamily,
          nativeFont: getComputedStyle(document.querySelector(".demo-site, .bridge-page")).getPropertyValue("--site-body-font").trim(),
          links: [...document.querySelectorAll(".compact-page-nav a")].map(link => link.href),
          scriptUrls: performance.getEntriesByType("resource").map(entry => entry.name).filter(url => /\.js(?:\?|$)/.test(url)),
        };
      });
      assert(result.complete === "complete" && result.fonts === "loaded", `Page ${page.step} is incomplete.`);
      assert(result.section === page.section, `Wrong section in page ${page.step}.`);
      assert(result.fontRequests.length === 0, `Downloaded font dependency on page ${page.step}: ${result.fontRequests.join(", ")}`);
      const normalizeFont = value => value.replace(/["'\s]/g, "").toLowerCase();
      assert(result.nativeFont && normalizeFont(result.fontFamily).startsWith(normalizeFont(result.nativeFont)),
        `Page ${page.step} is not using its assigned native font stack: ${result.fontFamily}.`);
      assert(result.images.every(image => image.complete && image.width && image.height), `Broken image in page ${page.step}.`);
      assert(result.icon.status === 200 && result.icon.type.includes("image/png"), `Favicon failed in page ${page.step}.`);
      assert(JSON.stringify(result.children) === JSON.stringify(["DIV:app", "SCRIPT:"]), `Added visible content outside the real site in page ${page.step}.`);
      assert(!result.title.includes("Speed") && !result.title.includes("sequence"), `Demo language in page ${page.step}'s title.`);
      if (originals.has(page.step)) assert(result.text === originals.get(page.step), `Site content changed in page ${page.step}.`);
      for (const section of page.site === 31 ? [] : ["home", "detail", "about", "offerings"]) {
        const target = pages.find(item => item.site === page.site && item.section === section);
        assert(result.links.some(href => new URL(href).pathname.endsWith(`/speed/${target.file}`)),
          `Missing standalone ${section} navigation on page ${page.step}.`);
      }
      if (screenshot && page.step === 1) await screenshot(tab, "site-01-home");
      if (screenshot && page.step === 14) await screenshot(tab, "site-04-detail");
      const { text, ...evidence } = result;
      results.push({ step: page.step, site: page.site, ...evidence });
      // Only the test harness releases already-checked tabs to protect the shared host.
      // Production code never closes a tab. Keep the first two for reload checks.
      cleanup = cleanup.then(async () => {
        for (const [step, old] of active) {
          if (active.size <= 8) break;
          if (step <= 2 || !results.some(item => item.step === step)) continue;
          harnessClosing.add(old);
          await old.close();
          active.delete(step);
        }
      });
      await cleanup;
    })().catch(error => { errors.push({ type: "audit", url: tab.url(), error: error.message }); });
    tasks.push(task);
  });
  if (autostart) await launcher.goto(new URL("speed/index.html?autostart=1", baseUrl).href);
  else await launcher.locator("#start").click();
  await launcher.waitForFunction(key => {
    const state = JSON.parse(localStorage.getItem(key) || "null");
    return state && (state.complete || state.stopped);
  }, storageKey, { timeout: 600000 });
  await Promise.all(tasks);
  await cleanup;
  const state = await launcher.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
  if (mode === "failure") {
    assert(state.stopped && seen.length === 2 && seen.includes(1) && seen.includes(2), "Failure fixture opened a successor.");
    assert(await launcher.locator("#launch-status").innerText().then(text => text.includes("speed-audit-missing-image.jpg")),
      "Launcher did not show the exact failure.");
  } else {
    assert(state.complete && !state.stopped, `Run did not complete: ${state.error}`);
    assert(seen.length === pages.length && results.length === pages.length, `Only ${seen.length} tabs / ${results.length} documents checked.`);
    assert(seen.every((step, index) => step === index + 1), "Tab opening order changed.");
    assert(state.ready.length === pages.length && state.opened.length === pages.length, "Not all pages passed.");
    const first = active.get(1);
    await first.reload();
    await first.waitForFunction(() => document.readyState === "complete" && document.fonts.status === "loaded");
    await first.evaluate(async () => { for (const image of document.images) { image.loading = "eager"; await image.decode(); } });
    assert(seen.length === pages.length, "Reloading an earlier page opened a duplicate successor.");
    assert(!await first.locator("body > aside, .tab-sequence-panel").count(), "Reload added an indicator.");
  }
  assert(errors.length === 0, JSON.stringify(errors));
  return { mode, pages: results.sort((a, b) => a.step - b.step), order: seen, state,
    maximumRetainedPages, testHarnessReleasedEarlierTabs: true, errors, expectedErrors };
}
