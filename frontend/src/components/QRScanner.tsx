import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  isOpen: boolean;
  onScan: (result: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    startScanner();

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    if (!videoRef.current) return;

    try {
      // Check for camera permission
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        setError('No camera found on this device');
        return;
      }

      setError('');
      setHasPermission(null);

      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          // Extract room code from scanned result
          const scannedText = result.data;
          let roomCode = '';

          // Try to extract room code from URL
          const urlMatch = scannedText.match(/[?&]room=([A-Z0-9]{6})/i);
          if (urlMatch) {
            roomCode = urlMatch[1].toUpperCase();
          } else {
            // Look for 6-character alphanumeric room code in the text
            const codeMatch = scannedText.match(/\b[A-Z0-9]{6}\b/i);
            if (codeMatch) {
              roomCode = codeMatch[0].toUpperCase();
            } else {
              // If it's just the URL, try to parse it as a room code
              const cleanText = scannedText.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
              if (cleanText.length === 6) {
                roomCode = cleanText;
              }
            }
          }

          if (roomCode && roomCode.length === 6) {
            onScan(roomCode);
            stopScanner();
            onClose();
          } else {
            setError('Invalid QR code. Please scan a valid room code.');
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Back camera on mobile
        }
      );

      await scannerRef.current.start();
      setHasPermission(true);
    } catch (err: any) {
      console.error('Scanner start error:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Failed to start camera. Please try again.');
      }
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setHasPermission(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="glass-card p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Scan QR Code</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-4 text-red-200 text-sm">
            {error}
          </div>
        )}

        {hasPermission === false && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-3 mb-4 text-yellow-200 text-sm">
            Camera permission is required to scan QR codes. Please allow camera access in your browser settings.
          </div>
        )}

        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-64 bg-black rounded-lg object-cover"
            playsInline
            muted
          />
          
          {hasPermission === null && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-white text-center">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm">Starting camera...</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-white/70 text-sm">
            Position the QR code within the camera view to scan automatically
          </p>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            Cancel
          </button>
          {hasPermission === false && (
            <button
              onClick={startScanner}
              className="flex-1 px-4 py-2 bg-diamond-500/20 hover:bg-diamond-500/30 rounded-lg text-white transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
