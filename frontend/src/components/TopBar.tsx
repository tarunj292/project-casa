import React, { useState } from 'react';
import { useLocation as useReactRouterLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, User, MapPin } from 'lucide-react';
import LoginPopup from './LoginPopup';

interface TopBarProps {
  setShowLocationPopup: React.Dispatch<React.SetStateAction<boolean>>;
  setUserLocation: React.Dispatch<React.SetStateAction<{ lat: number; lng: number } | null>>;
}

const TopBar: React.FC<TopBarProps> = ({ setShowLocationPopup, setUserLocation }) => {
  const navigate = useNavigate();
  const location = useReactRouterLocation();
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);

  const isProductPage = location.pathname.startsWith('/product/');
  const showBackButton = isProductPage;

  const handleBack = () => {
    navigate(-1);
  };

  const handleSearch = () => {
    navigate('/search');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleLoginClose = () => {
    setIsLoginPopupOpen(false);
  };

  const handleLoginContinue = (phoneNumber: string) => {
    console.log('Login with phone number:', phoneNumber);
    setIsLoginPopupOpen(false);
  };

  const handleLocationClick = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });

      if (permission.state === 'denied') {
        alert('Location access denied in browser settings.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setShowLocationPopup(true);
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } catch (error) {
      console.error('Geolocation not supported or blocked:', error);
    }
  };

  return (
    <div className="top-bar bg-gray-900 text-white px-4 py-3 border-b border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton ? (
            <button
              onClick={handleBack}
              className="btn p-2 -ml-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div
              onClick={handleLocationClick}
              className="flex items-center space-x-1 cursor-pointer"
            >
              <MapPin size={16} className="text-blue-400" />
              <span className="text-sm">
                Click here <span className="text-blue-400 font-semibold">to add loction</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button className="btn p-2 hover:bg-gray-800 rounded-full transition-colors" onClick={handleSearch}>
            <Search size={20} />
          </button>

          <button className="btn p-2 hover:bg-gray-800 rounded-full transition-colors" onClick={handleProfile}>
            <User size={20} />
          </button>
        </div>
      </div>

      <LoginPopup
        isOpen={isLoginPopupOpen}
        onClose={handleLoginClose}
        onContinue={handleLoginContinue}
      />
    </div>
  );
};

export default TopBar;
