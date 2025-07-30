import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSprings, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from 'react-use-gesture';
import { ArrowLeft, Heart } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import fetchProducts from '../utils/fetchProductforSwipe'

// Product interface to match backend data
interface Product {
  _id: string;
  name: string;
  description?: string;
  images: string[];
  price: {
    $numberDecimal: string;
  };
  currency: string;
  sizes: string[];
  fits: string[];
  tags: string[];
  stock: number;
  gender: string;
  brand: string;
  category: string[];
}

// Swipe history interface
interface SwipeHistoryItem {
  index: number;
  dir: number;
}


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
  const { addToWishlist } = useWishlist();

  // State to keep track of cards that have been swiped away
  const [goneCards, setGoneCards] = useState<Set<number>>(new Set());
  // State to hold the current set of cards
  const [cards, setCards] = useState<Product[]>([]);
  // State to track loading
  const [loading, setLoading] = useState(true);
  // State to track if we're loading more products
  const [loadingMore, setLoadingMore] = useState(false);
  // State to track wishlist
  const [wishlist, setWishlist] = useState<Product[]>([]);
  // Ref to track the history of swiped cards for the undo feature
  const swipedHistory = useRef<SwipeHistoryItem[]>([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);

  // Track all products that have been seen (across all batches)
  const [seenProductIds, setSeenProductIds] = useState<Set<string>>(new Set());

  const PRODUCTS_PER_BATCH = 10;

  // Function to load next batch of products (replaces current batch)
  const loadMoreProducts = async () => {
    if (loadingMore || !hasMoreProducts) return;

    setLoadingMore(true);
    console.log(`🔄 Loading next batch - Page ${currentPage + 1} (excluding ${seenProductIds.size} seen products)`);

    // Convert Set to Array for API call
    const excludeIds = Array.from(seenProductIds);
    const newProducts = await fetchProducts(currentPage + 1, PRODUCTS_PER_BATCH, excludeIds);

    if (newProducts.length === 0) {
      setHasMoreProducts(false);
      console.log('🎉 No more unseen products available - You\'ve seen everything!');
    } else {
      // Add new product IDs to seen set
      const newProductIds = newProducts.map(product => product._id);
      setSeenProductIds(prev => new Set([...prev, ...newProductIds]));

      // Replace current cards with new batch (clear gone set for fresh start)
      setCards(newProducts);
      setGoneCards(new Set()); // Reset gone set for new batch
      setCurrentPage(prev => prev + 1);
      console.log(`✅ Loaded new batch: ${newProducts.length} unique products (Page ${currentPage + 1})`);
      console.log(`📊 Total seen products: ${seenProductIds.size + newProducts.length}`);
    }

    setLoadingMore(false);
  };

  // Initial product load
  useEffect(() => {
    const loadInitialProducts = async () => {
      setLoading(true);
      console.log('🚀 Loading initial products...');

      const initialProducts = await fetchProducts(1, PRODUCTS_PER_BATCH, []);
      console.log('🎯 Setting initial cards:', initialProducts.length, 'products');

      if (initialProducts.length > 0) {
        // Track initial products as seen
        const initialProductIds = initialProducts.map(product => product._id);
        setSeenProductIds(new Set(initialProductIds));
        console.log(`📊 Tracking ${initialProductIds.length} initial products as seen`);
      }

      setCards(initialProducts);
      setCurrentPage(1);
      setHasMoreProducts(initialProducts.length === PRODUCTS_PER_BATCH);
      setLoading(false);
    };

    loadInitialProducts();
  }, []);

  // Check if current batch is completely consumed and load next batch
  useEffect(() => {
    const remainingCards = cards.length - goneCards.size;
    const isCurrentBatchComplete = remainingCards === 0 && cards.length > 0;

    console.log(`📊 Batch Status: Remaining: ${remainingCards}, Gone: ${goneCards.size}, Total: ${cards.length}`);
    console.log(`🎯 Batch Complete: ${isCurrentBatchComplete}, Has More: ${hasMoreProducts}, Loading: ${loadingMore}`);

    // Load next batch ONLY when current batch is completely consumed
    if (isCurrentBatchComplete && hasMoreProducts && !loadingMore) {
      console.log('🔄 Current batch completely consumed! Loading next batch...');
      loadMoreProducts();
    }
  }, [goneCards.size, cards.length, hasMoreProducts, loadingMore]);



  // Always call hooks in the same order - use empty array when no cards
  const [props, api] = useSprings(cards.length || 0, i => ({
    ...to(i),
    from: from(i),
  }));

  // `useDrag` gesture hook to handle swipe interactions - always call this hook
  const bind = useDrag(({ args: [index], down, movement: [mx], direction: [xDir], velocity }) => {
    // Don't process gestures if no cards or still loading
    if (!cards.length || loading) return;

    const trigger = velocity > 0.1; // Lowered velocity threshold to make swipes more responsive
    const distanceTrigger = Math.abs(mx) > 100; // Also trigger if card moved more than 100px
    const shouldSwipe = trigger || distanceTrigger;
    const dir = xDir < 0 ? -1 : 1; // -1 for left, 1 for right

    // If the drag ends and the velocity is high enough OR distance is far enough, mark the card as "gone"
    if (!down && shouldSwipe) {
      setGoneCards(prev => new Set([...prev, index]));
      swipedHistory.current.push({ index, dir }); // Add to history for undo

      // Enhanced logging for debugging
      const swipeDirection = dir === 1 ? 'RIGHT' : 'LEFT';
      const triggerReason = trigger ? 'velocity' : 'distance';
      console.log(`👆 Card ${index} swiped ${swipeDirection} (${triggerReason}: velocity=${velocity.toFixed(2)}, distance=${Math.abs(mx).toFixed(0)}px)`);
      console.log(`📊 Gone set now has ${goneCards.size + 1} cards out of ${cards.length} total`);

      // If swiped right, add to wishlist
      if (dir === 1) {
        const product = cards[index];
        if (product && !wishlist.find(item => item._id === product._id)) {
          setWishlist(prev => [...prev, product]);
          // Add to backend wishlist using context
          addToWishlist(product._id, 'medium', `Added via swipe on ${new Date().toLocaleDateString()}`).catch(error => {
            console.error('Failed to add to wishlist:', error);
          });
        }
      }
    }

    // Update the animation properties for the cards
    api.start(i => {
      // We only want to animate the top card and the one behind it
      if (i < index - 1 || i > index) return;

      // Logic for the card being dragged
      if (i === index) {
        const isGone = goneCards.has(index);
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
    if (!down && goneCards.size === cards.length) {
      setTimeout(() => {
        setGoneCards(new Set());
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

  const remainingCards = useMemo(() => cards.length - goneCards.size, [cards.length, goneCards.size]);

  // Debug logging
  console.log('🃏 Cards length:', cards.length);
  console.log('🎨 Props length:', props.length);

  // Show loading screen for initial load
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  // Show message if no products available
  if (!loading && cards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <p className="text-white text-xl mb-4">No products available</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-purple-900 px-6 py-2 rounded-lg font-semibold"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

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
            <p className="text-xs opacity-60">
              Batch {currentPage} • {seenProductIds.size} seen
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

      {/* Progress Bar - Shows progress within current batch */}
      <div className="absolute top-16 left-4 right-4 z-20">
        <div className="bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-full h-2 transition-all duration-300"
            style={{ width: `${cards.length > 0 ? ((cards.length - remainingCards) / cards.length) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-400">Batch {currentPage}</span>
          <span className="text-xs text-gray-400">{goneCards.size}/{cards.length} swiped</span>
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

                  <img
                    src={cards[i].images && cards[i].images.length > 0 ? cards[i].images[0] : 'https://via.placeholder.com/400x600?text=No+Image'}
                    className="w-full h-full object-cover"
                    alt={cards[i].name}
                  />

                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 text-white">
                    <div className="flex items-baseline space-x-2">
                      <p className="text-2xl font-bold">
                        ₹{cards[i].price && cards[i].price.$numberDecimal
                          ? parseFloat(cards[i].price.$numberDecimal).toLocaleString('en-IN')
                          : 'N/A'}
                      </p>
                      <p className="text-sm text-zinc-300">{cards[i].currency || 'INR'}</p>
                    </div>
                    <p className="text-lg font-bold mt-1">{cards[i].name || 'Product Name'}</p>
                    {cards[i].description && (
                      <p className="text-sm text-zinc-200 truncate">{cards[i].description}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {cards[i].tags && cards[i].tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs bg-white/20 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </animated.div>
            </animated.div>
          ))}
        </div>

        {/* Loading indicator for more products */}
        {loadingMore && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-sm">Loading more products...</span>
          </div>
        )}

        {/* Debug info overlay (temporary) */}
        <div className="absolute top-20 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-2 rounded-lg text-xs z-30">
          <div>Gone: {goneCards.size}/{cards.length}</div>
          <div>Remaining: {remainingCards}</div>
          <div>Seen Total: {seenProductIds.size}</div>
        </div>

        {/* Batch completion indicator */}
        {!loadingMore && hasMoreProducts && (cards.length - goneCards.size) === 0 && cards.length > 0 && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-green-500/20 backdrop-blur-md text-white px-4 py-2 rounded-full">
            <span className="text-sm">🎉 Batch Complete! Loading next batch...</span>
          </div>
        )}

        {/* End of products indicator */}
        {!hasMoreProducts && cards.length > 0 && goneCards.size === cards.length && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md text-white px-6 py-3 rounded-full border border-white/20">
            <div className="text-center">
              <span className="text-sm font-semibold">🎉 You've discovered everything!</span>
              <p className="text-xs opacity-80 mt-1">{seenProductIds.size} products explored</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main SwipeProductsPage Component
const SwipeProductsPage: React.FC = () => {
  return <Deck />;
};

export default SwipeProductsPage;
