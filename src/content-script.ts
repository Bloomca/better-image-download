import { appState } from "./app-state";

function start(type: string) {
  if (type === "selectImages") {
    appState.setMode("selectImages");
  } else if (type === "selectArea") {
    appState.setMode("selectArea");
  } else if (type === "selectContainer") {
    appState.setMode("selectContainer");
  } else if (type === "selectAllImages") {
    appState.setMode("selectImages");
    appState.selectAllImages();
  }

  appState.start();
}

// @ts-ignore we can declare new properties
window.__reactivate = start;
// @ts-ignore this property is set by background script
start(window.__betterImageDownload?.action || "selectImages");
