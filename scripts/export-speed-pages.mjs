import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { pages } from "../speed/pages.js";
import { sitesA } from "../sites-a.js";
import { sitesB } from "../sites-b.js";
import { bridge } from "../sites/bridge.js";

const sites = [...sitesA, ...sitesB, bridge];
const escapeHtml = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export function speedDocuments() {
  const source = readFileSync(new URL("../index.html", import.meta.url), "utf8").replaceAll("\r\n", "\n");
  const sharedHead = /<head>([\s\S]*?)<\/head>/.exec(source)[1].replace(/<link\b[^>]*>/g,
    tag => /\bhref="https:\/\/fonts\.(?:googleapis|gstatic)\.com\b/.test(tag) ? "" : tag);
  const observedHead = sharedHead.replace("</style>", '</style><script src="speed/errors.js"></script>');
  if (observedHead === sharedHead) throw new Error("The early dark canvas must precede the speed error observer.");
  const head = (title, description) => `<base href="../" />${observedHead
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(description)}" />`)}<link rel="stylesheet" href="speed/system-fonts.css?v=compact-light-v1" />`;
  const documents = pages.map(page => {
    const site = sites.find(item => item.id === page.site);
    return [page.file,
      `<!doctype html><html lang="en"><head>${head(`${site.siteName} — Lisbon Atlas`, site.description)}</head><body data-speed-page="${page.step}"><div id="app"></div><script type="module" src="speed/entry.js?v=dark-v1"></script></body></html>\n`];
  });
  for (let site = 1; site <= bridge.id; site++) {
    const file = `site-${String(site).padStart(2, "0")}.css`;
    // Both directories are one level deep, so image URLs keep their original base.
    const css = readFileSync(new URL(`../sites/${file}`, import.meta.url), "utf8").replaceAll("\r\n", "\n")
      .replace(/@import\s+url\(\s*(["'])https:\/\/fonts\.googleapis\.com\/[^"']+\1\s*\)\s*;\s*/g, "")
      .replace(/\n+$/, "\n");
    if (/fonts\.(?:googleapis|gstatic)\.com|@font-face/i.test(css)) throw new Error(`${file} still contains a downloaded font dependency.`);
    documents.push([file, css]);
  }
  documents.push(["index.html", `<!doctype html><html lang="en"><head>${head("Lisbon Atlas — Speed launcher", "Open the Lisbon collection in a separate browser sequence.")}<link rel="stylesheet" href="speed/launcher.css" /></head><body><main class="speed-launcher"><h1>Open the Lisbon collection</h1><p>Open Home, Detail, About and Offerings for each of the 30 sites, in that order, then finish at Dom Luís I Bridge. Each page opens the next only after its loading checks pass. All ${pages.length} site tabs stay open; this launcher stays separate.</p><p>Allow popups for this site in Safari or Edge before starting. Your browser controls whether each new tab becomes active. There are no counters, banners or demo controls on the site pages.</p><div class="launch-actions"><button id="start" class="button dark" type="button">Start ${pages.length}-page sequence</button><button id="stop" class="button ghost" type="button" disabled>Stop opening tabs</button></div><p id="launch-status" role="status" aria-live="polite">Ready to start. A loading failure or blocked tab stops the run and is reported here.</p><p><a href="./#/navigate">Return to the original sites</a></p></main><script type="module" src="speed/launcher.js?v=bridge-v1"></script></body></html>\n`]);
  return documents;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  mkdirSync(new URL("../speed/", import.meta.url), { recursive: true });
  for (const [file, html] of speedDocuments()) {
    const path = new URL(`../speed/${file}`, import.meta.url);
    if (process.argv.includes("--check")) {
      if (readFileSync(path, "utf8").replaceAll("\r\n", "\n") !== html) throw new Error(`${file} is stale. Run node scripts\\export-speed-pages.mjs.`);
    } else writeFileSync(path, html);
  }
  console.log(`${pages.length} independent site documents, ${bridge.id} font-independent stylesheets and the launcher are up to date.`);
}
