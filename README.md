# Lisbon Atlas

Lisbon Atlas is a portable static-first Microsoft Edge/Copilot travel corpus for planning a trip to Lisbon, Portugal. It contains 30 independent travel websites, a quick navigation hub, a cross-source relationship matrix, standards/source documentation, and the full-bleed looping **Porto by Drone** video page.

## Deployment and local preview

The approved pilot now extends to **all 30 properties and their seven sections**.
GitHub Pages publishes the root of `main` at
`https://guneetsingh097.github.io/LisbonDemo/`.
Use `http://localhost:4193/?review=safari-playback-v1#/navigate` for the running review preview.
The query forces a fresh document/module load instead of retaining an older hash-route session.

Each property retains its own fonts, palette, editorial voice and source material.
The hotel keeps its date/guest-driven sample stay planner. The other 29 properties
have purpose-specific planning desks on home and offerings: suite/apartment
comparison, dining shortlists, pastry/fado/walking itineraries, a sample-week
events planner, reading queues, workday/access/policy preparation checklists,
and museum, day-trip, surf, seasonal, wine, river, airport and course comparisons.
`PORTFOLIO-EXPERIENCES.csv` lists the actual tool, source section, Getty IDs and
remaining Pexels/other image-path counts for each property. Entries come from existing
renderer content; filters, sorting, selection, comparison, ordering and checkboxes
work locally. Non-fixed price estimates are not treated as fixed budget amounts.
The apartment page's old disconnected filters now lead to the working desk;
its hero search is wired. Public pages now stay in character as fictional travel
brands, with customer-facing ratings, service copy and useful planning guidance
rather than repeated prototype notices.

Selection lasts only for the open page session, including hash navigation.
No provider is contacted, no booking/payment is made, and preparation checks
do not verify accessibility, policy suitability or a real service. Galleries
use existing optimized files with thumbnails, keyboard navigation, Escape and
focus restoration. There is no artificial memory workload or total-Edge-RAM claim.

### Complete Getty photograph replacement

All active photographs across all 30 properties, their galleries, the watch poster
and the source-table thumbnails now use **75 local Getty Creative royalty-free stills**.
The 69 additional downloads replace all **181 original non-Getty photo paths /
453 original rendered occurrences** with similar subjects, reusing existing Getty
stills where genuinely relevant. Public captions show descriptive image titles
and photographer/Getty Images credits; the Photography & Credits page collects
the individual sources and licensing reference. The stock imagery does not
document actual fictional premises, staff, customers, services, accessibility or
current conditions. Inaccurate bridge/estuary captions remain corrected.

The user explicitly approved in-character fictional service details and ratings
for these demos. Prototype/sample/illustrative notices are therefore not part of
the public browsing experience. This does not change the underlying session-only
interactions or create real services. Original provenance and license records
remain unchanged. Caption titles and credits stack in one readable column,
including short desktop quadrants, rather than competing for narrow flex columns.
`tests/public-copy.test.mjs` covers all 210 property sections;
`tests/public-copy.browser.js` checks public copy, caption layout, compact menus
and page overflow at the six established desktop/mobile/quadrant viewport sizes.

Tiny-window acceptance also covers **320x300 and 480x320 content viewports**.
Menus measure the space below their actual header and retain visible keyboard
focus when resized. Gallery toolbars keep 44px controls while putting photographs
before secondary help/source links; photographer credits remain with each image.
In windows at most 400px high, the hotel comparison bar returns to normal flow
instead of covering planner fields. Closing a resized gallery scrolls its return
focus into view. Narrow, short planning launchers share one row without reducing
body text or scaling the page.

The additional acceptance run covered all 210 sections at both tiny sizes
(420 visits), all 30 menus with keyboard navigation and open-menu resizing,
647 purpose-specific interaction assertions across the other 29 sites,
221 hotel checks at four tiny/mobile/desktop sizes, and all five global routes
at both tiny sizes, including actual tram-video playback. The 40 Node tests pass.
Browser harnesses accept `viewports`; the portfolio harness additionally accepts
`sections` for focused route checks and `compactViewport` for interaction/resize
checks. Defaults retain the established six-size coverage. These are browser
content dimensions, not a claim about the user's monitor scaling.

