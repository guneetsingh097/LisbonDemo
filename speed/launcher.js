import { pages } from "./pages.js?v=porto-v1";
import { sequenceUrl, storageKey, readRun } from "./sequence.js?v=porto-v1";
import { readRunLog } from "./run-log.js?v=porto-v1";

const status = document.querySelector("#launch-status");
const start = document.querySelector("#start");
const stop = document.querySelector("#stop");
const download = document.querySelector("#download-log");

function update() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (!saved) return;
    const state = readRun(window, saved.run);
    download.disabled = false;
    const log = readRunLog(window, state);
    const warnings = log.reports.filter(report => report.events.length
      || report.readiness?.failed?.length || report.readiness?.pending?.length
      || ["timeout-below-threshold", "photos-failed-below-threshold"].includes(report.readiness?.reason)).length;
    stop.disabled = state.stopped || state.complete === true;
    status.textContent = state.error ? `Stopped: ${state.error}` : state.stopped
      ? "Stopped. Existing site tabs remain open." : state.complete
        ? `All ${state.ready.length} site tabs opened; the bridge passed its full loading checks.`
        : `${state.ready.length} of ${pages.length} pages advanced; ${state.opened.length} site tabs opened.`;
    if (warnings) status.textContent += ` ${warnings} page(s) have incomplete content or logged issues. Download the run log for details.`;
  } catch (error) {
    status.textContent = `Cannot read the run: ${error.message}`;
    console.error("Cannot read the speed run", error);
  }
}

function startRun() {
  try {
    const run = crypto.randomUUID();
    localStorage.setItem(storageKey, JSON.stringify({ run, opened: [1], ready: [], stopped: false, complete: false }));
    let tab;
    try {
      tab = window.open(sequenceUrl(new URL("speed/", document.baseURI), run, 1), `lisbon-speed-${run}-1`);
    } catch (error) {
      localStorage.removeItem(storageKey);
      throw error;
    }
    if (!tab) {
      localStorage.removeItem(storageKey);
      throw new Error("The first tab was blocked. Allow popups for this site, then select Start again.");
    }
    try { tab.focus(); }
    catch (error) { console.warn("The browser did not allow the first tab to become active", error); }
    update();
  } catch (error) {
    status.textContent = `Cannot start: ${error.message}`;
    console.error("Cannot start the speed run", error);
  }
}
start.addEventListener("click", startRun);
stop.addEventListener("click", () => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (!saved) throw new Error("There is no active run.");
    const state = readRun(window, saved.run);
    state.stopped = true;
    localStorage.setItem(storageKey, JSON.stringify(state));
    update();
  } catch (error) {
    status.textContent = `Cannot stop: ${error.message}`;
    console.error("Cannot stop the speed run", error);
  }
});
window.addEventListener("storage", event => { if (event.key === storageKey) update(); });
window.addEventListener("storage", event => { if (event.key?.startsWith("lisbon-speed-log-v1:")) update(); });
download.addEventListener("click", () => {
  let url;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (!saved) throw new Error("There is no run to export.");
    const state = readRun(window, saved.run);
    const log = readRunLog(window, state);
    url = URL.createObjectURL(new Blob([JSON.stringify(log, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `porto-speed-${state.run}.json`;
    link.click();
  } catch (error) {
    status.textContent = `Cannot download the run log: ${error.message}`;
    console.error("Cannot download the speed run log", error);
  } finally {
    if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
});
update();
if (new URL(location.href).searchParams.get("autostart") === "1") startRun();
