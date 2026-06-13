export function captureFrame(
  video: HTMLVideoElement,
  mimeType = "image/jpeg",
  quality = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Blob null"))),
      mimeType,
      quality
    );
  });
} 
