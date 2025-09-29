import { appState } from "./app-state";
import { insertStyles } from "./styles";

let overlayElement: HTMLElement | null = null;
/**
 * Actual element in DOM. We need to keep track of it to highlight
 * all affected images if the user clicks on it.
 */
let overlayedElement: HTMLElement | null = null;

export function startAreaSelect() {
  appState.setMode("selectArea");
  insertStyles();
  appState.createToolbar();
  handleMouseEvents();
}

function handleMouseEvents() {
  const mouseoverHandler = (event: MouseEvent) => {
    // ignore any bubbling
    event.preventDefault();

    if (event.target && event.target instanceof HTMLElement) {
      renderOverlay(event.target);
    }

    return false;
  };
  document.addEventListener("mouseover", mouseoverHandler);

  const cleanupCb = () => {
    document.removeEventListener("mouseover", mouseoverHandler);
  };
  appState.addCleanupCb(cleanupCb);

  let clickCleanupCb = () => {
    // pass
  };
  const clickHandler = (event: PointerEvent) => {
    event.preventDefault();

    if (overlayedElement) {
      selectElement(overlayedElement);
      cleanupCb();
      appState.removeCleanupCb(cleanupCb);
      appState.removeCleanupCb(clickCleanupCb);
    }

    return false;
  };
  document.addEventListener("click", clickHandler);
  clickCleanupCb = () => {
    document.removeEventListener("click", clickHandler);
  };

  appState.addCleanupCb(clickCleanupCb);
}

function selectElement(element: HTMLElement) {
  appState.selectElement(element);
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

  if (overlayedElement) {
    delete overlayedElement.dataset.betterImageDownloadOverlayed;
  }

  overlayedElement = element;
  element.dataset.betterImageDownloadOverlayed = "true";
}

function createOverlayElement() {
  const newOverlayElement = document.createElement("div");
  newOverlayElement.classList.add("better-image-download-overlay");
  document.body.appendChild(newOverlayElement);

  overlayElement = newOverlayElement;

  appState.addCleanupCb(() => {
    document.body.removeChild(newOverlayElement);

    overlayElement = null;

    if (overlayedElement) {
      delete overlayedElement.dataset.betterImageDownloadOverlayed;
    }

    overlayedElement = null;
  });

  return newOverlayElement;
}
