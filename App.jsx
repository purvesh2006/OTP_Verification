import React, { useState } from 'react';
import QRScanner from './QRScanner';
// import QRScanner from './QRScannerWithLib';
import OTPInput from './OTPInput';
import WorkerDetails from './WorkerDetails';
import './App.css';

const API_BASE_URL = 'http://localhost:5000'; // Change this to your backend URL

const App = () => {
  const [currentStep, setCurrentStep] = useState('qr-scan'); // 'qr-scan', 'otp-verify', 'worker-details'
  const [workerId, setWorkerId] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQRScanned = async (qrData) => {
    console.log('QR Code scanned:', qrData);
    setLoading(true);
    setError('');

    try {
      // Extract worker ID from QR code data
      // Assuming QR code contains just the worker ID (e.g., "WKR001")
      // Modify this logic based on your QR code format
      const scannedWorkerId = qrData.trim();
      
      const response = await fetch(`${API_BASE_URL}/verify-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workerId: scannedWorkerId }),
      });

      const data = await response.json();

      if (data.success) {
        setWorkerId(scannedWorkerId);
        setMaskedPhone(data.maskedPhone);
        setCurrentStep('otp-verify');
      } else {
        setError(data.error || 'Worker ID not found');
      }
    } catch (err) {
      console.error('Error verifying QR:', err);
      setError('Failed to verify worker ID. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPComplete = async (otp) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workerId, otp }),
      });

      const data = await response.json();

      if (data.success) {
        setWorkerData(data.worker);
        setCurrentStep('worker-details');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentStep('qr-scan');
    setWorkerId('');
    setMaskedPhone('');
    setWorkerData(null);
    setError('');
  };

  const handleRetry = () => {
    setError('');
    setCurrentStep('qr-scan');
    setWorkerId('');
    setMaskedPhone('');
  };

  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <h1>Worker Authentication System</h1>
          <div className="step-indicator">
            <div className={`step ${currentStep === 'qr-scan' ? 'active' : currentStep !== 'qr-scan' ? 'completed' : ''}`}>
              <span>1</span>
              Scan QR
            </div>
            <div className={`step ${currentStep === 'otp-verify' ? 'active' : currentStep === 'worker-details' ? 'completed' : ''}`}>
              <span>2</span>
              Enter OTP
            </div>
            <div className={`step ${currentStep === 'worker-details' ? 'active' : ''}`}>
              <span>3</span>
              View Details
            </div>
          </div>
        </header>

        <main className="app-main">
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={() => setError('')} className="close-error">×</button>
            </div>
          )}

          {currentStep === 'qr-scan' && (
            <div className="step-container">
              <h2>Scan Worker QR Code</h2>
              <p>Point your camera at the worker's QR code to begin authentication</p>
              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Verifying worker ID...</p>
                </div>
              ) : (
                <QRScanner 
                  onQRScanned={handleQRScanned}
                  onError={(err) => setError(err)}
                />
              )}
            </div>
          )}

          {currentStep === 'otp-verify' && (
            <div className="step-container">
              <h2>Enter OTP</h2>
              <p>We've sent a 6-digit OTP to {maskedPhone}</p>
              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Verifying OTP...</p>
                </div>
              ) : (
                <OTPInput
                  length={6}
                  onComplete={handleOTPComplete}
                  loading={loading}
                />
              )}
              <div className="step-actions">
                <button onClick={handleRetry} className="secondary-button">
                  Scan Another QR
                </button>
              </div>
            </div>
          )}

          {currentStep === 'worker-details' && workerData && (
            <div className="step-container">
              <h2>Worker Details</h2>
              <WorkerDetails 
                worker={workerData}
                onLogout={handleLogout}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;