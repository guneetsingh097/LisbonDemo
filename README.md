# Lisbon Atlas

Lisbon Atlas is a portable static Microsoft Edge/Copilot travel corpus for planning a trip to Lisbon, Portugal. It contains 30 independent travel websites, a quick navigation hub, a cross-source relationship matrix, standards/source documentation, and a full-bleed looping aerial video page.

## What is included

- 30 travel websites with bespoke layouts, type systems, colors, voices, and navigation patterns.
- 210 core site pages: home, about, offerings, resources, detail guide, FAQ, and contact for every property.
- A quick navigator at `#/navigate`.
- A relationship matrix at `#/matrix`.
- A custom full-bleed looping 4K player at `#/watch`, with a 4K badge, accessible buffer progress, and Play/Retry actions.
- Bundled media and attribution files:
  - `IMAGE-ATTRIBUTION.md`
  - `IMAGE-ATTRIBUTION.csv`
- Public URL inventory: `PUBLIC-URLS.csv`.
- CELA-aligned approved company/domain/contact data.

## CELA alignment notes

- Company names and domains use the approved company/domain list.
- Portuguese personal names use the approved Portuguese-name list.
- Contact emails use a first-name-only username on an approved domain, for example `raquel@contososuites.com`.
- International phone numbers are sequential numbers: `+351 210 000 001` through `+351 210 000 030`.
- No street addresses are currently used. If addresses are added later, use sequential numbers, common street names, and intentionally incorrect postal codes.
- Logos are stylized logotypes of the approved company name or non-descript functional marks.
- All commercial properties, people, schedules, prices, comments, policies, and services are travel-planning content.

## Run locally

This is a static site. No build step is required.

```powershell
node server.mjs
```

Then open:

```text
http://localhost:4173
```

ES modules should be served over HTTP; do not open `index.html` directly with a `file://` URL.

Run the built-in media, path, HTTP-range, and playback-state checks with `node --test tests\video.test.mjs`. The local server supports byte-range requests and HEAD responses for MP4 playback.

The watch player uses replacement Getty Images asset **2210663321**, selected by the owner for more visible motion, from `https://storage.googleapis.com/lisbongettyguneet/GettyImages-2210663321-4k-40mbps.mp4`. It preserves the full **46.52-second** duration, **3840x2160** resolution, **25 fps**, and all **1,163 frames**. Playback speed is unchanged. This project re-encoded it as H.264/yuv420p at a 40 Mbps target, 45 Mbps maximum VBV rate, and 80 Mb VBV buffer, using libx264's fast preset and two-second keyframe spacing. Its measured average is **40.61 Mbps**, and its size is **236,136,432 bytes**, about **80% smaller** than the 1,160,359,393-byte source MOV. Faststart metadata precedes media data, and Google Storage serves `video/mp4` with byte ranges. The file passed full decoding verification.

This is still 4K, but is **not the unchanged original encoding**: compression can affect detail and decoding/memory workload. Network demand is substantially lower, not eliminated; playback can still buffer on a slow connection. The original 2,199,230,526-byte file remains available at `https://storage.googleapis.com/lisbongettyguneet/GettyImages-2267015510.mp4`. Neither hosted Getty file is bundled in Git. The owner confirmed a license permitting public website use; the license agreement and contributor credit were not supplied for independent review. Google Cloud delivery charges/allowances apply. Playback requires internet access and public object availability. The smaller Pexels clip below remains bundled as a previous version, but is not automatically substituted if Getty playback fails.

A non-interactive **4K** badge stays in the player's top-left corner, with an accessible "4K Ultra HD video" label. It does not alter playback or buffering.

**Current watch behavior:** `#/watch` uses the restored custom full-bleed player with the lighter Google Storage MP4, 4K badge, buffer gate, and Play/Retry actions. It plays muted and loops automatically. It streams progressively rather than waiting for a full download.

The player waits for **4 contiguous seconds ahead of the current position** at startup and recovery after a stall (or the remaining duration near the end). Its loading label reports seconds ready; the progress bar reports total buffered duration. If the browser suspends preloading below the target, an explicit Play action lets the user proceed with the available buffer. Browser buffering, cache eviction, and decoding capabilities remain device-dependent.

## Compact demo windows

All 30 properties adapt below 980 CSS pixels for side-by-side demos as well as phones. A compact masthead replaces tall desktop rails while retaining each site's colors and typography. All seven page routes remain available in a horizontally scrollable navigation strip, with a current-page indicator, keyboard focus, and a skip-to-content link. At 560–980 pixels, suitable content uses two columns; narrower windows return to one column. Tables have named, keyboard-focusable scroll regions rather than overflowing the page. Full-width desktop layouts and the video page are unchanged.

