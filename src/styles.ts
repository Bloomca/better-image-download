let StyleElement: HTMLStyleElement | null;

export function insertStyles() {
  if (StyleElement) return;

  const newStyleEl = document.createElement("style");
  newStyleEl.textContent = `
    .better-images-download-toolbar {
        position: fixed;
        bottom: 50px;
        display: flex;
        flex-direction: row;
        z-index: 9999999999;
        left: calc(50% - 300px);
        width: 600px;
        background: cyan;
        padding: 10px 15px;
        border-radius: 5px;
        border: 1px solid rgba(0, 0, 255, 0.5);
        justify-content: space-between;
        align-items: center;
    }

    .better-images-download-toolbar fieldset {
        display: flex;
    }

    .better-images-download-toolbar fieldset label {
        margin-left: 4px;
        margin-right: 4px;
        display: flex;
    }

    .better-images-download-toolbar fieldset label input {
      margin-left: 2px;
    }

    .better-image-download-overlay {
        pointer-events: none;
        position: absolute;
        outline: 2px dotted cyan;
        background: rgba(0, 0, 255, 0.25);
        z-index: 999999999;
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

    img[data-better-image-download="true"],
    [data-better-image-download-overlayed="true"] img,
    img[data-better-image-download-overlayed="true"] {
        border: 2px solid #6f6fea !important;
        outline: 2px solid #6f6fea !important;
        box-sizing: border-box;
        opacity: 1;
    }

    img[data-better-image-download="true"]::after,
    [data-better-image-download-overlayed="true"] img::after,
    img[data-better-image-download-overlayed="true"]:: after {
      position: absolute;
      content: '\\2714';  /* ✔ */
    }

    .better-image-download-selected-image {
      position: absolute;
      background: rgba(38, 235, 16, 0.35);
      box-sizing: border-box;
      border: 3px solid rgba(14, 78, 7, 1);
      border-radius: 5px;
    }
  `;
  document.head.appendChild(newStyleEl);

  StyleElement = newStyleEl;
}

export function cleanStyles() {
  if (StyleElement) {
    document.head.removeChild(StyleElement);
    StyleElement = null;
  }
}
