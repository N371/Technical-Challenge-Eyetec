 export function FaceCapture({ onCapture }: { onCapture: (blob: Blob) => void }) {
  const videoRef = useWebcam();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const status = useFaceDetection(videoRef, canvasRef);

  const messages: Record<string, string> = {
    loading:    "Carregando modelos...",
    no_face:    "Nenhum rosto detectado",
    too_close:  "Muito próximo — afaste-se",
    too_far:    "Muito longe — aproxime-se",
    off_center: "Centralize o rosto",
    ok:         "✓ Enquadramento perfeito",
  };

  return (
    <div className="relative w-[640px] h-[480px]">
      <video ref={videoRef} className="w-full h-full object-cover" muted />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute inset-0"
      />
      <div className="absolute bottom-4 left-0 right-0 text-center text-white font-bold">
        {messages[status]}
      </div>
      <button
        disabled={status !== "ok"}
        onClick={async () => {
          const blob = await captureFrame(videoRef.current!);
          onCapture(blob);
        }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 px-6 py-2 bg-green-500 disabled:opacity-40 rounded"
      >
        Capturar
      </button>
    </div>
  );
} 
