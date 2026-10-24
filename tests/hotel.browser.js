(async (page, { baseUrl = "http://localhost:4193/", screenshotDirectory } = {}) => {
  const errors = [];
  let checks = 0;
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
    checks++;
  };
  const onError = error => errors.push(error.message);
  const onConsole = message => { if (message.type() === "error") errors.push(message.text()); };
  const onFailure = request => errors.push(`${request.url()}: ${request.failure()?.errorText}`);
  const onResponse = response => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
  };
  page.on("pageerror", onError);
  page.on("console", onConsole);
  page.on("requestfailed", onFailure);
  page.on("response", onResponse);
  const checkFocus = async selector =>
    page.locator(selector).evaluate(element => document.activeElement === element);
  try {
    await page.goto(`${baseUrl}#/site/1/home`);
    await page.reload();
    for (const viewport of [
      { width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 320, height: 568 },
      { width: 960, height: 440 }, { width: 640, height: 300 }, { width: 1280, height: 620 },
    ]) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => { location.hash = "#/site/1/about"; });
      await page.waitForSelector('.site-shell-1[data-section="about"]');
      await page.evaluate(() => { location.hash = "#/site/1/home"; });
      await page.waitForSelector("#hotel-stay-form");
      await page.waitForFunction(() => [...document.querySelectorAll('link[href^="sites/"]')].every(link => link.sheet));
      const form = page.locator("#hotel-stay-form");
      const submit = form.locator('[type="submit"]');
      const resultCount = () => page.locator("[data-room-toggle]").count();
      const search = async values => {
        for (const [name, value] of Object.entries(values)) {
          const field = form.locator(`[name="${name}"]`);
          if (name === "style") await field.selectOption(value);
          else await field.fill(value);
        }
        await submit.click();
      };
      assert(await resultCount() === 3, "Default stay must show three rooms");
      await page.locator('[data-hotel-action="plan-stay"]').click();
      assert(await checkFocus('[name="arrival"]'), "Hero action focuses arrival");
      assert(await form.evaluate(element => element.getBoundingClientRect().top >= -1), "Planner is scrolled into view");

      await search({ arrival: "2027-05-07", departure: "2027-05-10" });
      assert((await page.locator(".hotel-room-quote").first().textContent()).includes("552"), "Weekend sample total is calculated");
      const toggles = page.locator("[data-room-toggle]");
      await toggles.nth(0).click();
      assert(await page.locator('[data-hotel-action="compare"]').isDisabled(), "One room cannot open comparison");
      await toggles.nth(1).click();
      await form.locator('[name="arrival"]').fill("2027-05-08");
      assert((await page.locator("#hotel-search-status").textContent()).includes("Changes not applied"), "Unapplied changes are explicit");
      await page.locator('[data-hotel-action="compare"]').click();
      assert(await page.locator("#hotel-comparison").evaluate(element => element.matches(":modal")), "Comparison is a native modal");
      assert((await page.locator(".hotel-comparison-dates").textContent()).includes("7 May 2027"), "Comparison uses last applied stay");
      assert((await page.locator(".hotel-comparison-body").textContent()).includes("552"), "Comparison shows computed totals");
      assert((await page.locator(".hotel-comparison-body").textContent()).includes("Stairs; not fully step-free"), "Comparison retains meaningful access facts");
      await page.keyboard.press("Shift+Tab");
      assert(await page.locator("#hotel-comparison").evaluate(element => element.contains(document.activeElement)), "Comparison traps backward tab focus");
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => !document.querySelector("#hotel-comparison").open);
      assert(await checkFocus('[data-hotel-action="compare"]'), "Escape restores comparison opener");

      await search({ guests: "3", arrival: "2027-05-07" });
      assert(await resultCount() === 1, "Three guests filters to one room");
      assert(await page.locator('[data-room-toggle="roomSalon"]').count() === 1, "Three guests selects salon");
      assert((await page.locator("#hotel-search-status").textContent()).includes("selection cleared"), "Search clears stale comparison");
      await search({ style: "balcony" });
      assert(await resultCount() === 0 && await page.locator(".hotel-no-results").isVisible(), "Incompatible filter has useful empty state");
      await page.locator('[data-hotel-action="reset"]').click();
      assert(await resultCount() === 3 && await checkFocus('#hotel-stay-form [type="submit"]'), "Empty-state reset restores results and focus");
      await search({ arrival: "2027-05-24", departure: "2027-05-25" });
      assert(await resultCount() === 0, "Date blocks genuinely affect availability");
      await page.locator('[data-hotel-action="reset"]').click();
      await search({ departure: "2027-05-03" });
      assert(await checkFocus('[name="departure"]'), "Invalid dates focus the field");
      assert(await form.locator('[name="departure"]').getAttribute("aria-invalid") === "true", "Date error is accessible");
      assert(await page.locator("#hotel-error-departure").isVisible(), "Date error is visibly displayed");
      assert(await resultCount() === 3, "Invalid submission preserves displayed results");
      assert((await page.locator("#hotel-search-status").textContent()).includes("Results are unchanged"), "Invalid result state is explicit");
      await search({ departure: "2027-05-06", guests: "4" });
      assert(await checkFocus('[name="guests"]') && await page.locator("#hotel-error-guests").isVisible(), "Guest bounds are visibly enforced");
      await search({ guests: "2.5" });
      assert(await page.locator("#hotel-error-guests").isVisible(), "Fractional guests are rejected");
      await search({ guests: "2" });
      assert(await form.locator('[name="guests"]').getAttribute("aria-invalid") === "false", "Successful search clears validation");

      await toggles.nth(0).click();
      await toggles.nth(0).click();
      assert(await page.locator('[data-hotel-action="compare"]').isDisabled(), "Selection can be toggled off");
      for (let index = 0; index < 3; index++) await toggles.nth(index).click();
      await page.locator('[data-hotel-action="compare"]').click();
      assert(await page.locator("[data-remove-room]").count() === 3, "Three-room comparison renders all selected rooms");
      assert(await page.locator("#hotel-comparison").evaluate(element => {
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= innerHeight + 1 && rect.right <= innerWidth + 1;
      }), "Comparison fits the content viewport");
      if (screenshotDirectory) await page.screenshot({ path: `${screenshotDirectory}\\hotel-compare-${viewport.width}.png` });
      await page.locator("[data-remove-room]").first().click();
      assert(await page.locator("[data-remove-room]").count() === 2, "Drawer removal updates comparison");
      await page.locator('[data-hotel-action="close-comparison"]').click();
      assert(await checkFocus('[data-hotel-action="compare"]'), "Close comparison restores opener");
      await page.locator('[data-hotel-action="compare"]').click();
      await page.locator("[data-remove-room]").first().click();
      await page.locator("[data-remove-room]").first().click();
      await page.waitForFunction(() => !document.querySelector("#hotel-comparison").open);
      assert(await checkFocus('[data-room-toggle="roomBlue"]'), "Removing last room closes and restores a usable focus target");

      const photoOpener = page.locator('[data-hotel-photo="city"]').first();
      await photoOpener.click();
      assert(await page.locator("#hotel-gallery").evaluate(element => element.matches(":modal")), "Gallery is a native modal");
      if (viewport.width === 1440) {
        for (const size of [{ width: 960, height: 440 }, { width: 640, height: 300 }, { width: 1280, height: 620 }]) {
          await page.setViewportSize(size);
          assert(await page.locator("#hotel-gallery").evaluate(element => {
            const rect = element.getBoundingClientRect();
            return rect.top >= 0 && rect.bottom <= innerHeight + 1 && rect.right <= innerWidth + 1;
          }), "Open gallery fits after resizing into a quadrant");
        }
        await page.setViewportSize(viewport);
      }
      assert(await page.locator("[data-photo-index]").count() === 5, "Gallery contains five useful photo thumbnails");
      assert((await page.locator(".hotel-gallery-main").textContent()).includes("fhm / Getty Images"), "Getty photographer credit is present");
      assert((await page.locator(".hotel-gallery-main").textContent()).includes("not the hotel's exterior"), "Stock location is not misrepresented");
      await page.locator('[data-hotel-action="previous-photo"]').click();
      assert((await page.locator(".hotel-photo-position").textContent()) === "Photo 5 of 5", "Previous wraps at first photo");
      await page.locator('[data-hotel-action="next-photo"]').click();
      assert((await page.locator(".hotel-photo-position").textContent()) === "Photo 1 of 5", "Next wraps at last photo");
      await page.locator('[data-photo-index="1"]').click();
      assert((await page.locator(".hotel-gallery-main").textContent()).includes("fumumpa / Getty Images"), "Thumbnail selects credited Getty tile image");
      await page.keyboard.press("ArrowRight");
      assert(await checkFocus('[data-photo-index="2"]'), "Arrow navigation moves thumbnail focus");
      assert((await page.locator(".hotel-gallery-main").textContent()).includes("not an actual room"), "Interior is clearly illustrative");
      assert((await page.locator(".hotel-gallery-main").textContent()).includes("Edwin Tan / Getty Images"), "Room gallery retains the replacement photographer");
      assert(!(await page.locator(".hotel-gallery-main").textContent()).includes("Pexels"), "Room gallery contains no stale source label");
      await page.keyboard.press("End");
      assert((await page.locator(".hotel-photo-position").textContent()) === "Photo 5 of 5", "End selects last photo");
      await page.keyboard.press("Home");
      assert((await page.locator(".hotel-photo-position").textContent()) === "Photo 1 of 5", "Home selects first photo");
      await page.locator('[data-hotel-action="close-gallery"]').focus();
      await page.keyboard.press("Shift+Tab");
      assert(await page.locator("#hotel-gallery").evaluate(element => element.contains(document.activeElement)), "Gallery traps backward tab focus");
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.querySelectorAll("#hotel-gallery img")].map(image => image.decode()));
      });
      if (screenshotDirectory) await page.screenshot({ path: `${screenshotDirectory}\\hotel-gallery-${viewport.width}.png` });
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => !document.querySelector("#hotel-gallery").open);
      assert(await photoOpener.evaluate(element => document.activeElement === element), "Escape restores exact gallery opener");
      assert(await page.locator(".hotel-gallery-body img").count() === 0, "Closed gallery releases its extra image DOM");
      await page.locator('[data-hotel-photo="roomOchre"]').click();
      assert((await page.locator(".hotel-photo-position").textContent()) === "Photo 4 of 5", "Room photo opens the matching gallery image");
      await page.locator('[data-hotel-action="close-gallery"]').click();
      await page.waitForFunction(() => !document.querySelector("#hotel-gallery").open);
      assert(await checkFocus('[data-hotel-photo="roomOchre"]'), "Close gallery restores exact room opener");
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "Page has no horizontal overflow");
      await page.locator("#hotel-stay-title").scrollIntoViewIfNeeded();
      if (screenshotDirectory) await page.screenshot({ path: `${screenshotDirectory}\\hotel-planner-${viewport.width}.png` });

      await photoOpener.click();
      await page.evaluate(() => { location.hash = "#/site/1/about"; });
      await page.waitForSelector('.site-shell-1[data-section="about"]');
      assert(await page.locator("dialog:modal").count() === 0, "Route change removes modal safely");
      if (viewport.width <= 980 || viewport.height <= 650) await page.locator(".compact-menu-button").click();
      await page.locator(`${viewport.width <= 980 || viewport.height <= 650 ? ".compact-page-nav" : ".tab-rail"} a`).filter({ hasText: /^Home$/ }).click();
      await page.waitForSelector("#hotel-stay-form");
      await page.locator('[data-hotel-action="plan-stay"]').click();
      assert(await checkFocus('[name="arrival"]'), "New route has a functioning fresh controller");
    }
    assert(errors.length === 0, `Browser/network errors: ${errors.join("; ")}`);
    return { checks, errors, viewports: 6, note: "Functional UI checks; no total-browser memory benchmark." };
  } finally {
    page.off("pageerror", onError);
    page.off("console", onConsole);
    page.off("requestfailed", onFailure);
    page.off("response", onResponse);
  }
})
