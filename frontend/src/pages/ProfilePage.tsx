import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  HelpCircle,
  Heart,
  Users,
  Palette,
  User,
  MapPin,
  Gift,
  FileText,
  Shield,
  ChevronRight,
  LogOut
} from 'lucide-react';
import LoginPopup from '../components/LoginPopup';
import { useUser } from '../contexts/UserContext';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const { userData, setUserData } = useUser();
  const isLoggedIn = userData.isLoggedIn;

  const handleBack = () => {
    navigate(-1);
  };

  const menuItems = [
    { icon: Package, label: 'My Orders', hasChevron: false },
    { icon: HelpCircle, label: 'Help & Query', hasChevron: false },
    { icon: Heart, label: 'Wishlist', hasChevron: false },
    { icon: Users, label: 'Refer & Earn', hasChevron: false },
    { icon: Palette, label: 'Appearance', hasChevron: true },
    { icon: User, label: 'Manage Account', hasChevron: true },
    { icon: MapPin, label: 'Addresses', hasChevron: true },
    { icon: Gift, label: 'My Offers', hasChevron: true },
    { icon: FileText, label: 'Terms & Conditions', hasChevron: true },
    { icon: Shield, label: 'Privacy Policy', hasChevron: true },
    { icon: LogOut, label: 'Log Out', hasChevron: true, isLogout: true },
  ];

  const handleMenuClick = (label: string) => {
    if (label === 'Log Out') {
      setUserData({
        isLoggedIn: false,
        isNewUser: false,
        onboardingData: {}
      });
    } else if (!isLoggedIn && ['My Orders', 'Wishlist', 'Manage Account', 'Addresses', 'My Offers'].includes(label)) {
      setIsLoginPopupOpen(true);
    } else {
      // Navigate to appropriate pages
      switch (label) {
        case 'My Orders':
          navigate('/order-success'); // Placeholder - shows order success page
          break;
        case 'Wishlist':
          navigate('/wishlist');
          break;
        case 'Help & Query':
          navigate('/search'); // Placeholder - redirect to search
          break;
        case 'Refer & Earn':
          navigate('/'); // Placeholder - redirect to home
          break;
        default:
          console.log(`Menu item clicked: ${label}`);
      }
    }
  };

  const handleSignUp = () => {
    setIsLoginPopupOpen(true);
  };

  const handleLoginClose = () => {
    setIsLoginPopupOpen(false);
  };

  const handleLoginContinue = (phoneNumber: string) => {
    console.log('Login with phone number:', phoneNumber);
    // The LoginPopup component now handles user state updates
    setIsLoginPopupOpen(false);
    // Here you would typically make an API call to send OTP
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="px-4 py-6">
        <div 
          className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl p-6 relative overflow-hidden"
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10 rounded-2xl"></div>
          
          <div className="relative z-10">
            {isLoggedIn ? (
              <>
                <h2 className="text-2xl font-bold mb-1">vinvin</h2>
                <p className="text-gray-300 text-sm mb-4">Lvl 00</p>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">Level Progress</span>
                    <span className="text-sm text-gray-300">₹10,000</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">₹0</span>
                    <span className="text-xs text-gray-400">Lvl 01</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Total spent</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User size={32} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-bold mb-2">Welcome to Your Profile</h2>
                <p className="text-gray-300 text-sm mb-6">Sign up or log in to access your account</p>
                <button
                  onClick={handleSignUp}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-colors"
                >
                  Sign Up / Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Package size={20} className="text-gray-400 mr-2" />
              <span className="text-xs text-blue-400 font-medium">Order Count</span>
            </div>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-xs text-blue-400 font-medium mr-2">Knot cash</span>
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
            </div>
            <p className="text-2xl font-bold">₹0</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {menuItems.slice(0, 4).map((item) => (
            <button
              key={item.label}
              className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 flex items-center space-x-3 transition-colors"
              onClick={() => handleMenuClick(item.label)}
            >
              <item.icon size={20} className="text-gray-400" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {menuItems.slice(4).map((item) => (
            <button
              key={item.label}
              className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 flex items-center justify-between transition-colors"
              onClick={() => handleMenuClick(item.label)}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={20} className="text-gray-400" />
                <span className={`text-sm font-medium ${
                  item.isLogout ? 'text-red-400' : 'text-white'
                }`}>
                  {item.label}
                </span>
              </div>
              {item.hasChevron && (
                <ChevronRight size={16} className="text-gray-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Login Popup */}
      <LoginPopup
        isOpen={isLoginPopupOpen}
        onClose={handleLoginClose}
        onContinue={handleLoginContinue}
      />
    </div>
  );
};

export default ProfilePage;