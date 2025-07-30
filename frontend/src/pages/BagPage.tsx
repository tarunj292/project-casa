import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2 } from 'lucide-react';

interface BagItem {
  id: string;
  name: string;
  brand: string;
  price: string;
  image: string;
  size: string;
  quantity: number;
}

const BagPage: React.FC = () => {
  const navigate = useNavigate();
  const [bagItems, setBagItems] = useState<BagItem[]>([
    {
      id: '1',
      name: 'Bunny Time Hoodie',
      brand: 'Bonkers Corner',
      price: '₹1,899',
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=200',
      size: 'L',
      quantity: 1
    },
    {
      id: '2',
      name: 'Oversized T-Shirt',
      brand: 'Aesthetic Bodies',
      price: '₹899',
      image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=200',
      size: 'M',
      quantity: 2
    }
  ]);

  const handleStartShopping = () => navigate('/');

  const handleQuantityChange = (id: string, change: number) => {
    setBagItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setBagItems(items => items.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    const total = bagItems.reduce((sum, item) =>
      sum + (parseInt(item.price.replace('₹', '').replace(',', '')) * item.quantity), 0
    );
    navigate('/checkout', {
      state: {
        bagItems,
        total,
        directBuy: false
      }
    });
  };

  const totalAmount = bagItems.reduce((sum, item) =>
    sum + (parseInt(item.price.replace('₹', '').replace(',', '')) * item.quantity), 0
  );

  const isEmpty = bagItems.length === 0;

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)} className="p-1">
              <ArrowLeft size={24} className="text-white hover:text-blue-400 transition-colors" />
            </button>
            <h1 className="text-xl font-bold">Your Bag</h1>
          </div>
          <button
            onClick={() => navigate('/wishlist')}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-8 bg-blue-400 rounded-full opacity-60"
                  style={{
                    transform: `rotate(${i * 45}deg) translateY(-40px)`,
                    animation: `pulse 2s infinite ${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <div className="relative z-10 w-20 h-20 bg-gray-700 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
              </svg>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                <div className="text-xs text-gray-400">☹</div>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2 text-center">Your bag's feeling left out.</h2>
          <p className="text-gray-400 text-center mb-8 max-w-sm">Fill it with pieces that match your vibe.</p>
          <button
            onClick={handleStartShopping}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-colors"
          >
            Start shopping
          </button>
        </div>
      ) : (
        <div className="flex-1 px-4 py-6">
          <div className="space-y-4 mb-6">
            {bagItems.map(item => (
              <div key={item.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-400">{item.brand}</p>
                    <p className="text-sm text-gray-400">Size: {item.size}</p>
                    <p className="text-lg font-bold mt-1">{item.price}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <button onClick={() => handleRemoveItem(item.id)} className="p-1 text-red-400 hover:text-red-300">
                      <Trash2 size={16} />
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isEmpty && (
        <div className="px-4 py-4 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold">Total: ₹{totalAmount.toLocaleString('en-IN')}</span>
            <span className="text-sm text-gray-400">{bagItems.length} item{bagItems.length > 1 ? 's' : ''}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default BagPage;
