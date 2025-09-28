import type { DownloadImagesMessage } from "./types";

let StyleElement: HTMLStyleElement | null;
let cleanCbs: Function[] = [];

function startImageSelect() {
  insertStyles();
  const toolbar = new Toolbar();
  handleImageChange(toolbar);
}

type SelectedImage = {
  url: string;
  el: HTMLImageElement;
};

class Toolbar {
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

    cleanCbs.push(() => this.dispose());
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

      clean();
    });

    this.#closeBtn.addEventListener("click", clean);
  }

  dispose() {
    document.body.removeChild(this.#container);

    this.#selectedImages.forEach((image) => {
      delete image.el.dataset.betterImageDownload;
    });

    this.#selectedImages = [];
  }
}

function handleImageChange(toolbar: Toolbar) {
  const imageClickHandler = (event: PointerEvent) => {
    const targetElement = event.target;
    if (
      targetElement instanceof HTMLImageElement &&
      targetElement.tagName === "IMG"
    ) {
      const result = toolbar.toggleImage(targetElement);

      if (result === null) {
        console.log("result was null, meaning that source was not found");
        return;
      }

      if (!result) {
        targetElement.dataset.betterImageDownload = "true";
      } else {
        delete targetElement.dataset.betterImageDownload;
      }
    }

    // to avoid any image events
    event.preventDefault();
    return false;
  };
  document.addEventListener("click", imageClickHandler, true);

  cleanCbs.push(() => {
    document.removeEventListener("click", imageClickHandler, true);
  });
}

function insertStyles() {
  if (StyleElement) return;

  const newStyleEl = document.createElement("style");
  newStyleEl.textContent = `
    .better-images-download-toolbar {
        position: fixed;
        bottom: 50px;
        display: flex;
        flex-direction: row;
        z-index: 9999999999;
        left: calc(50% - 175px);
        width: 350px;
        background: cyan;
        padding: 10px 15px;
        border-radius: 5px;
        border: 1px solid rgba(0, 0, 255, 0.5);
        justify-content: space-between;
        align-items: center;
    }

    .better-images-download-toolbar h3 {
        margin: 3px;
    }

    .better-images-download-toolbar button {
        margin-left: 5px;
        margin-right: 5px;
    }

    img {
        cursor: pointer;
        opacity: 0.5;
        transition: 0.2s opacity;
    }

    img:hover {
        opacity: 1;
    }

    img[data-better-image-download="true"] {
       outline: 3px solid blue;
       opacity: 1;
    }
  `;
  document.head.appendChild(newStyleEl);

  StyleElement = newStyleEl;

  cleanCbs.push(() => {
    document.head.removeChild(newStyleEl);
    StyleElement = null;
  });
}

function clean() {
  cleanCbs.forEach((fn) => fn());
  cleanCbs = [];
}

if ("__reactivate" in window && typeof window.__reactivate === "function") {
  window.__reactivate();
} else {
  // @ts-ignore we can declare new properties
  window.__reactivate = startImageSelect;
  startImageSelect();
}
