import { pages } from "./pages.js?v=serial-97-v1";
import { sequenceUrl, storageKey, readRun } from "./sequence.js?v=serial-97-v1";

const status = document.querySelector("#launch-status");
const start = document.querySelector("#start");
const stop = document.querySelector("#stop");

function update() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (!saved) return;
    const state = readRun(window, saved.run);
    stop.disabled = state.stopped || state.complete === true;
    status.textContent = state.error ? `Stopped: ${state.error}` : state.stopped
      ? "Stopped. Existing site tabs remain open." : state.complete
        ? `All ${state.ready.length} opened pages passed their loading checks.`
        : `${state.ready.length} of ${pages.length} pages passed loading checks; ${state.opened.length} site tabs opened.`;
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
update();
if (new URL(location.href).searchParams.get("autostart") === "1") startRun();
