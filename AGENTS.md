# Project priorities

This project supports a Safari and Edge memory/performance demonstration.
Reliable, genuinely completed loading and keeping the tabs open matter more
than font fidelity or typography polish.

- The isolated `speed/` collection uses built-in system fonts. Do not reintroduce
  Google Fonts or other downloaded-font dependencies into that demo.
- Preserve real page content, images and normal browser memory behavior. Do not
  fake loading, suppress failed requests or weaken the separate desktop controller.
- Keep all 97 run tabs open: Home, Detail, About, Offerings for each site from
  1 through 24, followed by the single Dom Luís I Bridge page. Open one tab at a
  time after genuine loading checks. Stop after the bridge page. The launcher
  is the first tab; with the separate 4K and Bing Maps tabs the total is 100.
  Preserve sites 25–30 outside the run. Do not add artificial delays.
- Site pages must look like real websites: no added demo labels, counters,
  progress panels, symbols or controls. Controls belong only on the launcher.
- Both regular and speed sites now require visibly different identities at
  640x300, 480x270 and 320x240, with near-black and bounded dark-colour UI surfaces.
  Preserve distinct typography, compositions and photographs; avoid dark/light
  flashing. Use semantic roles in `sites/palettes.css`, not inversion or a universal
  descendant paint reset. Keep the early document canvas dark before external
  resources load. Keep natural photograph colours and do not add pacing delays.
  Preserve both watch routes and the supplied 4K video's behavior and URL.
- The shared final bridge page uses resized copies of the same 14 largest photos
  from the supplied archives, around 100 MB combined, as small uncropped posters,
  largest current files first.
  Show pixel dimensions and actual file sizes underneath, never filenames.
  Keep real high-resolution image sources and native Copy image support, not thumbnails,
  canvas substitutes or lazy-loading shortcuts around the loading gate.
- Verify the deployed live pages, not just a build. Report actual browser
  coverage honestly; Windows WebKit is not actual macOS Safari.
