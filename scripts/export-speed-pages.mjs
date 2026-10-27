import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { pages, allPages } from "../speed/pages.js?v=heavy90-v1";
import { sitesA } from "../sites-a.js?v=heavy90-v1";
import { sitesB } from "../sites-b.js?v=heavy90-v1";
import { bridge } from "../sites/bridge.js?v=heavy90-v1";

const sites = [...sitesA, ...sitesB, bridge];
const escapeHtml = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export function speedDocuments() {
  const source = readFileSync(new URL("../index.html", import.meta.url), "utf8").replaceAll("\r\n", "\n");
  const sharedHead = /<head>([\s\S]*?)<\/head>/.exec(source)[1].replace(/<link\b[^>]*>/g,
    tag => /\bhref="https:\/\/fonts\.(?:googleapis|gstatic)\.com\b/.test(tag) ? "" : tag);
  const observedHead = sharedHead.replace("</style>", '</style><script src="speed/errors.js?v=heavy90-v1"></script>');
  if (observedHead === sharedHead) throw new Error("The early dark canvas must precede the speed error observer.");
  const head = (title, description) => `<base href="../" />${observedHead
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(description)}" />`)}<link rel="stylesheet" href="speed/system-fonts.css?v=compact-light-v1" />`;
  const documents = allPages.map(page => {
    const site = sites.find(item => item.id === page.site);
    return [page.file,
      `<!doctype html><html lang="en"><head>${head(`${site.siteName} — Porto Atlas`, site.description)}</head><body data-speed-page="${page.step}"><div id="app"></div><script type="module" src="speed/entry.js?v=heavy90-v1"></script></body></html>\n`];
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
  documents.push(["index.html", `<!doctype html><html lang="en"><head>${head("Porto Atlas — Speed launcher", "Open the Porto collection in a separate browser sequence.")}<link rel="stylesheet" href="speed/launcher.css" /></head><body><main class="speed-launcher"><h1>Open the Porto collection</h1><p>Open Home, Detail, About and Offerings for each of the first 24 sites, in that order, then finish at Dom Luís I Bridge. Site pages advance when at least 90% of their photographs have decoded; small icons do not hold up the run. Remaining requests keep loading normally. Resource failures are logged, and a page taking over 45 seconds advances with a warning. The bridge still requires all its images and full loading checks. All ${pages.length} site tabs stay open; this launcher stays separate.</p><p>The 97 site tabs plus your first tab, 4K video and Bing Maps make 100 tabs. This launcher does not open the video or map; use it as your first tab. The remaining sites are still available outside the run.</p><p>Allow popups for this site in Safari or Edge before starting. Your browser controls whether each new tab becomes active. There are no counters, banners or demo controls on the site pages. A blocked tab or application error still stops the run.</p><div class="launch-actions"><button id="start" class="button dark" type="button">Start ${pages.length}-page sequence</button><button id="stop" class="button ghost" type="button" disabled>Stop opening tabs</button><button id="download-log" class="button ghost" type="button" disabled>Download run log</button></div><p id="launch-status" role="status" aria-live="polite">Ready to start. Resource failures and incomplete photographs are recorded in the downloadable JSON run log, including failures arriving after a page advances. Download it before starting another run.</p><p><a href="./#/navigate">Return to the original sites</a></p></main><script type="module" src="speed/launcher.js?v=heavy90-v1"></script></body></html>\n`]);
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
  console.log(`${allPages.length} independent site documents, ${bridge.id} font-independent stylesheets and the ${pages.length}-page launcher are up to date.`);
}
