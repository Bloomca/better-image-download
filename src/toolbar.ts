import { appState } from "./app-state";

import type { DownloadImagesMessage } from "./types";

type SelectedImage = {
  url: string;
  el: HTMLImageElement;
};

export class Toolbar {
  #container: HTMLElement;
  #selectedImages: SelectedImage[] = [];
  #counter: HTMLElement;
  #downloadBtn: HTMLButtonElement;
  #closeBtn: HTMLButtonElement;

  constructor() {
    this.#container = document.createElement("div");
    document.body.appendChild(this.#container);

    this.#counter = document.createElement("h3");
    this.#container.classList.add("better-images-download-toolbar");
    this.#container.appendChild(this.#counter);

    const buttonContainer = document.createElement("div");
    this.#container.appendChild(buttonContainer);

    this.#downloadBtn = document.createElement("button");
    this.#downloadBtn.innerText = "Download";
    this.#downloadBtn.disabled = true;
    buttonContainer.appendChild(this.#downloadBtn);

    this.#closeBtn = document.createElement("button");
    this.#closeBtn.innerText = "Close";
    buttonContainer.appendChild(this.#closeBtn);

    this.updateCounter();

    this.addButtonHandlers();

    appState.addCleanupCb(() => this.dispose());
  }

  updateCounter() {
    const num = this.#selectedImages.length;

    if (num === 0) {
      this.#counter.innerHTML = "No images selected";
      this.#downloadBtn.disabled = true;
    } else if (num === 1) {
      this.#counter.innerHTML = "1 image selected";
      this.#downloadBtn.disabled = false;
    } else {
      this.#counter.innerHTML = `${num} images selected`;
      this.#downloadBtn.disabled = false;
    }
  }

  // returns whether the image was selected before
  toggleImage(imageEl: HTMLImageElement): boolean | null {
    const source = imageEl.getAttribute("src");

    if (!source) return null;

    const hasImage =
      this.#selectedImages.findIndex((image) => image.el === imageEl) !== -1;

    if (hasImage) {
      this.#selectedImages = this.#selectedImages.filter(
        (image) => image.el != imageEl
      );
      this.updateCounter();
      return true;
    } else {
      this.#selectedImages.push({ el: imageEl, url: source });
      this.updateCounter();
      return false;
    }
  }

  addButtonHandlers() {
    this.#downloadBtn.addEventListener("click", () => {
      // should never happen
      if (this.#selectedImages.length === 0) return;

      chrome.runtime.sendMessage<DownloadImagesMessage>({
        action: "downloadImages",
        title: document.title,
        pageURL: location.href,
        images: this.#selectedImages.map((image) => image.url),
      });

      appState.clean();
    });

    this.#closeBtn.addEventListener("click", () => appState.clean());
  }

  dispose() {
    document.body.removeChild(this.#container);

    this.#selectedImages.forEach((image) => {
      delete image.el.dataset.betterImageDownload;
    });

    this.#selectedImages = [];
  }
}
