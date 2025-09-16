import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

const QRScanner = ({ onQRScanned, onError }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopScanning();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        startScanning();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Cannot access camera. Please allow camera permissions.');
      onError && onError('Camera access denied');
    }
  };

  const startScanning = () => {
    intervalRef.current = setInterval(() => {
      scanQRCode();
    }, 500);
  };

  const stopScanning = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const scanQRCode = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (qrCode && qrCode.data) {
        console.log('QR Code detected:', qrCode.data);
        stopScanning();
        onQRScanned && onQRScanned(qrCode.data);
      }
    }
  };

  const retryScanning = () => {
    setError('');
    startCamera();
  };

  return (
    <div className="qr-scanner">
      <div className="scanner-container">
        {error ? (
          <div className="error-container">
            <div className="error-message">{error}</div>
            <button onClick={retryScanning} className="retry-button">
              Retry Camera Access
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="scanner-video"
              playsInline
              muted
            />
            <div className="scanner-overlay">
              <div className="scanner-frame"></div>
              <div className="scanner-instructions">
                {isScanning ? 'Point camera at QR code' : 'Initializing camera...'}
              </div>
            </div>
          </>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default QRScanner;