Every detail page was individually checked immediately before normal DOWNLOAD for
the exact Creative ID, Royalty-free, no editorial-only notice, PREMIUM ACCESS and
availability under current agreements. No purchase, visible credit charge or new
terms appeared. New assets **1321502100**, **183319682** and **894870474** used
Medium, their highest offered size; the other 66 new assets used Large. Earlier
coast asset **1315418850** also used Medium. Public research alone was not treated
as proof of entitlement. Discovered CGI candidates were excluded.

The 75 quality-85 JPEG derivatives total **23,787,362 bytes**; each is under 800 KB.
The original six are 1600x1067; new images preserve aspect ratio with a maximum
edge of 1600 pixels, including portraits. Full-resolution originals remain outside
Git. `images-getty/provenance.json` contains source links, credits, release
information, observed download evidence and independently verified original and
derivative dimensions/bytes/SHA256 hashes. No watermarks or Getty preview hotlinks
are used. The user approved deployment of this complete rollout.

`PHOTO-REPLACEMENT-AUDIT.csv` preserves every replaced original slot and its routes;
`GETTY-DOWNLOAD-QUEUE.csv` now records completed downloads. The shared pre-render
replacement registry updates sources, alt text and credits before DOM insertion;
hotel source objects are resolved before dynamic room/gallery construction.
Planning facts are parsed in inert template content, so source-only markup does
not trigger hidden requests for the retired photographs.
`IMAGE-ATTRIBUTION.csv` and `.md` describe active Getty stills and retain video
records. The old Pexels/Wikimedia ledger is preserved separately as
`IMAGE-ATTRIBUTION-LEGACY.csv`; historical photo files remain bundled for traceability
but are not rendered or requested by the active site.

The user approved a dedicated non-private Edge profile outside the repository and
entered credentials directly in Edge. It completed all 69 downloads without another
sign-in. No password, cookie export or session-state file was copied into this
project. Password-manager saving and authenticated persistence across a browser
restart have not been independently verified; Getty may require reauthentication.

Regenerate the audit with `node scripts\export-photo-audit.mjs`; `--check` detects
stale exports and reports remaining non-Getty paths. `scripts\prepare-getty-photos.ps1`
independently verifies source JPEGs and generates web derivatives;
`scripts\install-getty-photos.mjs <metadata-json>` rebuilds provenance/catalog/ledgers
without downloading again. `scripts\download-getty.browser.js` documents the guarded
normal download procedure; do not rerun completed downloads.

Current Getty acceptance: **35 Node tests**, **1,260 property page/viewport visits**
and **30 global page/viewport visits**, with **3,612 decoded image instances**;
no remaining non-Getty photo requests, image failures or reported browser errors
in the passing route batches. The six actual content viewports were 1440x1000,
390x844, 320x568, 960x440, 640x300 and 1280x620, not a claim about the user's
monitor scaling. The 29 portfolio desks passed 577 interaction assertions;
the hotel passed 322 checks, including corrected Getty room-gallery labels.
Global checks confirmed actual watch playback at each size. The initial network
pass exposed the detached-parser requests; the passing batches followed the
inert-template correction. No total-browser memory benchmark was performed.

`MASTER-WEBPAGES.csv` is the complete UTF-8/BOM inventory: **216 canonical pages**
(210 property sections plus six global pages, including the bridge guide), with **30 home aliases** in a
separate column. It distinguishes GitHub Pages URLs from local development
preview URLs. Download it from Quick navigation. Regenerate both inventories
with `node scripts\export-pages.mjs`; use `--check` to detect stale files.
`route-catalog.js` is shared by the router, compact navigation and export.
`PUBLIC-URLS.csv` keeps its compatible format, extended to 36 entries with the bridge guide.

Run `node --test tests\*.test.mjs` for source/model/provenance/inventory checks.
The async Playwright page functions `tests/portfolio.browser.js` (optional
`startId`, `endId`, `phase: "routes"` or `"interactions"`), `tests/globals.browser.js`,
and the hotel checks cover real rendered behavior. They retain errors in their
reports; check both `issues` and `errors`, not only the route count.

### Video title and Windows taskbar limitation

The visible heading, document title, video label and launch-list title now say
**Porto by Drone**. A playing frame of the supplied 3840x2160, 56.389667-second clip
was inspected and shows a yellow Lisbon tram; the video source, playback speed,
buffering, loop and error/Play actions are unchanged. Its poster is the credited
Lisbon Getty tram still, not a frame grab or the previous Mississippi bridge.

