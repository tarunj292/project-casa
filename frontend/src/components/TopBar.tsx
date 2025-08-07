import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Heart, User, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import LoginPopup from './LoginPopup';
import { useUser } from '../contexts/UserContext';

const TopBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [curatedItems, setCuratedItems] = useState<Set<string>>(new Set());
  const { userData } = useUser();

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

  const handleCuratedList = () => {
    navigate('/curatedList'); // or whatever your frontend route is
  };

  // Load curated list from database when user logs in
  useEffect(() => {
    if (userData.isLoggedIn) {
      loadCuratedList();
    } else {
      setCuratedItems(new Set());
    }
  }, [userData.isLoggedIn]);

  // Listen for curated list updates from other components
  useEffect(() => {
    const handleCuratedListUpdate = () => {
      if (userData.isLoggedIn) {
        loadCuratedList();
      }
    };

    window.addEventListener('curatedListUpdated', handleCuratedListUpdate);
    return () => {
      window.removeEventListener('curatedListUpdated', handleCuratedListUpdate);
    };
  }, [userData.isLoggedIn]);

  const loadCuratedList = async () => {
    try {
      const userId = userData._id || 'dummyUserId';
      const response = await fetch(`http://localhost:5002/api/curatedlist/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const productIds = data.products.map((product: any) => product._id);
        setCuratedItems(new Set(productIds));
        console.log('🔝 TopBar: Loaded curated list count:', productIds.length);
      } else if (response.status === 404) {
        setCuratedItems(new Set());
      }
    } catch (error) {
      console.error('🔝 TopBar: Error loading curated list:', error);
      setCuratedItems(new Set());
    }
  };

  const handleLoginClose = () => {
    setIsLoginPopupOpen(false);
  };

  const handleLoginContinue = (phoneNumber: string) => {
    console.log('Login with phone number:', phoneNumber);
    setIsLoginPopupOpen(false);
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
            <div className="flex items-center space-x-1">
              <MapPin size={16} className="text-blue-400" />
              <span className="text-sm">
                Delivery in <span className="text-blue-400 font-semibold">60 minutes</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button className="btn p-2 hover:bg-gray-800 rounded-full transition-colors">
            <Search size={20} onClick={handleSearch} />
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
                transition={{ type: "spring", stiffness: 200 }}
              >
                {curatedItems.size > 99 ? '99+' : curatedItems.size}
              </motion.span>
            )}
          </motion.button>

          <button className="btn p-2 hover:bg-gray-800 rounded-full transition-colors">
            <User size={20} onClick={handleProfile} />
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
