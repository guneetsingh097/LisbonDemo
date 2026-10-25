import { bridge, bridgePhotos, bridgePhotoDimensions, bridgePhotoSize } from "../sites/bridge.js";

export async function runBridgeIndexAudit(context, { baseUrl, screenshot } = {}) {
  const errors = [];
  context.on("page", page => {
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => {
      if (message.type() === "error") errors.push(message.text());
    });
  });
  context.on("requestfailed", request => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
  context.on("response", response => {
    if (response.status() >= 400) errors.push(`${response.url()}: HTTP ${response.status()}`);
  });
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const page = await context.newPage();
  const index = new URL("?v=bridge-posters-100mb-v1#/", baseUrl).href;
  const destination = new URL(bridge.href, baseUrl).href;
  await page.goto(index, { waitUntil: "networkidle" });
  await page.locator("#site-grid .site-card").first().waitFor();
  check(await page.locator("#site-grid .site-card").count() === 31, "The index must include all 30 sites and the bridge.");
  const card = page.locator("#site-grid .site-card").filter({ hasText: bridge.siteName });
  check(await card.count() === 1, "The bridge must appear exactly once in the regular index.");
  check(await card.getAttribute("href") === bridge.href, "The index must link to the final speed step's existing document.");
  check(await page.getByRole("link", { name: "Bridges", exact: true }).getAttribute("href") === bridge.href, "The Bridges navigation must use the same document.");
  for (const text of ["bridge", "Porto", "Span Society"]) {
    await page.locator("#site-search").fill(text);
    check(await card.count() === 1, `The bridge must be searchable by ${text}.`);
  }
  await page.locator("#site-search").fill("no-such-guide-987654");
  check(await page.locator("#site-grid .site-card").count() === 0, "An unmatched search must not leave the bridge behind.");
  await page.locator("#site-search").fill("");
  check(await page.locator("#site-grid .site-card").count() === 31, "Clearing search must restore all cards.");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Index overflow at ${width}px.`);
    if (screenshot) await screenshot(page, width);
  }
  await card.click();
  await page.waitForURL(destination);
  const verifyDocument = async () => {
    await page.locator(".bridge-page").waitFor();
    await page.waitForLoadState("networkidle");
    const result = await page.evaluate(async () => {
      await document.fonts.ready;
      const images = [...document.querySelectorAll(".bridge-page img")];
      await Promise.all(images.map(image => image.decode()));
      return {
        complete: document.readyState, fonts: document.fonts.status, images: images.length,
        photos: images.filter(image => image.src.includes("GettyImages-")).map(image => ({
          url: image.currentSrc, width: image.naturalWidth, height: image.naturalHeight,
          displayWidth: image.getBoundingClientRect().width,
          displayHeight: image.getBoundingClientRect().height,
          thumbnail: image.srcset,
        })),
      };
    });
    check(result.complete === "complete" && result.fonts === "loaded" && result.images === 16, "The shared bridge document must genuinely finish loading.");
    check(result.photos.length === 15 && result.photos.every(photo => photo.width >= 2400 && photo.height >= 2400
      && !photo.thumbnail && photo.displayWidth <= 241 && photo.displayHeight <= 161
      && new URL(photo.url).searchParams.get("v") === "bridge-posters-100mb-v1"), "Small posters must use the high-resolution, cache-versioned sources.");
    for (let index = 0; index < bridgePhotos.length; index++) {
      const photo = bridgePhotos[index];
      const figure = page.locator(".bridge-photo-grid figure").nth(index);
      const caption = await figure.locator("figcaption").innerText();
      const dimensions = await figure.locator("img").evaluate(image => [image.naturalWidth, image.naturalHeight]);
      check(dimensions[0] === photo.width && dimensions[1] === photo.height, "Poster source has the wrong dimensions.");
      check(caption.includes(bridgePhotoDimensions(photo)) && caption.includes(bridgePhotoSize(photo)), "Poster metadata is missing or inaccurate.");
      check(!/GettyImages-|\d+\.jpg/.test(caption), "A poster caption exposes a filename.");
    }
    check(context.pages().length === 1, "A normal bridge visit must not open a tab.");
    return result;
  };
  const document = await verifyDocument();
  await page.getByRole("button", { name: "Up close", exact: true }).click();
  check(await page.locator('[data-bridge-category="river"]:visible').count() === 0, "Gallery filtering must still work.");
  await page.locator("[data-bridge-photo]:visible").first().click();
  const enlarged = await page.locator("dialog[open] img").evaluate(async image => {
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  });
  check(enlarged.width === bridgePhotos[0].width && enlarged.height === bridgePhotos[0].height, "The enlarged view must use the resized source at the displayed resolution.");
  await page.keyboard.press("Escape");
  await page.locator("dialog").waitFor({ state: "detached" });
  await page.getByRole("link", { name: /Back to Atlas/ }).click();
  await page.locator("#site-grid .site-card").first().waitFor();
  await page.waitForLoadState("networkidle");
  check(await page.locator("#site-grid .site-card").count() === 31, "Back to Atlas must return to the complete index.");
  for (const hash of ["#/site/31/home", "#/site/31"]) {
    await page.goto(new URL(`?v=bridge-posters-100mb-v1${hash}`, baseUrl).href);
    await page.waitForURL(destination);
    await verifyDocument();
  }
  check(errors.length === 0, JSON.stringify(errors));
  return { index, destination, cards: 31, aliases: 2, document, automaticTabs: 0, errors };
}