The repository supplies one ordinary project-local 16px PNG favicon and no PWA
manifest or Edge launch configuration. No matching Lisbon target process was
observable in the inspected Windows session, so the actual taskbar cause is
**not verified or fixed**. Normal Edge tabs and app/PWA windows can use different
taskbar identities; a website favicon cannot guarantee the operating-system
icon. No Edge logo impersonation, favicon removal, shortcut/pinned setting,
OS setting or separate controller change was made. The smallest next diagnostic
is the actual Edge launch command/mode, not another website icon.

## What is included

- 30 travel websites with bespoke layouts, type systems, colors, voices, and navigation patterns.
- 210 core site pages: home, about, offerings, resources, detail guide, FAQ, and contact for every property.
- A quick navigator at `#/navigate`.
- A relationship matrix at `#/matrix`.
- A custom full-bleed looping 4K player at `#/watch`, with a 4K badge, accessible buffer progress, and Play/Retry actions.
- Bundled media and attribution files:
  - `IMAGE-ATTRIBUTION.md`
  - `IMAGE-ATTRIBUTION.csv`
- Complete page inventory: `MASTER-WEBPAGES.csv`; legacy launch list: `PUBLIC-URLS.csv`.
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

Run `node --test tests\fonts.test.mjs` to check the shared Google Fonts families, weights, HTML escaping, and axis tuple counts in the root document and all 30 site stylesheets. The shared root font link also applies to `#/watch` and the other hash routes. These source checks do not replace live network and font-loading verification after deployment.

Run `node --test tests\resources.test.mjs` to check literal local resource paths and the user-supplied 16x16 `favicon.png`. The shared document links this icon with `./favicon.png`, so hash routes resolve it beneath the GitHub Pages project path instead of requesting the origin-root `/favicon.ico`.

`tests/loading.browser.js` is an async Playwright page function, like the compact-layout check below. Evaluate the file to obtain the function and call it with a page and `{ baseUrl: "https://guneetsingh097.github.io/LisbonDemo/" }` (the default is `http://localhost:4173/`). Use an 800-pixel-wide viewport so the compact section navigation is visible. It discovers section links from the rendered pages, checks all 30 landing aliases plus all seven sections for each property and the five shared routes (245 routes), clicks section navigation, scrolls through images, decodes image and CSS-image URLs, checks fonts/stylesheets/internal assets/favicon responses, and verifies actual 4K video playback. Its report retains HTTP errors, request failures, JavaScript exceptions, console errors, browser log errors, and route-specific issues; a passing run has `failedRouteCount === 0` and no `brokenDestinations`.

For favicon acceptance, run this check in **installed Microsoft Edge with a new user-data directory**, browser caching disabled (the check sends the CDP cache-disable command per tab), and browser-level NetLog capture. Do not disable browser security or use response interception. Playwright's default launch arguments are not required: launch with `ignoreDefaultArgs: true`, sandboxing enabled, and only the user-data-directory, remote-debugging-pipe, first-run/default-browser-check, and NetLog arguments. Confirm NetLog records a successful request for the project-local PNG and no automatic `/favicon.ico` request; ordinary page request listeners alone may miss favicons. Explicit favicon response checks use the API request context separately and do not stand in for this browser-level verification. Request cancellation caused only by closing a test tab is recorded separately as a teardown diagnostic, not silently discarded. This audit does not change the Windows demo controller.

The watch player uses owner-supplied Getty Images asset **2270002248** from `https://lisbongettyguneet.storage.googleapis.com/GettyImages-2270002248.mp4`. This is the bucket-specific address of the same object originally supplied at `https://storage.googleapis.com/lisbongettyguneet/GettyImages-2270002248.mp4`, not a replacement or re-encode. Both addresses returned the same ETag, generation, **161,462,195-byte** length and matching inspected bytes. macOS AVFoundation reports **3840x2160**, **56.39 seconds**, H.264 High profile level 5.2 and **59.94006 fps**, and decoded samples from the beginning, middle and end.

The Safari playback investigation reproduced a loading stall followed by `MEDIA_ERR_SRC_NOT_SUPPORTED` in isolated macOS WebKit at the original, path-style address. The identical file played locally, and the bucket-specific address immediately loaded metadata and played at 4K. WebKit HEAD requests also stalled at the original hostname but completed at the bucket hostname; ordinary command-line range requests and AVFoundation decoding worked at both. A later full reload also played at the original address, so the observed delivery failure is intermittent, not a universally unsupported codec or an autoplay rejection. The lower-level network cause is not established. Both `#/watch` and `#/watch/raw` now use the verified bucket-specific address to avoid the failing endpoint observed during investigation; attribution retains the original supplied URL. Isolated macOS WebKit checks do not establish playback in the Safari app.

