import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: (phoneNumber: string) => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ isOpen, onClose, onContinue }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneError, setPhoneError] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [fullPhoneNumber, setFullPhoneNumber] = useState('');

  const { setUserData } = useUser();
  const navigate = useNavigate();

  const getPhoneNumberLimit = (code: string) => {
    switch (code) {
      case '+1': return 10;
      case '+44': return 10;
      case '+86': return 11;
      case '+91': return 10;
      default: return 15;
    }
  };

  const validatePhoneNumber = (phone: string, code: string) => {
    if (!phone.trim()) return 'Phone number is required';
    if (!/^\d+$/.test(phone)) return 'Phone number should contain only digits';

    const min = 7;
    const max = getPhoneNumberLimit(code);

    if (phone.length < min) return `Phone number must be at least ${min} digits`;
    if (phone.length > max) return `Phone number cannot exceed ${max} digits`;

    if (code === '+91' && !phone.match(/^[6-9]\d{9}$/)) {
      return 'Invalid Indian mobile number (should start with 6-9)';
    }
    return '';
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    const limit = getPhoneNumberLimit(countryCode);
    if (val.length <= limit) {
      setPhoneNumber(val);
      if (phoneError) setPhoneError('');
    }
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountryCode(e.target.value);
    setPhoneNumber('');
    setPhoneError('');
  };

  const handleSubmitPhone = async () => {
    const error = validatePhoneNumber(phoneNumber, countryCode);
    if (error) return setPhoneError(error);

    const fullPhone = `${countryCode}${phoneNumber}`;
    setFullPhoneNumber(fullPhone);

    try {
      const res = await fetch('http://localhost:5002/api/users/generate-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await res.json();

      if (res.ok) {
        setGeneratedOtp(data.otp);
        setStep('otp');
      } else {
        setPhoneError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setPhoneError('Network error. Try again.');
    }
  };

  const handleOtpVerify = (enteredOtp: string) => {
    if (enteredOtp === generatedOtp.toString()) {
      setUserData({
        phoneNumber: fullPhoneNumber,
        isLoggedIn: true,
        isNewUser: true,
        onboardingData: {},
      });
      onClose();
      if (onContinue) onContinue(fullPhoneNumber);
      navigate('/onboarding');
    } else {
      alert('Invalid OTP. Try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-gray-800 rounded-t-3xl p-6 pb-8 animate-slide-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X />
        </button>

        {step === 'phone' && (
          <>
            <h2 className="text-white text-2xl font-bold mb-4">Login / Signup</h2>

            <div className="flex bg-gray-700 rounded-lg overflow-hidden mb-4">
              <select value={countryCode} onChange={handleCountryCodeChange} className="bg-gray-700 text-white px-4 py-3 outline-none">
                <option value="+91">+91</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+86">+86</option>
              </select>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="Phone Number"
                className="flex-1 px-4 py-3 bg-gray-700 text-white outline-none"
              />
            </div>

            {phoneError && <p className="text-red-400 mb-4">{phoneError}</p>}

            <button
              onClick={handleSubmitPhone}
              className="w-full py-3 bg-white text-black font-semibold rounded-xl"
            >
              Continue
            </button>
          </>
        )}

        {step === 'otp' && (
          <>
            <h2 className="text-white text-xl font-bold mb-4">Enter OTP</h2>
            <input
              type="text"
              placeholder="Enter OTP"
              onChange={(e) => handleOtpVerify(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg mb-4"
            />
            <button
              onClick={() => setStep('phone')}
              className="text-sm text-blue-400 underline"
            >
              Edit phone number
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPopup;
