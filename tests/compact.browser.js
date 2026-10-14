(async (page) => {
  const sections = ["home", "about", "offerings", "resources", "detail", "faq", "contact"];
  const viewports = [
    { width: 660, height: 320 },
    { width: 800, height: 400 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
    { width: 1440, height: 900 },
  ];
  const errors = [];
  const failures = [];
  const counts = {};
  const onError = error => errors.push(error.message);
  const onResponse = response => {
    if (response.status() >= 400 && !response.url().endsWith("/favicon.ico")) {
      errors.push(`HTTP ${response.status()}: ${response.url()}`);
    }
  };
  page.on("pageerror", onError);
  page.on("response", onResponse);
  await page.goto("http://localhost:4187/#/site/1/home", { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    let checked = 0;
    for (let id = 1; id <= 30; id++) {
      for (const section of sections) {
        await page.evaluate(({ id, section }) => {
          location.hash = `#/site/${id}/${section}`;
        }, { id, section });
        await page.waitForFunction(({ id, section }) =>
          document.querySelector(`.site-shell-${id}`)?.dataset.section === section, { id, section });
        await page.waitForFunction(() =>
          [...document.querySelectorAll('link[href^="sites/"]')].every(link => link.sheet));
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => {
          scrollTo({ top: 0, left: 0, behavior: "instant" });
          resolve();
        })));
        const issues = await page.evaluate(({ id, section, viewport }) => {
          const root = document.querySelector(`.site-shell-${id}`);
          const main = root.querySelector(".compact-content");
          const header = root.querySelector(".compact-site-header");
          const issues = [];
          const compact = viewport.width <= 980;
          if (compact && document.documentElement.scrollWidth > innerWidth + 1) {
            issues.push(`Document overflows: ${document.documentElement.scrollWidth}px`);
          }
          if (compact && main.getBoundingClientRect().top > Math.min(190, innerHeight * .6)) {
            issues.push(`Main begins too low: ${main.getBoundingClientRect().top}px`);
          }
          if (getComputedStyle(header).display !== (compact ? "block" : "none")) {
            issues.push("Wrong masthead for viewport");
          }
          const links = [...header.querySelectorAll(".compact-page-nav a")];
          if (links.length !== 7) issues.push("Missing page navigation");
          if (header.querySelector('[aria-current="page"]')?.getAttribute("href") !== `#/site/${id}/${section}`) {
            issues.push("Wrong current-page state");
          }
          if (compact && links.some(link => link.getBoundingClientRect().height < 44)) {
            issues.push("Navigation target smaller than 44px");
          }
          if (!main.textContent.trim()) issues.push("Empty content");
          if (compact && [...main.querySelectorAll("img")].some(img => img.complete && img.naturalWidth === 0)) {
            issues.push("Broken content image");
          }
          if (compact && [...main.querySelectorAll("table")].some(table =>
            !table.closest('.compact-table-region[role="region"][tabindex="0"]'))) {
            issues.push("Table has no keyboard-accessible scroll region");
          }
          return issues;
        }, { id, section, viewport });
        if (issues.length) failures.push({ viewport, id, section, issues });
        checked++;
      }
    }
    counts[`${viewport.width}x${viewport.height}`] = checked;
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:4187/#/site/1/home", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  const skipWorks = await page.evaluate(() => document.activeElement.classList.contains("compact-content"));
  await page.getByRole("link", { name: "Contact", exact: true }).click();
  await page.waitForFunction(() => document.querySelector(".demo-site")?.dataset.section === "contact");
  page.off("pageerror", onError);
  page.off("response", onResponse);
  if (!skipWorks) failures.push({ issues: ["Keyboard skip-to-content failed"] });
  if (failures.length || errors.length) {
    throw new Error(JSON.stringify({ counts, failures, errors }, null, 2));
  }
  return { counts, pagesChecked: Object.values(counts).reduce((a, b) => a + b, 0), skipWorks, errors, failures };
})