This is still 4K, but is **not the unchanged original encoding**: compression can affect detail and decoding/memory workload. Network demand is substantially lower, not eliminated; playback can still buffer on a slow connection. The original 2,199,230,526-byte file remains available at `https://storage.googleapis.com/lisbongettyguneet/GettyImages-2267015510.mp4`. Neither hosted Getty file is bundled in Git. The owner confirmed a license permitting public website use; the license agreement and contributor credit were not supplied for independent review. Google Cloud delivery charges/allowances apply. Playback requires internet access and public object availability. The smaller Pexels clip below remains bundled as a previous version, but is not automatically substituted if Getty playback fails.

A non-interactive **4K** badge stays in the player's top-left corner, with an accessible "4K Ultra HD video" label. It does not alter playback or buffering.

**Current watch behavior:** `#/watch` uses a plain native HTML video player with
visible browser controls in every browser, including Safari and Edge. Its direct
`src` is `https://lisbongettyguneet.storage.googleapis.com/GettyImages-2270002248.mp4`.
Declarative `controls`, `autoplay`, `muted` and `playsinline` let the
browser manage playback, seeking and buffering. The full-bleed layout,
title, navigation, poster and 4K badge remain.

There is no custom buffering overlay, percentage gate, playback timer, automatic
reload or scripted startup `play()` call. A small `ended` handler rewinds and
requests replay, because Windows WebKit's native `loop` flag was observed to
rewind and then stay paused. This does not reload the source or intervene in
midstream playback. Replay failures are logged; playback and errors are handled
by the browser's native media UI. If autoplay is blocked by browser/device policy,
use the native Play control. Navigation pauses the departing element and releases
its source; returning creates a fresh native player with the same URL.

`tests/video.test.mjs` checks the native player attributes, exact source, absence
of custom playback intervention and navigation cleanup.
`tests/watch-native.browser.js` checks real playback past the midpoint,
pause/resume and seeking, complete-clip looping, responsive native controls and route
cleanup without intercepting media responses. Windows WebKit checks are not
macOS Safari tests. The current progressive approximately 23 Mbps MP4 can still buffer on a
slow connection; using native controls does not reduce its network requirements.
The JavaScript entry URL is versioned so a full page reload fetches the revised player.

**Raw video URL:** `https://guneetsingh097.github.io/LisbonDemo/#/watch/raw`
opens that exact Google Storage MP4 as a top-level document in the browser's
native media viewer. The address bar changes to the MP4 URL. No website wrapper,
poster, title overlay, badge, navigation, replay handler or playback scripts run
in that viewer. Direct entry bypasses the application module imports; changing
the hash to `#/watch/raw` within the site also opens the MP4 directly.
The existing `#/watch` page is unchanged. Playback, autoplay policy and repeat
behavior on the raw URL are entirely browser-managed; press native Play if
required. This does not transcode, download in advance or replace the source,
so its 40 Mbps network requirement still applies.

## Compact demo windows

### Separate 121-page speed collection

Open `https://guneetsingh097.github.io/LisbonDemo/#/speed/` and select
**Start 121-page sequence**. The hash entry redirects to the real `speed/index.html`
launcher. A URL fragment cannot be a server folder: the actual `speed/` directory
contains the original 120 independently loadable HTML documents, named `site-01-home.html`
through `site-30-offerings.html`, followed by `site-31-home.html`. They reuse the existing site renderers, styles,
photographs and interactive behavior, without iframes or duplicated media.

To start immediately without pressing the button, open
`https://guneetsingh097.github.io/LisbonDemo/speed/index.html?autostart=1`.
Allow popups for this site first. Every visit starts a fresh run; the ordinary
launcher still waits for its Start button.

Order: site 1 **Home → Detail → About → Offerings**, then the same four pages for
sites 2–30. Each ready page opens its successor immediately in a new tab; there
is no countdown or artificial delay. After site 30 Offerings, the single
Dom Luís I Bridge page opens and completes the run.
All 121 site tabs remain open, plus the separate launcher tab. Original
`#/site/...`, Quick Navigate and both video routes have no tab-opening feature,
even when given an old five-tab query string.

