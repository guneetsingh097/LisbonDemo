(async (page, { baseUrl = "http://localhost:4193/", routes = ["#/", "#/navigate", "#/matrix", "#/docs", "#/watch"], viewports = [
  { width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 320, height: 568 },
  { width: 960, height: 440 }, { width: 640, height: 300 }, { width: 1280, height: 620 },
] } = {}) => {
  const issues = [], errors = [], measurements = [];
  const onError = error => errors.push(error.message);
  const onResponse = response => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`); };
  const onRequest = request => {
    if (/\/images(?:-pexels)?\/[^?]+\.(?:jpe?g|png|webp)(?:\?|$)/i.test(request.url())) errors.push(`Old photo requested: ${request.url()}`);
  };
  let checked = 0, decoded = 0;
  await page.goto(`${baseUrl}#/`); await page.reload();
  page.on("pageerror", onError); page.on("response", onResponse); page.on("request", onRequest);
  try {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      for (const hash of routes) {
        await page.evaluate(hash => { location.hash = hash; }, hash);
        await page.waitForFunction(hash => location.hash === hash && document.querySelector("main"), hash);
        if (hash === "#/docs") await page.waitForSelector("#attribution-body img");
        await page.evaluate(async () => { await document.fonts.ready; scrollTo({ top: 0, behavior: "instant" }); });
        const result = await page.evaluate(async hash => {
          const problems = [];
          const images = [...document.querySelectorAll("img")];
          for (const image of images) {
            image.loading = "eager";
            if (!image.getAttribute("src").startsWith("images-getty/")) problems.push(`Non-Getty thumbnail: ${image.getAttribute("src")}`);
            try { await image.decode(); } catch { problems.push(`Image failed: ${image.src}`); }
          }
          if (document.documentElement.scrollWidth > innerWidth + 1) problems.push("Whole-page horizontal overflow");
          if ([...document.querySelectorAll("table")].some(table => !table.closest('[role="region"][tabindex="0"]'))) problems.push("Table not locally scrollable");
          if (/\b(?:fictional|illustrative|demonstration)\b|PREMIUM ACCESS|CELA-oriented|travel corpus/i.test(document.body.innerText)) {
            problems.push("Prototype or internal sourcing copy remains visible");
          }
          if (hash === "#/docs") {
            const records = [...document.querySelectorAll("#attribution-body tr")].map(row => ({
              id: row.cells[4]?.textContent.trim(),
              photographer: row.cells[2]?.textContent.trim(),
              source: row.cells[6]?.querySelector("a")?.href,
            }));
            if (records.length !== 75 || new Set(records.map(record => record.id)).size !== 75 ||
              records.some(record => !/^[\w-]+$/.test(record.id) || !record.photographer || !record.source?.endsWith(`/${record.id}`))) {
              problems.push("Incomplete photographer, Getty image ID or source credits");
            }
          }
          if (hash === "#/watch") {
            const video = document.querySelector("video");
            if (document.title !== "Lisbon by Tram — Lisbon Atlas" || document.querySelector("h1").textContent !== "Lisbon by Tram") problems.push("Watch title mismatch");
            const rect = video.getBoundingClientRect();
            if (rect.bottom > innerHeight + 1 || rect.right > innerWidth + 1) problems.push("Video does not fit");
          }
          return { problems, images: images.length, header: document.querySelector(".portal-header")?.getBoundingClientRect().height };
        }, hash);
        checked++; decoded += result.images;
        if (result.problems.length) issues.push({ hash, viewport, problems: result.problems });
        const compact = viewport.width <= 980 || viewport.height <= 650 || hash === "#/watch";
        if (compact) {
          const button = page.locator(".compact-menu-button");
          await button.click();
          const menu = await page.locator(".compact-menu-panel").evaluate(panel => ({
            fits: panel.getBoundingClientRect().bottom <= innerHeight + 1,
            focus: panel.contains(document.activeElement),
            targets: [...panel.querySelectorAll("a")].every(link => link.getBoundingClientRect().height >= 44),
          }));
          if (!menu.fits || !menu.focus || !menu.targets) issues.push({ hash, viewport, problems: ["Expanded menu bounds, focus or target size"] });
          await page.keyboard.press("Escape");
          if (!await button.evaluate(button => document.activeElement === button && button.getAttribute("aria-expanded") === "false")) issues.push({ hash, viewport, problems: ["Menu Escape/focus"] });
          measurements.push({ hash, ...viewport, header: result.header });
        }
        if (hash === "#/watch") {
          await page.waitForFunction(() => {
            const video = document.querySelector("video");
            return video.readyState >= 3 && !video.paused && video.currentTime > .2;
          }, undefined, { timeout: 45000 });
          const time = await page.locator("video").evaluate(video => video.currentTime);
          await page.waitForFunction(time => document.querySelector("video").currentTime > time + .2, time);
        }
      }
    }
    return { checked, decoded, issues, errors, measurements };
  } finally { page.off("pageerror", onError); page.off("response", onResponse); page.off("request", onRequest); }
})
