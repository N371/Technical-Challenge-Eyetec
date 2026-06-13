export function captureFrame(video: HTMLVideoElement, mimeType: "image/jpeg" | "image/png" = "image/jpeg", quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!video.videoWidth) { reject(new Error("Vídeo não está pronto.")); return; }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Blob null")), mimeType, quality);
  });
}

export function blobToPreviewUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}
