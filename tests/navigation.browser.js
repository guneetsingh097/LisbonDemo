(async (page, { baseUrl = "http://localhost:4193/" } = {}) => {
  const routes = [...Array.from({ length: 30 }, (_, index) => `#/site/${index + 1}/home`),
    "#/", "#/navigate", "#/matrix", "#/docs", "#/watch"];
  let checks = 0;
  const assert = (condition, message) => { checks++; if (!condition) throw new Error(message); };
  const errors = [];
  const resize = async size => {
    await page.setViewportSize(size);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  };
  const onError = error => errors.push(error.message);
  await page.goto(`${baseUrl}#/`); await page.reload();
  page.on("pageerror", onError);
  try {
    for (const hash of routes) {
      await resize({ width: 1440, height: 1000 });
      await page.evaluate(hash => { location.hash = hash; }, hash);
      await page.waitForFunction(hash => location.hash === hash && document.querySelector(".compact-menu-button"), hash);
      if (hash.startsWith("#/site/")) await page.waitForSelector(`.site-shell-${hash.split("/")[2]}[data-section="home"]`);
      await page.waitForFunction(() => [...document.querySelectorAll('link[href^="sites/"]')].every(link => link.sheet));
      await resize({ width: 960, height: 440 });
      const button = page.locator(".compact-menu-button");
      await button.click();
      await resize({ width: 640, height: 300 });
      assert(await page.locator(".compact-menu-panel").evaluate(panel => {
        const rect = panel.getBoundingClientRect();
        return !panel.hidden && rect.bottom <= innerHeight + 1 && panel.contains(document.activeElement);
      }), `Open menu remains usable after quadrant resize: ${hash}`);
      await resize({ width: 1440, height: 1000 });
      await page.waitForFunction(() => document.querySelector(".compact-menu-panel").hidden);
      assert(await page.evaluate(() => document.activeElement.getClientRects().length > 0), `Focus not hidden after full resize: ${hash}`);
      await resize({ width: 960, height: 440 });
      await button.focus();
      await page.keyboard.press("Enter");
      assert(await button.getAttribute("aria-expanded") === "true", `Keyboard opens menu: ${hash}`);
      await page.keyboard.press("Escape");
      assert(await button.evaluate(button => document.activeElement === button), `Escape returns focus: ${hash}`);
      await button.click();
      const target = hash.startsWith("#/site/") ? hash.replace("/home", "/contact") : hash === "#/docs" ? "#/navigate" : "#/docs";
      await page.locator(`.compact-menu-panel a[href="${target}"]`).click();
      await page.waitForFunction(hash => location.hash === hash && document.querySelector(".compact-menu-button")?.getAttribute("aria-expanded") === "false", target);
      assert(true, `Route change closes menu: ${hash}`);
    }
    for (let id = 1; id <= 30; id++) {
      await page.evaluate(id => { location.hash = `#/site/${id}`; }, id);
      await page.waitForSelector(`.site-shell-${id}[data-section="home"]`);
      assert(await page.locator(".compact-page-nav [aria-current]").getAttribute("href") === `#/site/${id}/home`, `Landing alias resolves to home: ${id}`);
    }
    return { routes: routes.length, landingAliases: 30, checks, errors };
  } finally { page.off("pageerror", onError); }
})
