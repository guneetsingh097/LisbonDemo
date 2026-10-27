import { pageForStep, pageFromUrl, pages } from "./pages.js?v=porto-v1";
import { checkErrors, waitUntilReady, waitUntilPartlyReady } from "./readiness.js?v=porto-v1";

export const storageKey = "lisbon-speed-sequence-v1";

export function sequenceUrl(base, run, step) {
  if (!/^[\da-f-]{36}$/i.test(run)) throw new Error("Invalid speed run identifier.");
  const url = new URL(pageForStep(step).file, base);
  url.searchParams.set("speed-run", run);
  return url.href;
}

export function sequenceConfig(href) {
  const url = new URL(href);
  if (!url.searchParams.has("speed-run")) return null;
  const run = url.searchParams.get("speed-run") || "";
  const page = pageFromUrl(href);
  const selected = pages.find(item => item.file === page.file);
  if (!selected) throw new Error("This page is not part of the 97-tab run. Start again from the launcher.");
  sequenceUrl(href, run, selected.step);
  return { run, step: selected.step };
}

export function readRun(win, run) {
  const state = JSON.parse(win.localStorage.getItem(storageKey) || "null");
  if (!state || state.run !== run) throw new Error("This run is no longer active. Start again from the launcher.");
  const isPrefix = value => Array.isArray(value) && value.length <= pages.length
    && value.every((step, index) => step === index + 1);
  if (!isPrefix(state.opened) || !isPrefix(state.ready) || !state.opened.length
    || state.ready.length > state.opened.length || typeof state.stopped !== "boolean") {
    throw new Error("The saved sequence is invalid. Start again from the launcher.");
  }
  return state;
}

export function recordReady(win, { run, step }) {
  const state = readRun(win, run);
  if (state.stopped) return false;
  if (!state.opened.includes(step)) throw new Error("This page was not opened by the active run.");
  if (!state.ready.includes(step)) {
    if (state.ready.length !== step - 1) throw new Error("A preceding page has not passed its loading checks.");
    state.ready.push(step);
    win.localStorage.setItem(storageKey, JSON.stringify(state));
  }
  return true;
}

export function openNextTab(win, { run, step }) {
  const state = readRun(win, run);
  if (state.stopped) return "stopped";
  if (!state.ready.includes(step)) throw new Error("This page has not passed its loading checks.");
  if (step === pages.length) {
    state.complete = true;
    win.localStorage.setItem(storageKey, JSON.stringify(state));
    return "finished";
  }
  if (state.opened.includes(step + 1)) return "already-opened";
  state.opened.push(step + 1);
  win.localStorage.setItem(storageKey, JSON.stringify(state));
  let tab;
  try {
    tab = win.open(sequenceUrl(win.location.href, run, step + 1), `lisbon-speed-${run}-${step + 1}`);
  } catch (error) {
    state.opened.pop();
    win.localStorage.setItem(storageKey, JSON.stringify(state));
    throw error;
  }
  if (!tab) {
    state.opened.pop();
    win.localStorage.setItem(storageKey, JSON.stringify(state));
    throw new Error(`The browser blocked page ${step + 1}. Allow popups for this site and start a new run from the launcher.`);
  }
  try { tab.focus(); }
  catch (error) { win.console.warn("The browser did not allow the new tab to become active", error); }
  return "opened";
}

export function mountSpeedSequence(page) {
  const listeners = new AbortController();
  const { signal } = listeners;
  let deadline;
  let config;
  let advanced = false;
  let latestReadiness;
  const dispose = () => { clearTimeout(deadline); listeners.abort(); };
  const fail = error => {
    console.error("Speed sequence stopped", error);
    if (config) {
      try {
        const state = readRun(window, config.run);
        state.stopped = true;
        state.error = `${location.href}\n${error.message}`;
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (storageError) { console.error("Could not persist the stopped run", storageError); }
    }
    dispose();
  };
  try {
    config = sequenceConfig(location.href);
    if (!config) return dispose;
    const expected = pageForStep(config.step);
    if (expected.site !== page.site || expected.section !== page.section) throw new Error("The page does not match the active sequence URL.");
    if (readRun(window, config.run).stopped) return dispose;
    const strict = page.site === 31;
    const report = readiness => {
      latestReadiness = readiness;
      window.lisbonSpeedReport({ readiness });
    };
    const advance = () => {
      clearTimeout(deadline);
      if (signal.aborted || advanced) return;
      try {
        if (strict) checkErrors();
        if (recordReady(window, config)) openNextTab(window, config);
        advanced = true;
        // Keep observing late resource failures and decodes in the retained tab.
      } catch (error) { fail(error); }
    };
    window.addEventListener("storage", event => {
      if (event.key !== storageKey) return;
      try { if (readRun(window, config.run).stopped) dispose(); }
      catch (error) { console.warn("Speed sequence no longer active", error); dispose(); }
    }, { signal });
    window.addEventListener("pagehide", dispose, { once: true, signal });
    deadline = setTimeout(() => {
      if (strict) return fail(new Error("Loading checks did not complete within 45 seconds."));
      try {
        report({ ...latestReadiness, reason: "timeout-below-threshold" });
        window.lisbonSpeedReport({ event: { type: "warning", message: "50% photo threshold not reached within 45 seconds; continuing with incomplete content." } });
        advance();
      } catch (error) { fail(error); }
    }, 45000);
    const pending = strict ? waitUntilReady(page, signal) : waitUntilPartlyReady(page, signal, report);
    pending.then(() => {
      if (strict) report({ policy: "strict", reason: "all-resources-loaded" });
      advance();
    }, error => { if (!signal.aborted) fail(error); });
  } catch (error) { fail(error); }
  return dispose;
}
