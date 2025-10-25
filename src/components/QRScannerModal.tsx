// src/components/QRScannerModal.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Button } from '@/components/ui/button'; // Assuming shadcn Button
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription, // Added for potential hints
} from '@/components/ui/dialog'; // Assuming shadcn Dialog
import { AlertCircle, Upload, X } from 'lucide-react'; // Added X for close

// Props interface for TypeScript
interface QRScannerModalProps {
  open: boolean;
  onClose: () => void;
  onDetected: (data: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ open, onClose, onDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null); // To store requestAnimationFrame ID
  const streamRef = useRef<MediaStream | null>(null); // To store the camera stream

  const [error, setError] = useState('');
  const [hint, setHint] = useState('');
  const [videoReady, setVideoReady] = useState(false);

  // Function to stop the camera stream and animation frame loop
  const stopStreamAndScan = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setVideoReady(false); // Reset video ready state
  }, []);

  // Function to continuously decode video frames
  const decodeFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      // If video isn't ready, request the next frame and try again
      rafRef.current = requestAnimationFrame(decodeFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Need willReadFrequently

    if (ctx && video.videoWidth > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // Attempt to decode QR code from the current frame
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert', // Standard QR codes don't need inversion usually
        });

        if (code?.data) {
          // If a code is found, stop scanning and call the onDetected callback
          stopStreamAndScan();
          onDetected(code.data.trim());
          return; // Exit the loop
        }
      } catch (e) {
        console.error("Error decoding QR frame:", e);
        // Don't set state error here, just log, as it might be temporary
      }
    }

    // If no code found, request the next frame
    rafRef.current = requestAnimationFrame(decodeFrame);
  }, [onDetected, stopStreamAndScan]);

  // Effect to handle camera setup and cleanup when the modal opens/closes
  useEffect(() => {
    if (!open) {
      stopStreamAndScan(); // Ensure stream is stopped when modal is closed
      return;
    }

    // Reset state when modal opens
    setError('');
    setHint('');
    setVideoReady(false);

    // Async function to request camera access
    const startCamera = async () => {
      // Check for secure context (HTTPS) - required for camera
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        setError('Camera requires a secure connection (HTTPS).');
        setHint('Use https:// or a dev tunnel like ngrok.');
        return;
      }
      // Check if browser supports camera API
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera access not supported by this browser.');
        setHint('Try Chrome (Android) or Safari (iOS).');
        return;
      }

      try {
        // Request camera stream (prefer back camera)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }, // Prefer back camera
          audio: false,
        });
        streamRef.current = stream; // Store stream reference

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.playsInline = true; // Important for iOS Safari
          videoRef.current.muted = true; // Required for autoplay in most browsers

          // Wait for video metadata to load to start playback
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current?.play();
              setVideoReady(true);
              // Start the QR decoding loop only if it's not already running
              if (!rafRef.current) {
                 rafRef.current = requestAnimationFrame(decodeFrame);
              }
            } catch (playError) {
              console.error('[QRScanner] Video play error:', playError);
              setError('Could not start the camera stream.');
              stopStreamAndScan(); // Clean up if play fails
            }
          };
        }
      } catch (err: any) {
        console.error('[QRScanner] getUserMedia error:', err);
        const name = err?.name || '';
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          setError('Camera permission denied.');
          setHint('Please allow camera access in your browser settings and reload.');
        } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
          setError('No suitable camera found.');
        } else {
          setError('Could not access the camera.');
        }
      }
    };

    startCamera();

    // Cleanup function to stop stream when component unmounts or `open` becomes false
    return () => {
      stopStreamAndScan();
    };
  }, [open, decodeFrame, stopStreamAndScan]); // Rerun effect if `open` changes

  // Handler for image file upload (basic structure from Diya's code)
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code?.data) {
            onDetected(code.data.trim()); // Call onDetected with data
          } else {
            setError('No QR code found in the uploaded image.');
          }
        } catch(e) {
           console.error("Error decoding image QR:", e);
           setError('Could not process the image.');
        }
      };
      img.onerror = () => setError('Failed to load image file.');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset file input
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md p-0"> {/* Remove padding */}
        <DialogHeader className="p-6 pb-4"> {/* Add padding here */}
          <DialogTitle className="text-2xl">ಕ್ಯೂಆರ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ (Scan QR)</DialogTitle>
          <DialogDescription>Point your camera at a UPI QR code.</DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6 space-y-4">
          {error ? (
            <div className="space-y-2">
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-5 w-5"/> {error}
              </div>
              {hint && <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 p-3 rounded-md text-sm">{hint}</div>}
            </div>
          ) : (
            <div className="w-full bg-black rounded-lg overflow-hidden aspect-square flex items-center justify-center relative"> {/* aspect-square for QR */}
              <video
                ref={videoRef}
                className={`w-full h-full object-cover transition-opacity duration-300 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
                playsInline
                autoPlay
                muted
              />
               {/* Scanner Overlay (optional visual aid) */}
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-3/4 h-3/4 border-4 border-white/50 rounded-lg shadow-inner-strong" />
               </div>
               {!videoReady && (
                <div className="absolute inset-0 flex items-center justify-center text-white/80">
                  Initializing camera…
                </div>
               )}
            </div>
          )}

           <div className="text-center">
             <Button variant="link" asChild className="text-sm">
                <label>
                    <Upload className="h-4 w-4 mr-1" />
                    Upload QR Image Instead
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
             </Button>
           </div>

          <canvas ref={canvasRef} className="hidden" /> {/* Hidden canvas for image processing */}
        </div>
        {/* Footer removed, using shadcn's built-in close */}
      </DialogContent>
    </Dialog>
  );
};

export default QRScannerModal;