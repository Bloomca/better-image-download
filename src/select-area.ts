import { appState } from "./app-state";
import { insertStyles } from "./styles";

let overlayElement: HTMLElement | null = null;

type Coordinates = { x: number; y: number };

export function startAreaSelect() {
  appState.setMode("selectArea");
  insertStyles();
  appState.createToolbar();
  handleMouseEvents();
}

function handleMouseEvents() {
  const startCoordinates = { x: 0, y: 0 };
  const endCoordinates = { x: 0, y: 0 };
  const mouseDownHandler = function mouseDownHandler(event: MouseEvent) {
    updateCoordinates(startCoordinates, event);

    const mouseMoveHandler = function mouseMoveHandler(event: MouseEvent) {
      updateCoordinates(endCoordinates, event);
      renderOverlay(startCoordinates, endCoordinates);
    };

    document.addEventListener("mousemove", mouseMoveHandler);

    const moveCleanup = appState.addCleanupCb(() =>
      document.removeEventListener("mousemove", mouseMoveHandler)
    );

    let mouseUpCleanup = () => {};
    const mouseUpHandler = function mouseUpHandler() {
      moveCleanup();
      mouseUpCleanup();
      selectArea(startCoordinates, endCoordinates);
      startCoordinates.x = 0;
      startCoordinates.y = 0;
      endCoordinates.x = 0;
      endCoordinates.y = 0;
      const toolbar = appState.createToolbar();
      toolbar.updateCounter();

      if (overlayElement) {
        document.body.removeChild(overlayElement);
        overlayElement = null;
      }
    };

    document.addEventListener("mouseup", mouseUpHandler);

    mouseUpCleanup = () => {
      document.removeEventListener("mouseup", mouseUpHandler);
    };

    appState.addCleanupCb(mouseUpCleanup);
  };
  document.addEventListener("mousedown", mouseDownHandler);

  appState.addCleanupCb(() => {
    document.removeEventListener("mousedown", mouseDownHandler);
  });
}

// MUTATES coordinates value in-place
function updateCoordinates(coordinates: Coordinates, event: MouseEvent) {
  const topScroll = document.documentElement.scrollTop;
  const leftScroll = document.documentElement.scrollLeft;

  coordinates.x = leftScroll + event.x;
  coordinates.y = topScroll + event.y;
}

function renderOverlay(
  startCoordinates: Coordinates,
  endCoordinates: Coordinates
) {
  const overlayEl = overlayElement ? overlayElement : createOverlayElement();

  const top = Math.min(startCoordinates.y, endCoordinates.y);
  const bottom = Math.max(startCoordinates.y, endCoordinates.y);

  overlayEl.style.top = `${top}px`;
  overlayEl.style.height = `${bottom - top}px`;

  const left = Math.min(startCoordinates.x, endCoordinates.x);
  const right = Math.max(startCoordinates.x, endCoordinates.x);

  overlayEl.style.left = `${left}px`;
  overlayEl.style.width = `${right - left}px`;
}

function createOverlayElement() {
  const newOverlayElement = document.createElement("div");
  newOverlayElement.classList.add("better-image-download-overlay");
  document.body.appendChild(newOverlayElement);

  overlayElement = newOverlayElement;

  appState.addCleanupCb(() => {
    if (document.body.contains(newOverlayElement)) {
      document.body.removeChild(newOverlayElement);
    }

    if (overlayElement && document.body.contains(overlayElement)) {
      document.body.removeChild(overlayElement);
      overlayElement = null;
    }
  });

  return newOverlayElement;
}

function selectArea(
  startCoordinates: Coordinates,
  endCoordinates: Coordinates
) {
  const topScroll = document.documentElement.scrollTop;
  const leftScroll = document.documentElement.scrollLeft;
  const imageElements = document.querySelectorAll("img");

  const left = Math.min(startCoordinates.x, endCoordinates.x);
  const right = Math.max(startCoordinates.x, endCoordinates.x);

  const top = Math.min(startCoordinates.y, endCoordinates.y);
  const bottom = Math.max(startCoordinates.y, endCoordinates.y);

  for (const imageEl of imageElements) {
    const rect = imageEl.getBoundingClientRect();

    const imageX = leftScroll + rect.x;
    const imageXEnd = imageX + rect.width;
    const imageY = topScroll + rect.y;
    const imageYEnd = imageY + rect.height;

    const insideH =
      (imageX > left && imageX < right) ||
      (imageXEnd > left && imageXEnd < right);
    const insideY =
      (imageY > top && imageY < bottom) ||
      (imageYEnd > top && imageYEnd < bottom);

    if (insideH && insideY) {
      appState.addImage(imageEl);
    }
  }
}
