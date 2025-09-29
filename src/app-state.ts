import { Toolbar } from "./toolbar";
import { startImageSelect } from "./select-images";
import { startAreaSelect } from "./select-area";

import type { SelectedImage } from "./types";

class AppState {
  #cleanupFns: Function[] = [];
  #selectedImages: SelectedImage[] = [];
  #toolbar: Toolbar | null = null;

  #mode: "selectImages" | "selectArea" = "selectImages";

  setMode(mode: "selectImages" | "selectArea") {
    this.#mode = mode;
    this.#toolbar?.updateMode();
  }

  getMode() {
    return this.#mode;
  }

  start() {
    // clean all existing event listeners
    this.clean();

    if (this.#mode === "selectImages") {
      startImageSelect();
    } else if (this.#mode === "selectArea") {
      startAreaSelect();
    }
  }

  createToolbar() {
    if (this.#toolbar) {
      return this.#toolbar;
    }

    this.#toolbar = new Toolbar(() => {
      this.resetSelectedImages();
      this.#toolbar = null;
    });

    return this.#toolbar;
  }

  addCleanupCb(cb: Function) {
    this.#cleanupFns.push(cb);
    return cb;
  }

  removeCleanupCb(cb: Function) {
    this.#cleanupFns = this.#cleanupFns.filter((currentCb) => currentCb !== cb);
  }

  clean() {
    this.#cleanupFns.forEach((cb) => cb());
    this.#cleanupFns = [];
  }

  toggleImage(imageEl: HTMLImageElement): boolean | null {
    const source = imageEl.getAttribute("src");

    if (!source) return null;

    const hasImage =
      this.#selectedImages.findIndex((image) => image.el === imageEl) !== -1;

    if (hasImage) {
      this.#selectedImages = this.#selectedImages.filter(
        (image) => image.el != imageEl
      );
      return true;
    } else {
      this.#selectedImages.push({ el: imageEl, url: source });
      return false;
    }
  }

  selectElement(element: HTMLElement) {
    const imgElements = element.querySelectorAll("img");

    if (imgElements.length === 0) {
      // do nothing
      return;
    }

    for (const imageEl of imgElements) {
      const source = imageEl.getAttribute("src");

      if (source) {
        const alreadySelected =
          this.#selectedImages.findIndex((image) => image.el === imageEl) !==
          -1;

        if (!alreadySelected) {
          imageEl.dataset.betterImageDownload = "true";
          this.#selectedImages.push({
            el: imageEl,
            url: source,
          });
        }
      }
    }

    this.#toolbar?.updateCounter();
    this.setMode("selectImages");
    this.start();
  }

  getSelectedImages() {
    return this.#selectedImages;
  }

  resetSelectedImages() {
    this.#selectedImages.forEach((image) => {
      delete image.el.dataset.betterImageDownload;
    });

    this.#selectedImages = [];
  }
}

const appState = new AppState();

export { appState };
