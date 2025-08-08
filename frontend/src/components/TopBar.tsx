import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, User, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import LoginPopup from './LoginPopup';
import { useUser } from '../contexts/UserContext';

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { userData } = useUser();

  const [curatedItems, setCuratedItems] = useState<Set<string>>(new Set());
  const [liveAddress, setLiveAddress] = useState('Delivery Location');

  useEffect(() => {
    const saved = localStorage.getItem('savedAddress');
    if (saved) setLiveAddress(saved);
  }, []);

  const handleSearch = () => navigate('/search');
  const handleProfile = () => navigate('/profile');
  const handleCuratedList = () => navigate('/curatedList');
  const handleLocationClick = () => navigate('/location');

  const loadCuratedList = async () => {
    try {
      const userId = userData?._id || 'dummyUserId';
      const res = await fetch(`http://localhost:5002/api/curatedlist/${userId}`);
      if (res.ok) {
        const data = await res.json();
        const ids = data.products.map((p: any) => p._id);
        setCuratedItems(new Set(ids));
      }
    } catch (err) {
      console.error('Error loading curated list:', err);
    }
  };

  useEffect(() => {
    if (userData?.isLoggedIn) loadCuratedList();
  }, [userData?.isLoggedIn]);

  return (
    <>
      <div className="bg-gray-900 text-white px-4 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center space-x-1 cursor-pointer"
            onClick={handleLocationClick}
          >
            <MapPin size={16} className="text-blue-400" />
            <span className="text-sm text-blue-300 font-semibold truncate max-w-[180px]">
              {liveAddress}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-800 rounded-full" onClick={handleSearch}>
              <Search size={20} />
            </button>
            <motion.button
              className="p-2 hover:bg-gray-800 rounded-full relative"
              onClick={handleCuratedList}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
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
                >
                  {curatedItems.size > 99 ? '99+' : curatedItems.size}
                </motion.span>
              )}
            </motion.button>
            <button className="p-2 hover:bg-gray-800 rounded-full" onClick={handleProfile}>
              <User size={20} />
            </button>
          </div>
        </div>
      </div>

      <LoginPopup isOpen={false} onClose={() => {}} onContinue={() => {}} />
    </>
  );
};

export default TopBar;
