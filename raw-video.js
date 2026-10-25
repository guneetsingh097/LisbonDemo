export function openRawVideo() {
  if (location.hash !== "#/watch/raw") return false;
  location.replace("https://lisbongettyguneet.storage.googleapis.com/GettyImages-2270002248.mp4");
  return true;
}
