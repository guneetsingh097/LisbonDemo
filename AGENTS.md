# Project priorities

This project supports a Safari and Edge memory/performance demonstration.
Reliable, genuinely completed loading and keeping the tabs open matter more
than font fidelity or typography polish.

- The isolated `speed/` collection uses built-in system fonts. Do not reintroduce
  Google Fonts or other downloaded-font dependencies into that demo.
- Preserve real page content, images and normal browser memory behavior. Do not
  fake loading, suppress failed requests or weaken the separate desktop controller.
- Keep all 121 site tabs open: Home, Detail, About, Offerings for each site from
  1 through 30, followed by the single Dom Luís I Bridge page. Stop after the
  bridge page. Do not add artificial delays.
- Site pages must look like real websites: no added demo labels, counters,
  progress panels, symbols or controls. Controls belong only on the launcher.
- Leave the original websites outside `speed/` unchanged unless requested.
  Preserve both watch routes and the supplied 4K video's behavior and URL.
- Verify the deployed live pages, not just a build. Report actual browser
  coverage honestly; Windows WebKit is not actual macOS Safari.
