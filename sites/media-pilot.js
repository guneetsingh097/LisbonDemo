import { pilotPhotos, pilotVideo } from "./media-pilot-catalog.js?v=pages-budget-v1";

export const mediaPilots = {
  1: {
    style: "house", title: "Alfama, in the details",
    intro: "Rooftops, glazed tiles and the textures behind our house notes.",
    photos: ["1172009391", "183584154"],
  },
  2: {
    style: "salon", title: "The art of staying in",
    intro: "A closer look at lounge interiors and the quiet proportions of a bedroom.",
    photos: ["1365312403", "1795754166"],
  },
  3: {
    style: "contact-sheet", title: "Room for the whole crew",
    intro: "Bunks, backpacks and the shared spaces of hostel life.",
    photos: ["588286104", "1045047954"],
  },
  4: {
    style: "rooms", title: "Inside, outside, Lisbon",
    intro: "Bedroom details and a yellow city facade: two views of a Lisbon stay.",
    photos: ["1453121684", "1392723392"],
  },
  5: {
    style: "table", title: "From market to table",
    intro: "Produce at Ribeira Market and Portuguese dishes, photographed in Lisbon.",
    photos: ["1354751821", "945023048"],
  },
  6: {
    style: "recipe", title: "Bread, pastry, repeat",
    intro: "Portuguese pastries in the window, and the daily ritual of choosing a loaf.",
    photos: ["1455011765", "527640900"],
  },
  7: {
    style: "stage", title: "The shape of a fado evening",
    intro: "A musician in Alfama and the distinctive curves of the Portuguese guitar.",
    photos: ["1124710877", "2220476619"],
  },
  8: {
    style: "press", title: "The city gathers",
    intro: "Lisbon festival decorations and the energy of a concert audience.",
    photos: ["1182278389", "483495210"],
  },
  9: {
    style: "journal", title: "Behind the plate",
    intro: "From a chef's finishing touches to the dining room beyond the kitchen.",
    photos: ["137737392", "1125725514"],
  },
  10: {
    style: "album", title: "A little room to explore",
    intro: "A family at Belem Tower, then the simple pleasure of a swing in the park.",
    photos: ["1426540586", "1489193662"],
  },
  11: {
    style: "notebook", title: "A view and a table of your own",
    intro: "A pause above Alfama and an outdoor cafe in Santa Catarina.",
    photos: ["2156783104", "200372075-001"],
  },
  12: {
    style: "workspace", title: "Where the workday happens",
    intro: "Laptop time and shared desks, seen through two workplace photographs.",
    photos: ["1450789031", "2081127070"],
  },
  13: {
    style: "exhibition", title: "Looking a little longer",
    intro: "Time with a painting, and the evening silhouette of Belem Tower.",
    photos: ["1495954819", "1578532135"],
  },
  14: {
    style: "route", title: "Lisbon on the move",
    intro: "An underground arrival and an old yellow tram on the city streets.",
    photos: ["114208719", "1494877133"],
  },
  15: {
    style: "walk", title: "Read the street at walking pace",
    intro: "Alfama lanes and tile-decorated houses reward a slower look.",
    photos: ["2206023257", "2194079200"],
  },
  16: {
    style: "postcards", title: "Palace hills, coastal air",
    intro: "Pena Palace in Sintra and an aerial view of the Cascais coast.",
    photos: ["997451208", "1680780214"],
  },
  17: {
    style: "surf", title: "Before the paddle out",
    intro: "Surf photography and a quiet study of the walk to the water.",
    photos: ["1277370721", "2190480336"],
  },
  18: {
    style: "viewfinder", title: "Find the frame",
    intro: "A photographer at work and a wide view of Lisbon's 25 April Bridge.",
    photos: ["519622494", "520670710"],
  },
  19: {
    style: "archive", title: "Reading the traces",
    intro: "Library books and old photographs: two ways of holding on to a story.",
    photos: ["1460007178", "183263623"],
  },
  20: {
    style: "forecast", title: "Two skies, different plans",
    intro: "Cloud studies for thinking about a day outdoors, not a live forecast.",
    photos: ["2187398021", "1737350812"],
  },
  21: {
    style: "lookbook", title: "From the street to the rail",
    intro: "Rua Augusta in Lisbon and the colour and texture of a clothing rack.",
    photos: ["102426612", "688398000"],
  },
  22: {
    style: "trail", title: "Coastal paths, woodland shade",
    intro: "A hiker at Cabo da Roca and a footpath through Sintra Natural Park.",
    photos: ["642007444", "1320833203"],
  },
  23: {
    style: "cellar", title: "Vines and cellars",
    intro: "Sunset in an Alentejo vineyard and wine barrels in a Porto cellar.",
    photos: ["1044275790", "467101890"],
  },
  24: {
    style: "horizon", title: "A different view from the water",
    intro: "A sailing boat on the Tagus and the open perspective from a yacht's deck.",
    photos: ["1903184810", "543659548"],
  },
  25: {
    style: "departure", title: "The first leg of the journey",
    intro: "An airport taxi arrival and the facade of Lisbon's Rossio station.",
    photos: ["1352121711", "607210824"],
  },
  26: {
    style: "circular", title: "Finding your bearings",
    intro: "A paper map and Portuguese azulejo patterns: orientation and local detail.",
    photos: ["871168786", "1392999887"],
  },
  27: {
    style: "workshop", title: "Learning by doing",
    intro: "Conversation in a classroom and ingredients coming together in a cookery class.",
    photos: ["2198962183", "1194472286"],
  },
  28: {
    style: "briefing", title: "Before the next departure",
    intro: "Airport boards and lounge time, alongside the practical questions to ask before travelling.",
    photos: ["2193515508", "923748932"],
  },
  29: {
    style: "access", title: "Look closely at the route",
    intro: "A beach outing and a ramp detail. Check the specific access conditions of every journey.",
    photos: ["663267954", "1035083396"],
  },
  30: {
    style: "memo", title: "Between the meetings",
    intro: "A team discussion and a meeting outdoors: the human side of a business trip.",
    photos: ["2148703154", "1916729901"],
  },
};

