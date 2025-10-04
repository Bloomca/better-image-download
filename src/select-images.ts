import { Toolbar } from "./toolbar";
import { insertStyles } from "./styles";
import { appState } from "./app-state";

export function startImageSelect() {
  appState.setMode("selectImages");
  insertStyles();
  const toolbar = appState.createToolbar();
  handleImageChange(toolbar);
}

function handleImageChange(toolbar: Toolbar) {
  const imageClickHandler = (event: PointerEvent) => {
    const targetElement = event.target;

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
      toggleElement(targetElement, toolbar);
      return false;
    } else if (targetElement instanceof HTMLElement) {
      /**
       * If the user has the extension active in the images mode and they clicked on non-image element,
       * there is a good chance the element is covering the actual image behind it.
       */

      const allImages = document.querySelectorAll("img");

      const targetRect = targetElement.getBoundingClientRect();

      console.log(targetRect);

      for (const image of allImages) {
        if (compareRects(targetRect, image.getBoundingClientRect())) {
          // to avoid any image events
          event.preventDefault();
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

  if (!result) {
    element.dataset.betterImageDownload = "true";
  } else {
    delete element.dataset.betterImageDownload;
  }
}

function compareRects(el1: DOMRect, el2: DOMRect) {
  return [
    areValuesClose(el1.bottom, el2.bottom),
    areValuesClose(el1.height, el2.height),
    areValuesClose(el1.left, el2.left),
    areValuesClose(el1.right, el2.right),
  ].every((value) => value);
}

// precision is in pixels
function areValuesClose(
  value1: number,
  value2: number,
  precision = 5
): boolean {
  return Math.abs(value1 - value2) < precision;
}
