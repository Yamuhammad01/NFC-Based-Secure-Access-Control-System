'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Camera, RefreshCcw, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QRScannerProps {
  onScan?: (data: string) => void;
  onScanSuccess?: (data: string) => void;
  onCancel?: () => void;
  doorName?: string;
}

const QRScanner = ({ onScan, onScanSuccess, onCancel, doorName }: QRScannerProps) => {
  const handleScan = useCallback((data: string) => {
    if (onScan) onScan(data);
    if (onScanSuccess) onScanSuccess(data);
  }, [onScan, onScanSuccess]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [showManual, setShowManual] = useState(false);
  const requestRef = useRef<number>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        requestRef.current = requestAnimationFrame(tick);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied. Please allow permissions or use manual input.');
      setShowManual(true);
    }
  }, []);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
      const context = canvas.getContext('2d', { willReadFrequently: true });
      
      if (context) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        
        if (code) {
          handleScan(code.data);
          return; // Stop ticking if found
        }
      }
    }
    requestRef.current = requestAnimationFrame(tick);
  }, [onScan]);

  useEffect(() => {
    startCamera();
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/95 p-4">
      <div className="relative w-full max-w-2xl aspect-square lg:aspect-video glass border border-primary/30 rounded-3xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-navy/80 to-transparent">
          <div>
            <h2 className="text-white font-bold text-xl">Scanning for: <span className="text-primary">{doorName}</span></h2>
            <p className="text-text-secondary text-sm">Position your QR code within the frame</p>
          </div>
          <button onClick={onCancel} className="p-2 glass rounded-full hover:bg-white/10 transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Camera Area */}
        <div className="flex-1 relative flex items-center justify-center bg-black">
          {error ? (
            <div className="flex flex-col items-center p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <p className="text-white text-lg font-medium mb-6">{error}</p>
              {!showManual && (
                <button onClick={startCamera} className="px-6 py-3 bg-primary text-white rounded-xl flex items-center gap-2">
                  <RefreshCcw className="w-5 h-5" /> Retry Camera
                </button>
              )}
            </div>
          ) : (
            <>
              <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scan Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 relative">
                  {/* Corner Brackets */}
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-xl" />
                  
                  {/* Scan Line */}
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-scan-line z-10" />
                  
                  {/* Dimming overlay outside scan area */}
                  <div className="absolute -inset-[2000px] border-[2000px] border-navy/40" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Manual Input Fallback */}
        <div className="p-6 bg-panel/50 border-t border-white/5 flex items-center gap-4">
          <div className="flex-1">
             <input 
              type="text" 
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Enter QR Data manually..."
              className="w-full bg-navy/50 border border-border/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
            />
          </div>
          <button 
            disabled={!manualInput}
            onClick={() => handleScan(manualInput)}
            className="px-6 py-3 bg-primary/20 text-primary border border-primary/30 rounded-xl font-bold hover:bg-primary/30 transition-all disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;