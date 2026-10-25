export const siteSections = [
  ["home", "Home"], ["about", "About"], ["offerings", "Offerings"],
  ["resources", "Resources"], ["detail", "Detail guide"], ["faq", "FAQ"], ["contact", "Contact"],
];

export const globalPages = [
  { hash: "#/", title: "Ecosystem home", documentTitle: "Lisbon Atlas — 30 Travel Websites" },
  { hash: "#/watch", title: "Lisbon by Tram", documentTitle: "Lisbon by Tram — Lisbon Atlas" },
  { hash: "#/navigate", title: "Quick navigation", documentTitle: "Quick Navigation — Lisbon Atlas" },
  { hash: "#/matrix", title: "Travel planning guide", documentTitle: "Travel Planning Guide — Lisbon Atlas" },
  { hash: "#/docs", title: "Photography & credits", documentTitle: "Photography & Credits — Lisbon Atlas" },
  { hash: "#/site/31/home", title: "Dom Luís I Bridge", documentTitle: "Span Society — Dom Luís I Bridge" },
];

export function enumeratePages(sites) {
  return [
    ...globalPages.map(page => ({ ...page, siteId: "", siteName: "Lisbon Atlas", companyName: "", category: "Global", alias: "" })),
    ...sites.flatMap(site => siteSections.map(([section, title]) => ({
      hash: `#/site/${site.id}/${section}`,
      alias: section === "home" ? `#/site/${site.id}` : "",
      title, documentTitle: `${site.siteName} — Lisbon Atlas`,
      siteId: site.id, siteName: site.siteName, companyName: site.companyName, category: site.category,
    }))),
  ];
}
