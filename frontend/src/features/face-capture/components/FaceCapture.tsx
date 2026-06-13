import { useRef, useState } from "react";
import { useWebcam } from "../hooks/useWebcam";
import { useFaceDetection, type FramingStatus } from "../hooks/useFaceDetection";
import { captureFrame, blobToPreviewUrl } from "../utils/captureFrame";

interface FaceCaptureProps {
  onCapture: (blob: Blob, previewUrl: string) => void;
  onCancel: () => void;
}

const MESSAGES: Record<FramingStatus, { text: string; color: string }> = {
  loading:    { text: "Carregando modelo...",          color: "text-gray-400" },
  no_face:    { text: "Nenhum rosto detectado",        color: "text-yellow-400" },
  too_close:  { text: "Muito próximo — afaste-se",     color: "text-orange-400" },
  too_far:    { text: "Muito longe — aproxime-se",     color: "text-orange-400" },
  off_center: { text: "Centralize o rosto",            color: "text-orange-400" },
  ok:         { text: "✓ Enquadramento perfeito",      color: "text-green-400"  },
};

export function FaceCapture({ onCapture, onCancel }: FaceCaptureProps) {
  const videoRef = useWebcam();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const status = useFaceDetection(videoRef, canvasRef);
  const [capturing, setCapturing] = useState(false);
  const msg = MESSAGES[status];

  const handleCapture = async () => {
    if (!videoRef.current || status !== "ok") return;
    setCapturing(true);
    try {
      const blob = await captureFrame(videoRef.current);
      onCapture(blob, blobToPreviewUrl(blob));
    } catch (err) {
      console.error("Erro na captura:", err);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ position: "relative", width: 480, height: 360, background: "#0f1117", borderRadius: 8, overflow: "hidden" }}>
        <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} muted playsInline />
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: "scaleX(-1)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center" }}>
          <span style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(0,0,0,0.6)", fontSize: 13 }} className={msg.color}>
            {msg.text}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onCancel} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid #2a2d3e", background: "transparent", color: "#9ca3af", cursor: "pointer" }}>
          Cancelar
        </button>
        <button onClick={handleCapture} disabled={status !== "ok" || capturing}
          style={{ padding: "8px 24px", borderRadius: 8, border: "none", background: status === "ok" ? "#3b5bdb" : "#3b5bdb55", color: status === "ok" ? "#fff" : "#ffffff55", cursor: status === "ok" ? "pointer" : "not-allowed", fontWeight: 600 }}>
          {capturing ? "Capturando..." : "Capturar foto"}
        </button>
      </div>
    </div>
  );
}
