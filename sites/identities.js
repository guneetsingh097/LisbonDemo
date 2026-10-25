import { gettyPhotos } from "./getty-photo-catalog.js";

const palettes = {
  porcelain: ["#fbfaf7", "#edf1f0", "#344950"],
  rose: ["#fff9f7", "#f6e8e4", "#563c3b"],
  sage: ["#f8faf5", "#e7efdf", "#354b3c"],
  butter: ["#fffdf4", "#f5edcf", "#51462d"],
  sand: ["#fbf8f1", "#eee5d6", "#514337"],
  powder: ["#f7fbfd", "#e4eef4", "#344b5b"],
  lilac: ["#fbf9fd", "#ece7f2", "#4d4058"],
  peach: ["#fffaf5", "#f4e4d9", "#594034"],
  sea: ["#f8fbfa", "#e4eee9", "#304c47"],
  chalk: ["#faf9f7", "#eceae4", "#44443f"],
};
const typefaces = {
  editorial: ["Georgia, serif", "Georgia, serif"],
  classical: ["Georgia, serif", "'Palatino Linotype', Palatino, Georgia, serif"],
  newspaper: ["Georgia, serif", "'Times New Roman', Times, serif"],
  modern: ["Arial, Helvetica, sans-serif", "'Helvetica Neue', Arial, sans-serif"],
  humanist: ["'Trebuchet MS', Arial, sans-serif", "'Trebuchet MS', Arial, sans-serif"],
  spacious: ["Verdana, sans-serif", "Verdana, sans-serif"],
  poster: ["Arial, sans-serif", "Impact, 'Arial Narrow', sans-serif"],
  technical: ["Arial, sans-serif", "ui-monospace, Menlo, Consolas, monospace"],
};

export const siteIdentities = [
  ["tide", "porcelain", "classical", "1172009391"],
  ["palacio", "sand", "classical", "1365312403"],
  ["bunkhouse", "butter", "poster", "1045047954"],
  ["chave", "powder", "modern", "1453121684"],
  ["dining-index", "sage", "technical", "945023048"],
  ["bakery", "peach", "editorial", "1455011765"],
  ["fado", "rose", "poster", "1124710877"],
  ["newspaper", "chalk", "newspaper", "1182278389"],
  ["food-journal", "butter", "editorial", "1354751821"],
  ["family", "powder", "humanist", "1426540586"],
  ["food-walk", "sage", "classical", "2156783104"],
  ["nomad", "lilac", "modern", "1450789031"],
  ["museum", "porcelain", "modern", "1495954819"],
  ["transit", "powder", "technical", "114208719"],
  ["walking", "sand", "humanist", "2206023257"],
  ["excursions", "peach", "poster", "997451208"],
  ["surf", "sea", "humanist", "1267635029"],
  ["photography", "chalk", "modern", "519622494"],
  ["archive", "sand", "newspaper", "1460007178"],
  ["weather", "butter", "spacious", "2187398021"],
  ["fashion", "rose", "classical", "102426612"],
  ["outdoors", "sage", "spacious", "642007444"],
  ["wine", "rose", "editorial", "1044275790"],
  ["river", "powder", "classical", "1903184810"],
  ["transfer", "chalk", "technical", "1352121711"],
  ["civic", "porcelain", "newspaper", "871168786"],
  ["languages", "lilac", "humanist", "2198962183"],
  ["insurance", "sand", "spacious", "2193515508"],
  ["accessible", "sea", "modern", "663267954"],
  ["business", "powder", "technical", "2081127070"],
  ["bridge", "porcelain", "modern", null],
].map(([world, palette, type, photo], index) => ({ id: index + 1, world, palette, type, photo }));

export function applySiteIdentity(root, id, header) {
  const identity = siteIdentities.find(item => item.id === id);
  if (!identity) throw new Error(`Missing visual identity for site ${id}.`);
  const [paper, panel, ink] = palettes[identity.palette];
  const [body, display] = typefaces[identity.type];
  root.dataset.identity = identity.world;
  for (const [name, value] of Object.entries({
    "--site-paper": paper, "--site-panel": panel, "--site-ink": ink,
    "--site-body-font": body, "--site-display-font": display,
  })) root.style.setProperty(name, value);
  if (!header) return;
  const photo = gettyPhotos[identity.photo];
  if (!photo) throw new Error(`Missing identity photograph for site ${id}.`);
  const figure = document.createElement("figure");
  figure.className = "identity-photograph";
  const image = document.createElement("img");
  image.src = photo.file;
  image.alt = photo.title;
  image.title = photo.credit;
  image.decoding = "async";
  image.fetchPriority = "high";
  figure.append(image);
  header.append(figure);
}
