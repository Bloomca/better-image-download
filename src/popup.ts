document.addEventListener("DOMContentLoaded", async () => {
  const selectAreaBtn = document.getElementById("selectArea");
  const selectImagesBtn = document.getElementById("selectImages");

  selectAreaBtn?.addEventListener("click", async () => {
    await chrome.runtime.sendMessage({ action: "selectArea" });
    window.close();
  });

  selectImagesBtn?.addEventListener("click", async () => {
    await chrome.runtime.sendMessage({ action: "selectImages" });
    window.close();
  });
});
