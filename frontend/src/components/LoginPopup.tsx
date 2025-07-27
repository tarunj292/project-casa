import React, { useState } from 'react';
import { X } from 'lucide-react';
import OtpInput from './OtpInput';

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (phoneNumber: string) => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ isOpen, onClose, onContinue }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [fullPhoneNumber, setFullPhoneNumber] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const getPhoneNumberLimit = (countryCode: string) => {
    switch (countryCode) {
      case '+1': return 10; // US/Canada
      case '+44': return 11; // UK
      case '+86': return 11; // China
      case '+91': return 10; // India
      default: return 15; // International standard max
    }
  };

  const getMinPhoneLength = (countryCode: string) => {
    switch (countryCode) {
      case '+1': return 10; // US/Canada
      case '+44': return 10; // UK (minimum)
      case '+86': return 11; // China
      case '+91': return 10; // India
      default: return 7; // International minimum
    }
  };

  const validatePhoneNumber = (phone: string, countryCode: string) => {
    if (!phone.trim()) {
      return 'Phone number is required';
    }
    
    if (!/^\d+$/.test(phone)) {
      return 'Phone number should contain only digits';
    }

    const minLength = getMinPhoneLength(countryCode);
    const maxLength = getPhoneNumberLimit(countryCode);

    if (phone.length < minLength) {
      return `Phone number must be at least ${minLength} digits`;
    }

    if (phone.length > maxLength) {
      return `Phone number cannot exceed ${maxLength} digits`;
    }

    // Country-specific validation
    switch (countryCode) {
      case '+91': // India
        if (!phone.match(/^[6-9]\d{9}$/)) {
          return 'Invalid Indian mobile number (should start with 6-9)';
        }
        break;
      case '+1': // US/Canada
        if (!phone.match(/^[2-9]\d{9}$/)) {
          return 'Invalid US/Canada number (area code cannot start with 0 or 1)';
        }
        break;
    }

    return '';
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const limit = getPhoneNumberLimit(countryCode);
    
    if (value.length <= limit) {
      setPhoneNumber(value);
      // Clear error when user starts typing
      if (phoneError) {
        setPhoneError('');
      }
    }
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountryCode(e.target.value);
    setPhoneNumber(''); // Clear phone number when country changes
    setPhoneError(''); // Clear any existing errors
  };

  const handleContinue = async () => {
    const validationError = validatePhoneNumber(phoneNumber, countryCode);
    
    if (validationError) {
      setPhoneError(validationError);
      return;
    }

    const fullPhone = `${countryCode}${phoneNumber}`;

    try {
      const res = await fetch('http://localhost:5002/api/users/generate-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log('✅ OTP sent:', data.otp);
        setGeneratedOtp(data.otp);
        setFullPhoneNumber(fullPhone);
        setStep('otp');
        setPhoneError(''); // Clear any errors on success
      } else {
        console.error('❌ Server error:', data.error);
        setPhoneError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setPhoneError('Network error. Please try again.');
    }
  };

  const handleOtpVerify = (enteredOtp: string) => {
    console.log('🔍 Verifying OTP:', enteredOtp, 'against', generatedOtp);
    
    if (enteredOtp === generatedOtp.toString()) {
      console.log('✅ OTP verified successfully');
      onContinue(fullPhoneNumber);
      handleClose();
    } else {
      console.log('❌ Invalid OTP');
      alert('Invalid OTP. Please try again.');
    }
  };

  const handleResendOtp = () => {
    handleContinue();
  };

  const handleBack = () => {
    setStep('phone');
  };

  const handleClose = () => {
    setStep('phone');
    setPhoneNumber('');
    setGeneratedOtp('');
    setFullPhoneNumber('');
    onClose();
  };

  const isPhoneValid = phoneNumber.trim() && !validatePhoneNumber(phoneNumber, countryCode);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-md bg-gray-800 rounded-t-3xl p-6 pb-8 animate-slide-up">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-8 pt-4">
          {step === 'phone' ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">Login/Signup</h2>
              
              <div className="mb-6">
                <label className="block text-white font-medium mb-4">
                  Phone Number
                </label>

                <div className="flex bg-gray-700 rounded-lg overflow-hidden">
                  <div className="flex items-center px-4 py-3 bg-gray-700 border-r border-gray-600">
                    <select
                      value={countryCode}
                      onChange={handleCountryCodeChange}
                      className="bg-transparent text-white text-sm font-medium outline-none cursor-pointer"
                    >
                      <option value="+91" className="bg-gray-700">+91</option>
                      <option value="+1" className="bg-gray-700">+1</option>
                      <option value="+44" className="bg-gray-700">+44</option>
                      <option value="+86" className="bg-gray-700">+86</option>
                    </select>
                  </div>

                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    placeholder="Phone Number"
                    className={`flex-1 px-4 py-3 bg-gray-700 text-white placeholder-gray-400 outline-none text-base ${
                      phoneError ? 'border-2 border-red-500' : ''
                    }`}
                    maxLength={getPhoneNumberLimit(countryCode)}
                  />
                </div>

                {phoneError && (
                  <p className="text-red-400 text-sm mt-2">
                    {phoneError}
                  </p>
                )}

                <p className="text-gray-400 text-sm mt-3">
                  A verification code will be sent to this phone number
                </p>
              </div>

              <div className="mb-8">
                <p className="text-gray-400 text-sm leading-relaxed">
                  By clicking, I accept the{' '}
                  <span className="text-white font-medium underline cursor-pointer hover:text-blue-400 transition-colors">
                    Terms & Conditions
                  </span>{' '}
                  &{' '}
                  <span className="text-white font-medium underline cursor-pointer hover:text-blue-400 transition-colors">
                    Privacy Policy
                  </span>
                </p>
              </div>

              <button
                onClick={handleContinue}
                disabled={!isPhoneValid}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  isPhoneValid
                    ? 'bg-gray-300 text-gray-900 hover:bg-white active:scale-95'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </>
          ) : (
            <OtpInput
              phoneNumber={fullPhoneNumber}
              onBack={handleBack}
              onVerify={handleOtpVerify}
              onResend={handleResendOtp}
            />
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPopup;
