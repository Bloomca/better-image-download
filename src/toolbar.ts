import { appState } from "./app-state";
import { cleanStyles } from "./styles";

import type { DownloadImagesMessage } from "./types";

export class Toolbar {
  #container: HTMLElement;
  #counter: HTMLElement;
  #downloadBtn: HTMLButtonElement;
  #closeBtn: HTMLButtonElement;
  #onClose: Function;

  constructor(onClose: Function) {
    this.#onClose = onClose;
    this.#container = document.createElement("div");
    document.body.appendChild(this.#container);

    this.#counter = document.createElement("h3");
    this.#container.classList.add("better-images-download-toolbar");
    this.#container.appendChild(this.#counter);

    const radioButtonContainer = document.createElement("fieldset");
    const imageRadioContainer = document.createElement("label");
    imageRadioContainer.innerText = "Images";
    const imageRadioInput = document.createElement("input");
    imageRadioInput.type = "radio";
    imageRadioInput.name = "better-image-download-type";
    imageRadioInput.value = "selectImages";
    imageRadioInput.id = "selectImages";
    // if (appState.getMode() === "selectImages") {
    //   imageRadioInput.checked = true;
    // }
    imageRadioContainer.appendChild(imageRadioInput);
    radioButtonContainer.appendChild(imageRadioContainer);

    const areaRadioContainer = document.createElement("label");
    areaRadioContainer.innerText = "Area";
    const areaRadioInput = document.createElement("input");
    areaRadioInput.type = "radio";
    areaRadioInput.name = "better-image-download-type";
    areaRadioInput.value = "selectArea";
    areaRadioInput.id = "selectArea";
    // if (appState.getMode() === "selectArea") {
    //   areaRadioInput.checked = true;
    // }
    areaRadioContainer.appendChild(areaRadioInput);
    radioButtonContainer.appendChild(areaRadioContainer);
    this.#container.appendChild(radioButtonContainer);

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
  }

  updateCounter() {
    const num = appState.getSelectedImages().length;

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
    const result = appState.toggleImage(imageEl);

    if (result !== null) this.updateCounter();

    return result;
  }

  addButtonHandlers() {
    this.#downloadBtn.addEventListener("click", () => {
      // should never happen
      if (appState.getSelectedImages().length === 0) return;

      chrome.runtime.sendMessage<DownloadImagesMessage>({
        action: "downloadImages",
        title: document.title,
        pageURL: location.href,
        images: appState.getSelectedImages().map((image) => image.url),
      });

      appState.clean();
      this.dispose();
    });

    this.#closeBtn.addEventListener("click", () => {
      appState.clean();
      this.dispose();
    });
  }

  dispose() {
    document.body.removeChild(this.#container);
    this.#onClose();
    cleanStyles();
  }
}
