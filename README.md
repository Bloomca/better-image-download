## Better Image Download

This is a web extension to download images in bulk. After activating this extension, you can either toggle images individually, or you can select an area to automatically select all images inside.

After that, you can download them into a single folder.

## Build instructions

While this is a simple plugin, to make it more robust it is written in TypeScript, and output scripts are concatenated. There are no dependencies outside of the build step. To test it locally, perform the following:

```
npm i
npm run build
```

After that, you'll have `dist/chrome` and `dist/firefox` folders, which can be used to load the extension locally in the browser.