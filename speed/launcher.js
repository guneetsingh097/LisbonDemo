import { pages } from "./pages.js?v=bridge-v1";
import { openFirstBatch, storageKey, readRun } from "./sequence.js?v=batch-three-v1";

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
    if (!navigator.locks) throw new Error("This browser cannot safely coordinate parallel tabs. Use a current Safari or Edge version on HTTPS.");
    openFirstBatch(window, run);
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
