import { gettyPhotos, gettyPhotoReplacements } from "./getty-photo-catalog.js?v=porto-v1";
import { activePhoto, portoPhotoReplacements } from "./porto-photo-catalog.js?v=porto-v1";

const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");

export function resolveGettyPhoto(image) {
  const installed = Object.values(portoPhotoReplacements).find(photo => photo.file === image.src);
  if (installed) return { ...image, alt: installed.title, credit: installed.credit, caption: installed.title };
  const id = gettyPhotoReplacements[image.src] || /^images-getty\/GettyImages-([\w-]+)-1600\.jpg$/.exec(image.src)?.[1];
  if (!id) throw new Error(`Unmapped photo: ${image.src}`);
  const original = gettyPhotos[id];
  if (!original) throw new Error(`Getty derivative metadata missing for ${id}`);
  const asset = activePhoto(original);
  return { ...image, src: asset.file, alt: asset.title, credit: asset.credit, caption: asset.title };
}

function replaceImage(tag) {
  const src = /\bsrc="([^"]+)"/.exec(tag)?.[1];
  if (!src) throw new Error("Photo is missing its source.");
  const photo = resolveGettyPhoto({ src });
  let updated = tag.replace(/\bsrc="[^"]*"/, `src="${escape(photo.src)}"`);
  updated = /\balt="/.test(updated)
    ? updated.replace(/\balt="[^"]*"/, `alt="${escape(photo.alt)}"`)
    : updated.replace("<img", `<img alt="${escape(photo.alt)}"`);
  return { tag: updated, photo };
}

export function replaceGettyPhotos(markup) {
  // Apartment listing cards keep their image and credit outside a figure.
  return markup.replace(/<figure\b[^>]*>[\s\S]*?<\/figure>|<div class="listing-item">[\s\S]*?<\/div>(?=<div class="listing-item">|<\/div><\/div>)|<img\b[^>]*>/g, block => {
    let replacement = null;
    const updated = block.replace(/<img\b[^>]*>/g, tag => {
      const result = replaceImage(tag);
      if (result.photo) replacement = result.photo;
      return result.tag;
    });
    if (!replacement) return updated;
    const caption = `<strong>${escape(replacement.alt)}</strong> <em>${escape(replacement.credit)}</em>`;
    if (/<figcaption\b/.test(updated)) {
      return updated.replace(/<figcaption\b([^>]*)>[\s\S]*?<\/figcaption>/,
        (_, attributes) => `<figcaption${attributes}>${caption}</figcaption>`);
    }
    if (block.startsWith("<figure")) return updated.replace("</figure>", `<figcaption>${caption}</figcaption></figure>`);
    return `${updated}<span class="getty-photo-credit">${escape(replacement.alt)}. ${escape(replacement.credit)}</span>`;
  });
}

export function mountPortoPhotoCredits(root) {
  const files = new Set([...root.querySelectorAll("img")].map(image => image.getAttribute("src")));
  const photos = Object.values(portoPhotoReplacements).filter(photo => files.has(photo.file));
  if (!photos.length) return;
  const footer = root.querySelector("footer");
  if (!footer) throw new Error("Porto photographs require a footer for their source and license credits.");
  const credits = document.createElement("p");
  credits.className = "porto-photo-credits";
  credits.append("Porto-area photographs: ");
  for (const [index, photo] of photos.entries()) {
    if (index) credits.append("; ");
    const source = document.createElement("a");
    source.href = photo.source;
    source.textContent = `${photo.title} by ${photo.photographer}`;
    const license = document.createElement("a");
    license.href = photo.licenseUrl;
    license.textContent = photo.license;
    credits.append(source, " / ", license);
  }
  credits.append(". Uncropped, resized JPEG derivatives. Photography is illustrative of the subject, not the provider or current access conditions.");
  footer.append(credits);
}
