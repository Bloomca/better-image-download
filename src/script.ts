chrome.runtime.onMessage.addListener(async function handleMessage(message) {
  if (typeof message === "object" && "action" in message) {
    if (message.action === "selectArea") {
      // send selecting area
    } else if (message.action === "selectImages") {
      const [activeTab] = await getActiveTab();
      if (activeTab?.id) {
        chrome.scripting.executeScript({
          target: { tabId: activeTab?.id },
          files: ["select-images-script.js"],
        });
      }
    }
  }
});

function getActiveTab() {
  return chrome.tabs.query({ active: true, lastFocusedWindow: true });
}
