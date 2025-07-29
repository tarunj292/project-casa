import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from 'react-use-gesture';
import { ArrowLeft, Heart } from 'lucide-react';

// Product interface
interface Product {
  id: number;
  url: string;
  name: string;
  store: string;
  price: number;
  oldPrice: number;
  discount: string;
  tryOn: boolean;
}

// Swipe history interface
interface SwipeHistoryItem {
  index: number;
  dir: number;
}

// Mock data for the product cards
const initialCards: Product[] = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    name: 'The Souled Store Urban Blaze: Lavender Women Lo...',
    store: 'The Souled Store',
    price: 2699,
    oldPrice: 2799,
    discount: '4% off',
    tryOn: true,
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ab?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    name: 'Classic Red Runners',
    store: 'Nike',
    price: 4995,
    oldPrice: 5495,
    discount: '9% off',
    tryOn: false,
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=2789&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    name: 'Vintage Style High-Tops',
    store: 'Vans',
    price: 3499,
    oldPrice: 3999,
    discount: '12% off',
    tryOn: true,
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=2825&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    name: 'Modern White & Blue Sneakers',
    store: 'Adidas',
    price: 5999,
    oldPrice: 6499,
    discount: '7% off',
    tryOn: false,
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    name: 'Neon Green Performance Shoes',
    store: 'Puma',
    price: 4599,
    oldPrice: 4999,
    discount: '8% off',
    tryOn: true,
  },
];

// Helper function to define the card's resting state animation properties
const to = (i: number) => ({
  x: 0,
  y: i * -2,
  scale: 1 - i * 0.02,
  rot: 0,
  delay: i * 100,
});

// Helper function to define the card's initial "from" state (off-screen)
const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });

// Helper function to interpolate rotation and scale into a CSS transform (reduced tilt)
const trans = (r: number, s: number) => `perspective(1500px) rotateX(5deg) rotateZ(${r}deg) scale(${s})`;

