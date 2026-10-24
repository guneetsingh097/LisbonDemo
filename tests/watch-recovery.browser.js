(async (page, { baseUrl = "http://localhost:4173/", simulateStall = false } = {}) => {
  const errors = [];
  const warnings = [];
  const onError = error => errors.push(error.message);
  const onConsole = message => {
    if (message.type() === "error") errors.push(message.text());
    if (message.type() === "warning") warnings.push(message.text());
  };
  page.on("pageerror", onError);
  page.on("console", onConsole);
  try {
    await page.goto(`${baseUrl}#/watch`, { waitUntil: "load", timeout: 60000 });
    await page.evaluate(() => {
      const video = document.querySelector("video");
      window.watchRecoveryEvents = [];
      for (const event of ["playing", "waiting", "emptied", "loadedmetadata", "ended", "error"]) {
        video.addEventListener(event, () => window.watchRecoveryEvents.push({
          event, time: video.currentTime, error: video.error?.code,
        }));
      }
    });
    await page.waitForFunction(() => document.querySelector("video").currentTime > 26,
      null, { timeout: 90000 });
    let stalledAt = null;
    if (simulateStall) {
      // Deliberately reproduce the stalled state; real source/network responses are unchanged.
      stalledAt = await page.evaluate(() => {
        const video = document.querySelector("video");
        video.pause();
        video.dispatchEvent(new Event("waiting"));
        return video.currentTime;
      });
      await page.waitForFunction(position => {
        const video = document.querySelector("video");
        return window.watchRecoveryEvents.some(event => event.event === "emptied")
          && video.currentTime > position + 1 && !video.paused;
      }, stalledAt, { timeout: 45000 });
    }
    await page.waitForFunction(() =>
      window.watchRecoveryEvents.some(event => event.event === "ended")
      && document.querySelector("video").currentTime > 2
      && document.querySelector("video").currentTime < 15, null, { timeout: 70000 });
    const result = await page.evaluate(() => {
      const video = document.querySelector("video");
      return {
        url: video.currentSrc, duration: video.duration, width: video.videoWidth,
        height: video.videoHeight, time: video.currentTime, paused: video.paused,
        error: video.error?.code, overlayHidden: document.querySelector("#video-loading").hidden,
        events: window.watchRecoveryEvents,
      };
    });
    if (errors.length || result.error || result.paused || !result.overlayHidden) {
      throw new Error(JSON.stringify({ result, errors, warnings }));
    }
    if (simulateStall && result.events.filter(event => event.event === "emptied").length !== 1) {
      throw new Error(`Expected exactly one recovery reload: ${JSON.stringify(result)}`);
    }
    await page.evaluate(() => { location.hash = "#/navigate"; });
    await page.waitForFunction(() => !document.querySelector("video"));
    return { ...result, stalledAt, errors, warnings, simulateStall };
  } finally {
    page.off("pageerror", onError);
    page.off("console", onConsole);
  }
})
