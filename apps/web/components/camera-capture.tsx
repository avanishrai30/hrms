"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui";

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  disabled?: boolean;
  aspectRatio?: "square" | "video";
}

export function CameraCapture({ onCapture, disabled = false, aspectRatio = "video" }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const startCamera = async () => {
    setIsInitializing(true);
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API is not supported in this browser.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to access camera device.";
      setCameraError(msg);
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Re-attach stream to video if capturedImage is cleared (retake)
  useEffect(() => {
    if (!capturedImage && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [capturedImage, stream]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(dataUrl);
    onCapture(dataUrl);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    if (!stream) {
      startCamera();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`relative w-full overflow-hidden rounded-panel border-2 border-border bg-black ${
          aspectRatio === "square" ? "aspect-square max-w-sm" : "aspect-video max-w-md"
        }`}
      >
        {/* Hidden Canvas for Frame Extraction */}
        <canvas ref={canvasRef} className="hidden" />

        {cameraError ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center text-white">
            <span className="text-2xl">⚠️</span>
            <p className="mt-2 text-sm font-semibold text-red-400">Camera Access Denied</p>
            <p className="mt-1 text-xs text-zinc-400">{cameraError}</p>
            <Button variant="secondary" className="mt-4 text-xs" onClick={startCamera}>
              Retry Camera
            </Button>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured Face Preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover -scale-x-100"
            />

            {/* Facial Oval Alignment Guide Overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-44 w-32 rounded-[50%] border-2 border-dashed border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] sm:h-52 sm:w-40" />
            </div>

            <div className="pointer-events-none absolute bottom-3 inset-x-0 text-center">
              <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                Center your face within the oval guide
              </span>
            </div>
          </>
        )}

        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-xs text-white">
            Starting camera stream...
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {capturedImage ? (
          <Button variant="secondary" onClick={handleRetake} disabled={disabled}>
            Retake Snapshot
          </Button>
        ) : (
          <Button
            onClick={handleCapture}
            disabled={disabled || Boolean(cameraError) || isInitializing}
            className="px-6 font-semibold"
          >
            Capture Face
          </Button>
        )}
      </div>
    </div>
  );
}
