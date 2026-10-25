import { pilotPhotos, pilotVideo } from "./media-pilot-catalog.js";

export const mediaPilots = {
  1: {
    style: "house", title: "Alfama, in the details",
    intro: "Rooftops, glazed tiles and the textures behind our house notes.",
    photos: ["1172009391", "183584154"],
  },
  5: {
    style: "table", title: "From market to table",
    intro: "Produce at Ribeira Market and Portuguese dishes, photographed in Lisbon.",
    photos: ["1354751821", "945023048"],
  },
  17: {
    style: "surf", title: "Before the paddle out",
    intro: "Surf photography and a quiet study of the walk to the water.",
    photos: ["1277370721", "2190480336"],
  },
};

const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export function renderMediaPilot(id, section) {
  const pilot = mediaPilots[id];
  if (!pilot || !["home", "detail", "about", "offerings"].includes(section)) return "";
  const photos = pilot.photos.map(photoId => {
    const photo = pilotPhotos.find(asset => asset.id === photoId);
    if (!photo) throw new Error(`Missing verified full-resolution Getty photo ${photoId}.`);
    return `<figure><img src="${escape(photo.file)}" width="${photo.width}" height="${photo.height}" loading="eager" alt="${escape(photo.title)}">
      <figcaption><strong>${escape(photo.title)}</strong><em>Photo by ${escape(photo.credit)}</em></figcaption></figure>`;
  }).join("");
  const film = id === 17 && ["home", "detail"].includes(section) ? `<figure class="media-pilot-film">
    <video controls muted playsinline preload="auto" data-ready-media aria-label="${escape(pilotVideo.title)}"
      width="${pilotVideo.width}" height="${pilotVideo.height}" poster="${escape(pilotVideo.poster)}">
      <source src="${escape(pilotVideo.file)}" type="video/mp4">
      Your browser does not support this film.
    </video><figcaption><strong>${escape(pilotVideo.title)}</strong><em>Film by ${escape(pilotVideo.credit)}</em></figcaption>
    <p class="media-pilot-status" role="status" aria-live="polite" hidden></p></figure>` : "";
  return `<section class="media-pilot media-pilot--${pilot.style}" aria-labelledby="media-pilot-title-${id}">
    <div class="media-pilot-intro"><h2 id="media-pilot-title-${id}" tabindex="-1">${pilot.title}</h2><p>${pilot.intro}</p></div>
    ${film}<div class="media-pilot-grid">${photos}</div></section>`;
}

export function mountMediaPilot(root, id, section) {
  const markup = renderMediaPilot(id, section);
  if (!markup) return () => {};
  const main = root.querySelector("main");
  if (!main) throw new Error(`Missing main content for media pilot ${id}.`);
  if (!document.getElementById("media-pilot-css")) {
    const link = document.createElement("link");
    link.id = "media-pilot-css";
    link.rel = "stylesheet";
    link.href = "sites/media-pilot.css?v=media-pilot-v1";
    document.head.append(link);
  }
  main.insertAdjacentHTML("beforeend", markup);
  const feature = main.querySelector(".media-pilot");
  const controller = new AbortController();
  const { signal } = controller;
  const jump = document.createElement("button");
  jump.type = "button";
  jump.className = "media-pilot-jump";
  jump.textContent = mediaPilots[id].title;
  jump.addEventListener("click", () => {
    feature.scrollIntoView({ block: "start", behavior: "instant" });
    feature.querySelector("h2").focus({ preventScroll: true });
  }, { signal });
  const existingJump = main.querySelector(".portfolio-jump");
  if (existingJump) existingJump.append(jump);
  else main.prepend(jump);

  const video = feature.querySelector("video");
  if (!video) return () => controller.abort();
  const status = feature.querySelector(".media-pilot-status");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  let userControlled = false;
  let starting = false;
  const report = message => { status.hidden = false; status.textContent = message; };
  const stop = () => {
    video.pause();
    video.removeAttribute("src");
    video.querySelectorAll("source").forEach(source => source.removeAttribute("src"));
    video.load();
  };
  video.defaultMuted = true;
  video.muted = true;
  const playVisible = () => {
    if (!visible || document.hidden || reducedMotion.matches || userControlled || starting || video.error) {
      if (!visible || document.hidden || reducedMotion.matches) video.pause();
      return;
    }
    starting = true;
    video.play().catch(error => {
      if (signal.aborted || error.name === "AbortError") return;
      userControlled = true;
      report(error.name === "NotAllowedError"
        ? "Automatic playback was blocked. Use the video controls to play."
        : `The film could not play: ${error.message}. Reload the page to try again.`);
    }).finally(() => { starting = false; });
  };
  for (const name of ["pointerdown", "keydown"]) {
    video.addEventListener(name, () => { userControlled = true; }, { signal });
  }
  video.addEventListener("playing", () => { status.hidden = true; }, { signal });
  video.addEventListener("error", () => {
    report(`The surf film is unavailable (${video.error?.code ?? "unknown media error"}). Reload the page to try again.`);
  }, { signal });
  video.querySelector("source").addEventListener("error", () => {
    report("The surf film could not be loaded. Reload the page to try again.");
  }, { signal });
  video.addEventListener("ended", () => {
    if (!visible || document.hidden || reducedMotion.matches || userControlled) return;
    video.currentTime = 0;
    playVisible();
  }, { signal });
  document.addEventListener("visibilitychange", playVisible, { signal });
  reducedMotion.addEventListener("change", playVisible, { signal });
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    playVisible();
  }, { threshold: 0 });
  observer.observe(video);
  return () => {
    observer.disconnect();
    controller.abort();
    stop();
  };
}
