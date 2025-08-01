import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Heart, ShoppingBag } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

interface WishlistItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: string[];
    price: {
      $numberDecimal: string;
    };
    currency: string;
    brand: string | {
      _id: string;
      name: string;
      logo_url?: string;
    };
    description?: string;
    tags: string[];
  };
  addedAt: string;
  priority: string;
  notes?: string;
}

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { userData } = useUser();
  const { addToCart } = useCart();
  const { wishlist, loading: isLoading, error, removeFromWishlist, fetchWishlist } = useWishlist();

  // Helper function to safely get brand name
  const getBrandName = (brand: string | { _id: string; name: string; logo_url?: string }): string => {
    if (typeof brand === 'string') {
      return brand;
    }
    if (typeof brand === 'object' && brand && 'name' in brand) {
      return brand.name;
    }
    return 'Unknown Brand';
  };

  // Load wishlist on component mount
  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleStartShopping = () => {
    navigate('/');
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      console.log('✅ Product removed from wishlist');
    } catch (error) {
      console.error('❌ Error removing from wishlist:', error);
    }
  };

  const handleViewProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToBag = async (item: WishlistItem) => {
    try {
      console.log('🛒 Adding to bag:', item.product.name);

      // Add to cart with default size M and quantity 1
      await addToCart(item.product._id, 1, 'M');

      // Show success message (you could add a toast notification here)
      console.log('✅ Product added to bag successfully');

      // Navigate to bag page to show the added item
      navigate('/bag');
    } catch (error) {
      console.error('❌ Failed to add to bag:', error);
      // You could show an error toast here
    }
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
        {wishlist.items.length > 0 && (
          <p className="text-gray-400 text-sm mt-1">{wishlist.items.length} item{wishlist.items.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your wishlist...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <p className="text-white text-lg mb-2">Failed to load wishlist</p>
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Wishlist Items */}
      {!isLoading && !error && wishlist.items.length > 0 && (
        <div className="flex-1 px-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {wishlist.items.map((item) => (
              <div key={item._id} className="bg-gray-800 rounded-2xl overflow-hidden">
                <div className="relative">
                  <img
                    src={item.product.images && item.product.images.length > 0
                      ? item.product.images[0]
                      : 'https://via.placeholder.com/200x200?text=No+Image'}
                    alt={item.product.name}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => handleRemoveItem(item.product._id)}
                    className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 hover:bg-black/70 transition-colors"
                  >
                    <X size={16} className="text-white" />
                  </button>
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                    {item.priority.toUpperCase()}
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{item.product.name}</h3>
                  <p className="text-gray-400 text-xs mb-2">{getBrandName(item.product.brand)}</p>

                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-bold text-white">
                      ₹{parseFloat(item.product.price.$numberDecimal).toLocaleString('en-IN')}
                    </span>
                    <span className="text-gray-500 text-xs">{item.product.currency}</span>
                  </div>

                  {item.product.tags && item.product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.product.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-700 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mb-3">
                    Added: {new Date(item.addedAt).toLocaleDateString()}
                  </p>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewProduct(item.product._id)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleAddToBag(item)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <ShoppingBag size={12} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Shopping Button */}
          <div className="pb-6">
            <button
              onClick={() => navigate('/swipe')}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all transform hover:scale-105 shadow-lg"
            >
              Discover More Products 💫
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && wishlist.items.length === 0 && (
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

        <div className="space-y-3">
          <button
            onClick={() => navigate('/swipe')}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-full transition-all transform hover:scale-105"
          >
            Discover Products (Swipe) 💫
          </button>
          <button
            onClick={handleStartShopping}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-colors"
          >
            Start shopping
          </button>
        </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;