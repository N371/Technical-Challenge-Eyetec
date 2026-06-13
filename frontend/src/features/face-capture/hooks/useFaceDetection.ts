import * as faceapi from "face-api.js";
import { useEffect, useRef, useState } from "react";

export type FramingStatus = "loading" | "no_face" | "too_close" | "too_far" | "off_center" | "ok";

export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>
) {
  const [status, setStatus] = useState<FramingStatus>("loading");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const animFrameRef = useRef<number>();

  useEffect(() => {
    faceapi.loadTinyFaceDetectorModel("/models")
      .then(() => { setModelsLoaded(true); setStatus("no_face"); })
      .catch((err) => console.error("Erro ao carregar modelos:", err));
  }, []);

  useEffect(() => {
    if (!modelsLoaded) return;
    const detect = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detect); return;
      }
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }));
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!detection) { setStatus("no_face"); animFrameRef.current = requestAnimationFrame(detect); return; }
      const { box } = detection;
      const vw = canvas.width, vh = canvas.height;
      const faceArea = (box.width * box.height) / (vw * vh);
      const offsetX = Math.abs(box.x + box.width / 2 - vw / 2) / vw;
      const offsetY = Math.abs(box.y + box.height / 2 - vh / 2) / vh;
      let s: FramingStatus = "ok";
      if (faceArea > 0.35) s = "too_close";
      else if (faceArea < 0.06) s = "too_far";
      else if (offsetX > 0.2 || offsetY > 0.2) s = "off_center";
      setStatus(s);
      ctx.strokeStyle = s === "ok" ? "#22c55e" : "#f97316";
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      animFrameRef.current = requestAnimationFrame(detect);
    };
    animFrameRef.current = requestAnimationFrame(detect);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [modelsLoaded, videoRef, canvasRef]);

  return status;
}
