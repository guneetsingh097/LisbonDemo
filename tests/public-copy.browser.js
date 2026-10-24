(async (page, { baseUrl = "http://localhost:4193/", startId = 1, endId = 30, screenshots } = {}) => {
  const failures = [];
  const sizes = [[1440, 1000], [390, 844], [320, 568], [960, 440], [640, 300], [1280, 620]];
  let visits = 0, captions = 0;
  const onError = error => failures.push(error.message);
  page.on("pageerror", onError);
  try {
    await page.goto(`${baseUrl}?review=public-copy-layout#/site/${startId}`);
    for (let id = startId; id <= endId; id++) {
      for (const [width, height] of sizes) {
        await page.setViewportSize({ width, height });
        await page.evaluate(id => { location.hash = `#/site/${id}/home`; }, id);
        await page.waitForSelector(`.site-shell-${id}[data-section="home"]`);
        await page.waitForFunction(id => document.querySelector(`link[href="sites/site-${String(id).padStart(2, "0")}.css"]`)?.sheet, id);
        await page.evaluate(() => document.fonts.ready);
        const result = await page.evaluate(() => {
          const text = document.body.innerText;
          const badCopy = /\b(?:sample|fictional|illustrative|imagined|mock|demonstration|demonstrative)\b|not a photograph of/i.exec(text)?.[0];
          const problems = [];
          const captions = [...document.querySelectorAll(".demo-site figcaption")];
          for (const caption of captions) {
            if (!caption.getClientRects().length) continue;
            // Local layout boxes avoid false overlap reports on rotated hostel cards.
            const nodes = [...caption.children].map(node => ({
              parent: node.offsetParent, left: node.offsetLeft, top: node.offsetTop,
              right: node.offsetLeft + node.offsetWidth, bottom: node.offsetTop + node.offsetHeight,
            }));
            for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
              const a = nodes[i], b = nodes[j];
              if (a.parent === b.parent &&
                Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 &&
                Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2) {
                problems.push(caption.innerText);
              }
            }
            if ([caption, ...caption.children].some(node => node.scrollWidth > node.clientWidth + 2)) {
              problems.push(`Caption overflow: ${caption.innerText}`);
            }
          }
          const menu = document.querySelector(".compact-menu-button");
          const compact = matchMedia("(max-width: 980px), (max-height: 650px)").matches;
          const heroCaption = document.querySelector(".site-shell-2 .hero-image figcaption");
          return { badCopy, problems, captions: captions.length,
            overflow: document.documentElement.scrollWidth > innerWidth + 2,
            hiddenHero: !heroCaption || getComputedStyle(heroCaption).display === "none",
            collapsed: !compact || menu?.getAttribute("aria-expanded") === "false" };
        });
        visits++; captions += result.captions;
        if (result.badCopy || result.problems.length || result.overflow || !result.collapsed || !result.hiddenHero) {
          failures.push({ id, width, height, ...result });
        }
        if (screenshots && [1, 3, 4].includes(id) && [390, 960].includes(width)) {
          if (id === 3) await page.locator(".collage-grid").scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${screenshots}\\site-${id}-${width}.png` });
        }
      }
    }
    if (failures.length) throw new Error(JSON.stringify(failures));
    return { startId, endId, visits, captions, sizes, failures };
  } finally {
    page.off("pageerror", onError);
  }
})
