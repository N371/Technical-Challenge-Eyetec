import * as faceapi from "face-api.js";
import { useEffect, useRef, useState } from "react";

export type FramingStatus =
  | "loading"
  | "no_face"
  | "too_close"
  | "too_far"
  | "off_center"
  | "ok";

export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>
) {
  const [status, setStatus] = useState<FramingStatus>("loading");
  const animFrameRef = useRef<number>();

  // Carrega os modelos uma vez
  useEffect(() => {
    faceapi
      .loadTinyFaceDetectorModel("/models") // modelos em /public/models
      .then(() => setStatus("no_face"));
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    const detect = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const detection = await faceapi.detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions()
      );

      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!detection) {
        setStatus("no_face");
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const { box } = detection;
      const { width: vw, height: vh } = video;

      // --- Lógica de enquadramento ---
      const faceArea = (box.width * box.height) / (vw * vh);
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      const offsetX = Math.abs(centerX - vw / 2) / vw;
      const offsetY = Math.abs(centerY - vh / 2) / vh;

      let newStatus: FramingStatus = "ok";
      if (faceArea > 0.35) newStatus = "too_close";
      else if (faceArea < 0.08) newStatus = "too_far";
      else if (offsetX > 0.2 || offsetY > 0.2) newStatus = "off_center";

      setStatus(newStatus);

      // Desenha bounding box colorida no canvas
      const color = newStatus === "ok" ? "#22c55e" : "#ef4444";
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      animFrameRef.current = requestAnimationFrame(detect);
    };

    animFrameRef.current = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(animFrameRef.current!);
  }, [status === "loading"]);

  return status;
} 
