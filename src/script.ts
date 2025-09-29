import type {
  DownloadImagesMessage,
  SelectAreaMessage,
  SelectImagesMessage,
} from "./types";

chrome.runtime.onMessage.addListener(async function handleMessage(
  message:
    | DownloadImagesMessage
    | SelectAreaMessage
    | SelectImagesMessage
    | unknown
) {
  if (!message) return;

  if (typeof message === "object" && "action" in message) {
    if (message.action === "selectArea") {
      const [activeTab] = await getActiveTab();
      if (activeTab?.id) {
        const [result] = await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          func: () => {
            // @ts-ignore
            if (window.__reactivate) {
              // @ts-ignore
              window.__reactivate("selectArea");
              return true;
            } else {
              // @ts-ignore
              window.__betterImageDownloadAction = "selectArea";
              return false;
            }
          },
        });

        if (result.result !== true) {
          chrome.scripting.executeScript({
            target: { tabId: activeTab?.id },
            files: ["content-script.js"],
          });
        }
      }
    } else if (message.action === "selectImages") {
      const [activeTab] = await getActiveTab();
      if (activeTab?.id) {
        const [result] = await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          func: () => {
            // @ts-ignore
            if (window.__reactivate) {
              // @ts-ignore
              window.__reactivate("selectImages");
              return true;
            } else {
              // @ts-ignore
              window.__betterImageDownloadAction = "selectImages";
              return false;
            }
          },
        });

        if (result.result !== true) {
          chrome.scripting.executeScript({
            target: { tabId: activeTab?.id },
            files: ["content-script.js"],
          });
        }
      }
    } else if (isMessageDownloadImages(message)) {
      downloadImages(message);
    } else {
      // pass for now, unknown message
    }
  }
});

function isMessageDownloadImages(
  message: unknown
): message is DownloadImagesMessage {
  if (!message || typeof message !== "object") return false;

  const msg = message as Record<string, unknown>;

  return (
    msg.action === "downloadImages" &&
    typeof msg.title === "string" &&
    typeof msg.pageURL === "string" &&
    Array.isArray(msg.images) &&
    msg.images.every((img: unknown) => typeof img === "string")
  );
}

function getActiveTab() {
  return chrome.tabs.query({ active: true, lastFocusedWindow: true });
}

function downloadImages(message: DownloadImagesMessage) {
  const folderName = getFolderName(message);
  message.images.forEach((imageURL) => {
    chrome.downloads.download({
      filename: `${folderName}/${getFilename(imageURL)}`,
      conflictAction: "uniquify",
      url: imageURL,
    });
  });
}

function getFilename(imageURL: string) {
  const urlElements = imageURL.split("/");
  return urlElements[urlElements.length - 1];
}

function getFolderName(message: DownloadImagesMessage) {
  const title = sanitizeTitle(message.title);
  return `BetterImageDownload - ${title} - ${getFormattedDate()}`;
}

function sanitizeTitle(title: string) {
  return (
    title
      // Remove/replace illegal characters
      .replace(/[<>:"|?*\/\\]/g, "_")
      // Remove control characters (0-31)
      .replace(/[\x00-\x1F]/g, "")
      // Remove trailing periods and spaces
      .replace(/[.\s]+$/g, "")
      // Collapse multiple dashes/spaces
      .replace(/[-\s]+/g, " ")
      .trim()
  );
}

function getFormattedDate() {
  const now = new Date();
  const time = `${now.getHours()}_${now.getMinutes()}`;
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${time}`;
}
