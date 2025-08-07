import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Heart, User, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import LoginPopup from './LoginPopup';
import { useUser } from '../contexts/UserContext';

interface TopBarProps {
  setShowLocationPopup: React.Dispatch<React.SetStateAction<boolean>>;
  setUserLocation: React.Dispatch<React.SetStateAction<{ lat: number; lng: number } | null>>;
}

const TopBar: React.FC<TopBarProps> = ({ setShowLocationPopup, setUserLocation }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [curatedItems, setCuratedItems] = useState<Set<string>>(new Set());
  const { userData } = useUser();

  const isProductPage = location.pathname.startsWith('/product/');
  const showBackButton = isProductPage;

  const handleBack = () => navigate(-1);
  const handleSearch = () => navigate('/search');
  const handleProfile = () => navigate('/profile');
  const handleCuratedList = () => navigate('/curatedList');

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

  const handleLoginClose = () => setIsLoginPopupOpen(false);

  const handleLoginContinue = (phoneNumber: string) => {
    console.log('Login with phone number:', phoneNumber);
    setIsLoginPopupOpen(false);
  };

  useEffect(() => {
    if (userData?.isLoggedIn) {
      loadCuratedList();
    } else {
      setCuratedItems(new Set());
    }
  }, [userData?.isLoggedIn]);

  useEffect(() => {
    const handleUpdate = () => {
      if (userData?.isLoggedIn) {
        loadCuratedList();
      }
    };
    window.addEventListener('curatedListUpdated', handleUpdate);
    return () => window.removeEventListener('curatedListUpdated', handleUpdate);
  }, [userData?.isLoggedIn]);

  const loadCuratedList = async () => {
    try {
      const userId = userData?._id || 'dummyUserId';
      const res = await fetch(`http://localhost:5002/api/curatedlist/${userId}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        const ids = data.products.map((p: any) => p._id);
        setCuratedItems(new Set(ids));
        console.log('🔝 TopBar: Loaded curated list count:', ids.length);
      } else if (res.status === 404) {
        setCuratedItems(new Set());
      }
    } catch (err) {
      console.error('🔝 TopBar: Error loading curated list:', err);
      setCuratedItems(new Set());
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
                Delivery in <span className="text-blue-400 font-semibold">60 minutes</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button className="btn p-2 hover:bg-gray-800 rounded-full transition-colors" onClick={handleSearch}>
            <Search size={20} />
          </button>

          <motion.button
            className="btn p-2 hover:bg-gray-800 rounded-full transition-colors relative"
            onClick={handleCuratedList}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Curated List"
          >
            <Heart
              size={20}
              className={curatedItems.size > 0 ? 'text-red-500 fill-current' : 'text-white'}
            />
            {curatedItems.size > 0 && (
              <motion.span
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {curatedItems.size > 99 ? '99+' : curatedItems.size}
              </motion.span>
            )}
          </motion.button>

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
