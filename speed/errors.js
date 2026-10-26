window.lisbonSpeedErrors = [];
window.lisbonSpeedStylesheets = new WeakSet();
document.addEventListener("load", event => {
  if (event.target?.matches?.('link[rel="stylesheet"]')) window.lisbonSpeedStylesheets.add(event.target);
}, true);
const nativeConsoleError = console.error.bind(console);
window.lisbonSpeedReport = ({ event, readiness } = {}) => {
  const run = new URLSearchParams(location.search).get("speed-run");
  if (!run) return;
  const state = JSON.parse(localStorage.getItem("lisbon-speed-sequence-v1") || "null");
  if (state?.run !== run) return;
  const key = `lisbon-speed-log-v1:${location.pathname}`;
  const saved = JSON.parse(localStorage.getItem(key) || "null");
  const report = saved?.run === run ? saved : { run, url: location.href, events: [] };
  if (event) report.events.push({ ...event, time: new Date().toISOString() });
  if (readiness) report.readiness = readiness;
  report.updatedAt = new Date().toISOString();
  localStorage.setItem(key, JSON.stringify(report));
};
function recordLoadingError(message, fatal = true) {
  window.lisbonSpeedErrors.push(message);
  const run = new URLSearchParams(location.search).get("speed-run");
  if (!run) return;
  try {
    const state = JSON.parse(localStorage.getItem("lisbon-speed-sequence-v1") || "null");
    if (state?.run !== run) return;
    window.lisbonSpeedReport({ event: { type: "error", message } });
    if (!fatal && !location.pathname.endsWith("/site-31-home.html")) return;
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
    || `Resource failed: ${target?.currentSrc || target?.src || target?.href || target?.tagName}`,
    !["IMG", "LINK", "VIDEO", "SOURCE"].includes(target?.tagName));
}, true);
window.addEventListener("unhandledrejection", event => {
  recordLoadingError(`Unhandled error: ${event.reason?.message || event.reason}`);
});
if (typeof PerformanceObserver !== "undefined") {
  new PerformanceObserver(list => {
    for (const entry of list.getEntries()) {
      if (entry.responseStatus >= 400) recordLoadingError(`HTTP ${entry.responseStatus}: ${entry.name}`, false);
    }
  }).observe({ type: "resource", buffered: true });
}
console.error = (...args) => {
  recordLoadingError(args.map(value => value?.message || String(value)).join(" "));
  nativeConsoleError(...args);
};
