import { pages } from "./pages.js?v=photo-half-v1";

export function readRunLog(win, state) {
  const reports = pages.flatMap(page => {
    const url = new URL(page.file, win.location.href);
    const saved = JSON.parse(win.localStorage.getItem(`lisbon-speed-log-v1:${url.pathname}`) || "null");
    return saved?.run === state.run ? [{ step: page.step, ...saved }] : [];
  });
  return {
    run: state.run, exportedAt: new Date().toISOString(),
    policy: "Sites: 50% decoded photographs; resource failures and 45-second timeouts continue with warnings. Bridge: all resources required.",
    state, reports,
  };
}
