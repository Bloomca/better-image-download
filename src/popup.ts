import type { SelectAreaMessage, SelectImagesMessage } from "./types";

document.addEventListener("DOMContentLoaded", async () => {
  const selectAreaBtn = document.getElementById("selectArea");
  const selectImagesBtn = document.getElementById("selectImages");

  selectAreaBtn?.addEventListener("click", async () => {
    await chrome.runtime.sendMessage<SelectAreaMessage>({
      action: "selectArea",
    });
    window.close();
  });

  selectImagesBtn?.addEventListener("click", async () => {
    await chrome.runtime.sendMessage<SelectImagesMessage>({
      action: "selectImages",
    });
    window.close();
  });
});
