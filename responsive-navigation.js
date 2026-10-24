export function mountResponsiveNavigation(app) {
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const main = app.querySelector("main, .compact-content");
  if (main && !main.hasAttribute("tabindex")) main.tabIndex = -1;
  const compact = matchMedia("(max-width: 980px), (max-height: 650px)");
  for (const header of app.querySelectorAll(".compact-site-header, :scope > .portal-header, .watch-navigation")) {
    if (!header.classList.contains("compact-site-header")) {
      const desktop = header.querySelector("nav");
      desktop.classList.add("portal-desktop-nav");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "compact-menu-button";
      button.textContent = "Menu";
      button.setAttribute("aria-controls", "atlas-page-menu");
      button.setAttribute("aria-expanded", "false");
      const panel = document.createElement("div");
      panel.id = "atlas-page-menu";
      panel.className = "compact-menu-panel";
      panel.hidden = true;
      const links = desktop.cloneNode(true);
      links.className = "compact-page-nav";
      links.setAttribute("aria-label", "Ecosystem pages");
      links.querySelector(".active")?.setAttribute("aria-current", "page");
      panel.append(links);
      header.append(button, panel);
    }
    const button = header.querySelector(".compact-menu-button");
    const panel = header.querySelector(".compact-menu-panel");
    const fitPanel = () => {
      if (panel.hidden) return;
      const viewport = window.visualViewport;
      const bottom = viewport ? viewport.offsetTop + viewport.height : innerHeight;
      panel.style.maxHeight = `${Math.max(0, bottom - panel.getBoundingClientRect().top - 12)}px`;
      if (panel.contains(document.activeElement)) {
        document.activeElement.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
      }
    };
    window.addEventListener("resize", fitPanel, options);
    window.visualViewport?.addEventListener("resize", fitPanel, options);
    window.visualViewport?.addEventListener("scroll", fitPanel, options);
    const observer = new ResizeObserver(fitPanel);
    observer.observe(header);
    controller.signal.addEventListener("abort", () => observer.disconnect(), { once: true });
    const close = restore => {
      panel.hidden = true;
      button.setAttribute("aria-expanded", "false");
      if (restore) button.focus({ preventScroll: true });
    };
    button.addEventListener("click", () => {
      const open = panel.hidden;
      panel.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      if (open) {
        fitPanel();
        (panel.querySelector('[aria-current="page"]') || panel.querySelector("a")).focus();
      }
    }, options);
    header.addEventListener("keydown", event => {
      if (event.key === "Escape" && !panel.hidden) {
        event.preventDefault();
        close(true);
      }
    }, options);
    header.addEventListener("focusout", event => {
      if (event.relatedTarget && !header.contains(event.relatedTarget)) close(false);
    }, options);
    document.addEventListener("pointerdown", event => {
      if (!header.contains(event.target)) close(false);
    }, options);
    compact.addEventListener("change", event => {
      const active = document.activeElement;
      const restore = panel.contains(active) && (event.matches || header.classList.contains("watch-navigation"));
      if (!restore && ((!event.matches && header.contains(active))
        || (event.matches && active.closest(".full-site-masthead, .portal-desktop-nav")))) {
        app.querySelector("main, .compact-content")?.focus({ preventScroll: true });
      }
      close(restore);
    }, options);
  }
  return () => controller.abort();
}
