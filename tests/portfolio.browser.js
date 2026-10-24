(async (page, { baseUrl = "http://localhost:4193/", startId = 1, endId = 30, phase = "routes", screenshotDirectory } = {}) => {
  const issues = [], errors = [], fonts = new Set(), measurements = [];
  let checked = 0, decoded = 0, assertions = 0;
  const check = (condition, message) => { assertions++; if (!condition) throw new Error(message); };
  await page.goto(`${baseUrl}#/site/${startId}/home`);
  await page.reload();
  const onError = error => errors.push(error.message);
  const onResponse = response => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
    if (response.ok() && response.url().startsWith("https://fonts.gstatic.com/")) fonts.add(response.url());
  };
  const onConsole = message => { if (message.type() === "error") errors.push(message.text()); };
  const onRequest = request => {
    if (/\/images(?:-pexels)?\/[^?]+\.(?:jpe?g|png|webp)(?:\?|$)/i.test(request.url())) errors.push(`Old photo requested: ${request.url()}`);
  };
  page.on("pageerror", onError); page.on("response", onResponse); page.on("console", onConsole); page.on("request", onRequest);
  const go = async (id, section = "home") => {
    await page.evaluate(({ id, section }) => { location.hash = `#/site/${id}/${section}`; }, { id, section });
    await page.waitForSelector(`.site-shell-${id}[data-section="${section}"]`);
    await page.waitForFunction(() => [...document.querySelectorAll('link[href^="sites/"]')].every(link => link.sheet));
    await page.evaluate(async () => { await document.fonts.ready; scrollTo({ top: 0, behavior: "instant" }); });
  };
  try {
    if (phase === "routes") {
      for (const viewport of [
        { width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 320, height: 568 },
        { width: 960, height: 440 }, { width: 640, height: 300 }, { width: 1280, height: 620 },
      ]) {
        await page.setViewportSize(viewport);
        for (let id = startId; id <= endId; id++) for (const section of ["home", "about", "offerings", "resources", "detail", "faq", "contact"]) {
          await go(id, section);
          const result = await page.evaluate(async ({ id, section }) => {
            const root = document.querySelector(`.site-shell-${id}`);
            const main = root.querySelector(".compact-content");
            const header = root.querySelector(".compact-site-header");
            const compact = innerWidth <= 980 || innerHeight <= 650;
            const problems = [];
            const images = [...root.querySelectorAll("img")];
            for (const image of images) {
              image.loading = "eager";
              if (!image.getAttribute("src").startsWith("images-getty/")) problems.push(`Non-Getty photo: ${image.getAttribute("src")}`);
              try { await image.decode(); } catch { problems.push(`Image failed: ${image.getAttribute("src")}`); }
            }
            if (document.documentElement.scrollWidth > innerWidth + 1) problems.push("Whole-page horizontal overflow");
            const workspace = root.querySelector(".portfolio-workspace");
            if (workspace && getComputedStyle(root).getPropertyValue("--work-ink") !== getComputedStyle(main).color) problems.push("Planning palette did not follow the loaded site theme");
            if (!main.textContent.trim()) problems.push("Empty main");
            if (getComputedStyle(header).display !== (compact ? "block" : "none")) problems.push("Wrong header mode");
            if (header.querySelectorAll(".compact-page-nav a").length !== 7) problems.push("Missing section destination");
            if (header.querySelector('[aria-current="page"]')?.hash !== `#/site/${id}/${section}`) problems.push("Wrong current page");
            if (compact && main.getBoundingClientRect().top > 120) problems.push("Compact header monopolizes first viewport");
            if (compact && header.querySelector(".compact-menu-button").getAttribute("aria-expanded") !== "false") problems.push("Menu not collapsed");
            if ([...main.querySelectorAll("table")].some(table => !table.closest('.compact-table-region[tabindex="0"]'))) problems.push("Table lacks local keyboard scrolling");
            return { problems, images: images.length, header: header.getBoundingClientRect().height, top: main.getBoundingClientRect().top };
          }, { id, section });
          checked++; decoded += result.images;
          if (result.problems.length) issues.push({ id, section, viewport, problems: result.problems });
          if (section === "home" && (viewport.width <= 980 || viewport.height <= 650)) {
            const menu = page.locator(".compact-site-header .compact-menu-button");
            await menu.click();
            const expanded = await page.locator(".compact-menu-panel").evaluate(panel => ({
              fits: panel.getBoundingClientRect().bottom <= innerHeight + 1,
              targets: [...panel.querySelectorAll("a")].every(link => link.getBoundingClientRect().height >= 44),
              focus: panel.contains(document.activeElement),
            }));
            check(expanded.fits && expanded.targets && expanded.focus, `Menu expansion/focus/targets: ${id} ${JSON.stringify(viewport)}`);
            await page.keyboard.press("Escape");
            check(await menu.evaluate(button => document.activeElement === button && button.getAttribute("aria-expanded") === "false"), `Menu Escape ${id}`);
            measurements.push({ id, ...viewport, header: result.header, mainTop: result.top });
          }
          if (section === "home" && screenshotDirectory && [1440, 390].includes(viewport.width)) {
            await page.screenshot({ path: `${screenshotDirectory}\\portfolio-${id}-${viewport.width}.png` });
          }
        }
      }
    } else {
      for (let id = Math.max(2, startId); id <= endId; id++) {
        await page.setViewportSize({ width: 640, height: 300 });
        await go(id);
        const desk = page.locator(".portfolio-workspace");
        const toggles = desk.locator("[data-work-toggle]");
        const count = await toggles.count();
        check(count >= 4, `Expected real source entries for ${id}`);
        await desk.locator('input[name="text"]').fill("zzzz-no-match");
        check(await desk.locator(".portfolio-empty").count() === 1, `No-results ${id}`);
        await desk.locator('[data-work-action="reset"]').first().click();
        check(await toggles.count() === count, `Reset ${id}`);
        const facet = desk.locator('select[name="facet"]');
        const option = await facet.locator("option").nth(1).getAttribute("value") || await facet.locator("option").nth(1).textContent();
        await facet.selectOption({ label: option });
        check(await toggles.count() > 0 && await toggles.count() <= count, `Facet ${id}`);
        await desk.locator('[data-work-action="reset"]').first().click();
        await desk.locator('select[name="sort"]').selectOption("name");
        await toggles.nth(0).click(); await toggles.nth(1).click();
        check(await desk.locator(".portfolio-selected > li").count() === 2, `Save ${id}`);
        const compare = desk.locator('[data-work-action="compare"]');
        if (await compare.count()) {
          await compare.click();
          check(await desk.locator(".portfolio-comparison").isVisible(), `Compare ${id}`);
          check(await desk.locator(".portfolio-compare-grid article").count() === 2, `Comparison facts ${id}`);
          await page.setViewportSize({ width: 1280, height: 620 });
          check(await desk.locator(".portfolio-comparison").isVisible(), `Compare resize ${id}`);
          await desk.locator('[data-work-action="close-comparison"]').click();
          check(await compare.evaluate(button => document.activeElement === button), `Comparison close focus ${id}`);
        } else {
          const secondTitle = await desk.locator(".portfolio-selected strong").nth(1).textContent();
          await desk.locator("[data-work-up]").nth(1).click();
          check(await desk.locator(".portfolio-selected strong").first().textContent() === secondTitle, `Reorder ${id}`);
          const complete = desk.locator("[data-work-complete]");
          if (await complete.count()) {
            await complete.first().check();
            check(await complete.first().isChecked(), `Preparation/read state ${id}`);
          }
        }
        await desk.locator("[data-work-remove]").first().click();
        check(await desk.locator(".portfolio-selected > li").count() === 1, `Remove ${id}`);
        await desk.locator('[data-work-action="clear"]').click();
        check(await desk.locator(".portfolio-selected > li").count() === 0, `Clear ${id}`);
        const price = desk.locator('input[name="maxPrice"]');
        if (await price.count()) {
          await price.fill("-1");
          check(await price.getAttribute("aria-invalid") === "true", `Price validation ${id}`);
          await toggles.first().click();
          check(await desk.locator(".portfolio-selected > li").count() === 1, `Selection remains usable with invalid filter ${id}`);
          await desk.locator('[data-work-action="clear"]').click();
          await price.fill("0");
          check(await desk.locator(".portfolio-empty").count() === 1, `Price limit ${id}`);
          await desk.locator('[data-work-action="reset"]').first().click();
        }
        await page.setViewportSize({ width: 1440, height: 1000 });
        const opener = page.locator(".portfolio-gallery-opener");
        await opener.click();
        const dialog = page.locator(".portfolio-gallery:modal");
        check(await dialog.count() === 1, `Gallery modal ${id}`);
        check(await dialog.locator("img").evaluateAll(images => images.every(image => image.getAttribute("src").startsWith("images-getty/"))), `Getty-only gallery ${id}`);
        check((await dialog.textContent()).includes("Getty Images"), `Gallery contributor credits ${id}`);
        const first = await dialog.locator('[role="status"]').textContent();
        await page.keyboard.press("ArrowRight");
        check(await dialog.locator('[role="status"]').textContent() !== first, `Gallery arrows ${id}`);
        await page.keyboard.press("End");
        await page.setViewportSize({ width: 640, height: 300 });
        const fit = await dialog.evaluate(element => {
          const rect = element.getBoundingClientRect();
          return rect.left >= 0 && rect.top >= 0 && rect.bottom <= innerHeight + 1 && rect.right <= innerWidth + 1;
        });
        check(fit, `Gallery short-window fit ${id}`);
        await dialog.locator("[data-gallery-close]").focus();
        await page.keyboard.press("Shift+Tab");
        check(await dialog.evaluate(element => element.contains(document.activeElement)), `Gallery backward Tab ${id}`);
        await page.keyboard.press("Tab");
        check(await dialog.evaluate(element => element.contains(document.activeElement)), `Gallery forward Tab ${id}`);
        await page.keyboard.press("Escape");
        check(await opener.evaluate(button => document.activeElement === button), `Gallery Escape focus ${id}`);
        const menu = page.locator(".compact-site-header .compact-menu-button");
        await menu.click();
        await page.locator('.compact-page-nav a[href$="/about"]').click();
        await page.waitForSelector(`.site-shell-${id}[data-section="about"]`);
        check(await page.locator("dialog:modal").count() === 0, `Route cleanup ${id}`);
        check(await page.locator(".compact-menu-button").getAttribute("aria-expanded") === "false", `Route menu reset ${id}`);
        checked++;
      }
    }
    return { phase, startId, endId, checked, decoded, assertions, fontFiles: fonts.size, measurements, issues, errors };
  } finally {
    page.off("pageerror", onError); page.off("response", onResponse); page.off("console", onConsole); page.off("request", onRequest);
  }
})