The compact layout is tuned for the approximately **660×320 CSS-pixel** browser content area in the demo screenshot, not by scaling or zooming the page. The shared overrides live in `sites/compact.css`, loaded after each property's stylesheet. `prepareCompactSite` in `app.js` wires the compact navigation and table regions for all 210 property pages.

`tests/compact.browser.js` is a Playwright page-function regression check. With the site running on port 4187, execute it through Playwright's `browser_run_code_unsafe` file input. It visits all 210 pages at 660×320, 800×400, 390×844, 320×568, and 1440×900, checks overflow, content position, navigation states/target sizes, image paths, table regions, and keyboard skip/navigation behavior. These viewport checks do not claim testing on physical mobile devices.

## Deploy anywhere

Upload the repository contents to any static host that can serve files with normal MIME types:

- GitHub Pages
- Azure Static Web Apps
- Azure Blob static website hosting
- Netlify
- Vercel static output
- IIS, Nginx, Apache, or any CDN-backed file host

The app uses hash routing (`#/site/1`, `#/watch`, `#/navigate`), so it does not require server-side rewrite rules and works under any domain or subpath.

Required MIME types:

- `.html` -> `text/html`
- `.js` -> `text/javascript` or `application/javascript`
- `.css` -> `text/css`
- `.jpg` -> `image/jpeg`
- `.mp4` -> `video/mp4` (HTTP byte-range support is recommended for seeking and efficient buffering)
- `.csv` -> `text/csv`
- `.md` -> `text/markdown` or `text/plain`

## GitHub Pages

For GitHub Pages, publish the `main` branch from the repository root (`/`). After Pages is enabled, open:

```text
https://<owner>.github.io/<repo>/
```

Because all app navigation uses hash routes, deep links such as `https://<owner>.github.io/<repo>/#/watch` work without extra configuration.

## Key files

- `index.html` — static shell
- `app.js` — router, portal, navigator, matrix, docs, and video page
- `styles.css` — shared portal/docs/video styles
- `sites-a.js`, `sites-b.js` — structured data for all 30 sites
- `sites/` — 30 bespoke site renderers and scoped CSS files
- `images/`, `images-pexels/` — bundled referenced image assets only
- `videos/lisbon-aerial-4823566-4k-loop.mp4` — a late 30.096733-second section of the original Pexels clip, stream-copied into a faststart MP4 without re-encoding
- `PUBLIC-URLS.csv` — public URL inventory
- `server.mjs` — tiny local static server

## Licensing and attribution

Written content is original travel content. Bundled external media is documented in `IMAGE-ATTRIBUTION.md` and `IMAGE-ATTRIBUTION.csv`. Pexels media is included under the Pexels License; Wikimedia Commons media retains the individual license noted in the attribution ledger.

## 4K loop asset

The original Pexels video #4823566 is 202.168633 seconds and 611,641,290 bytes. Its first quarter, remuxed without re-encoding, is 155,016,177 bytes and exceeds GitHub's individual-file limit. The requested loop was therefore shortened further, rather than changing codec, bitrate, resolution, or frame rate.

The bundled clip uses source footage starting at **150.150 seconds** and lasting **30.096733 seconds**, ending before the final Cristo Rei statue shot. The literal ending also features the statue, so a late section showing Belém Tower, Pena Palace, the river, and Lisbon rooftops is used instead.

The bundled clip is **90,460,023 bytes** (90.46 MB / 86.27 MiB), **3840×2160**, H.264 High profile, level 5.2, yuv420p, **30000/1001 fps**, and has no audio, like the source. Its 902 encoded video packets match the original source starting at packet 4500; only the selected time range and MP4 packaging change. `moov` metadata precedes `mdat` media (`+faststart`), so the browser can start before downloading the whole file. No byte chunks or Blob reassembly are required.

Reproduce it from the reassembled original source with FFmpeg:

```powershell
ffmpeg -ss 150.150 -i lisbon-source.mp4 -t 30.03 -map 0:v:0 -c copy -movflags +faststart videos\lisbon-aerial-4823566-4k-loop.mp4
ffprobe -v error -show_format -show_streams -of json videos\lisbon-aerial-4823566-4k-loop.mp4
```

The actual cut is 30.096733 seconds because stream-copy retains encoded frame/reordering boundaries. This is intentionally shorter than 25% of the source after the user prioritized unchanged encoding and a GitHub-safe file. The overlay's percentage measures buffered **duration**, not downloaded bytes, and disappears when playback starts; it returns if playback needs to buffer. Device/browser decoding and buffering policies still affect resource use, so identical hardware performance or memory consumption across devices is not guaranteed.

Clip SHA-256: `fb1ab0196ac12b14097626fe0f4b952fb50386bf3ca4bd62e923622a995e7d42`.
