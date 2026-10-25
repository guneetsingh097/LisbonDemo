(async (context, { baseUrl = "http://localhost:4201/", mode = "auto", screenshot = async () => {} } = {}) => {
  const errors = [], requests = [], order = [], checked = [];
  const trialPages = () => context.pages().filter(page => new URL(page.url()).searchParams.has("tab-sequence"));
  const onConsole = message => { if (message.type() === "error") errors.push(message.text()); };
  const onError = error => errors.push(error.error().message);
  const onResponse = response => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
  };
  const onFailure = request => errors.push(`${request.failure()?.errorText}: ${request.url()}`);
  const onRequest = request => requests.push(request.url());
  context.on("console", onConsole);
  context.on("weberror", onError);
  context.on("response", onResponse);
  context.on("requestfailed", onFailure);
  context.on("request", onRequest);
  if (mode === "failure") {
    // A real failing HTTP image tests the stop gate; no responses are intercepted.
    await context.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        if (new URLSearchParams(location.search).get("tab-step") !== "2") return;
        const image = document.createElement("img");
        image.src = "./missing-five-tab-test-image.jpg";
        document.body.append(image);
      }, { once: true });
    });
  }
  try {
    const launcher = context.pages().find(page => page.url() === "about:blank") || await context.newPage();
    await launcher.goto(`${baseUrl}#/navigate`, { waitUntil: "load" });
    await launcher.waitForSelector(".tab-sequence-launcher");
    for (const [name, viewport] of [
      ["desktop", { width: 1440, height: 1000 }], ["mobile", { width: 320, height: 700 }],
    ]) {
      await launcher.setViewportSize(viewport);
      await launcher.locator(".tab-sequence-launcher").scrollIntoViewIfNeeded();
      if (!await launcher.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)) {
        throw new Error(`Launcher overflow: ${name}`);
      }
      await screenshot(launcher, `launcher-${name}`);
    }
    await launcher.setViewportSize({ width: 1440, height: 1000 });
    await launcher.getByRole("button", { name: "Start five-tab sequence" }).click();
    let continued = 0;
    for (let step = 1; step <= (mode === "failure" ? 2 : 5); step++) {
      const deadline = Date.now() + 60000;
      let page;
      while (Date.now() < deadline) {
        page = context.pages().find(tab => new URL(tab.url()).searchParams.get("tab-step") === String(step));
        if (page) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (!page) throw new Error(`Site ${step} did not open`);
      await page.waitForFunction(() => {
        const panel = document.querySelector(".tab-sequence-panel");
        return panel && ["opened", "blocked", "finished", "stopped", "already-opened"].includes(panel.dataset.state);
      }, null, { timeout: 60000, polling: 100 });
      const state = await page.locator(".tab-sequence-panel").getAttribute("data-state");
      const status = await page.locator(".tab-sequence-panel").innerText();
      order.push(step);
      if (mode === "failure" && step === 2) {
        if (state !== "stopped" || !status.includes("missing-five-tab-test-image.jpg") || trialPages().length !== 2) {
          throw new Error(`Failure gate: ${JSON.stringify({ state, status, pages: trialPages().length, errors,
            images: await page.locator("img").evaluateAll(images => images.map(image => image.src)) })}`);
        }
        const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("lisbon-five-tab-sequence-v1")));
        if (!saved.stopped || saved.opened.join(",") !== "1,2") throw new Error("Failure did not stop shared progress");
        return { mode, order, stoppedOnReal404: true, pages: trialPages().length, errors };
      }
      if (state === "stopped") throw new Error(status);
      if (state === "blocked") {
        if (mode !== "manual") throw new Error(`Popup permission was not applied: ${status}`);
        await screenshot(page, "blocked");
        await page.locator("[data-continue]").click();
        await page.waitForFunction(() => document.querySelector(".tab-sequence-panel").dataset.state === "opened",
          null, { timeout: 10000, polling: 100 });
        continued++;
      }
      checked.push(await page.evaluate(() => ({
        hash: location.hash, ready: document.readyState, fonts: document.fonts.status,
        images: [...document.images].map(image => ({ url: image.currentSrc, complete: image.complete,
          width: image.naturalWidth, height: image.naturalHeight })),
        state: document.querySelector(".tab-sequence-panel").dataset.state,
      })));
    }
    if (trialPages().length !== 5 || checked.some(page => page.ready !== "complete" || page.fonts !== "loaded"
      || page.images.some(image => !image.complete || image.width <= 0 || image.height <= 0)) || errors.length) {
      throw new Error(JSON.stringify({ pages: context.pages().map(page => page.url()), checked, errors }));
    }
    if (requests.some(url => /#\/site\/6(?:\/|$)/.test(url))) throw new Error("Unexpected sixth site request");
    if (mode === "manual" && !continued) throw new Error("Blocked-popup fallback was not exercised");
    const fifth = context.pages().find(tab => new URL(tab.url()).hash === "#/site/5");
    await screenshot(fifth, "finished");
    // Reloading the first tab must not duplicate any successor.
    await launcher.reload({ waitUntil: "load" });
    await launcher.waitForFunction(() => document.querySelector(".tab-sequence-panel")?.dataset.state === "already-opened",
      null, { timeout: 60000, polling: 100 });
    if (trialPages().length !== 5) throw new Error("Reload duplicated a tab");
    await launcher.locator("[data-stop]").click();
    for (const page of trialPages()) {
      await page.waitForFunction(() => document.querySelector(".tab-sequence-panel")?.dataset.state === "stopped",
        null, { polling: 100 });
    }
    await launcher.evaluate(() => { location.hash = "#/navigate"; });
    await launcher.waitForSelector(".tab-sequence-launcher button");
    if (await launcher.evaluate(() => new URL(location.href).searchParams.has("tab-sequence"))) {
      throw new Error("Leaving the sequence did not clear its URL parameters");
    }
    if (errors.length) throw new Error(JSON.stringify(errors));
    return { mode, order, pages: checked.length, continued, checked,
      reloadWithoutDuplicates: true, stopPreservesAllTabs: true, navigationCleanupPassed: true, errors };
  } finally {
    context.off("console", onConsole);
    context.off("weberror", onError);
    context.off("response", onResponse);
    context.off("requestfailed", onFailure);
    context.off("request", onRequest);
  }
})
