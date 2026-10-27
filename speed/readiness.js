export function checkErrors(includeFonts = true) {
  if (!Array.isArray(window.lisbonSpeedErrors)) throw new Error("The early loading-error observer did not initialize.");
  const errors = [...window.lisbonSpeedErrors];
  for (const font of includeFonts ? document.fonts : []) {
    if (font.status === "error") errors.push(`Font failed: ${font.family}, weight ${font.weight}`);
  }
  for (const entry of performance.getEntriesByType("resource")) {
    if (entry.responseStatus >= 400) errors.push(`HTTP ${entry.responseStatus}: ${entry.name}`);
  }
  if (errors.length) throw new Error([...new Set(errors)].join("\n"));
}

export function photoCandidates(doc = document) {
  const photos = [...doc.querySelectorAll("#app img")].filter(image => {
    const width = Number(image.getAttribute("width")) || image.naturalWidth;
    const height = Number(image.getAttribute("height")) || image.naturalHeight;
    return !(/\.(?:svg|ico)(?:[?#]|$)/i.test(image.currentSrc || image.src)
      || (width > 0 && height > 0 && width <= 128 && height <= 128));
  });
  const backgrounds = new Set();
  for (const element of doc.querySelectorAll("#app *")) {
    for (const pseudo of [null, "::before", "::after"]) {
      const value = getComputedStyle(element, pseudo).backgroundImage;
      for (const [, source] of value.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
        const url = new URL(source, doc.baseURI).href;
        if (/\.(?:jpe?g|png|webp|avif)(?:[?#]|$)/i.test(url)) backgrounds.add(url);
      }
    }
  }
  for (const url of backgrounds) {
    const image = new Image();
    image.src = url;
    photos.push(image);
  }
  return photos;
}

export function waitForPhotoThreshold(photos, signal, report) {
  signal.throwIfAborted();
  const total = photos.length;
  const required = Math.ceil(total * 9 / 10);
  const statuses = photos.map(image => ({ url: image.currentSrc || image.src, status: "pending" }));
  const snapshot = reason => ({
    policy: "90%-photos", reason, total, required,
    loaded: statuses.filter(item => item.status === "loaded").length,
    failed: statuses.filter(item => item.status === "failed"),
    pending: statuses.filter(item => item.status === "pending"),
  });
  return new Promise((resolve, reject) => {
    let advanced = false;
    const aborted = () => reject(signal.reason);
    signal.addEventListener("abort", aborted, { once: true });
    const update = () => {
      const current = snapshot();
      const reason = current.loaded >= required ? "threshold-met"
        : current.pending.length === 0 ? "photos-failed-below-threshold" : "loading";
      const result = snapshot(reason);
      report(result);
      if (!advanced && reason !== "loading") {
        advanced = true;
        signal.removeEventListener("abort", aborted);
        resolve(result);
      }
    };
    update();
    for (const [index, image] of photos.entries()) {
      image.loading = "eager";
      image.decode().then(() => {
        if (!image.complete || !image.naturalWidth || !image.naturalHeight) throw new Error("Image has no decoded pixels.");
        statuses[index] = { url: image.currentSrc || image.src, status: "loaded" };
      }).catch(error => {
        statuses[index] = { url: image.currentSrc || image.src, status: "failed", error: error.message };
        console.warn("Speed run photo failed", statuses[index]);
      }).then(() => {
        // Remaining real requests keep running after the next tab opens.
        try { update(); }
        catch (error) { reject(error); console.error("Could not record photo readiness", error); }
      });
    }
  });
}

export async function waitUntilPartlyReady({ site, section }, signal, report) {
  if (!document.querySelector(`.site-shell-${site}[data-section="${section}"] .compact-content`)) {
    throw new Error(`Expected the ${section} page for site ${site}.`);
  }
  for (const icon of document.querySelectorAll('link[rel~="icon"]')) {
    const image = new Image();
    image.src = icon.href;
    image.decode().catch(error => {
      const message = `Optional icon failed: ${icon.href}: ${error.message}`;
      console.warn(message);
      window.lisbonSpeedReport({ event: { type: "error", message } });
    });
  }
  return waitForPhotoThreshold(photoCandidates(), signal, report);
}

function waitForLoad(target, signal, ready) {
  signal.throwIfAborted();
  if (ready()) return Promise.resolve();
  return new Promise((resolve, reject) => {
    target.addEventListener("load", () => resolve(), { once: true, signal });
    target.addEventListener("error", () => reject(new Error(`Resource failed: ${target.href || target.src}`)), { once: true, signal });
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  });
}

export function waitForMedia(video, signal) {
  signal.throwIfAborted();
  const failure = () => new Error(`Video failed: ${video.currentSrc || video.querySelector("source")?.src || "unknown source"} (media error ${video.error?.code ?? "source unavailable"})`);
  if (video.error || video.networkState === 3) return Promise.reject(failure());
  if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const clean = () => {
      video.removeEventListener("loadeddata", loaded);
      video.removeEventListener("error", failed);
      source?.removeEventListener("error", failed);
      signal.removeEventListener("abort", aborted);
    };
    const loaded = () => {
      if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;
      clean();
      resolve();
    };
    const failed = () => { clean(); reject(failure()); };
    const aborted = () => { clean(); reject(signal.reason); };
    const source = video.querySelector("source");
    video.addEventListener("loadeddata", loaded);
    video.addEventListener("error", failed);
    source?.addEventListener("error", failed);
    signal.addEventListener("abort", aborted, { once: true });
  });
}

export async function waitUntilReady({ site, section }, signal) {
  await waitForLoad(window, signal, () => document.readyState === "complete");
  if (!document.querySelector(`.site-shell-${site}[data-section="${section}"] .compact-content`)) {
    throw new Error(`Expected the ${section} page for site ${site}.`);
  }
  checkErrors(false);
  await Promise.all([...document.querySelectorAll('link[rel="stylesheet"]')].map(link =>
    // sheet can exist while its @imports are still loading; use the native load event.
    waitForLoad(link, signal, () => window.lisbonSpeedStylesheets?.has(link))));
  // Layout starts the font loads for this page before fonts.ready is awaited.
  document.body.getBoundingClientRect();
  await document.fonts.ready;
  checkErrors();
  const decode = async image => {
    signal.throwIfAborted();
    image.loading = "eager";
    try { await image.decode(); }
    catch (error) { throw new Error(`Image failed: ${image.currentSrc || image.src}: ${error.message}`); }
    if (!image.complete || !image.naturalWidth || !image.naturalHeight) {
      throw new Error(`Image has no decoded pixels: ${image.currentSrc || image.src}`);
    }
  };
  await Promise.all([...document.images].map(decode));
  await Promise.all([...document.querySelectorAll("video[data-ready-media]")].map(video => waitForMedia(video, signal)));
  const backgrounds = new Set();
  for (const element of document.querySelectorAll("#app *")) {
    for (const pseudo of [null, "::before", "::after"]) {
      const style = getComputedStyle(element, pseudo);
      for (const value of [style.backgroundImage, style.maskImage, style.borderImageSource, style.listStyleImage, style.content]) {
        for (const [, url] of value.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
          backgrounds.add(new URL(url, document.baseURI).href);
        }
      }
    }
  }
  for (const icon of document.querySelectorAll('link[rel~="icon"]')) backgrounds.add(icon.href);
  await Promise.all([...backgrounds].map(url => {
    const image = new Image();
    image.src = url;
    return decode(image);
  }));
  await document.fonts.ready;
  signal.throwIfAborted();
  checkErrors();
}
