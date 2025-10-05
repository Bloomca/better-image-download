import { Toolbar } from "./toolbar";
import {
  startImageSelect,
  applyElementSelection,
  clearElementSelection,
} from "./select-images";
import { startContainerSelect } from "./select-container";
import { startAreaSelect } from "./select-area";

import type { SelectedImage } from "./types";

class AppState {
  #cleanupFns: Function[] = [];
  #selectedImages: SelectedImage[] = [];
  #toolbar: Toolbar | null = null;

  #mode: "selectImages" | "selectArea" | "selectContainer" = "selectImages";

  setMode(mode: "selectImages" | "selectArea" | "selectContainer") {
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
    } else if (this.#mode === "selectContainer") {
      startContainerSelect();
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

  toggleImage(
    imageEl: HTMLImageElement,
    source: string
  ): {
    existed: boolean;
    selected: SelectedImage;
  } {
    const imageIndex = this.#selectedImages.findIndex(
      (image) => image.el === imageEl
    );

    if (imageIndex !== -1) {
      const oldElement = this.#selectedImages[imageIndex];
      this.#selectedImages = this.#selectedImages.filter(
        (image) => image.el != imageEl
      );
      return { existed: true, selected: oldElement };
    } else {
      const overlay = document.createElement("div");
      const newElement: SelectedImage = {
        el: imageEl,
        url: source,
        overlay,
      };
      this.#selectedImages.push(newElement);
      return { existed: false, selected: newElement };
    }
  }

  removeImageByOverlay(overlay: HTMLElement) {
    const imageToRemove = this.#selectedImages.find(
      (image) => image.overlay === overlay
    );

    if (imageToRemove) {
      clearElementSelection(imageToRemove);
    }

    this.#selectedImages = this.#selectedImages.filter(
      (image) => image.overlay !== overlay
    );
  }

  selectElement(element: HTMLElement) {
    const imgElements = element.querySelectorAll("img");

    for (const imageEl of imgElements) {
      const source = imageEl.getAttribute("src");

      if (source) {
        const alreadySelected =
          this.#selectedImages.findIndex((image) => image.el === imageEl) !==
          -1;

        if (!alreadySelected) {
          const overlay = document.createElement("div");
          const newElement: SelectedImage = {
            el: imageEl,
            url: source,
            overlay,
          };
          applyElementSelection(newElement);
          this.#selectedImages.push(newElement);
        }
      }
    }

    this.#toolbar?.updateCounter();
    this.start();
  }

  getSelectedImages() {
    return this.#selectedImages;
  }

  /**
   * Resets selected images, but does not touch the toolbar. The styles
   * in the HTML will be correctly stripped, so previously selected
   * images will lose the selected border.
   */
  resetSelectedImages() {
    this.#selectedImages.forEach(clearElementSelection);
    this.#selectedImages = [];
  }

  selectAllImages() {
    const imageElements = document.querySelectorAll("img");

    for (const imageEl of imageElements) {
      this.addImage(imageEl);
    }

    this.#toolbar?.updateCounter();
  }

  addImage(imageEl: HTMLImageElement) {
    const source = imageEl.getAttribute("src");

    if (!source) return;

    const hasImage =
      this.#selectedImages.findIndex((image) => image.el === imageEl) !== -1;

    if (!hasImage) {
      const overlay = document.createElement("div");
      const newElement: SelectedImage = {
        el: imageEl,
        url: source,
        overlay,
      };
      applyElementSelection(newElement);
      this.#selectedImages.push(newElement);
    }
  }
}

const appState = new AppState();

export { appState };
