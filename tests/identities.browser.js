import { siteIdentities } from "../sites/identities.js";

export async function runIdentityAudit(context, { baseUrl, screenshot } = {}) {
  const issues = [];
  const check = (condition, message) => { if (!condition) issues.push(message); };
  const errors = [];
  const results = [];
  context.on("requestfailed", request => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
  context.on("response", response => {
    if (response.status() >= 400) errors.push(`${response.url()}: HTTP ${response.status()}`);
  });
  const page = await context.newPage();
  if (context.browser()?.browserType().name() === "chromium") {
    const network = await context.newCDPSession(page);
    await network.send("Network.enable");
    await network.send("Network.setCacheDisabled", { cacheDisabled: true });
  }
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  const viewports = [{ width: 640, height: 300 }, { width: 480, height: 270 }, { width: 320, height: 240 }];
  for (const mode of ["regular", "speed"]) {
    for (const identity of siteIdentities) {
      // The bridge is one shared standalone document in both collections.
      if (mode === "regular" && identity.id === 31) continue;
      const path = mode === "speed" ? `speed/site-${String(identity.id).padStart(2, "0")}-home.html`
        : `?v=dark-v1#/site/${identity.id}/home`;
      await page.goto(new URL(path, baseUrl).href, { waitUntil: "networkidle" });
      await page.locator(`[data-identity="${identity.world}"]`).waitFor();
      await page.evaluate(async () => {
        await document.fonts.ready;
        for (const image of document.images) { image.loading = "eager"; await image.decode(); }
      });
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
        const measured = await page.evaluate(() => {
          const root = document.querySelector("[data-identity]");
          const header = root.querySelector(".compact-site-header, .bridge-header");
          const image = root.querySelector(".identity-photograph img, .bridge-cover img");
          const brand = root.querySelector(".compact-brand, .bridge-intro h1");
          const rect = element => {
            const box = element.getBoundingClientRect();
            return { x: box.x, y: box.y, width: box.width, height: box.height, bottom: box.bottom };
          };
          const brightSurfaces = [...root.querySelectorAll("*"), root].filter(element => {
            const box = element.getBoundingClientRect();
            if (box.width * box.height < 4000 || box.bottom < 0 || box.top > innerHeight) return false;
            const color = getComputedStyle(element).backgroundColor.match(/[\d.]+/g)?.map(Number);
            if (!color || color.length > 3 && color[3] < .95) return false;
            const rgb = color.slice(0, 3).map(value => {
              const channel = value / 255;
              return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
            });
            return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 > .12;
          }).map(element => `${element.tagName}.${element.className}`);
          return {
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            header: rect(header), brand: rect(brand), image: rect(image),
            menu: root.querySelector(".compact-menu-button") ? rect(root.querySelector(".compact-menu-button")) : null,
            imageSource: image.currentSrc, imageWidth: image.naturalWidth,
            brightSurfaces, paper: getComputedStyle(root).backgroundColor,
            body: getComputedStyle(root).fontFamily, brandFont: getComputedStyle(brand).fontFamily,
            text: root.querySelector(".compact-content").textContent.trim().length,
          };
        });
        const label = `${mode} ${identity.id} ${viewport.width}x${viewport.height}`;
        check(!measured.overflow, `Horizontal overflow: ${label}`);
        check(measured.brightSurfaces.length === 0, `Bright UI surface: ${label}: ${measured.brightSurfaces}`);
        check(measured.imageWidth > 0 && measured.image.y >= 0 && measured.image.bottom <= viewport.height,
          `First-screen photograph missing: ${label}: ${JSON.stringify(measured.image)}`);
        check(measured.brand.y >= 0 && measured.brand.bottom <= viewport.height && measured.text > 0,
          `First-screen identity missing: ${label}`);
        if (screenshot && mode === "speed") await screenshot(page, identity.id, viewport);
        if (identity.id <= 30) {
          check(measured.header.height <= 120 && measured.brand.bottom <= measured.header.bottom,
            `Masthead clips the brand: ${label}`);
          check(measured.brand.x + measured.brand.width <= measured.menu.x
            || measured.menu.x + measured.menu.width <= measured.brand.x
            || measured.brand.bottom <= measured.menu.y, `Menu overlaps the brand: ${label}`);
          const menu = page.locator(".compact-menu-button");
          await menu.click();
          check(await page.locator(".compact-page-nav a").count() === 7, `Missing page navigation: ${label}`);
          for (let index = 0; index < 9; index++) {
            if (index) await page.keyboard.press("Tab");
            const fits = await page.locator(".compact-menu-panel").evaluate(panel => {
              const box = panel.getBoundingClientRect();
              const active = document.activeElement.getBoundingClientRect();
              return panel.contains(document.activeElement) && box.bottom <= innerHeight
                && active.top >= box.top && active.bottom <= box.bottom + 1;
            });
            check(fits, `Menu focus is clipped: ${label}, link ${index}`);
          }
          await page.keyboard.press("Escape");
          check(await menu.evaluate(element => element === document.activeElement && element.getAttribute("aria-expanded") === "false"),
            `Menu Escape failed: ${label}`);
        }
        results.push({ mode, id: identity.id, viewport, ...measured });
      }
    }
  }
  check(errors.length === 0, JSON.stringify(errors));
  await page.close();
  return { visits: results.length, results, issues, errors };
}
