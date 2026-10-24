(async (page, { baseUrl = "http://localhost:4173/", concurrency = 3, onRoute = () => {} } = {}) => {
  const base = new URL(baseUrl);
  const results = [];
  const queued = new Set(["#/", "#/navigate", "#/matrix", "#/docs", "#/watch",
    ...Array.from({ length: 30 }, (_, index) => `#/site/${index + 1}`)]);
  const queue = [...queued];
  const visited = new Set();
  const assetChecks = new Map();
  const fontFiles = new Map();
  const navigation = [];

  async function checkAsset(url) {
    if (!assetChecks.has(url)) {
      assetChecks.set(url, (async () => {
        const response = await page.request.get(url);
        const result = { url, status: response.status(), type: response.headers()["content-type"] };
        await response.dispose();
        return result;
      })());
    }
    return assetChecks.get(url);
  }

  async function checkRoute(hash) {
    const tab = await page.context().newPage();
    const session = await tab.context().newCDPSession(tab);
    await session.send("Network.enable");
    await session.send("Network.setCacheDisabled", { cacheDisabled: true });
    await session.send("Log.enable");
    const result = {
      hash, failures: [], httpErrors: [], exceptions: [], consoleErrors: [],
      browserLogErrors: [], diagnostics: [], resources: [], issues: [],
    };
    let phase = "loading";
    tab.on("requestfailed", request => {
      const failure = { url: request.url(), error: request.failure()?.errorText };
      if (phase === "teardown") result.diagnostics.push({ ...failure, phase });
      else result.failures.push(failure);
    });
    tab.on("response", response => {
      const resource = {
        url: response.url(), status: response.status(),
        type: response.headers()["content-type"], kind: response.request().resourceType(),
      };
      result.resources.push(resource);
      if (resource.status >= 400) result.httpErrors.push(resource);
      if (resource.url.startsWith("https://fonts.gstatic.com/")) fontFiles.set(resource.url, resource);
    });
    tab.on("pageerror", error => result.exceptions.push(error.message));
    tab.on("console", message => {
      if (message.type() === "error") result.consoleErrors.push({ text: message.text(), ...message.location() });
    });
    session.on("Log.entryAdded", ({ entry }) => {
      if (entry.level === "error") result.browserLogErrors.push(entry);
    });
    try {
      const response = await tab.goto(`${base.href}${hash}`, { waitUntil: "load", timeout: 45000 });
      result.documentStatus = response.status();
      const html = await response.text();
      result.correctedFonts = html.includes("Fraunces:opsz,wght@9..144,600;9..144,700");
      await tab.waitForFunction(() =>
        document.querySelector("#app")?.textContent.trim()
        && !document.querySelector(".loading-shell"), null, { timeout: 15000 });
      await tab.waitForFunction(() => document.fonts.status === "loaded", null, { timeout: 30000 });
      const state = await tab.evaluate(async () => {
        await document.fonts.ready;
        for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) {
          scrollTo({ top: y, behavior: "instant" });
          await new Promise(resolve => requestAnimationFrame(resolve));
        }
        const images = await Promise.all([...document.images].map(async image => {
          try {
            await image.decode();
            return { url: image.currentSrc || image.src, complete: image.complete,
              width: image.naturalWidth, height: image.naturalHeight };
          } catch (error) {
            return { url: image.currentSrc || image.src, error: error.message };
          }
        }));
        const backgrounds = new Set();
        for (const element of document.querySelectorAll("*")) {
          for (const pseudo of [null, "::before", "::after"]) {
            const style = getComputedStyle(element, pseudo);
            for (const value of [style.backgroundImage, style.maskImage, style.borderImageSource,
              style.listStyleImage, style.content]) {
              for (const [, url] of value.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
                if (!url.startsWith("data:")) backgrounds.add(new URL(url, document.baseURI).href);
              }
            }
          }
        }
        const backgroundImages = await Promise.all([...backgrounds].map(async url => {
          const image = new Image();
          image.src = url;
          try {
            await image.decode();
            return { url, width: image.naturalWidth, height: image.naturalHeight };
          } catch (error) {
            return { url, error: error.message };
          }
        }));
        return {
          title: document.title, readyState: document.readyState, fontsStatus: document.fonts.status,
          fontErrors: [...document.fonts].filter(font => font.status === "error")
            .map(font => ({ family: font.family, weight: font.weight })),
          renderedSection: document.querySelector(".demo-site")?.dataset.section,
          contentLength: document.querySelector("#app").textContent.trim().length,
          images, backgroundImages,
          stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')]
            .map(link => ({ url: link.href, loaded: !!link.sheet })),
          icons: [...document.querySelectorAll('link[rel~="icon"]')]
            .map(link => ({ url: link.href, type: link.type })),
          links: [...document.querySelectorAll("a[href]")].map(link => ({
            url: link.href, raw: link.getAttribute("href"),
            fragmentExists: !link.hash || link.hash === "#" || link.hash.startsWith("#/")
              || !!document.getElementById(decodeURIComponent(link.hash.slice(1))),
          })),
        };
      });
      Object.assign(result, state);
      for (const link of state.links) {
        const url = new URL(link.url);
        if (url.origin !== base.origin) continue;
        navigation.push({ from: hash, ...link });
        if (url.pathname === base.pathname && url.hash.startsWith("#/")) {
          if (!queued.has(url.hash)) {
            queued.add(url.hash);
            queue.push(url.hash);
          }
        } else if (!url.hash && url.pathname !== base.pathname) {
          const asset = await checkAsset(url.href);
          if (asset.status >= 400) result.issues.push({ kind: "internal-asset", ...asset });
        } else if (!link.fragmentExists) {
          result.issues.push({ kind: "missing-fragment", url: link.url });
        }
      }
      result.iconResponses = await Promise.all(state.icons.map(icon => checkAsset(icon.url)));
      if (!state.icons.length) result.issues.push({ kind: "missing-favicon", url: base.href });
      for (const icon of result.iconResponses) {
        if (icon.status !== 200 || !icon.type?.startsWith("image/")) {
          result.issues.push({ kind: "favicon-response", ...icon });
        }
        if (!icon.url.startsWith(base.href)) result.issues.push({ kind: "favicon-outside-project", ...icon });
      }
      if (hash === "#/watch") {
        await tab.waitForFunction(() => {
          const video = document.querySelector("video");
          return video?.currentTime > 1 && !video.paused;
        }, null, { timeout: 60000 });
        const before = await tab.locator("video").evaluate(video => ({
          time: video.currentTime, frames: video.getVideoPlaybackQuality().totalVideoFrames,
        }));
        await tab.waitForFunction(before => {
          const video = document.querySelector("video");
          return video.currentTime > before.time + 2
            && video.getVideoPlaybackQuality().totalVideoFrames > before.frames + 20;
        }, before, { timeout: 30000 });
        result.video = await tab.locator("video").evaluate(video => ({
          url: video.currentSrc, width: video.videoWidth, height: video.videoHeight,
          duration: video.duration, currentTime: video.currentTime, paused: video.paused,
          muted: video.muted, loop: video.loop, error: video.error,
          frames: video.getVideoPlaybackQuality().totalVideoFrames,
          droppedFrames: video.getVideoPlaybackQuality().droppedVideoFrames,
        }));
        result.video.before = before;
        if (result.video.width < 3840 || result.video.height < 2160 || result.video.error) {
          result.issues.push({ kind: "video", ...result.video });
        }
      } else {
        await tab.waitForLoadState("networkidle", { timeout: 20000 });
      }
      const site = /^#\/site\/(\d+)(?:\/([^/]+))?$/.exec(hash);
      if (site && state.renderedSection !== (site[2] || "home")) {
        result.issues.push({ kind: "wrong-section", expected: site[2] || "home",
          actual: state.renderedSection, url: tab.url() });
      }
      if (site) {
        result.skipNavigation = [];
        const skipLinks = tab.locator('a[href^="#"]:not([href^="#/"])');
        for (let index = 0; index < await skipLinks.count(); index++) {
          const skip = skipLinks.nth(index);
          const target = await skip.getAttribute("href");
          const viewport = tab.viewportSize();
          if (!await skip.evaluate(link => link.getClientRects().length > 0)) {
            await tab.setViewportSize({ width: 1280, height: 800 });
          }
          await skip.focus();
          if (!await skip.evaluate(link => link === document.activeElement)) {
            result.issues.push({ kind: "unfocusable-skip-link", target });
            break;
          }
          await skip.press("Enter");
          await tab.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
          const actual = await tab.evaluate(() => ({
            hash: location.hash, activeId: document.activeElement.id,
            section: document.querySelector(".demo-site")?.dataset.section,
          }));
          result.skipNavigation.push({ target, ...actual });
          await tab.setViewportSize(viewport);
          if (actual.hash !== hash || actual.activeId !== target.slice(1)
            || actual.section !== (site[2] || "home")) {
            result.issues.push({ kind: "skip-navigation", target, ...actual });
            break;
          }
        }
      }
      if (site && !site[2]) {
        const target = `#/site/${site[1]}/about`;
        const menu = tab.locator(".compact-menu-button");
        if (await menu.isVisible()) await menu.click();
        await tab.locator(`a[href="${target}"]:visible`).first().click();
        await tab.waitForFunction(() => document.querySelector(".demo-site")?.dataset.section === "about",
          null, { timeout: 10000 });
        result.navigationClick = { target, renderedSection: "about" };
      }
      if (state.readyState !== "complete" || state.fontsStatus !== "loaded") {
        result.issues.push({ kind: "incomplete-document", readyState: state.readyState, fonts: state.fontsStatus });
      }
      if (!result.correctedFonts) result.issues.push({ kind: "font-selector-regression", url: tab.url() });
      for (const image of [...state.images, ...state.backgroundImages]) {
        if (image.error || !image.width || !image.height) result.issues.push({ kind: "image", ...image });
      }
      for (const sheet of state.stylesheets) {
        if (!sheet.loaded) result.issues.push({ kind: "stylesheet", ...sheet });
      }
      for (const font of state.fontErrors) result.issues.push({ kind: "font", ...font });
    } catch (error) {
      result.issues.push({ kind: "audit-exception", error: error.message, url: tab.url() });
    } finally {
      phase = "teardown";
      await tab.close();
    }
    results.push(result);
    visited.add(hash);
    await onRoute(result);
  }

  while (queue.length) {
    await Promise.all(queue.splice(0, concurrency).map(checkRoute));
  }
  const brokenDestinations = navigation.filter(link => {
    const url = new URL(link.url);
    return url.pathname === base.pathname && url.hash.startsWith("#/") && !visited.has(url.hash);
  });
  for (let id = 1; id <= 30; id++) {
    for (const section of ["", "/home", "/about", "/offerings", "/resources", "/detail", "/faq", "/contact"]) {
      if (!visited.has(`#/site/${id}${section}`)) {
        brokenDestinations.push({ url: `${base.href}#/site/${id}${section}`, error: "Route not discovered" });
      }
    }
  }
  const failures = results.filter(result => result.issues.length || result.failures.length
    || result.httpErrors.length || result.exceptions.length || result.consoleErrors.length
    || result.browserLogErrors.length);
  return {
    baseUrl: base.href, checkedAt: new Date().toISOString(), cacheDisabled: true,
    userAgent: await page.evaluate(() => navigator.userAgent),
    routeCount: results.length, failedRouteCount: failures.length,
    imageCount: results.reduce((sum, result) => sum + (result.images?.length || 0), 0),
    backgroundImageCount: results.reduce((sum, result) => sum + (result.backgroundImages?.length || 0), 0),
    fontFiles: [...fontFiles.values()], assets: await Promise.all(assetChecks.values()),
    brokenDestinations, results,
  };
})
