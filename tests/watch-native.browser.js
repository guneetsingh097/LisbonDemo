(async (page, { baseUrl = "http://localhost:4173/" } = {}) => {
  const errors = [];
  const onError = error => errors.push(error.message);
  const onConsole = message => { if (message.type() === "error") errors.push(message.text()); };
  const onResponse = response => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
  };
  const onFailure = request => errors.push(`${request.failure()?.errorText}: ${request.url()}`);
  page.on("pageerror", onError);
  page.on("console", onConsole);
  page.on("response", onResponse);
  page.on("requestfailed", onFailure);
  try {
    await page.goto(`${baseUrl}#/watch`, { waitUntil: "load", timeout: 60000 });
    await page.waitForSelector("video");
    await page.evaluate(async () => {
      await document.fonts.ready;
      const video = document.querySelector("video");
      window.nativeWatchLoops = 0;
      window.departingVideo = video;
      video.addEventListener("ended", () => window.nativeWatchLoops++);
    });
    await page.waitForFunction(() => document.querySelector("video").currentTime > 26,
      null, { timeout: 90000 });
    // Native media API actions must not be overridden by page playback logic.
    const video = page.locator("video");
    await video.evaluate(video => video.pause());
    await page.waitForFunction(() => document.querySelector("video").paused);
    const pausedAt = await video.evaluate(video => video.currentTime);
    await page.waitForTimeout(1200);
    if (Math.abs(await video.evaluate(video => video.currentTime) - pausedAt) > .2) {
      throw new Error("Native pause was overridden");
    }
    await video.evaluate(video => video.play());
    await page.waitForFunction(position => {
      const video = document.querySelector("video");
      return !video.paused && video.currentTime > position + .5;
    }, pausedAt);
    await page.waitForFunction(() => window.nativeWatchLoops > 0
      && document.querySelector("video").currentTime > 2, null, { timeout: 70000 });
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 320, height: 300 }]) {
      await page.setViewportSize(viewport);
      const valid = await video.evaluate(video => {
        const rect = video.getBoundingClientRect();
        return video.controls && rect.width > 0 && rect.height > 0
          && rect.right <= innerWidth + 1 && rect.bottom <= innerHeight + 1;
      });
      if (!valid) throw new Error(`Native player bounds/controls: ${JSON.stringify(viewport)}`);
    }
    const result = await video.evaluate(video => ({
      url: video.currentSrc, duration: video.duration, width: video.videoWidth, height: video.videoHeight,
      controls: video.controls, autoplay: video.autoplay, muted: video.muted,
      defaultMuted: video.defaultMuted, inline: video.playsInline,
      time: video.currentTime, paused: video.paused, error: video.error?.code,
      documentComplete: document.readyState === "complete", fontsLoaded: document.fonts.status === "loaded",
      customLoading: !!document.querySelector("#video-loading"), loops: window.nativeWatchLoops,
    }));
    if (result.url !== "https://storage.googleapis.com/lisbongettyguneet/GettyImages-2270002248.mp4"
      || !result.controls || !result.autoplay || !result.muted || !result.defaultMuted
      || !result.inline || result.paused || result.error || result.customLoading
      || !result.documentComplete || !result.fontsLoaded || result.width <= 0 || result.height <= 0
      || errors.length) {
      throw new Error(JSON.stringify({ result, errors }));
    }
    // Seeking is native too; no custom handler may restore an earlier position.
    await video.evaluate(video => { video.currentTime = 15; });
    await page.waitForFunction(() => {
      const video = document.querySelector("video");
      return !video.seeking && video.currentTime > 15.5 && video.currentTime < 20;
    });
    // Cancellation is expected when deliberately releasing a progressive source.
    page.off("requestfailed", onFailure);
    await page.evaluate(() => { location.hash = "#/navigate"; });
    await page.waitForFunction(() => !document.querySelector("video"));
    const released = await page.evaluate(() =>
      window.departingVideo.paused && !window.departingVideo.hasAttribute("src"));
    if (!released) throw new Error("Navigation did not release native video");
    await page.evaluate(() => { location.hash = "#/watch"; });
    await page.waitForFunction(() => document.querySelector("video")?.currentTime > .5);
    if (errors.length) throw new Error(JSON.stringify(errors));
    return { ...result, pausedAt, seekPassed: true, cleanupPassed: released, returnPlaybackPassed: true, errors };
  } finally {
    page.off("pageerror", onError);
    page.off("console", onConsole);
    page.off("response", onResponse);
    page.off("requestfailed", onFailure);
  }
})