function Deck() {
  const navigate = useNavigate();
  // State to keep track of cards that have been swiped away
  const [gone] = useState(() => new Set<number>());
  // State to hold the current set of cards
  const [cards] = useState<Product[]>(initialCards);
  // State to track wishlist
  const [wishlist, setWishlist] = useState<Product[]>([]);
  // Ref to track the history of swiped cards for the undo feature
  const swipedHistory = useRef<SwipeHistoryItem[]>([]);

  // `useSprings` to manage animations for all cards in the deck
  const [props, api] = useSprings(cards.length, i => ({
    ...to(i),
    from: from(i),
  }));

  // `useDrag` gesture hook to handle swipe interactions
  const bind = useDrag(({ args: [index], down, movement: [mx], direction: [xDir], velocity }) => {
    const trigger = velocity > 0.2; // A velocity threshold to trigger a swipe
    const dir = xDir < 0 ? -1 : 1; // -1 for left, 1 for right

    // If the drag ends and the velocity is high enough, mark the card as "gone"
    if (!down && trigger) {
      gone.add(index);
      swipedHistory.current.push({ index, dir }); // Add to history for undo

      // If swiped right, add to wishlist
      if (dir === 1) {
        const product = cards[index];
        if (product && !wishlist.find(item => item.id === product.id)) {
          setWishlist(prev => [...prev, product]);
        }
      }
    }

    // Update the animation properties for the cards
    api.start(i => {
      // We only want to animate the top card and the one behind it
      if (i < index - 1 || i > index) return;

      // Logic for the card being dragged
      if (i === index) {
        const isGone = gone.has(index);
        const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0;
        // ** UPDATED ** Reduced rotation for less tilt
        const rot = mx / 200 + (isGone ? dir * 5 * velocity : 0);
        const scale = down ? 1.05 : 1; // Slightly scale up the card when dragged
        return {
          x,
          rot,
          scale,
          delay: undefined,
          config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
        };
      }

      // ** UPDATED ** Logic for the card behind the one being dragged to "peek"
      if (i === index - 1) {
        const { y, scale } = to(i);
        return {
          y: down ? y + 15 : y, // Move it up more for a better peek
          scale: down ? scale + 0.04 : scale, // Scale it up more
          config: { friction: 50, tension: 500 },
        };
      }
    });

    // When all cards are gone, reset the deck
    if (!down && gone.size === cards.length) {
      setTimeout(() => {
        gone.clear();
        swipedHistory.current = [];
        // ** UPDATED ** Animate cards back in from the bottom
        api.start(i => ({ ...to(i), from: { y: window.innerHeight } }));
      }, 600);
    }
  });



  const handleBack = () => {
    navigate('/');
  };

  const handleViewWishlist = () => {
    navigate('/wishlist');
  };

  const remainingCards = cards.length - gone.size;

  return (
    <div className="bg-gray-900 text-white h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 py-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 bg-gray-800/80 backdrop-blur-sm rounded-full hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-sm opacity-80">
              {remainingCards} remaining
            </p>
          </div>
          <button
            onClick={handleViewWishlist}
            className="p-2 bg-gray-800/80 backdrop-blur-sm rounded-full relative hover:bg-gray-700 transition-colors"
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
            style={{ width: `${((cards.length - remainingCards) / cards.length) * 100}%` }}
          />
        </div>
      </div>



      {/* Card Deck - Centered */}
      <div className="flex-1 flex items-center justify-center w-full overflow-hidden px-4">
        <div className="w-full max-w-sm h-[670px] relative">
          {props.map(({ x, y, rot, scale }, i) => (
            <animated.div className="absolute w-full h-full will-change-transform flex items-center justify-center" key={i} style={{ x, y }}>
              <animated.div
                {...bind(i)}
                className="bg-zinc-800 w-full h-full max-w-[300px] sm:max-w-full max-h-[670px] will-change-transform rounded-2xl shadow-2xl touch-none"
                style={{ transform: interpolate([rot, scale], trans) }}
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                  {/* ** UPDATED ** Swipe action indicators with scaling effect */}
                  <animated.div
                    className="absolute top-10 left-4 flex items-center justify-center text-red-500 font-bold text-3xl border-4 border-red-500 rounded-xl transform -rotate-12"
                    style={{
                      opacity: x.to({ range: [-100, -50], output: [1, 0], extrapolate: 'clamp' }),
                      transform: x.to({ range: [-100, -50], output: [1, 0.5], extrapolate: 'clamp' }).to(s => `scale(${s})`),
                      padding: '0.5rem 1.5rem',
                    }}
                  >
                    SKIP
                  </animated.div>
                  <animated.div
                    className="absolute top-10 right-4 flex items-center justify-center text-green-500 font-bold text-3xl border-4 border-green-500 rounded-xl transform rotate-12"
                    style={{
                      opacity: x.to({ range: [50, 100], output: [0, 1], extrapolate: 'clamp' }),
                      transform: x.to({ range: [50, 100], output: [0.5, 1], extrapolate: 'clamp' }).to(s => `scale(${s})`),
                      padding: '0.5rem 1.5rem',
                    }}
                  >
                    BAG
                  </animated.div>

                  <img src={cards[i].url} className="w-full h-full object-cover" alt={cards[i].name} />

                  {cards[i].tryOn && (
                    <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white font-bold text-xs px-3 py-1.5 rounded-md">
                      TRY 'n BUY
                    </div>
                  )}

                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 text-white">
                    <div className="flex items-baseline space-x-2">
                      <p className="text-2xl font-bold">₹{cards[i].price.toLocaleString('en-IN')}</p>
                      <p className="text-sm line-through text-zinc-300">₹{cards[i].oldPrice.toLocaleString('en-IN')}</p>
                      <p className="text-sm font-semibold text-green-400">{cards[i].discount}</p>
                    </div>
                    <p className="text-lg font-bold mt-1">{cards[i].store}</p>
                    <p className="text-sm text-zinc-200 truncate">{cards[i].name}</p>
                  </div>
                </div>
              </animated.div>
            </animated.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main SwipeProductsPage Component
const SwipeProductsPage: React.FC = () => {
  return <Deck />;
};

export default SwipeProductsPage;
