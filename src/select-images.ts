import { Toolbar } from "./toolbar";
import { insertStyles } from "./styles";
import { appState } from "./app-state";

export function startImageSelect() {
  insertStyles();
  const toolbar = new Toolbar();
  handleImageChange(toolbar);
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

  appState.addCleanupCb(() => {
    document.removeEventListener("click", imageClickHandler, true);
  });
}
