const storageKey = "lisbon-five-tab-sequence-v1";
const limit = 5;

export function sequenceUrl(base, run, step) {
  if (!/^[\da-f-]{36}$/i.test(run) || !Number.isInteger(step) || step < 1 || step > limit) {
    throw new Error("Invalid five-tab sequence URL.");
  }
  const url = new URL(base);
  url.searchParams.set("tab-sequence", run);
  url.searchParams.set("tab-step", String(step));
  url.hash = `#/site/${step}`;
  return url.href;
}

export function sequenceConfig(href) {
  const url = new URL(href);
  if (!url.searchParams.has("tab-sequence") && !url.searchParams.has("tab-step")) return null;
  const run = url.searchParams.get("tab-sequence") || "";
  const step = Number(url.searchParams.get("tab-step"));
  sequenceUrl(href, run, step);
  return { run, step };
}

function readTrial(win, run) {
  const trial = JSON.parse(win.localStorage.getItem(storageKey) || "null");
  if (!trial || trial.run !== run) throw new Error("This trial is no longer active. Start again from Quick navigate.");
  if (!Array.isArray(trial.opened) || trial.opened.some(step => !Number.isInteger(step) || step < 1 || step > limit)) {
    throw new Error("The saved tab sequence is invalid. Start a new trial from Quick navigate.");
  }
  return trial;
}

export function openNextTab(win, { run, step }) {
  const trial = readTrial(win, run);
  if (trial.stopped) return "stopped";
  if (!trial.opened.includes(step)) throw new Error("This page was not opened by the active trial.");
  if (step === limit) return "finished";
  if (trial.opened.includes(step + 1)) return "already-opened";
  trial.opened.push(step + 1);
  win.localStorage.setItem(storageKey, JSON.stringify(trial));
  let tab;
  try {
    tab = win.open(sequenceUrl(win.location.href, run, step + 1), `lisbon-five-${run}-${step + 1}`);
  } catch (error) {
    trial.opened.pop();
    win.localStorage.setItem(storageKey, JSON.stringify(trial));
    throw error;
  }
  if (!tab) {
    trial.opened.pop();
    win.localStorage.setItem(storageKey, JSON.stringify(trial));
    return "blocked";
  }
  try { tab.focus(); }
  catch (error) { win.console.warn("The browser did not allow the new tab to become active", error); }
  return "opened";
}

function checkErrors() {
  if (!Array.isArray(window.lisbonSequenceErrors)) throw new Error("The early loading-error observer did not initialize.");
  const errors = [...window.lisbonSequenceErrors];
  for (const font of document.fonts) {
    if (font.status === "error") errors.push(`Font failed: ${font.family}, weight ${font.weight}`);
  }
  for (const entry of performance.getEntriesByType("resource")) {
    if (entry.responseStatus >= 400) errors.push(`HTTP ${entry.responseStatus}: ${entry.name}`);
  }
  if (errors.length) throw new Error([...new Set(errors)].join("\n"));
}

function waitForLoad(target, signal, ready) {
  if (ready()) return Promise.resolve();
  return new Promise((resolve, reject) => {
    target.addEventListener("load", () => resolve(), { once: true, signal });
    target.addEventListener("error", () => reject(new Error(`Resource failed: ${target.href || target.src}`)), { once: true, signal });
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  });
}

export async function waitUntilReady(step, signal) {
  if (document.readyState !== "complete") {
    await waitForLoad(window, signal, () => document.readyState === "complete");
  }
  if (!document.querySelector(`.site-shell-${step}[data-section="home"] .compact-content`)) {
    throw new Error(`Expected the home page for site ${step}.`);
  }
  checkErrors();
  await Promise.all([...document.querySelectorAll('link[rel="stylesheet"]')].map(link =>
    waitForLoad(link, signal, () => !!link.sheet)));
  // Force layout before waiting for the fonts actually used by this route.
  document.body.getBoundingClientRect();
  await document.fonts.ready;
  checkErrors();
  const decode = async image => {
    image.loading = "eager";
    try { await image.decode(); }
    catch (error) { throw new Error(`Image failed: ${image.currentSrc || image.src}: ${error.message}`); }
    if (!image.complete || !image.naturalWidth || !image.naturalHeight) {
      throw new Error(`Image has no decoded pixels: ${image.currentSrc || image.src}`);
    }
  };
  await Promise.all([...document.images].map(decode));
  const backgrounds = new Set();
  for (const element of document.querySelectorAll("#app *")) {
    for (const pseudo of [null, "::before", "::after"]) {
      const style = getComputedStyle(element, pseudo);
      for (const value of [style.backgroundImage, style.maskImage, style.borderImageSource, style.listStyleImage, style.content]) {
        for (const [, url] of value.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
          backgrounds.add(new URL(url, document.baseURI).href);
        }
      }
    }
  }
  for (const icon of document.querySelectorAll('link[rel~="icon"]')) backgrounds.add(icon.href);
  await Promise.all([...backgrounds].map(url => {
    const image = new Image();
    image.src = url;
    return decode(image);
  }));
  signal.throwIfAborted();
  checkErrors();
}

