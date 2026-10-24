import { gettyPhotos, gettyPhotoReplacements } from "./getty-photo-catalog.js";

const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");

export function resolveGettyPhoto(image) {
  const id = gettyPhotoReplacements[image.src] || /^images-getty\/GettyImages-([\w-]+)-1600\.jpg$/.exec(image.src)?.[1];
  if (!id) throw new Error(`Unmapped photo: ${image.src}`);
  const asset = gettyPhotos[id];
  if (!asset) throw new Error(`Getty derivative metadata missing for ${id}`);
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
