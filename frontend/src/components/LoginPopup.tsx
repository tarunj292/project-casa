import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import OtpInput from './OtpInput';

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

  const getMinPhoneLength = (countryCode: string) => {
    switch (countryCode) {
      case '+1': return 10;
      case '+44': return 10;
      case '+86': return 11;
      case '+91': return 10;
      default: return 7;
    }
  }; // ✅ FIXED: added missing closing }

  const getPhoneNumberLimit = (countryCode: string) => {
    switch (countryCode) {
      case '+1': return 10;
      case '+44': return 11;
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

    switch (countryCode) {
      case '+91':
        if (!phone.match(/^[6-9]\d{9}$/)) {
          return 'Invalid Indian mobile number (should start with 6, 7, 8, or 9)';
        }
        break;
      case '+1':
        if (!phone.match(/^[2-9]\d{9}$/)) {
          return 'Invalid US/Canada number (area code cannot start with 0 or 1)';
        }
        break;
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

  const handleContinue = async () => {
    const validationError = validatePhoneNumber(phoneNumber, countryCode);

    if (validationError) {
      setPhoneError(validationError);
      return;
    }

    const fullPhone = `${countryCode}${phoneNumber}`;
    setFullPhoneNumber(fullPhone);

    try {
      const res = await fetch('http://localhost:5002/api/users/generate-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('✅ OTP sent:', data.otp);
        setGeneratedOtp(data.otp);
        setStep('otp');
      } else {
        let errorMessage = 'Failed to send OTP';
        try {
          const data = await res.json();
          errorMessage = data.error || errorMessage;
        } catch (jsonError) {
          errorMessage = `Server error: ${res.status} ${res.statusText}`;
        }
        console.error('❌ Server error:', errorMessage);
        setPhoneError(errorMessage);
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setPhoneError('Network error. Please check if the backend server is running.');
    }
  };

  const handleOtpVerify = async (enteredOtp: string) => {
    console.log('🔍 Verifying OTP:', enteredOtp, 'against', generatedOtp);

    if (enteredOtp === generatedOtp.toString()) {
      console.log('✅ OTP verified successfully');

      try {
        const response = await fetch(`http://localhost:5002/api/users?phone=${encodeURIComponent(fullPhoneNumber)}`);
        const users = await response.json();

        const existingUser = users.find((user: any) => user.phone === fullPhoneNumber);
        const isNewUser = !existingUser;

        console.log('User check result:', { existingUser, isNewUser });

        setUserData({
          phoneNumber: fullPhoneNumber,
          name: existingUser?.display_name || undefined,
          email: existingUser?.email || undefined,
          isLoggedIn: true,
          isNewUser: isNewUser,
          onboardingData: existingUser ? {
            ageRange: existingUser.age <= 25 ? 'Gen Z (18-25)' : existingUser.age <= 35 ? 'Millennial (26-35)' : 'Other',
            styleInterests: existingUser.interests || [],
            preferredFits: existingUser.ml_preferences || []
          } : {}
        });

        handleClose();

        if (onContinue) onContinue(fullPhoneNumber);

        if (isNewUser) {
          console.log('New user detected - redirecting to onboarding');
          navigate('/onboarding');
        } else {
          console.log('Existing user detected - redirecting to home');
          navigate('/');
        }

      } catch (error) {
        console.error('Error checking user existence:', error);
        setUserData({
          phoneNumber: fullPhoneNumber,
          isLoggedIn: true,
          isNewUser: true,
          onboardingData: {}
        });

        handleClose();
        if (onContinue) onContinue(fullPhoneNumber);
        navigate('/onboarding');
      }
    } else {
      alert('Invalid OTP. Try again.');
    }
  };

  const handleClose = () => {
    setPhoneNumber('');
    setPhoneError('');
    setGeneratedOtp('');
    setFullPhoneNumber('');
    setStep('phone');
    onClose();
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
              onClick={handleContinue}
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
