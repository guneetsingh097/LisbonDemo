export function openRawVideo() {
  if (location.hash !== "#/watch/raw") return false;
  location.replace("https://storage.googleapis.com/lisbongettyguneet/GettyImages-2270002248.mp4");
  return true;
}
