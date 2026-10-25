import { gettyPhotos } from "./getty-photo-catalog.js";

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

export function applySiteIdentity(root, id, header, identityPhoto) {
  const identity = siteIdentities.find(item => item.id === id);
  if (!identity) throw new Error(`Missing visual identity for site ${id}.`);
  const [body, display] = typefaces[identity.type];
  root.dataset.identity = identity.world;
  root.dataset.palette = identity.palette;
  for (const [name, value] of Object.entries({
    "--site-body-font": body, "--site-display-font": display,
  })) root.style.setProperty(name, value);
  if (!header) return;
  const photo = identityPhoto || gettyPhotos[identity.photo];
  if (!photo?.file || !photo.title || !photo.credit) throw new Error(`Missing identity photograph for site ${id}.`);
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
