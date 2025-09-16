import React, { useState, useRef, useEffect } from 'react';

const OTPInput = ({ length = 6, onComplete, onError, loading = false }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus on first input when component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Move to next input if current input is filled
    if (element.value !== '' && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Check if OTP is complete
    if (newOtp.every(digit => digit !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous input on backspace
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    if (pastedData.length === length && /^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      onComplete(pastedData);
    }
  };

  const clearOtp = () => {
    setOtp(new Array(length).fill(''));
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="otp-input-container">
      <div className="otp-inputs">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            disabled={loading}
            className={`otp-digit ${loading ? 'disabled' : ''}`}
            autoComplete="off"
          />
        ))}
      </div>
      
      <div className="otp-actions">
        <button 
          type="button" 
          onClick={clearOtp}
          disabled={loading}
          className="clear-button"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default OTPInput;