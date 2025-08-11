import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  animate,
} from "framer-motion";
import {
  ArrowLeft,
  ShoppingBag,
  ShoppingCart,
  Share2,
  Heart,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useUser } from "../contexts/UserContext";
import fetchProducts from "../utils/fetchProductforSwipe";

// 1. UPDATED: Added 'brand' to the Product interface
interface Brand {
  _id: string;
  name: string;
  logo_url?: string;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  images: string[];
  price: {
    $numberDecimal: string;
  };
  currency: string;
  tags: string[];
  brand: Brand; // Brand is now part of the product
  exitDirection?: "left" | "right";
}

// Define props interface for SwipeableCard
interface SwipeableCardProps {
  product: Product;
  onSwipe: (productId: string, direction: "left" | "right") => void;
  index: number;
  total: number;
  curatedItems: Set<string>;
  onCuratedToggle: (productId: string) => void;
  addToCart: (productId: string, quantity?: number, size?: string) => void;
}

// Single Swipeable Card Component using Framer Motion
function SwipeableCard({
  product,
  onSwipe,
  index,
  total,
  curatedItems,
  onCuratedToggle,
  addToCart,
}: SwipeableCardProps) {
  const navigate = useNavigate();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-20, 20]);
  const scale = useTransform(x, [-300, 0, 300], [0.9, 1, 0.9]);

  const handleDragEnd = (_event: any, info: any) => {
    const offsetX = info.offset.x;
    const velocityX = info.velocity.x;

    if (offsetX > 150 || velocityX > 500) {
      onSwipe(product._id, "right");
    } else if (offsetX < -150 || velocityX < -500) {
      onSwipe(product._id, "left");
    } else {
      animate(x, 0, { type: "tween", duration: 0.2 });
    }
  };

  return (
    <motion.div
      className="absolute w-full h-full will-change-transform flex items-center justify-center"
      style={{ zIndex: total - index }}
      initial={{ scale: 0.95, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{
        x: product.exitDirection === "right" ? 500 : -500,
        scale: 0.8,
        transition: { duration: 0.35 },
      }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <motion.div
        className="bg-zinc-800 w-full h-full will-change-transform rounded-2xl touch-none select-none cursor-grab"
        style={{ x, rotate, scale }}
        drag="x"
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: "grabbing" }}
      >
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
          {/* Swipe action indicators */}
          <motion.div
            className="absolute top-10 left-4 flex items-center justify-center text-red-500 font-bold text-3xl border-4 border-red-500 rounded-xl transform -rotate-12 px-6 py-2"
            style={{ opacity: useTransform(x, [-100, -50], [1, 0]) }}
          >
            SKIP
          </motion.div>
          <motion.div
            className="absolute top-10 right-4 flex items-center justify-center text-green-500 font-bold text-3xl border-4 border-green-500 rounded-xl transform rotate-12 px-6 py-2"
            style={{ opacity: useTransform(x, [50, 100], [0, 1]) }}
          >
            BAG
          </motion.div>

          <img
            src={
              product.images && product.images.length > 0
                ? product.images[0]
                : "https://placehold.co/400x600/27272a/ffffff?text=No+Image"
            }
            className="w-full h-full object-cover select-none pointer-events-none"
            alt={product.name}
            draggable={false}
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/400x600/27272a/ffffff?text=No+Image";
            }}
          />

          <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 text-white select-none">
            
            {/* 2. ADDED: Brand logo and name section */}
            {product.brand && (
              <div className="flex items-center mb-2">
                <img
                  src={product.brand.logo_url || 'https://placehold.co/40x40/333/fff?text=B'}
                  alt={`${product.brand.name} logo`}
                  className="w-10 h-10 rounded-full bg-gray-700 border-2 border-white object-contain mr-3"
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/40x40/333/fff?text=B'; }}
                />
                <span className="font-semibold text-sm">{product.brand.name}</span>
              </div>
            )}

            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold">
                ₹
                {product.price?.$numberDecimal
                  ? parseFloat(product.price.$numberDecimal).toLocaleString(
                      "en-IN"
                    )
                  : "N/A"}
              </p>
              <p className="text-sm text-zinc-300">
                {product.currency || "INR"}
              </p>
            </div>
            <p className="text-lg font-bold mt-1">
              {product.name || "Product Name"}
            </p>
            {product.description && (
              <p className="text-sm text-zinc-200 truncate">
                {product.description}
              </p>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              {product.tags
                ?.slice(0, 3)
                .map((tag: string, tagIndex: number) => (
                  <span
                    key={tagIndex}
                    className="text-xs bg-white/20 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
            </div>
            <div className="absolute right-4 bottom-4 flex flex-col items-center gap-2">
              <motion.button
                onClick={() => {
                  addToCart(product._id, 1, "M");
                }}
                className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Buy Now"
              >
                <ShoppingCart size={20} />
              </motion.button>
              <motion.button
                onClick={() => onCuratedToggle(product._id)}
                className={`p-3 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
                  curatedItems.has(product._id)
                    ? "bg-red-500 text-white hover:bg-red-600 ring-2 ring-red-300"
                    : "bg-white/90 text-gray-700 hover:bg-red-100 hover:text-red-500"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title={
                  curatedItems.has(product._id)
                    ? "Remove from Curated List"
                    : "Add to Curated List"
                }
              >
                <Heart
                  size={20}
                  className={
                    curatedItems.has(product._id)
                      ? "fill-current text-white"
                      : "hover:fill-current"
                  }
                />
              </motion.button>
              <motion.button
                onClick={() => alert("Share clicked")}
                className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-900 transition-all duration-200 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Share Product"
              >
                <Share2 size={20} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// The Deck and SwipeProductsPage components remain the same
function Deck() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { userData } = useUser();

  const [cards, setCards] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set());

  const [curatedItems, setCuratedItems] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [seenProductIds, setSeenProductIds] = useState<Set<string>>(new Set());

  // State for policy dropdowns
  const [writtenPolicyOpen, setWrittenPolicyOpen] = useState(false);
  const [shippingPolicyOpen, setShippingPolicyOpen] = useState(false);

  // Ref to store the size of the current batch for progress bar calculation
  const currentBatchSize = useRef(0);

  const PRODUCTS_PER_BATCH = 20;

  // Function to load the next batch of products
  const loadMoreProducts = async () => {
    if (loadingMore || !hasMoreProducts) return;

    setLoadingMore(true);
    console.log(`🔄 Loading next batch - Page ${currentPage + 1}`);

    const excludeIds = Array.from(seenProductIds);
    const newProducts = await fetchProducts(
      currentPage + 1,
      PRODUCTS_PER_BATCH,
      excludeIds
    );

    if (newProducts.length === 0) {
      setHasMoreProducts(false);
      console.log("🎉 No more unseen products available!");
    } else {
      const newProductIds = newProducts.map((product) => product._id);
      setSeenProductIds((prev) => new Set([...prev, ...newProductIds]));

      // Set new batch of cards
      setCards((prev) => [...prev, ...newProducts]); // ✅ Appends new batch
      currentBatchSize.current = newProducts.length; // Update batch size
      setCurrentPage((prev) => prev + 1);
      console.log(`✅ Loaded new batch: ${newProducts.length} unique products`);
    }


    setLoadingMore(false);
  };

  useEffect(() => {
    const loadInitialProducts = async () => {
      setLoading(true);
      console.log("🚀 Loading initial products...");

      const initialProducts = await fetchProducts(1, PRODUCTS_PER_BATCH, []);
      if (initialProducts.length > 0) {
        const initialProductIds = initialProducts.map((product) => product._id);
        setSeenProductIds(new Set(initialProductIds));
        currentBatchSize.current = initialProducts.length;

      }
      setCards(initialProducts);
      setCurrentPage(1);
      setHasMoreProducts(initialProducts.length === PRODUCTS_PER_BATCH);
      setLoading(false);
    };
    loadInitialProducts();
  }, []);
   
  const loadCuratedList = async () => {
    try {
      if (!userData._id) return; // or navigate('/profile');

      const userId = userData._id;

      console.log("🔍 Loading curated list for userId:", userId);
      const response = await fetch(
        `http://localhost:5002/api/curatedlist/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const productIds = data.products.map(
          (product: { _id: string }) => product._id
        );
        setCuratedItems(new Set(productIds));
        console.log("✅ Loaded curated list:", productIds);
      } else if (response.status === 404) {
        // No curated list exists yet, that's fine
        console.log("📝 No curated list found for user, starting fresh");
        setCuratedItems(new Set());
      }
    } catch (error) {
      console.error("❌ Error loading curated list:", error);
    }
  };

  useEffect(() => {
        console.log("🔄 SwipeProductsPage: User data changed:", userData);

    if (userData.isLoggedIn) {
      console.log("✅ User is logged in, loading curated list...");
      loadCuratedList();
    } else {
      console.log("❌ User not logged in, clearing curated items");
      setCuratedItems(new Set());
    }
  }, [userData.isLoggedIn]);

   // Effect to load more products when the current batch is finished
  useEffect(() => {
    // Trigger when cards array is empty, but it's not the initial load
    if (!loading && cards.length === 0 && hasMoreProducts && !loadingMore) {
      console.log("🔄 Current batch finished! Loading next batch...");
      loadMoreProducts();
    }
  }, [cards.length, loading, hasMoreProducts, loadingMore]);

  // Handle the swipe action from the card component
  
  const handleSwipe = (productId: string, direction: "left" | "right") => {
    if (userData.isLoggedIn === false) {
      navigate("/profile");
    }
    if (direction === "right") {
      const product = cards.find((c) => c._id === productId);
    }

    // Set exit direction for the animation
    setCards((prev) =>
      prev.map((c) =>
        c._id === productId ? { ...c, exitDirection: direction } : c
      )
    );

    // After the animation, remove the card from the state
    setTimeout(() => {
      setCards((prev) => prev.filter((c) => c._id !== productId));
    }, 350);
  };
  const handleCuratedToggle = async (productId: string) => {
    console.log("💖 Heart clicked! Product ID:", productId);
    console.log("👤 User logged in:", userData.isLoggedIn);
    console.log("📋 Current curated items:", Array.from(curatedItems));


    if (!userData.isLoggedIn) {
            console.log("❌ User not logged in, redirecting to profile");

      navigate("/profile");
      return;
    }
    // Logic to toggle curated items
    try {
      const userId = userData._id;
      const isCurrentlyInList = curatedItems.has(productId);

      // Immediate UI update
      if (!isCurrentlyInList) {
        setCuratedItems((prev) => new Set(prev).add(productId));
      }

      if (isCurrentlyInList) {
        const response = await fetch(
          "http://localhost:5002/api/curatedlist/remove",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, productId }),
          }
        );

        if (response.ok) {
          window.dispatchEvent(new CustomEvent("curatedListUpdated"));
          console.log("✅ Removed from curated list");
          setCuratedItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        } else {
          console.error("❌ Failed to remove");
          setCuratedItems((prev) => new Set(prev).add(productId));
        }
      } else {
        const response = await fetch(
          "http://localhost:5002/api/curatedlist/add",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, productId }),
          }
        );

        if (response.ok) {
          window.dispatchEvent(new CustomEvent("curatedListUpdated"));
          console.log("✅ Added to curated list");
        } else {
          console.error("❌ Failed to add");
          setCuratedItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        }
      }
    } catch (error) {
      console.error("❌ Error in curated toggle:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (cards.length === 0) return;

      const topCard = cards[0];
      if (e.key === "ArrowLeft") {
        handleSwipe(topCard._id, "left");
      } else if (e.key === "ArrowRight") {
        handleSwipe(topCard._id, "right");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cards]);


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

  if (!loading && cards.length === 0 && !hasMoreProducts) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <p className="text-white text-xl mb-4">
            🎉 You've discovered everything!
          </p>
          <p className="text-xs opacity-80 mt-1">
            {seenProductIds.size} products explored
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-white text-purple-900 px-6 py-2 rounded-lg font-semibold"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }
  
  
  return (
    <div className="bg-gray-900 text-white flex flex-col overflow-y-auto">
            <div className="py-4 flex items-center justify-center w-full overflow-hidden px-4 select-none">

      <div className="w-full max-w-sm h-[600px] relative">
        <AnimatePresence>
          {cards.map((product, index) => (
            <SwipeableCard
              key={product._id}
              product={product}
              onSwipe={handleSwipe}
              index={index}
              total={cards.length}
              curatedItems={curatedItems}
              onCuratedToggle={handleCuratedToggle}
              addToCart={addToCart}
            />
          ))}
        </AnimatePresence>

        {/* Loading indicator for next batch */}
          {loadingMore && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-2xl">
              <div className="text-center text-white bg-black/50 backdrop-blur-md p-4 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
                <p>Loading more...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Policies Section - Scrollable below swipe area */}
      <div className="px-4 py-3 space-y-6">
        {/* Return Policy */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
          <button
            onClick={() => setWrittenPolicyOpen(!writtenPolicyOpen)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-xl font-semibold text-white flex items-center">
              <svg
                className="w-6 h-6 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Return Policy
            </h3>
            <svg
              className={`w-5 h-5 text-white transition-transform duration-200 ${
                writtenPolicyOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {writtenPolicyOpen && (
            <p className="text-gray-300 text-base leading-relaxed mt-4">
              This is Return policy
            </p>
          )}
        </div>

        {/* Shipping Policy */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
          <button
            onClick={() => setShippingPolicyOpen(!shippingPolicyOpen)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-xl font-semibold text-white flex items-center">
              <svg
                className="w-6 h-6 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              Shipping Policy
            </h3>
            <svg
              className={`w-5 h-5 text-white transition-transform duration-200 ${
                shippingPolicyOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {shippingPolicyOpen && (
            <p className="text-gray-300 text-base leading-relaxed mt-4">
              This is shipping policy
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const SwipeProductsPage: React.FC = () => {
  return <Deck />;
};

export default SwipeProductsPage;
