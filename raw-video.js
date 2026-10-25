export function openRawVideo() {
  if (location.hash !== "#/watch/raw") return false;
  location.replace("https://storage.googleapis.com/lisbongettyguneet/GettyImages-2210663321-4k-40mbps.mp4");
  return true;
}
