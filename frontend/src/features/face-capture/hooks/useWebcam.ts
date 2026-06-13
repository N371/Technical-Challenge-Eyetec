import { useEffect, useRef } from "react";

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    let stream: MediaStream;
    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480, facingMode: "user" }, audio: false })
      .then((s) => {
        stream = s;
        if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play(); }
      })
      .catch((err) => console.error("Erro câmera:", err));
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);
  return videoRef;
}
