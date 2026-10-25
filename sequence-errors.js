if (new URLSearchParams(location.search).has("tab-sequence")) {
  window.lisbonSequenceErrors = [];
  window.addEventListener("error", event => {
    const target = event.target;
    window.lisbonSequenceErrors.push(event.message
      || `Resource failed: ${target.currentSrc || target.src || target.href || target.tagName}`);
  }, true);
  window.addEventListener("unhandledrejection", event => {
    window.lisbonSequenceErrors.push(`Unhandled error: ${event.reason?.message || event.reason}`);
  });
}
