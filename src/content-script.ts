import { startImageSelect } from "./select-images";
import { startAreaSelect } from "./select-area";

function start(type: string) {
  if (type === "selectImages") {
    startImageSelect();
  } else if (type === "selectArea") {
    startAreaSelect();
  }
}

// @ts-ignore we can declare new properties
window.__reactivate = start;
// @ts-ignore this property is set by background script
start(window.__betterImageDownloadAction);
