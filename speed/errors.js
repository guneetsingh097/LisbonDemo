window.lisbonSpeedErrors = [];
window.lisbonSpeedStylesheets = new WeakSet();
document.addEventListener("load", event => {
  if (event.target?.matches?.('link[rel="stylesheet"]')) window.lisbonSpeedStylesheets.add(event.target);
}, true);
const nativeConsoleError = console.error.bind(console);
function recordLoadingError(message) {
  window.lisbonSpeedErrors.push(message);
  const run = new URLSearchParams(location.search).get("speed-run");
  if (!run) return;
  try {
    const state = JSON.parse(localStorage.getItem("lisbon-speed-sequence-v1") || "null");
    if (state?.run !== run) return;
    state.stopped = true;
    state.error = `${location.href}\n${message}`;
    localStorage.setItem("lisbon-speed-sequence-v1", JSON.stringify(state));
  } catch (error) {
    nativeConsoleError("Could not report the loading failure to the launcher", error);
  }
}
window.addEventListener("error", event => {
  const target = event.target;
  recordLoadingError(event.message
    || `Resource failed: ${target?.currentSrc || target?.src || target?.href || target?.tagName}`);
}, true);
window.addEventListener("unhandledrejection", event => {
  recordLoadingError(`Unhandled error: ${event.reason?.message || event.reason}`);
});
console.error = (...args) => {
  recordLoadingError(args.map(value => value?.message || String(value)).join(" "));
  nativeConsoleError(...args);
};
