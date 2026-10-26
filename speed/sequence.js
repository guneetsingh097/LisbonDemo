import { pageForStep, pageFromUrl, pages } from "./pages.js?v=bridge-v1";
import { checkErrors, waitUntilReady } from "./readiness.js?v=media-pilot-v1";

export const storageKey = "lisbon-speed-sequence-v1";
export const batchSize = 3;

function openBatch(win, state) {
  const start = state.opened.length + 1;
  const steps = pages.slice(start - 1, start - 1 + batchSize).map(page => page.step);
  state.opened.push(...steps);
  win.localStorage.setItem(storageKey, JSON.stringify(state));
  let opened = 0;
  let lastTab;
  try {
    for (const step of steps) {
      const tab = win.open(sequenceUrl(win.location.href, state.run, step), `lisbon-speed-${state.run}-${step}`);
      if (!tab) throw new Error(`The browser blocked page ${step}. Allow popups for this site and start a new run from the launcher.`);
      opened++;
      lastTab = tab;
    }
  } catch (error) {
    state.opened = state.opened.slice(0, start - 1 + opened);
    state.stopped = true;
    state.error = error.message;
    win.localStorage.setItem(storageKey, JSON.stringify(state));
    throw error;
  }
  try { lastTab?.focus(); }
  catch (error) { win.console.warn("The browser did not allow the new tab to become active", error); }
}

export function openFirstBatch(win, run) {
  const state = { run, opened: [], ready: [], stopped: false, complete: false };
  sequenceUrl(win.location.href, run, 1);
  openBatch(win, state);
}

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
  sequenceUrl(href, run, page.step);
  return { run, step: page.step };
}

export function readRun(win, run) {
  const state = JSON.parse(win.localStorage.getItem(storageKey) || "null");
  if (!state || state.run !== run) throw new Error("This run is no longer active. Start again from the launcher.");
  const isPrefix = value => Array.isArray(value) && value.length <= pages.length
    && value.every((step, index) => step === index + 1);
  const validReady = Array.isArray(state.ready) && new Set(state.ready).size === state.ready.length
    && state.ready.every(step => state.opened.includes(step));
  if (!isPrefix(state.opened) || !validReady || (!state.opened.length && !state.stopped)
    || typeof state.stopped !== "boolean"
    || (!state.stopped && state.opened.length !== pages.length && state.opened.length % batchSize !== 0)) {
    throw new Error("The saved sequence is invalid. Start again from the launcher.");
  }
  return state;
}

export function recordReady(win, { run, step }) {
  const state = readRun(win, run);
  if (state.stopped) return false;
  if (!state.opened.includes(step)) throw new Error("This page was not opened by the active run.");
  if (!state.ready.includes(step)) {
    state.ready.push(step);
    state.ready.sort((a, b) => a - b);
    win.localStorage.setItem(storageKey, JSON.stringify(state));
  }
  return true;
}

export function openNextTab(win, { run, step }) {
  const state = readRun(win, run);
  if (state.stopped) return "stopped";
  if (!state.ready.includes(step)) throw new Error("This page has not passed its loading checks.");
  const batchEnd = Math.min(Math.ceil(step / batchSize) * batchSize, pages.length);
  if (state.opened.length > batchEnd) return "already-opened";
  if (state.ready.length !== state.opened.length) return "waiting";
  if (state.opened.length === pages.length) {
    state.complete = true;
    win.localStorage.setItem(storageKey, JSON.stringify(state));
    return "finished";
  }
  openBatch(win, state);
  return "opened";
}

export function mountSpeedSequence(page) {
  const listeners = new AbortController();
  const { signal } = listeners;
  let deadline;
  let config;
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
    if (config.step !== page.step) throw new Error("The page does not match the active sequence URL.");
    if (readRun(window, config.run).stopped) return dispose;
    if (!navigator.locks) throw new Error("This browser cannot safely coordinate parallel tabs. Use a current Safari or Edge version on HTTPS.");
    window.addEventListener("storage", event => {
      if (event.key !== storageKey) return;
      try { if (readRun(window, config.run).stopped) dispose(); }
      catch (error) { console.warn("Speed sequence no longer active", error); dispose(); }
    }, { signal });
    window.addEventListener("pagehide", dispose, { once: true, signal });
    deadline = setTimeout(() => fail(new Error("Loading checks did not complete within 45 seconds.")), 45000);
    waitUntilReady(page, signal).then(async () => {
      clearTimeout(deadline);
      if (signal.aborted) return;
      try {
        await navigator.locks.request(`${storageKey}:${config.run}`, { signal }, () => {
          checkErrors();
          if (recordReady(window, config)) openNextTab(window, config);
        });
        dispose();
      } catch (error) { fail(error); }
    }, error => { if (!signal.aborted) fail(error); });
  } catch (error) { fail(error); }
  return dispose;
}
