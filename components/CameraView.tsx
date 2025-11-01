import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CameraIcon, CloseIcon, SwitchCameraIcon } from './icons';

interface CameraViewProps {
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode
        }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please check permissions.");
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Flip the image horizontally if it's the user-facing camera
        if (facingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg').split(',')[1];
        onCapture(imageData);
        onClose();
      }
    }
  };

  const handleSwitchCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="relative bg-black rounded-lg w-full max-w-md aspect-[9/16] overflow-hidden shadow-2xl">
        {error ? (
          <div className="flex items-center justify-center h-full text-white p-4 text-center">
            <p>{error}</p>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />

        <div className="absolute top-0 left-0 right-0 p-4 flex justify-end">
          <button onClick={onClose} className="text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-colors" aria-label="Close camera">
            <CloseIcon />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center items-center gap-8 bg-gradient-to-t from-black/60 to-transparent">
          <button onClick={handleSwitchCamera} className="text-white bg-black/50 rounded-full p-3 hover:bg-black/75 transition-colors" aria-label="Switch camera">
            <SwitchCameraIcon />
          </button>
          <button
            onClick={handleCapture}
            className="w-20 h-20 rounded-full border-4 border-white bg-white/30 hover:bg-white/50 transition-colors"
            aria-label="Take picture"
            disabled={!!error}
          />
          <div className="w-12 h-12" />
        </div>
      </div>
    </div>
  );
};