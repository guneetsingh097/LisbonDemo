import { renderSpeedPage } from "../app.js?v=bridge-photos-v2";
import { pageFromUrl, pages } from "./pages.js?v=bridge-v1";
import { mountSpeedSequence, sequenceConfig, readRun, storageKey } from "./sequence.js?v=bridge-v1";

const page = pageFromUrl(location.href);
if (Number(document.body.dataset.speedPage) !== page.step) throw new Error("The standalone document has the wrong page identifier.");
renderSpeedPage(page.site, page.section);

// A real base path keeps all original image, font and stylesheet references intact.
for (const link of document.querySelectorAll('#app a[href^="#"]')) {
  const hash = link.getAttribute("href");
  if (!hash.startsWith("#/")) {
    const url = new URL(location.href);
    url.hash = hash;
    link.href = url.href;
    continue;
  }
  const [, site, section = "home"] = /^#\/site\/(\d+)(?:\/([^/]+))?$/.exec(hash) || [];
  const target = pages.find(item => item.site === Number(site) && item.section === section);
  link.href = target ? new URL(`speed/${target.file}`, document.baseURI).href
    : new URL(hash, document.baseURI).href;
}

document.addEventListener("click", event => {
  const link = event.target.closest("a");
  if (!link || link.target === "_blank" || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const destination = new URL(link.href);
  if (destination.origin === location.origin && destination.pathname === location.pathname
    && destination.search === location.search) return;
  const config = sequenceConfig(location.href);
  if (!config) return;
  try {
    const state = readRun(window, config.run);
    state.stopped = true;
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) { console.error("Could not stop the run after navigation", error); }
});

mountSpeedSequence(page);
