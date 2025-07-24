import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TinderCard from 'react-tinder-card';
import { ArrowLeft, Heart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  image: string;
  category: string;
  description: string;
}

// Sample products data - moved outside component to avoid initialization issues
const products: Product[] = [
  {
    id: '1',
    name: 'Cropped Hoodie Set',
    brand: 'Street Dreams',
    price: '₹1,899',
    originalPrice: '₹2,799',
    discount: '32% OFF',
    image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Hoodies',
    description: 'Premium quality cropped hoodie with comfortable fit and modern design.'
  },
  {
    id: '2',
    name: 'Oversized T-Shirt',
    brand: 'Urban Vibes',
    price: '₹899',
    originalPrice: '₹1,299',
    discount: '31% OFF',
    image: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'T-Shirts',
    description: 'Comfortable oversized t-shirt perfect for casual wear.'
  },
  {
    id: '3',
    name: 'Denim Jacket',
    brand: 'Classic Wear',
    price: '₹2,499',
    originalPrice: '₹3,999',
    discount: '38% OFF',
    image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Jackets',
    description: 'Vintage-style denim jacket with premium finish.'
  },
  {
    id: '4',
    name: 'Cargo Pants',
    brand: 'Street Style',
    price: '₹1,599',
    originalPrice: '₹2,299',
    discount: '30% OFF',
    image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Pants',
    description: 'Trendy cargo pants with multiple pockets and comfortable fit.'
  },
  {
    id: '5',
    name: 'Formal Shirt',
    brand: 'Business Pro',
    price: '₹1,299',
    originalPrice: '₹1,899',
    discount: '32% OFF',
    image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Shirts',
    description: 'Professional formal shirt perfect for office wear.'
  }
];

const SwipeProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(products.length - 1);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const currentIndexRef = useRef(products.length - 1);

  const childRefs = useMemo(
    () =>
      Array(products.length)
        .fill(0)
        .map(() => React.createRef<any>()),
    []
  );

  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  // Handle swipe events
  const swiped = (direction: 'left' | 'right' | 'up' | 'down', nameToDelete: string, index: number) => {
    updateCurrentIndex(index - 1);

    // If swiped right, add to wishlist
    if (direction === 'right') {
      const product = products.find(p => p.id === nameToDelete);
      if (product && !wishlist.find(item => item.id === product.id)) {
        setWishlist(prev => [...prev, product]);
      }
    }
  };

  const outOfFrame = (name: string, idx: number) => {
    console.log(`${name} (${idx}) left the screen!`, currentIndexRef.current);
    // Handle the case when the card goes out of frame
    if (currentIndexRef.current >= idx) {
      childRefs[idx].current?.restoreCard();
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewWishlist = () => {
    navigate('/wishlist');
  };

  // Check if all products have been swiped
  if (currentIndex < 0) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">All products viewed!</h2>
          <button
            onClick={handleViewWishlist}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold"
          >
            View Wishlist ({wishlist.length})
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen relative overflow-hidden pb-32">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 py-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 bg-gray-800 rounded-full"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-sm opacity-80">
              {products.length - currentIndex} remaining
            </p>
          </div>
          <button
            onClick={handleViewWishlist}
            className="p-2 bg-gray-800 rounded-full relative"
          >
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-16 left-4 right-4 z-20">
        <div className="bg-gray-700 rounded-full h-1">
          <div
            className="bg-white rounded-full h-1 transition-all duration-300"
            style={{ width: `${((products.length - currentIndex - 1) / products.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Product Cards Stack */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-16 pb-32">
        <div className="relative w-full max-w-md h-[650px]">
          {products.map((product, index) => (
            <TinderCard
              ref={childRefs[index]}
              className="tinder-card"
              key={product.id}
              onSwipe={(dir) => swiped(dir, product.id, index)}
              onCardLeftScreen={() => outOfFrame(product.id, index)}
              preventSwipe={['up', 'down']}
              swipeRequirementType="position"
              swipeThreshold={100}
            >
              <div className="bg-gray-800 rounded-3xl overflow-hidden shadow-2xl w-full h-full select-none">
                {/* Product Image */}
                <div className="relative h-[420px]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />

                  {/* Instant delivery badge */}
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>Instant delivery available</span>
                  </div>

                  {/* Discount badge */}
                  {product.discount && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {product.discount}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
                  <p className="text-gray-400 mb-3">{product.brand}</p>

                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl font-bold text-white">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">{product.originalPrice}</span>
                    )}
                  </div>

                  <p className="text-gray-300 text-sm mb-4">{product.description}</p>

                  {/* Size options */}
                  <div className="flex space-x-2 mb-4">
                    <span className="text-sm text-gray-400">Available sizes:</span>
                    {['S', 'M', 'L', 'XL'].map(size => (
                      <span key={size} className="text-xs bg-gray-700 px-2 py-1 rounded">
                        {size}
                      </span>
                    ))}
                  </div>

                  {/* Category tag */}
                  <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {product.category}
                  </div>
                </div>
              </div>
            </TinderCard>
          ))}
        </div>
      </div>


    </div>
  );
};

export default SwipeProductsPage;
