import type {
  SelectAreaMessage,
  SelectImagesMessage,
  SelectAllImagesMessage,
  SelectContainerMessage,
} from "./types";

document.addEventListener("DOMContentLoaded", async () => {
  const selectAreaBtn = document.getElementById("selectArea");
  const selectImagesBtn = document.getElementById("selectImages");
  const selectAllImagesBtn = document.getElementById("selectAllImages");
  const selectContainerBtn = document.getElementById("selectContainer");

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

  selectAllImagesBtn?.addEventListener("click", async () => {
    await chrome.runtime.sendMessage<SelectAllImagesMessage>({
      action: "selectAllImages",
    });
    window.close();
  });

  selectContainerBtn?.addEventListener("click", async () => {
    await chrome.runtime.sendMessage<SelectContainerMessage>({
      action: "selectContainer",
    });
    window.close();
  });
});

async function setSavedValues() {
  const { preserveFilenames } = await chrome.storage.local.get([
    "preserveFilenames",
  ]);

  const preserveFilenamesCheckbox =
    document.getElementById("preserveFilenames");

  if (
    preserveFilenamesCheckbox instanceof HTMLInputElement &&
    preserveFilenames !== false
  ) {
    preserveFilenamesCheckbox.checked = true;
  }

  preserveFilenamesCheckbox?.addEventListener("change", (event) => {
    if (event.target instanceof HTMLInputElement) {
      chrome.storage.local.set({
        preserveFilenames: event.target.checked,
      });
    }
  });
}

setSavedValues().catch(() => {
  // pass
});
