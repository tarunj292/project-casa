import React, { useState } from 'react';
import { X } from 'lucide-react';

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (phoneNumber: string) => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ isOpen, onClose, onContinue }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');

  const handleContinue = () => {
    if (phoneNumber.trim()) {
      onContinue(`${countryCode}${phoneNumber}`);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-gray-800 rounded-t-3xl p-6 pb-8 animate-slide-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-8 pt-4">
          <h2 className="text-2xl font-bold text-white mb-2">Login/Signup</h2>
        </div>

        {/* Phone Number Section */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-4">
            Phone Number
          </label>
          
          {/* Phone Input Container */}
          <div className="flex bg-gray-700 rounded-lg overflow-hidden">
            {/* Country Code Selector */}
            <div className="flex items-center px-4 py-3 bg-gray-700 border-r border-gray-600">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-transparent text-white text-sm font-medium outline-none cursor-pointer"
              >
                <option value="+91" className="bg-gray-700">+91</option>
                <option value="+1" className="bg-gray-700">+1</option>
                <option value="+44" className="bg-gray-700">+44</option>
                <option value="+86" className="bg-gray-700">+86</option>
              </select>
            </div>
            
            {/* Phone Number Input */}
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="Phone Number"
              className="flex-1 px-4 py-3 bg-gray-700 text-white placeholder-gray-400 outline-none text-base"
              maxLength={10}
            />
          </div>
          
          {/* Verification Message */}
          <p className="text-gray-400 text-sm mt-3">
            A verification code will be sent to this phone number
          </p>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-8">
          <p className="text-gray-400 text-sm leading-relaxed">
            By clicking, I accept the{' '}
            <span className="text-white font-medium underline cursor-pointer hover:text-blue-400 transition-colors">
              Terms & Conditions
            </span>
            {' '}&{' '}
            <span className="text-white font-medium underline cursor-pointer hover:text-blue-400 transition-colors">
              Privacy Policy
            </span>
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!phoneNumber.trim()}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
            phoneNumber.trim()
              ? 'bg-gray-300 text-gray-900 hover:bg-white active:scale-95'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
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
