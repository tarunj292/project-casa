import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleStartShopping = () => {
    navigate('/');
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          <button
            onClick={() => navigate('/bag')}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold">WISHLIST</h1>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="relative mb-8">
          {/* Glass bowl with hearts */}
          <div className="relative w-48 h-32">
            {/* Bowl outline */}
            <div className="absolute bottom-0 w-full h-20 border-2 border-gray-600 rounded-b-full"></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full"></div>
            
            {/* Hearts inside bowl */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                {/* Multiple hearts with different sizes and positions */}
                <div className="absolute -left-4 bottom-2">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <div className="absolute left-2 bottom-0">
                  <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <div className="absolute right-1 bottom-1">
                  <svg className="w-5 h-5 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Floating heart above */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
              <svg className="w-12 h-12 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {/* Elliptical ring around floating heart */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-8 border border-gray-600 rounded-full"></div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-2 text-center">Fill your wishlist?</h2>
        <p className="text-gray-400 text-center mb-8 max-w-sm">
          Save items you love and find them here anytime.
        </p>

        <button
          onClick={handleStartShopping}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-colors"
        >
          Start shopping
        </button>
      </div>
    </div>
  );
};

export default WishlistPage;