There are **no sequence indicators, added copy, banners, counters or controls on
the site pages**. Start, Stop and diagnostics appear only on the launcher.
Allow popups for `guneetsingh097.github.io` before starting. Safari's preferences
for tabs rather than windows and making new tabs active determine presentation;
JavaScript cannot override them. A blocked popup stops the run and reports its
page on the launcher; allow popups and start again. Starting again supersedes
the old run but does not close its existing tabs.

Before a successor opens, its predecessor must have a complete document, the
correct rendered section, loaded stylesheets and used fonts, decoded images
(including lazy images), CSS image assets and a decoded favicon. Resource,
JavaScript and console errors are captured without suppressing their native
reporting. Available HTTP status timing adds another check. An actual failure
or a 45-second loading timeout stops rather than fakes success. Checks concern
the initial page state, not future interactions or all future browser/GPU work.

This is a memory/performance demonstration, not a typography showcase. Speed
copies use built-in system fonts and generated `speed/site-XX.css` stylesheets
without Google Fonts imports. Their shared head also excludes font stylesheets
and preconnects. This removes the dependency rather than ignoring failed font
requests. Original sites retain their original styles and fonts. Content,
sequencing and strict loading/error checks are unchanged. Project
priorities are recorded in `AGENTS.md` for future work.

### Calm, distinct tiny-window identities

Both regular properties and speed copies use `sites/identities.js` and its
render-blocking light-surface stylesheet. All 30 compact mastheads have their
own composition, built-in display typography and a different existing Getty
photograph, rather than one repeated header. Arched, circular, ticket, panorama,
editorial, gallery and other frames remain recognizable at 640x300, 480x270
and 320x240. White, beige, neutral and pastel UI surfaces replace dark panels
throughout the sites, including menus and selected controls; photographs keep
their natural colours. Speed mode's native body/display stacks vary by site,
without downloading fonts. Existing content, planning tools, accessible menus,
section destinations, media and loading checks remain in place. Video pages
are outside the light-surface override.

**Stop opening tabs** broadcasts a stop without closing anything. Reloading an
earlier page cannot duplicate its successor. Following a normal navigation link
stops the run; links to the four copied sections open their standalone documents,
and other navigation returns to the original site. Opening a standalone document
without an active run query does not start tab opening. Browser memory management
and the separate desktop controller are unchanged.

Regenerate after changing the shared HTML head or document list:
`node scripts\export-speed-pages.mjs`. Check committed output with
`node scripts\export-speed-pages.mjs --check`.
`tests/speed.test.mjs` covers all 121 steps, ordering, boundaries, duplicate
prevention, original-route isolation, invisible integration and failure handling.
`tests/speed.browser.js` exercises real documents and handoffs without response
interception. Windows WebKit is not macOS Safari; Mac popup and tab activation
preferences still need a Mac check.

### Dom Luís I Bridge / Span Society

The bridge enthusiast's photo guide has one shared document: `speed/site-31-home.html`.
The regular index includes its searchable **Span Society — Dom Luís I Bridge** card,
and the main navigation's **Bridges** link opens that same document. The old
`#/site/31/home` (and `#/site/31`) routes redirect there for existing bookmarks.
Opening it normally does not start a run or open another tab. The speed run
uses the identical document as its final page, with its existing run query.
It is not a new seven-section property; the existing 30 Lisbon properties keep their sections.

The page uses **resized copies of the same 14 largest JPEGs** across the user's
two supplied GettyImages-2026-10-25 archives, ordered by decreasing current file
size. They total **99,853,290 bytes (99.85 MB, decimal)**, down from 481.18 MB. High-quality
bicubic resizing preserves aspect ratios, with JPEG quality 95. Small posters
retain their natural aspect ratios and use the actual high-resolution images,
never resized thumbnail files, `srcset` or canvas copies.
Captions show current pixel dimensions and decimal MB, with exact bytes in the
size tooltip, and no filenames. Native right-click **Copy image** operates on
the resized high-resolution source, not the original archive image; a destination application may still resize, recompress or
otherwise transform pasted images. Clipboard formats may differ from JPEG and
use much more memory than the compressed file. No clipboard permission or
custom image conversion is needed.

