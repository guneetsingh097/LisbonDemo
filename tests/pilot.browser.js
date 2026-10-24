(async (page, { baseUrl = "http://localhost:4193/", screenshotDirectory } = {}) => {
  const ids = [1, 5, 8];
  const sections = ["home", "about", "offerings", "resources", "detail", "faq", "contact"];
  const viewports = [
    { width: 1440, height: 1000 },
    { width: 1024, height: 768 },
    { width: 660, height: 320 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
  ];
  const errors = [];
  const issues = [];
  const fontResponses = new Set();
  const onError = error => errors.push(error.message);
  const onConsole = message => {
    if (message.type() === "error") errors.push(message.text());
  };
  const onFailure = request => errors.push(`${request.url()}: ${request.failure()?.errorText}`);
  const onResponse = response => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
    if (response.url().startsWith("https://fonts.gstatic.com/") && response.ok()) {
      fontResponses.add(response.url());
    }
  };
  page.on("pageerror", onError);
  page.on("console", onConsole);
  page.on("requestfailed", onFailure);
  page.on("response", onResponse);
  let checked = 0;
  let imagesDecoded = 0;
  try {
    await page.goto(`${baseUrl}#/site/1/home`);
    await page.reload();
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      for (const id of ids) {
        for (const section of sections) {
          await page.evaluate(({ id, section }) => {
            location.hash = `#/site/${id}/${section}`;
          }, { id, section });
          await page.waitForFunction(({ id, section }) =>
            document.querySelector(`.site-shell-${id}`)?.dataset.section === section,
          { id, section });
          await page.waitForFunction(() =>
            [...document.querySelectorAll('link[href^="sites/"]')].every(link => link.sheet));
          await page.evaluate(() => new Promise(resolve => {
            scrollTo({ top: 0, left: 0, behavior: "instant" });
            requestAnimationFrame(resolve);
          }));
          const result = await page.evaluate(async ({ id, section }) => {
            await document.fonts.ready;
            const root = document.querySelector(`.site-shell-${id}`);
            const problems = [];
            const images = [...root.querySelectorAll("img")];
            for (const image of images) {
              try { await image.decode(); }
              catch { problems.push(`Image failed: ${image.getAttribute("src")}`); }
            }
            if (section === "home") {
              const expected = { 1: ["1172009391", "183584154"], 5: ["945023048"], 8: ["1494877133"] };
              for (const assetId of expected[id]) {
                const image = images.find(item =>
                  item.getAttribute("src") === `images-getty/GettyImages-${assetId}-1600.jpg`);
                if (!image || image.naturalWidth !== 1600 || image.naturalHeight !== 1067) {
                  problems.push(`Getty ${assetId} not rendered at expected dimensions`);
                }
              }
            }
            const families = {
              1: ["Cormorant Garamond", "IBM Plex Mono"],
              5: ["Source Serif 4", "Libre Franklin"],
              8: ["Noto Serif", "Public Sans"],
            };
            for (const family of families[id]) {
              const loaded = [...document.fonts].some(face =>
                face.family.replaceAll(/['"]/g, "") === family && face.status === "loaded");
              if (!loaded) problems.push(`Font not loaded: ${family}`);
            }
            if (document.documentElement.scrollWidth > innerWidth + 1) {
              problems.push(`Horizontal overflow: ${document.documentElement.scrollWidth}`);
            }
            if (!root.querySelector("main")?.textContent.trim()) problems.push("Empty main");
            const nav = root.querySelector(".compact-page-nav");
            if (nav.children.length !== 7) problems.push("Missing section navigation");
            if (nav.querySelector('[aria-current="page"]')?.hash !== `#/site/${id}/${section}`) {
              problems.push("Wrong current route");
            }
            if (innerWidth <= 980 || innerHeight <= 650) {
              if (root.querySelector(".compact-menu-button").getAttribute("aria-expanded") !== "false") problems.push("Compact menu not collapsed");
              if (root.querySelector("main").getBoundingClientRect().top > 190) {
                problems.push("Main begins below compact readiness boundary");
              }
            }
            if ([...root.querySelectorAll("table")].some(table =>
              !table.closest('.compact-table-region[role="region"][tabindex="0"]'))) {
              problems.push("Table lacks keyboard scroll region");
            }
            return { problems, images: images.length };
          }, { id, section });
          imagesDecoded += result.images;
          if (result.problems.length) issues.push({ id, section, viewport, problems: result.problems });
          checked++;
          if (section === "home" && screenshotDirectory && [1440, 390].includes(viewport.width)) {
            await page.evaluate(() => scrollTo({ top: 0, left: 0, behavior: "instant" }));
            await page.screenshot({ path: `${screenshotDirectory}\\after-${id}-${viewport.width}.png` });
          }
        }
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    for (const id of ids) {
      await page.goto(`${baseUrl}#/site/${id}/home`);
      await page.locator(".compact-menu-button").click();
      await page.locator(".compact-page-nav a").filter({ hasText: /^About$/ }).click();
      await page.waitForFunction(id =>
        document.querySelector(`.site-shell-${id}`)?.dataset.section === "about", id);
      await page.locator(".compact-skip").focus();
      await page.keyboard.press("Enter");
      if (!await page.locator("main").evaluate(main => document.activeElement === main)) {
        issues.push({ id, problems: ["Skip link failed to focus main"] });
      }
    }
    return { checked, imagesDecoded, fontFilesLoaded: fontResponses.size, errors, issues };
  } finally {
    page.off("pageerror", onError);
    page.off("console", onConsole);
    page.off("requestfailed", onFailure);
    page.off("response", onResponse);
  }
})
