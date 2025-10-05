import { Toolbar } from "./toolbar";
import { insertStyles } from "./styles";
import { appState } from "./app-state";

import type { SelectedImage } from "./types";

export function startImageSelect() {
  appState.setMode("selectImages");
  insertStyles();
  const toolbar = appState.createToolbar();
  handleImageChange(toolbar);
}

function handleImageChange(toolbar: Toolbar) {
  const imageClickHandler = (event: PointerEvent) => {
    const targetElement = event.target;

    // let toolbar handle the event by itself
    if (appState.createToolbar().isToolbarElement(targetElement)) {
      return;
    }

    if (targetElement instanceof HTMLElement) {
      const link = targetElement.closest("a");
      // if the user clicked on a link, we don't want to navigate away
      // so we forcefully prevent navigation while extension is active
      if (link && link.href) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    if (
      targetElement instanceof HTMLImageElement &&
      targetElement.tagName === "IMG"
    ) {
      // to avoid any image events
      event.preventDefault();
      event.stopPropagation();
      toggleElement(targetElement, toolbar);
      return false;
    } else if (targetElement instanceof HTMLElement) {
      if (targetElement.dataset.betterImageSelectedOverlay === "true") {
        event.preventDefault();
        event.stopPropagation();

        appState.removeImageByOverlay(targetElement);

        return false;
      }

      /**
       * If the user has the extension active in the images mode and they clicked on non-image element,
       * there is a good chance the element is covering the actual image behind it.
       */

      const allImages = document.querySelectorAll("img");

      for (const image of allImages) {
        if (
          clickedInside(image.getBoundingClientRect(), {
            x: event.x,
            y: event.y,
          })
        ) {
          // to avoid any image events
          event.preventDefault();
          event.stopPropagation();
          toggleElement(image, toolbar);
          return false;
        }
      }
    }
  };
  document.addEventListener("click", imageClickHandler, true);

  appState.addCleanupCb(() => {
    document.removeEventListener("click", imageClickHandler, true);
  });
}

function toggleElement(element: HTMLImageElement, toolbar: Toolbar) {
  const result = toolbar.toggleImage(element);

  if (result === null) {
    console.log("result was null, meaning that source was not found");
    return false;
  }

  if (!result.existed) {
    applyElementSelection(result.selected);
  } else {
    clearElementSelection(result.selected);
  }
}

export function applyElementSelection(selectedElement: SelectedImage) {
  selectedElement.overlay.classList.add("better-image-download-selected-image");
  selectedElement.overlay.dataset.betterImageSelectedOverlay = "true";
  const rect = selectedElement.el.getBoundingClientRect();
  const top = document.documentElement.scrollTop + rect.y;
  selectedElement.overlay.style.top = `${top}px`;
  const left = document.documentElement.scrollLeft + rect.x;
  selectedElement.overlay.style.left = `${left}px`;
  selectedElement.overlay.style.height = `${rect.height}px`;
  selectedElement.overlay.style.width = `${rect.width}px`;

  document.body.appendChild(selectedElement.overlay);
}

export function clearElementSelection(selectedElement: SelectedImage) {
  if (document.body.contains(selectedElement.overlay)) {
    document.body.removeChild(selectedElement.overlay);
  }
}

function clickedInside(target: DOMRect, coords: { x: number; y: number }) {
  const insideH =
    coords.x >= target.left && coords.x <= target.left + target.width;
  const insideY =
    coords.y >= target.top && coords.y <= target.top + target.height;

  return insideH && insideY;
}