All photographs load eagerly and pass the existing decode gate. A small on-screen
poster does not imply a small download or memory footprint, and a slow connection
can hit the unchanged 45-second deadline. The original `Illustration.jpg` remains.
`images-bridge/sources.json` records hashes, dimensions, bytes and provenance
without asserting independently verified licensing. Regenerate the browser's
caption metadata with `node scripts\export-bridge-assets.mjs`; `--check` detects
drift. Version `bridge-posters-100mb-v1` refreshes previously cached originals.
To reproduce from an external directory containing the previous original
`sources.json` and its JPEGs, run
`pwsh -File scripts\resize-bridge-photos.ps1 -SourceDirectory <directory>`,
then regenerate caption metadata. Original hashes and dimensions remain in the
manifest alongside the current derivatives.
The illustration is the opening visualization. All fourteen gallery photographs
are visible inline by default; optional filters and local anchor navigation stay
on the page. There is no full-photo modal or "View full size" step. Each image's
hit area follows its natural aspect ratio rather than a letterboxed frame, and
the page leaves the browser's native image context menu untouched. Version
`bridge-direct-images-v1` refreshes the interface without changing image URLs.
No additional font or third-party image service
is required. During a speed run it uses the same genuine loading gate as all
preceding pages, and no demo indicators appear on the bridge page.

### Original three-property visual pilot

The review-only visual pilot refines `#/site/1` (Contoso Suites / Azulejo Tide House),
`#/site/5` (Northwind Traders / Mesa Lisboa Index), and `#/site/8`
(Adatum Corporation / Hoje em Lisboa), including their seven existing sections.
It preserves their separate cream/teal hotel ledger, maroon dining index, and
blue civic bulletin identities. This was the initial milestone; the current
local review above extends the work to all 30 properties. Google Font URLs,
the supplied video playback and separate demo controller remain unchanged.

`GETTY-PILOT-CANDIDATES.csv` records individually checked candidates.
Four primary assets are now integrated: **1172009391** (Lisbon rooftops),
**183584154** (azulejos), **945023048** (Portuguese dishes), and **1494877133**
(daytime tram). For each, the coordinating session read the authenticated
detail page showing **PREMIUM ACCESS**, **Content available with your current
agreements**, a matching Creative number, **Royalty-free**, and
**No release required**, with no editorial-only notice. Each normal Large
DOWNLOAD completed without a purchase, visible credit charge, or new-terms
prompt. Alternate 2022780576 was not downloaded.

The four original JPEGs remain outside the repository. Only 1600x1067,
quality-85 JPEG derivatives are bundled in `images-getty/` (about 2.22 MB
combined versus 84.61 MB for the originals). They are resized and recompressed,
not unchanged originals. `images-getty/provenance.json` retains source links,
photographer credits, dimensions, original/derivative hashes, processing and
observed download evidence. Both attribution ledgers contain the four assets.
No watermarked previews or remote Getty hotlinks are used.

The hotel's inaccurate Wabasha Bridge/Mississippi photograph and Tejo caption
are replaced with correctly captioned Lisbon rooftops. The new food and tram
captions distinguish location references from the fictional restaurants and
sample events. That initial milestone used only four Getty assets. The complete
replacement above supersedes its remaining Pexels slots, including rooms,
alleys, interiors, terraces, market halls and festival scenes.

Royalty-free does not mean public domain, free of charge, or unrestricted
redistribution. Existing agreement availability and successful downloads were
observed; confidential agreement terms were not exported or independently
reviewed. The separately recorded Getty video license evidence is distinct
from these still-image downloads. Public rollout remains outside this pilot.

`tests/pilot.browser.js` is an async Playwright page function checking all 21
pilot section routes at desktop, intermediate, compact-demo, and mobile sizes,
including image decoding, actual font loading, navigation, skip links, and
table scroll regions. Its default local URL is port 4193; pass `baseUrl` to
use another server. Pass `screenshotDirectory` to save desktop/mobile captures
outside the repository.

Run `node --test tests\getty-pilot.test.mjs` for all 75 derivative hashes,
dimensions and size budgets, installed image/credit references, corrected
captions, and both attribution records.

### Interactive hotel pilot

