import { gettyPhotos, gettyPhotoReplacements } from "./getty-photo-catalog.js";

const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const note = "Illustrative stock reference; not the sample provider, its premises, staff or customers.";

export function resolveGettyPhoto(image) {
  const id = gettyPhotoReplacements[image.src];
  if (!id) {
    if (!image.src.startsWith("images-getty/")) throw new Error(`Unmapped photo: ${image.src}`);
    return image;
  }
  const asset = gettyPhotos[id];
  if (!asset) throw new Error(`Getty derivative metadata missing for ${id}`);
  return { ...image, src: asset.file, alt: asset.title, credit: `${asset.credit} / Creative #${id}`, referenceNote: note };
}

function replaceImage(tag) {
  const src = /\bsrc="([^"]+)"/.exec(tag)?.[1];
  if (!src) throw new Error("Photo is missing its source.");
  const photo = resolveGettyPhoto({ src });
  if (photo.src === src) return { tag, photo: null };
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
    const caption = `<strong>${escape(replacement.alt)}</strong> <span>${note}</span> <em>${escape(replacement.credit)}</em>`;
    if (/<figcaption\b/.test(updated)) {
      return updated.replace(/<figcaption\b([^>]*)>[\s\S]*?<\/figcaption>/,
        (_, attributes) => `<figcaption${attributes}>${caption}</figcaption>`);
    }
    if (block.startsWith("<figure")) return updated.replace("</figure>", `<figcaption>${caption}</figcaption></figure>`);
    return `${updated}<span class="getty-photo-credit">${escape(replacement.alt)}. ${note} ${escape(replacement.credit)}</span>`;
  });
}
