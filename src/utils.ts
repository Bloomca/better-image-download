export function getImageSource(imageEl: HTMLImageElement): string | null {
  return imageEl.getAttribute("src");
}