const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export function renderMediaPilot(id, section, photoOverrides, includeFilm = true) {
  const pilot = mediaPilots[id];
  if (!pilot || !["home", "detail", "about", "offerings"].includes(section)) return "";
  if (photoOverrides && photoOverrides.length !== pilot.photos.length) throw new Error(`Incomplete media photographs for ${id}/${section}.`);
  const photos = pilot.photos.map((photoId, index) => {
    const photo = photoOverrides ? photoOverrides[index] : pilotPhotos.find(asset => asset.id === photoId);
    if (!photo) throw new Error(`Missing verified feature photo ${photoId}.`);
    return `<figure><img src="${escape(photo.file)}" width="${photo.width}" height="${photo.height}" loading="eager" alt="${escape(photo.title)}">
      <figcaption><strong>${escape(photo.title)}</strong><em>${photoOverrides ? escape(photo.credit) : `Photo by ${escape(photo.credit)}`}</em></figcaption></figure>`;
  }).join("");
  const film = includeFilm && id === 17 && ["home", "detail"].includes(section) ? `<figure class="media-pilot-film">
    <video controls muted playsinline preload="auto" data-ready-media aria-label="${escape(pilotVideo.title)}"
      width="${pilotVideo.width}" height="${pilotVideo.height}" poster="${escape(pilotVideo.poster)}">
      <source src="${escape(pilotVideo.file)}" type="video/mp4">
      Your browser does not support this film.
    </video><figcaption><strong>${escape(pilotVideo.title)}</strong><em>Film by ${escape(pilotVideo.credit)}</em></figcaption>
    <p class="media-pilot-status" role="status" aria-live="polite" hidden></p></figure>` : "";
  return `<section class="media-pilot media-pilot--${pilot.style}" aria-labelledby="media-pilot-title-${id}">
    <div class="media-pilot-intro"><h2 id="media-pilot-title-${id}" tabindex="-1">${pilot.title}</h2><p>${photoOverrides ? "A closer look through the photographer's lens. Subjects and credits accompany each image." : pilot.intro}</p></div>
    ${film}<div class="media-pilot-grid">${photos}</div></section>`;
}

export function mountMediaPilot(root, id, section, photoOverrides, includeFilm = true) {
  const markup = renderMediaPilot(id, section, photoOverrides, includeFilm);
  if (!markup) return () => {};
  const main = root.querySelector("main, .compact-content");
  if (!main) throw new Error(`Missing main content for media pilot ${id}.`);
  if (!document.getElementById("media-pilot-css")) {
    const link = document.createElement("link");
    link.id = "media-pilot-css";
    link.rel = "stylesheet";
    link.href = "sites/media-pilot.css?v=pages-budget-v1";
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
