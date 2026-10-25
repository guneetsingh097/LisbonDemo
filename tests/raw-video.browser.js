(async (page, { baseUrl = "http://localhost:4173/" } = {}) => {
  const url = "https://lisbongettyguneet.storage.googleapis.com/GettyImages-2270002248.mp4";
  const errors = [], scripts = [];
  const onError = error => errors.push(error.message);
  const onResponse = response => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
  };
  const onRequest = request => {
    if (request.resourceType() === "script") scripts.push(request.url());
  };
  page.on("pageerror", onError);
  page.on("response", onResponse);
  page.on("request", onRequest);
  try {
    await page.goto(`${baseUrl}#/watch/raw`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForURL(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("video");
    const video = page.locator("video");
    // The browser's media document owns autoplay policy; permit native Play if needed.
    if (await video.evaluate(video => video.paused)) {
      await video.click();
      await video.evaluate(video => video.play());
    }
    await page.waitForFunction(() => document.querySelector("video").currentTime > 26,
      null, { timeout: 90000 });
    const result = await video.evaluate(video => ({
      url: location.href, source: video.currentSrc, controls: video.controls,
      width: video.videoWidth, height: video.videoHeight, time: video.currentTime,
      duration: video.duration, error: video.error?.code, paused: video.paused,
      siteWrapper: !!document.querySelector("#app, .watch-page, .video-loading, .watch-navigation"),
      siteScripts: [...document.scripts].map(script => script.src),
    }));
    await page.waitForFunction(() => document.querySelector("video").ended,
      null, { timeout: 60000 });
    if (result.url !== url || result.source !== url || !result.controls || result.paused
      || result.error || result.siteWrapper || result.siteScripts.length
      || scripts.some(source => /\/(?:app|sites-a|sites-b)\.js(?:\?|$)/.test(source)) || errors.length) {
      throw new Error(JSON.stringify({ result, scripts, errors }));
    }
    // Hash navigation from an already loaded app must open the same raw document.
    await page.goto(`${baseUrl}#/`, { waitUntil: "load" });
    await page.waitForSelector(".portal-header");
    await page.evaluate(() => { location.hash = "#/watch/raw"; });
    await page.waitForURL(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    if (errors.length) throw new Error(JSON.stringify(errors));
    return { ...result, completed: true, inAppRedirectPassed: true, errors };
  } finally {
    page.off("pageerror", onError);
    page.off("response", onResponse);
    page.off("request", onRequest);
  }
})
