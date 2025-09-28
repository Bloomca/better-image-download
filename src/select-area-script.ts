let StyleElement: HTMLStyleElement | null = null;
let cleanCbs: Function[] = [];
let overlayElement: HTMLElement | null = null;

function startAreaSelect() {
  insertStyles();
  handleMouseEvents();
}

function handleMouseEvents() {
  document.addEventListener("mouseover", (event) => {
    // ignore any bubbling
    event.preventDefault();

    if (event.target && event.target instanceof HTMLElement) {
      renderOverlay(event.target);
    }

    return false;
  });
}

function renderOverlay(element: HTMLElement) {
  const overlayEl = overlayElement ? overlayElement : createOverlayElement();
  const elementRect = element.getBoundingClientRect();

  overlayEl.style.width = `${elementRect.width}px`;
  overlayEl.style.height = `${elementRect.height}px`;

  const topScroll = document.documentElement.scrollTop;
  const leftScroll = document.documentElement.scrollLeft;

  overlayEl.style.top = `${topScroll + elementRect.top}px`;
  overlayEl.style.left = `${leftScroll + elementRect.left}px`;
}

function createOverlayElement() {
  const newOverlayElement = document.createElement("div");
  newOverlayElement.classList.add("better-image-download-overlay");
  document.body.appendChild(newOverlayElement);

  overlayElement = newOverlayElement;

  cleanCbs.push(() => {
    document.body.removeChild(newOverlayElement);
  });

  return newOverlayElement;
}

function insertStyles() {
  if (StyleElement) return;

  const newStyleEl = document.createElement("style");
  newStyleEl.textContent = `
    .better-image-download-overlay {
        pointer-events: none;
        position: absolute;
        outline: 2px dotted cyan;
        background: rgba(0, 0, 255, 0.25);
        z-index: 999999999;
    }

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
  window.__reactivate = startAreaSelect;
  startAreaSelect();
}
