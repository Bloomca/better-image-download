export type SelectAreaMessage = {
  action: "selectArea";
};

export type SelectImagesMessage = {
  action: "selectImages";
};

export type SelectAllImagesMessage = {
  action: "selectAllImages";
};

export type DownloadImagesMessage = {
  action: "downloadImages";
  title: string;
  pageURL: string;
  images: string[];
};

export type SelectedImage = {
  url: string;
  el: HTMLImageElement;
};
