// Pass this function directly to page.evaluate; it also covers opened dialogs.
export function inspectDarkPaint() {
  const rgba = value => {
    const values = value.match(/[-+]?\d*\.?\d+(?:e[+-]?\d+)?/gi)?.map(Number);
    if (!values || values.length < 3) throw new Error(`Unrecognised computed colour: ${value}`);
    const scale = value.startsWith("color(") ? 1 : 255;
    return [...values.slice(0, 3).map(channel => channel / scale), values[3] ?? 1];
  };
  const blend = (front, back) => front.slice(0, 3).map((channel, index) =>
    channel * front[3] + back[index] * (1 - front[3]));
  const luminance = color => color.slice(0, 3).map(channel => channel <= .04045
    ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0);
  const contrast = (first, second) => {
    const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (values[0] + .05) / (values[1] + .05);
  };
  const cache = new Map();
  const background = element => {
    if (!element) return [0, 0, 0];
    if (!cache.has(element)) cache.set(element,
      blend(rgba(getComputedStyle(element).backgroundColor), background(element.parentElement)));
    return cache.get(element);
  };
  const issues = [], bright = [], controls = [];
  let textChecks = 0, minimumText = Infinity, maximumSurface = 0;
  for (const element of document.querySelectorAll("html, body, #app, #app *, dialog[open] *")) {
    const style = getComputedStyle(element), rect = element.getBoundingClientRect();
    if (style.visibility !== "visible" || style.display === "none" || !rect.width || !rect.height) continue;
    const label = `${element.tagName.toLowerCase()}.${element.className}`;
    const surface = background(element);
    const level = luminance(surface);
    maximumSurface = Math.max(maximumSurface, level);
    if (rect.width * rect.height >= 4000 && level > .12) bright.push({ label, level });
    const hasText = [...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())
      || element.matches("input:not([type=checkbox]):not([type=radio]), select, textarea");
    if (hasText && !element.closest("script, style, [hidden]")) {
      const foreground = rgba(style.color);
      for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
        foreground[3] *= Number(getComputedStyle(ancestor).opacity);
      }
      const ratio = contrast(blend(foreground, surface), surface);
      const size = parseFloat(style.fontSize);
      const required = size >= 24 || size >= 18.66 && Number(style.fontWeight) >= 700 ? 3 : 4.5;
      textChecks++;
      minimumText = Math.min(minimumText, ratio);
      if (ratio + .02 < required && !element.matches(":disabled")) {
        issues.push({ label, text: element.textContent.trim().slice(0, 60), ratio, required,
          color: style.color, background: style.backgroundColor });
      }
    }
    if (element.matches("input:not([type=checkbox]):not([type=radio]), select, textarea")
      && !element.matches(":disabled") && parseFloat(style.borderBottomWidth) > 0) {
      const outer = background(element.parentElement);
      const ratio = contrast(blend(rgba(style.borderBottomColor), outer), outer);
      controls.push({ label, ratio });
      if (ratio + .02 < 3) issues.push({ label, type: "control-boundary", ratio, required: 3 });
    }
    if (element.matches("img, video") && style.filter !== "none") {
      issues.push({ label, type: "media-filter", value: style.filter });
    }
  }
  let focusContrast = null;
  const active = document.activeElement;
  if (active && getComputedStyle(active).outlineStyle !== "none") {
    const style = getComputedStyle(active);
    const outer = background(active.parentElement);
    focusContrast = contrast(blend(rgba(style.outlineColor), outer), outer);
    if (focusContrast + .02 < 3) issues.push({ type: "focus", ratio: focusContrast, required: 3 });
  }
  return { issues, bright, controls, textChecks, minimumText, maximumSurface, focusContrast,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    canvas: getComputedStyle(document.documentElement).backgroundColor,
    scheme: getComputedStyle(document.documentElement).colorScheme };
}

export function observeDarkFrames() {
  window.darkPaintFrames = [];
  window.darkLoadedStyles = new WeakSet();
  document.addEventListener("load", event => {
    if (event.target instanceof HTMLLinkElement && event.target.rel === "stylesheet") {
      window.darkLoadedStyles.add(event.target);
    }
  }, true);
  const start = performance.now();
  const record = () => {
    if (document.documentElement) window.darkPaintFrames.push({
      time: performance.now(), route: location.href,
      canvas: getComputedStyle(document.documentElement).backgroundColor,
      body: document.body && getComputedStyle(document.body).backgroundColor,
      app: document.querySelector("#app") && getComputedStyle(document.querySelector("#app")).backgroundColor,
    });
    if (performance.now() - start < 3000) requestAnimationFrame(record);
  };
  requestAnimationFrame(record);
}
