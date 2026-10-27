import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { inspectDarkPaint, observeDarkFrames } from "./dark.browser.js";

export async function verifyMediaPilot(page, { baseUrl = "http://localhost:4193/", screenshotsDirectory,
  siteIds = Array.from({ length: 30 }, (_, index) => index + 1) } = {}) {
  const results = [], errors = [], mediaCancellations = [], routeFailures = [];
  await page.addInitScript(observeDarkFrames);
  page.on("pageerror", error => errors.push(error.message));
  page.on("response", response => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  page.on("requestfailed", request => {
    const failure = `${request.failure()?.errorText}: ${request.url()}`;
    if (request.resourceType() === "media" && /ERR_ABORTED|cancelled|canceled/i.test(failure)) mediaCancellations.push(failure);
    else errors.push(failure);
  });
  await page.addInitScript(() => {
    window.mediaTestStyles = new WeakSet();
    document.addEventListener("load", event => {
      if (event.target.matches?.('link[rel="stylesheet"]')) window.mediaTestStyles.add(event.target);
    }, true);
  });
  async function ready() {
    await page.waitForSelector(".media-pilot");
    await page.waitForFunction(() => [...document.querySelectorAll('link[rel="stylesheet"]')]
      .every(link => window.mediaTestStyles.has(link)));
    return page.evaluate(async () => {
      document.body.getBoundingClientRect();
      await document.fonts.ready;
      await Promise.all([...document.images].map(image => image.decode()));
      if (document.body.hasAttribute("data-speed-page")) {
        const { waitUntilReady } = await import("./speed/readiness.js?v=media-full-v1");
        const root = document.querySelector(".demo-site");
        await waitUntilReady({ site: Number(root.className.match(/site-shell-(\d+)/)[1]), section: root.dataset.section }, new AbortController().signal);
      }
      const root = document.querySelector(".demo-site");
      const id = Number(root.className.match(/site-shell-(\d+)/)[1]);
      let expected;
      if (document.body.hasAttribute("data-speed-page")) {
        const { speedPhotoAssets, speedPhotoRoutes } = await import("./speed/photo-catalog.js?v=unique-photos-v1");
        const phases = speedPhotoRoutes[`${id}/${root.dataset.section}`];
        expected = phases.feature.map(source => speedPhotoAssets[source]);
        const files = Object.values(phases).flat().map(source => new URL(speedPhotoAssets[source].file, document.baseURI).href);
        const actual = [...root.querySelectorAll("img")].filter(image => /images-(?:speed|getty|porto|heavy)\//.test(image.src)).map(image => image.src);
        if ([...root.querySelectorAll("[data-speed-photo-index]")].some(image =>
          image.hasAttribute("width") || image.hasAttribute("height"))) {
          throw new Error("Photographic replacement must preserve the incumbent CSS sizing, not impose source dimensions.");
        }
        if (actual.length !== files.length || new Set(actual).size !== files.length || actual.some(file => !files.includes(file))) {
          throw new Error(`Rendered photographic sources differ from the unique plan: ${id}/${root.dataset.section}.`);
        }
        const unexpected = performance.getEntriesByType("resource").filter(entry => entry.initiatorType === "img"
          && /\/images(?:-(?:speed|getty|pilot|pexels|porto|heavy))?\//.test(entry.name) && !files.includes(entry.name)
          && !entry.name.includes("getty-surf-1479976095-poster.jpg"));
        if (unexpected.length) throw new Error(`Unselected photograph requested before replacement: ${unexpected.map(entry => entry.name)}`);
      } else {
        const { pilotPhotos } = await import("./sites/media-pilot-catalog.js?v=pages-budget-v1");
        const { portoPhotoReplacements } = await import("./sites/porto-photo-catalog.js?v=porto-v1");
        expected = [...document.querySelectorAll(".media-pilot img")].map(image => [...pilotPhotos, ...Object.values(portoPhotoReplacements)].find(photo =>
          new URL(photo.file, document.baseURI).href === image.src));
      }
      return Promise.all([...document.querySelectorAll(".media-pilot img")].map(async (image, index) => {
        const photo = expected[index];
        if (!photo || image.src !== new URL(photo.file, document.baseURI).href
          || image.naturalWidth !== photo.width || image.naturalHeight !== photo.height) {
          throw new Error(`Incorrect photographic file or decoded dimensions: ${image.src}.`);
        }
        const pixels = photo => {
          const canvas = document.createElement("canvas");
          canvas.width = 32;
          canvas.height = 32;
          const context = canvas.getContext("2d");
          context.imageSmoothingQuality = "high";
          context.drawImage(photo, 0, 0, 32, 32);
          return context.getImageData(0, 0, 32, 32).data;
        };
        let meanPixelDifference = null;
        if (!photo.sourceId || photo.sourceId.startsWith("getty:")) {
          const reference = new Image();
          reference.src = `images-getty/GettyImages-${photo.id}-1600.jpg`;
          await reference.decode();
          const actualPixels = pixels(image), referencePixels = pixels(reference);
          meanPixelDifference = actualPixels.reduce((sum, value, index) =>
            sum + (index % 4 === 3 ? 0 : Math.abs(value - referencePixels[index])), 0) / (32 * 32 * 3);
        }
        return {
          file: new URL(image.currentSrc).pathname, width: image.naturalWidth, height: image.naturalHeight,
          bytes: performance.getEntriesByName(image.currentSrc).at(-1)?.encodedBodySize, meanPixelDifference,
        };
      }));
    });
  }
  const viewports = [{ width: 1440, height: 1000 }, { width: 640, height: 300 },
    { width: 480, height: 270 }, { width: 320, height: 240 }];
  for (const id of siteIds) {
    for (const standalone of [false, true]) {
      for (const section of ["home", "detail", "about", "offerings"]) {
        const relative = standalone ? `speed/site-${String(id).padStart(2, "0")}-${section}.html?review=pages-budget-v1`
          : `?review=pages-budget-v1#/site/${id}/${section}`;
        try {
        await page.goto(new URL(relative, baseUrl).href, { waitUntil: "load" });
        const images = await ready();
        assert.equal(images.length, 2);
        assert.ok(images.every(image => Math.max(image.width, image.height) <= (image.file.includes("/images-heavy/") ? 5120 : 2560)));
        assert.ok(images.every(image => image.meanPixelDifference === null || image.meanPixelDifference < 18), JSON.stringify(images));
        const frames = await page.evaluate(() => window.darkPaintFrames);
        assert.ok(frames.length > 0);
        assert.ok(frames.every(frame => frame.canvas === "rgb(15, 20, 23)"
          && [frame.body, frame.app].filter(Boolean).every(color =>
            [...color.matchAll(/[\d.]+/g)].slice(0, 3).every(channel => Number(channel[0]) < 128))), JSON.stringify(frames));
        for (const viewport of section === "home" ? viewports : [viewports[1], viewports[3]]) {
          await page.setViewportSize(viewport);
          if (screenshotsDirectory && section === "home" && !standalone && [1, 8, 17].includes(id)) {
            await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
            await page.screenshot({ path: join(screenshotsDirectory, `top-${id}-${viewport.width}.png`) });
          }
          await page.locator(".media-pilot-jump").click();
          await page.waitForFunction(() => document.activeElement?.id.startsWith("media-pilot-title-"));
          const paint = await page.evaluate(inspectDarkPaint);
          assert.deepEqual(paint.issues, [], JSON.stringify({ id, section, viewport, paint }));
          assert.deepEqual(paint.bright, [], JSON.stringify({ id, section, viewport, paint }));
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
          assert.ok(await page.locator(".media-pilot img").evaluateAll(images => images.every(image => {
            const bounds = image.getBoundingClientRect();
            return bounds.width > 0 && bounds.height > 0
              && Math.abs(bounds.width / bounds.height - image.naturalWidth / image.naturalHeight) < .02;
          })), `Uncropped photographs: ${id}/${section}/${viewport.width}`);
          if (screenshotsDirectory && section === "home" && !standalone && [1, 8, 17].includes(id)) {
            await page.screenshot({ path: join(screenshotsDirectory, `media-${id}-${viewport.width}.png`) });
          }
          results.push({ id, section, standalone, viewport, images, minimumText: paint.minimumText,
            darkFrameCount: frames.length });
        }
        } catch (error) {
          routeFailures.push({ id, section, standalone, message: error.message });
          if (screenshotsDirectory) await page.screenshot({
            path: join(screenshotsDirectory, `failure-${id}-${section}-${standalone ? "speed" : "regular"}.png`),
          });
          if (routeFailures.length >= 3) throw new Error(`Route checks failed: ${JSON.stringify(routeFailures)}`);
        }
      }
    }
  }
  assert.deepEqual(routeFailures, []);
  await page.setViewportSize({ width: 960, height: 800 });
  await page.goto(new URL("speed/site-01-home.html?review=pages-budget-hotel", baseUrl).href, { waitUntil: "load" });
  await ready();
  const roomPhotos = await page.locator("#hotel-room-results [data-hotel-photo]").evaluateAll(buttons =>
    Object.fromEntries(buttons.map(button => [button.dataset.hotelPhoto, button.querySelector("img").src])));
  assert.equal(Object.keys(roomPhotos).length, 3);
  await page.locator('[name="arrival"]').fill("2027-05-06");
  await page.locator('[name="departure"]').fill("2027-05-08");
  await page.locator('[name="style"]').selectOption("balcony");
  await page.locator('#hotel-stay-form [type="submit"]').evaluate(button =>
    button.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.locator('#hotel-stay-form [type="submit"]').click();
  assert.equal(await page.locator("#hotel-room-results [data-hotel-photo]").count(), 1);
  const roomPhoto = page.locator('#hotel-room-results [data-hotel-photo="roomOchre"]');
  assert.equal(await roomPhoto.locator("img").evaluate(image => image.src), roomPhotos.roomOchre);
  await roomPhoto.evaluate(button => button.scrollIntoView({ block: "center", behavior: "instant" }));
  await roomPhoto.click();
  await page.locator("#hotel-gallery[open] .hotel-gallery-main img").evaluate(image => image.decode());
  assert.equal(await page.locator(".hotel-gallery-main img").evaluate(image => image.src), roomPhotos.roomOchre);
  await page.locator('[data-hotel-action="close-gallery"]').click();
  const cityPhoto = await page.locator(".intro-figure img").evaluate(image => image.src);
  await page.getByRole("button", { name: "Explore photos", exact: true }).evaluate(button =>
    button.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.getByRole("button", { name: "Explore photos", exact: true }).click();
  await page.locator("#hotel-gallery[open] .hotel-gallery-main img").evaluate(image => image.decode());
  assert.equal(await page.locator(".hotel-gallery-main img").evaluate(image => image.src), cityPhoto);
  await page.locator('[data-hotel-action="close-gallery"]').click();
  await page.goto(new URL("?review=pages-budget-video#/site/17/home", baseUrl).href, { waitUntil: "load" });
  await ready();
  await page.locator(".media-pilot-jump").click();
  await page.locator(".media-pilot video").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const video = document.querySelector(".media-pilot video");
    return !video.paused && video.currentTime > 1 && video.videoWidth > 0 && video.videoHeight > 0;
  });
  const frame = () => page.evaluate(() => {
    const video = document.querySelector(".media-pilot video"), canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 135;
    canvas.getContext("2d").drawImage(video, video.videoWidth / 4, video.videoHeight / 4,
      video.videoWidth / 2, video.videoHeight / 2, 0, 0, 240, 135);
    return { pixels: canvas.toDataURL(), time: video.currentTime, muted: video.muted, inline: video.playsInline,
      width: video.videoWidth, height: video.videoHeight };
  });
  const first = await frame();
  await page.waitForFunction(time => document.querySelector(".media-pilot video").currentTime > time + 1, first.time);
  const second = await frame();
  assert.notEqual(createHash("sha256").update(first.pixels).digest("hex"), createHash("sha256").update(second.pixels).digest("hex"));
  assert.ok(first.muted && first.inline);
  await page.evaluate(() => {
    window.pilotFilmEnds = 0;
    document.querySelector(".media-pilot video").addEventListener("ended", () => window.pilotFilmEnds++);
  });
  await page.waitForFunction(() => window.pilotFilmEnds > 0 && document.querySelector(".media-pilot video").currentTime > .25);
  await page.locator(".media-pilot video").evaluate(video => {
    video.dispatchEvent(new Event("pointerdown"));
    video.pause();
    scrollTo({ top: 0, behavior: "instant" });
  });
  await page.locator(".media-pilot video").scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.ok(await page.locator(".media-pilot video").evaluate(video => video.paused));
  await page.evaluate(() => { window.previousPilotVideo = document.querySelector(".media-pilot video"); location.hash = "#/site/2/home"; });
  await page.waitForSelector(".site-shell-2");
  assert.equal(await page.locator(".media-pilot video").count(), 0);
  assert.ok(await page.evaluate(() => previousPilotVideo.paused && !previousPilotVideo.querySelector("source").hasAttribute("src")));

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(new URL("?review=pages-budget-reduced#/site/17/home", baseUrl).href, { waitUntil: "load" });
  await ready();
  await page.locator(".media-pilot-jump").click();
  await page.locator(".media-pilot video").scrollIntoViewIfNeeded();
  assert.ok(await page.locator(".media-pilot video").evaluate(video => video.paused && video.readyState >= 2));
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await page.goto(new URL("?review=pages-budget-unaffected#/site/8/faq", baseUrl).href, { waitUntil: "load" });
  await page.waitForSelector(".site-shell-8");
  assert.equal(await page.locator(".media-pilot").count(), 0);
  assert.equal(await page.evaluate(() => performance.getEntriesByType("resource").filter(entry =>
    /images-pilot\/|getty-surf-1479976095\.mp4/.test(entry.name)).length), 0);
  assert.deepEqual(routeFailures, []);
  assert.deepEqual(errors, []);
  return { routes: results, hotelPhotos: { filteredRoomAndGalleryMatch: true, cityGalleryMatches: true },
    nativeVideo: { first: first.time, second: second.time,
    width: first.width, height: first.height, movingPixels: true, naturalReplay: true, userPausePreserved: true }, mediaCancellations };
}
