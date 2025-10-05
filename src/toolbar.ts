import { appState } from "./app-state";
import { cleanStyles } from "./styles";

import type { DownloadImagesMessage } from "./types";

export class Toolbar {
  #container: HTMLElement;
  #counter: HTMLElement;
  #resetBtn: HTMLButtonElement;
  #downloadBtn: HTMLButtonElement;
  #closeBtn: HTMLButtonElement;
  #onClose: Function;
  #selectImageInput: HTMLInputElement;
  #selectAreaInput: HTMLInputElement;
  #selectContainerInput: HTMLInputElement;

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
    if (appState.getMode() === "selectImages") {
      imageRadioInput.checked = true;
    }
    imageRadioContainer.appendChild(imageRadioInput);
    radioButtonContainer.appendChild(imageRadioContainer);

    const areaRadioContainer = document.createElement("label");
    areaRadioContainer.innerText = "Area";
    const areaRadioInput = document.createElement("input");
    areaRadioInput.type = "radio";
    areaRadioInput.name = "better-image-download-type";
    areaRadioInput.value = "selectArea";
    areaRadioInput.id = "selectArea";
    if (appState.getMode() === "selectArea") {
      areaRadioInput.checked = true;
    }
    areaRadioContainer.appendChild(areaRadioInput);
    radioButtonContainer.appendChild(areaRadioContainer);

    const containerRadioContainer = document.createElement("label");
    containerRadioContainer.innerText = "Container";
    const containerRadioInput = document.createElement("input");
    containerRadioInput.type = "radio";
    containerRadioInput.name = "better-image-download-type";
    containerRadioInput.value = "selectContainer";
    containerRadioInput.id = "selectContainer";
    if (appState.getMode() === "selectContainer") {
      containerRadioInput.checked = true;
    }
    containerRadioContainer.appendChild(containerRadioInput);
    radioButtonContainer.appendChild(containerRadioContainer);

    this.#container.appendChild(radioButtonContainer);

    this.#selectImageInput = imageRadioInput;
    this.#selectAreaInput = areaRadioInput;
    this.#selectContainerInput = containerRadioInput;

    const buttonContainer = document.createElement("div");
    this.#container.appendChild(buttonContainer);

    this.#resetBtn = document.createElement("button");
    this.#resetBtn.innerText = "Reset";
    this.#resetBtn.disabled = true;
    buttonContainer.appendChild(this.#resetBtn);

    this.#downloadBtn = document.createElement("button");
    this.#downloadBtn.innerText = "Download";
    this.#downloadBtn.disabled = true;
    buttonContainer.appendChild(this.#downloadBtn);

    this.#closeBtn = document.createElement("button");
    this.#closeBtn.innerText = "Close";
    buttonContainer.appendChild(this.#closeBtn);

    this.updateCounter();

    this.addButtonHandlers();
    this.addRadioButtonhandlers();
  }

  updateCounter() {
    const num = appState.getSelectedImages().length;

    if (num === 0) {
      this.#counter.innerHTML = "No images selected";
      this.#downloadBtn.disabled = true;
      this.#resetBtn.disabled = true;
    } else if (num === 1) {
      this.#counter.innerHTML = "1 image selected";
      this.#downloadBtn.disabled = false;
      this.#resetBtn.disabled = false;
    } else {
      this.#counter.innerHTML = `${num} images selected`;
      this.#downloadBtn.disabled = false;
      this.#resetBtn.disabled = false;
    }
  }

  updateMode() {
    const mode = appState.getMode();

    if (mode === "selectArea") {
      this.#selectAreaInput.checked = true;
    } else if (mode === "selectContainer") {
      this.#selectContainerInput.checked = true;
    } else if (mode === "selectImages") {
      this.#selectImageInput.checked = true;
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

    this.#resetBtn.addEventListener("click", () => {
      appState.resetSelectedImages();
      this.updateCounter();
    });
  }

  addRadioButtonhandlers() {
    this.#selectImageInput.addEventListener("change", (event) => {
      if (event.target instanceof HTMLInputElement && event.target.checked) {
        if (appState.getMode() !== "selectImages") {
          appState.setMode("selectImages");
          appState.start();
        }
      }
    });

    this.#selectAreaInput.addEventListener("change", (event) => {
      if (event.target instanceof HTMLInputElement && event.target.checked) {
        if (appState.getMode() !== "selectArea") {
          appState.setMode("selectArea");
          appState.start();
        }
      }
    });

    this.#selectContainerInput.addEventListener("change", (event) => {
      if (event.target instanceof HTMLInputElement && event.target.checked) {
        if (appState.getMode() !== "selectContainer") {
          appState.setMode("selectContainer");
          appState.start();
        }
      }
    });
  }

  isToolbarElement(element: EventTarget | null): boolean {
    if (element instanceof HTMLElement) {
      return this.#container.contains(element);
    }

    return false;
  }

  dispose() {
    document.body.removeChild(this.#container);
    this.#onClose();
    cleanStyles();
  }
}
