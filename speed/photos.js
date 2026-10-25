import { speedPhotoAssets, speedPhotoRoutes } from "./photo-catalog.js?v=unique-photos-v1";

export function speedPhotosForRoute(id, section) {
  const route = speedPhotoRoutes[`${id}/${section}`];
  if (!route) throw new Error(`Missing distinct photo plan for ${id}/${section}.`);
  const photos = Object.fromEntries(Object.entries(route).map(([phase, sources]) => [
    phase, sources.map(source => {
      const asset = speedPhotoAssets[source];
      if (!asset?.file || !asset.title || !asset.credit) throw new Error(`Missing photographic source ${source}.`);
      return asset;
    }),
  ]));
  if (photos.identity.length !== 1 || photos.feature.length !== 2
    || photos.reference.length !== (id !== 1 && ["home", "offerings"].includes(section) ? 1 : 0)) {
    throw new Error(`Incomplete distinct photo plan for ${id}/${section}.`);
  }
  return photos;
}

export function renderSpeedPhotos(markup, photos) {
  const template = document.createElement("template");
  template.innerHTML = markup;
  const images = [...template.content.querySelectorAll("img")];
  if (images.length !== photos.length) throw new Error(`Photo plan expects ${photos.length} content images, found ${images.length}.`);
  images.forEach((image, index) => {
    const photo = photos[index];
    image.src = photo.file;
    image.alt = photo.title;
    image.title = photo.credit;
    image.loading = "eager";
    image.decoding = "async";
    image.dataset.speedPhotoIndex = String(index);
    const figure = image.closest("figure");
    const caption = figure?.querySelector("figcaption");
    if (caption) {
      const title = caption.querySelector("strong");
      const credit = caption.querySelector("em");
      if (title) title.textContent = photo.title;
      if (credit) credit.textContent = photo.credit;
    }
    const standaloneCredit = image.closest(".listing-item")?.querySelector(".getty-photo-credit");
    if (standaloneCredit) standaloneCredit.textContent = `${photo.title}. ${photo.credit}`;
  });
  return template.innerHTML;
}

export function mountSpeedPhotoCredits(root, phases) {
  const photos = Object.values(phases).flat();
  const photographers = [...new Map(photos.filter(photo => photo.sourceId.startsWith("pexels:"))
    .map(photo => [photo.photographerUrl, photo.photographer])).entries()];
  const footer = root.querySelector("footer");
  if (!footer) throw new Error("The photographic credits require the property's footer.");
  const credits = document.createElement("p");
  credits.className = "speed-photo-credits";
  const label = document.createElement("a");
  label.href = "https://www.pexels.com/";
  label.textContent = "Photos provided by Pexels";
  credits.append(label, ". Photographers: ");
  photographers.forEach(([url, name], index) => {
    if (index) credits.append(", ");
    const link = document.createElement("a");
    link.href = url;
    link.textContent = name;
    credits.append(link);
  });
  credits.append(". Reference photography; not a depiction of this provider, its team or current access conditions.");
  footer.append(credits);
}
