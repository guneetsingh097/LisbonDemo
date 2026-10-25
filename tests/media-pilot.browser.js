import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { inspectDarkPaint } from "./dark.browser.js";

export async function verifyMediaPilot(page, { baseUrl = "http://localhost:4193/", screenshotsDirectory } = {}) {
  const results = [], errors = [], mediaCancellations = [];
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
        const { waitUntilReady } = await import("./speed/readiness.js?v=media-pilot-v1");
        const root = document.querySelector(".demo-site");
        await waitUntilReady({ site: Number(root.className.match(/site-shell-(\d+)/)[1]), section: root.dataset.section }, new AbortController().signal);
      }
      return Promise.all([...document.querySelectorAll(".media-pilot img")].map(async image => {
        const id = /GettyImages-(\d+)-full/.exec(image.src)[1];
        const reference = new Image();
        reference.src = `images-getty/GettyImages-${id}-1600.jpg`;
        await reference.decode();
        const pixels = photo => {
          const canvas = document.createElement("canvas");
          canvas.width = 32;
          canvas.height = 32;
          const context = canvas.getContext("2d");
          context.imageSmoothingQuality = "high";
          context.drawImage(photo, 0, 0, 32, 32);
          return context.getImageData(0, 0, 32, 32).data;
        };
        const actual = pixels(image), expected = pixels(reference);
        const meanPixelDifference = actual.reduce((sum, value, index) =>
          sum + (index % 4 === 3 ? 0 : Math.abs(value - expected[index])), 0) / (32 * 32 * 3);
        return {
          file: new URL(image.currentSrc).pathname, width: image.naturalWidth, height: image.naturalHeight,
          bytes: performance.getEntriesByName(image.currentSrc).at(-1)?.encodedBodySize, meanPixelDifference,
        };
      }));
    });
  }
  const viewports = [{ width: 1440, height: 1000 }, { width: 640, height: 300 }, { width: 320, height: 300 }];
  for (const id of [1, 5, 17]) {
    for (const standalone of [false, true]) {
      for (const section of ["home", "detail", "about", "offerings"]) {
        const relative = standalone ? `speed/site-${String(id).padStart(2, "0")}-${section}.html?review=media-pilot-v1`
          : `?review=media-pilot-v1#/site/${id}/${section}`;
        await page.goto(new URL(relative, baseUrl).href, { waitUntil: "load" });
        const images = await ready();
        assert.equal(images.length, 2);
        assert.ok(images.every(image => image.width * image.height > 14_000_000));
        assert.ok(images.every(image => image.meanPixelDifference < 18), JSON.stringify(images));
        for (const viewport of section === "home" ? viewports : [viewports[1]]) {
          await page.setViewportSize(viewport);
          await page.locator(".media-pilot-jump").click();
          await page.waitForFunction(() => document.activeElement?.id.startsWith("media-pilot-title-"));
          const paint = await page.evaluate(inspectDarkPaint);
          assert.deepEqual(paint.issues, [], JSON.stringify({ id, section, viewport, paint }));
          assert.deepEqual(paint.bright, [], JSON.stringify({ id, section, viewport, paint }));
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
          if (screenshotsDirectory && section === "home" && !standalone) {
            await page.screenshot({ path: join(screenshotsDirectory, `media-${id}-${viewport.width}.png`) });
          }
          results.push({ id, section, standalone, viewport, images, minimumText: paint.minimumText });
        }
      }
    }
  }
  await page.setViewportSize({ width: 960, height: 800 });
  await page.goto(new URL("?review=media-pilot-video#/site/17/home", baseUrl).href, { waitUntil: "load" });
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
  assert.equal(await page.locator(".media-pilot").count(), 0);
  assert.ok(await page.evaluate(() => previousPilotVideo.paused && !previousPilotVideo.querySelector("source").hasAttribute("src")));

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(new URL("?review=media-pilot-reduced#/site/17/home", baseUrl).href, { waitUntil: "load" });
  await ready();
  await page.locator(".media-pilot-jump").click();
  await page.locator(".media-pilot video").scrollIntoViewIfNeeded();
  assert.ok(await page.locator(".media-pilot video").evaluate(video => video.paused && video.readyState >= 2));
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await page.goto(new URL("?review=media-pilot-nonpilot#/site/8/home", baseUrl).href, { waitUntil: "load" });
  await page.waitForSelector(".site-shell-8");
  assert.equal(await page.locator(".media-pilot").count(), 0);
  assert.equal(await page.evaluate(() => performance.getEntriesByType("resource").filter(entry =>
    /images-pilot\/|getty-surf-1479976095\.mp4/.test(entry.name)).length), 0);
  assert.deepEqual(errors, []);
  return { routes: results, nativeVideo: { first: first.time, second: second.time,
    width: first.width, height: first.height, movingPixels: true, naturalReplay: true, userPausePreserved: true }, mediaCancellations };
}
