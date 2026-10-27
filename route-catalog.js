export const siteSections = [
  ["home", "Home"], ["about", "About"], ["offerings", "Offerings"],
  ["resources", "Resources"], ["detail", "Detail guide"], ["faq", "FAQ"], ["contact", "Contact"],
];

export const globalPages = [
  { hash: "#/", title: "Ecosystem home", documentTitle: "Porto Atlas — 30 Travel Websites" },
  { hash: "#/watch", title: "Porto by Drone", documentTitle: "Porto by Drone — Porto Atlas" },
  { hash: "#/navigate", title: "Quick navigation", documentTitle: "Quick Navigation — Porto Atlas" },
  { hash: "#/matrix", title: "Travel planning guide", documentTitle: "Travel Planning Guide — Porto Atlas" },
  { hash: "#/docs", title: "Photography & credits", documentTitle: "Photography & Credits — Porto Atlas" },
  { hash: "#/site/31/home", title: "Dom Luís I Bridge", documentTitle: "Span Society — Dom Luís I Bridge" },
];

export function enumeratePages(sites) {
  return [
    ...globalPages.map(page => ({ ...page, siteId: "", siteName: "Porto Atlas", companyName: "", category: "Global", alias: "" })),
    ...sites.flatMap(site => siteSections.map(([section, title]) => ({
      hash: `#/site/${site.id}/${section}`,
      alias: section === "home" ? `#/site/${site.id}` : "",
      title, documentTitle: `${site.siteName} — Porto Atlas`,
      siteId: site.id, siteName: site.siteName, companyName: site.companyName, category: site.category,
    }))),
  ];
}