Only `#/site/1/home` adds a working sample stay planner. Arrival, departure,
guest count and room style filter the three existing room entries using a
deterministic **May 2027** calendar, not live hotel inventory. Stays are
1-14 nights for 1-3 guests; the existing EUR 168/192/236 sample nightly rates
are the base, with EUR 24 per room per Friday/Saturday night. Sample capacities
are 2/2/3. All rooms are blocked on May 24, with additional fixed room-specific
blocks in `sites/hotel-experience.js`. Taxes and other charges are not modelled.
Invalid fields show visible errors; an invalid submission leaves results
unchanged. Unapplied edits are clearly distinguished from the last applied stay.
Empty results include a reset action.

Guests can select two or three rooms for a modal comparison drawer with
calculated totals, capacities, existing room descriptions, breakfast and access
notes. Removing rooms updates the selection; applying a new search clears it.
The photo gallery has five credited images, thumbnails, previous/next controls,
Left/Right and Home/End navigation, Escape, contained keyboard focus and opener
focus restoration. Getty rooftops/tiles are location/material references;
the replacement Getty interiors are illustrative, not photographs of actual rooms.
Route changes clean up listeners and close dialogs.

This is local, session-only interaction: no reservations, payments, backend,
saved user data or availability guarantee. The gallery reuses existing optimized
files, creates its extra image elements only when opened, and removes them on
close. No full-resolution originals, hidden memory allocations, artificial
workload or extra preload are added. These features do not establish an increase
in total Edge RAM; no browser-memory benchmark is claimed.

Run `node --test tests\hotel.test.mjs` for the model and validation cases.
`tests/hotel.browser.js` is an async Playwright page function covering real
form submissions, filtering, totals, empty/error states, comparison add/remove,
dialog keyboard/focus behavior, gallery navigation, route cleanup and open-dialog
resizing across the six acceptance sizes below. Its default local URL is port 4193; optional
`baseUrl` and `screenshotDirectory` arguments match `tests/pilot.browser.js`.
These are browser viewport checks, not a claim of physical-device testing.

All 30 properties use a compact masthead at **width <=980 or height <=650 CSS pixels**.
Navigation is collapsed by default behind a real **Menu** button, not a stacked
desktop link bar. Expansion reveals all seven sections and ecosystem links in a
bounded scrolling disclosure. It retains current-page indication, 44px targets,
Escape/focus restoration, outside/focus-departure close, route cleanup and
resize handling. Long brand labels use at most two visual lines while their
full accessible names remain. Global pages and watch also have compact menus.
Tables use local keyboard-accessible scroll regions. Gallery dialogs have
bounded height, internal scrolling and sticky close controls.

Quarter-window acceptance covers **960x440, 640x300 and 1280x620**, plus
1440x1000 desktop and 390x844/320x568 mobile content viewports. These are content
sizes, not a claim to have tested the user's physical monitor, OS scaling or
window placement. Layout changes are responsive, not whole-page scaling.

The completed local checks covered 1,260 property page/viewport visits plus
30 global page/viewport visits, all 30 landing aliases, 519 portfolio interaction
assertions, 310 hotel assertions and 205 navigation/resize assertions.
The primary page visits decoded 4,314 image instances; the civic-photo correction
also passed a focused 42-visit recheck. The 30 Node checks passed.
At 390x844 the hotel's collapsed header is 65px (the earlier capture occupied
approximately 124px); at 640x300 it is 68.3px with content starting at 80.3px.
These results do not establish a total-browser memory benchmark.

The compact layout is tuned for the approximately **660×320 CSS-pixel** browser content area in the demo screenshot, not by scaling or zooming the page. The shared overrides live in `sites/compact.css`, loaded after each property's stylesheet. `prepareCompactSite` in `app.js` wires the compact navigation and table regions for all 210 property pages.

Compact and original full-size skip links share the same content-focus handler. They target the current page's main content without replacing its hash route, including the original links on properties 8 and 29.

`tests/compact.browser.js` remains a Playwright page-function regression check
on port 4193. `tests/portfolio.browser.js` adds all 210 pages at the six current
acceptance sizes, real image decoding/font readiness, expanded/collapsed menus,
and purpose-specific interaction/resize states. These are browser viewport
checks, not physical-device testing.

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

Written content is original travel content. Active Getty media is documented in `IMAGE-ATTRIBUTION.md` and `IMAGE-ATTRIBUTION.csv`. Historical Pexels/Wikimedia files are not displayed; their individual license records remain in `IMAGE-ATTRIBUTION-LEGACY.csv`. The previous Pexels video remains bundled but is not the active watch source.

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