export function mountTabSequence(app) {
  const listeners = new AbortController();
  const { signal } = listeners;
  let panel;
  const dispose = () => { listeners.abort(); panel?.remove(); };
  const inventory = app.querySelector(".navigator-hero > div:last-child");
  if (inventory) {
    const launcher = document.createElement("section");
    launcher.className = "tab-sequence-launcher";
    launcher.innerHTML = `<h2>Try five tabs</h2><p>Load sites 1–5 in order, keeping every tab open. This tab becomes site 1; each ready page opens the next.</p><button type="button" class="button dark">Start five-tab sequence</button><p>Allow popups for this site in Safari or Edge. Your browser decides whether new tabs become active. A blocked tab can be opened with Continue.</p><p role="alert" hidden></p>`;
    inventory.append(launcher);
    launcher.querySelector("button").addEventListener("click", () => {
      try {
        const run = crypto.randomUUID();
        localStorage.setItem(storageKey, JSON.stringify({ run, opened: [1], stopped: false }));
        location.assign(sequenceUrl(location.href, run, 1));
      } catch (error) {
        const message = launcher.querySelector('[role="alert"]');
        message.hidden = false;
        message.textContent = `Cannot start the trial: ${error.message}`;
        console.error("Five-tab sequence could not start", error);
      }
    }, { signal });
  }
  let config;
  try { config = sequenceConfig(location.href); }
  catch (error) {
    console.error("Invalid five-tab sequence", error);
    panel = document.createElement("aside");
    panel.className = "tab-sequence-panel";
    panel.setAttribute("role", "alert");
    panel.textContent = error.message;
    document.body.append(panel);
    return dispose;
  }
  if (!config) return dispose;
  const { run, step } = config;
  if (location.hash !== `#/site/${step}` && location.hash !== `#/site/${step}/home`) {
    try {
      const trial = readTrial(window, run);
      trial.stopped = true;
      localStorage.setItem(storageKey, JSON.stringify(trial));
      const url = new URL(location.href);
      url.searchParams.delete("tab-sequence");
      url.searchParams.delete("tab-step");
      history.replaceState(null, "", url);
    } catch (error) { console.error("Could not stop the trial after navigation", error); }
    panel = document.createElement("aside");
    panel.className = "tab-sequence-panel";
    panel.setAttribute("role", "status");
    panel.textContent = "Sequence stopped because you navigated away. Existing tabs stay open.";
    document.body.append(panel);
    return dispose;
  }
  panel = document.createElement("aside");
  panel.className = "tab-sequence-panel";
  panel.setAttribute("aria-label", "Five-tab sequence");
  panel.innerHTML = `<strong>Five-tab trial · page ${step} of 5</strong><p role="status" aria-live="polite">Checking document, stylesheets, fonts and images…</p><div><button type="button" data-continue hidden>Continue to page ${step + 1}</button><button type="button" data-stop>Stop sequence</button></div>`;
  document.body.append(panel);
  const status = panel.querySelector('[role="status"]');
  const next = panel.querySelector("[data-continue]");
  const stop = panel.querySelector("[data-stop]");
  let deadline;
  const stopped = message => {
    clearTimeout(deadline);
    status.textContent = message;
    panel.dataset.state = "stopped";
    next.hidden = true;
    stop.disabled = true;
    listeners.abort();
  };
  const fail = error => {
    console.error("Five-tab sequence stopped", error);
    try {
      const trial = readTrial(window, run);
      trial.stopped = true;
      localStorage.setItem(storageKey, JSON.stringify(trial));
    } catch (storageError) { console.error("Could not persist the stopped trial", storageError); }
    stopped(`Stopped: ${error.message}`);
  };
  stop.addEventListener("click", () => {
    try {
      const trial = readTrial(window, run);
      trial.stopped = true;
      localStorage.setItem(storageKey, JSON.stringify(trial));
      stopped("Sequence stopped. All existing tabs stay open.");
    } catch (error) { fail(error); }
  }, { signal });
  window.addEventListener("storage", event => {
    if (event.key !== storageKey) return;
    try {
      if (readTrial(window, run).stopped) stopped("Sequence stopped. All existing tabs stay open.");
    } catch (error) { stopped(error.message); }
  }, { signal });
  const advance = () => {
    if (signal.aborted) return;
    try {
      checkErrors();
      const result = openNextTab(window, config);
      panel.dataset.state = result;
      next.hidden = result !== "blocked";
      if (result === "blocked") {
        status.textContent = `Page ${step} passed its loading checks. Your browser blocked the next tab. Allow popups, or click Continue.`;
      } else if (result === "finished") {
        status.textContent = "Site 5 passed its loading checks. The five-tab sequence is complete.";
      } else if (result === "stopped") {
        stopped("Sequence stopped. All existing tabs stay open.");
      } else {
        status.textContent = `Page ${step} passed its loading checks. Page ${step + 1} ${result === "opened" ? "opened" : "was already opened"} in another tab.`;
      }
    } catch (error) { fail(error); }
  };
  next.addEventListener("click", advance, { signal });
  try {
    const trial = readTrial(window, run);
    if (trial.stopped) { stopped("This sequence has been stopped. Start a new trial from Quick navigate."); return dispose; }
    deadline = setTimeout(() => fail(new Error("Loading checks did not complete within 45 seconds.")), 45000);
    waitUntilReady(step, signal).then(() => {
      clearTimeout(deadline);
      advance();
    }, error => { if (!signal.aborted) fail(error); });
  } catch (error) { fail(error); }
  return () => {
    clearTimeout(deadline);
    if (!signal.aborted && location.hash !== `#/site/${step}` && location.hash !== `#/site/${step}/home`) {
      try {
        const trial = readTrial(window, run);
        trial.stopped = true;
        localStorage.setItem(storageKey, JSON.stringify(trial));
      } catch (error) { console.error("Could not stop the trial after navigation", error); }
    }
    dispose();
  };
}
