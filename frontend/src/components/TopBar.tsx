import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Heart, User, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import LoginPopup from './LoginPopup';

const TopBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());

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

  const handleWishlist = () => {
    navigate('/wishlist');
  };

  // Demo effect to simulate wishlist items (you can remove this in production)
  useEffect(() => {
    // Simulate getting wishlist from localStorage or API
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        const wishlistArray = JSON.parse(savedWishlist);
        setWishlistItems(new Set(wishlistArray));
      } catch (error) {
        console.error('Error parsing wishlist from localStorage:', error);
      }
    }
  }, []);

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
    <div className="top-bar bg-gray-900 text-white px-4 py-3 border-b border-gray-800">
      {/* Main navigation */}
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
              <span className="text-sm">Delivery in <span className="text-blue-400 font-semibold">60 minutes</span></span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button className="btn p-2 hover:bg-gray-800 rounded-full transition-colors">
            <Search size={20} onClick={handleSearch} />
          </button>

          <motion.button
            className="btn p-2 hover:bg-gray-800 rounded-full transition-colors relative"
            onClick={handleWishlist}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Wishlist"
          >
            <Heart
              size={20}
              className={wishlistItems.size > 0 ? 'text-red-500 fill-current' : 'text-white'}
            />
            {wishlistItems.size > 0 && (
              <motion.span
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {wishlistItems.size > 99 ? '99+' : wishlistItems.size}
              </motion.span>
            )}
          </motion.button>

          <button className="btn p-2 hover:bg-gray-800 rounded-full transition-colors">
            <User size={20} onClick={handleProfile} />
          </button>
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

export default TopBar;