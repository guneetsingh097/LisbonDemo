import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { pages } from "../speed/pages.js";
import { sitesA } from "../sites-a.js";
import { sitesB } from "../sites-b.js";

const sites = [...sitesA, ...sitesB];
const escapeHtml = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export function speedDocuments() {
  const source = readFileSync(new URL("../index.html", import.meta.url), "utf8").replaceAll("\r\n", "\n");
  const sharedHead = /<head>([\s\S]*?)<\/head>/.exec(source)[1];
  const head = (title, description) => `<base href="../" /><script src="speed/errors.js"></script>${sharedHead
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(description)}" />`)}`;
  const documents = pages.map(page => {
    const site = sites.find(item => item.id === page.site);
    return [page.file,
      `<!doctype html><html lang="en"><head>${head(`${site.siteName} — Lisbon Atlas`, site.description)}</head><body data-speed-page="${page.step}"><div id="app"></div><script type="module" src="speed/entry.js"></script></body></html>\n`];
  });
  documents.push(["index.html", `<!doctype html><html lang="en"><head>${head("Lisbon Atlas — Speed launcher", "Open the Lisbon collection in a separate browser sequence.")}<link rel="stylesheet" href="speed/launcher.css" /></head><body><main class="speed-launcher"><h1>Open the Lisbon collection</h1><p>Open Home, Detail, About and Offerings for each of the 30 sites, in that order. Each page opens the next only after its loading checks pass. All 120 site tabs stay open; this launcher stays separate.</p><p>Allow popups for this site in Safari or Edge before starting. Your browser controls whether each new tab becomes active. There are no counters, banners or demo controls on the site pages.</p><div class="launch-actions"><button id="start" class="button dark" type="button">Start 120-page sequence</button><button id="stop" class="button ghost" type="button" disabled>Stop opening tabs</button></div><p id="launch-status" role="status" aria-live="polite">Ready to start. A loading failure or blocked tab stops the run and is reported here.</p><p><a href="./#/navigate">Return to the original sites</a></p></main><script type="module" src="speed/launcher.js"></script></body></html>\n`]);
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
  console.log("120 independent site documents and the separate launcher are up to date.");
}
