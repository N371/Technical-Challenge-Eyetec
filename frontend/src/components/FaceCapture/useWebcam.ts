import { useEffect, useRef } from "react";

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream;

    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480, facingMode: "user" } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
      })
      .catch(console.error);

    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  return videoRef;
}
