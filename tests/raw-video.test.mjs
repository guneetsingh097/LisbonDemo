import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const source = readFileSync("raw-video.js", "utf8").replace(/^export /gm, "");
const url = "https://storage.googleapis.com/lisbongettyguneet/GettyImages-2270002248.mp4";

test("raw route opens the exact supplied MP4 directly with no playback code", () => {
  let destination;
  const result = runInNewContext(`${source}\nopenRawVideo();`, {
    location: { hash: "#/watch/raw", replace: value => { destination = value; } },
  });
  assert.equal(result, true);
  assert.equal(destination, url);
  assert.doesNotMatch(source, /document|play\(|setInterval|setTimeout|fetch|iframe/);
  assert.ok(readFileSync("app.js", "utf8").includes(`src="${url}"`));
});

test("ordinary routes remain in the site instead of redirecting", () => {
  for (const hash of ["", "#/", "#/watch", "#/navigate", "#/watch/other",
    ...Array.from({ length: 30 }, (_, i) => `#/site/${i + 1}`)]) {
    assert.equal(runInNewContext(`${source}\nopenRawVideo();`, {
      location: { hash, replace: () => { throw new Error(`Unexpected redirect: ${hash}`); } },
    }), false);
  }
});

test("direct raw entry bypasses app imports and in-app hash navigation checks raw first", () => {
  const html = readFileSync("index.html", "utf8");
  const entry = /<script type="module">([^<]+)<\/script>/.exec(html)?.[1];
  assert.ok(entry);
  assert.match(entry, /import \{ openRawVideo \} from "\.\/raw-video\.js"/);
  const bootstrap = entry.replace(/import \{ openRawVideo \} from "[^"]+";\s*/, "")
    .replace(/import\(/g, "loadApp(");
  for (const raw of [true, false]) {
    let imported = 0;
    runInNewContext(bootstrap, { openRawVideo: () => raw, loadApp: () => { imported++; } });
    assert.equal(imported, raw ? 0 : 1);
  }
  const app = readFileSync("app.js", "utf8");
  assert.match(app, /function renderRoute\(\) \{\s*if \(openRawVideo\(\)\) return;/);
  assert.ok(app.indexOf("if (openRawVideo()) return;") < app.lastIndexOf("  route();"));
});
