export const sections = ["home", "detail", "about", "offerings"];
export const pages = Array.from({ length: 120 }, (_, index) => {
  const site = Math.floor(index / sections.length) + 1;
  const section = sections[index % sections.length];
  return { step: index + 1, site, section, file: `site-${String(site).padStart(2, "0")}-${section}.html` };
});
pages.push({ step: 121, site: 31, section: "home", file: "site-31-home.html" });

export function pageForStep(step) {
  if (!Number.isInteger(step) || step < 1 || step > pages.length) {
    throw new Error(`Invalid speed page: expected a step from 1 to ${pages.length}.`);
  }
  return pages[step - 1];
}

export function pageFromUrl(href) {
  const path = new URL(href).pathname;
  const page = pages.find(item => path.endsWith(`/speed/${item.file}`));
  if (!page) throw new Error("This URL is not a standalone speed page.");
  return page;
}
