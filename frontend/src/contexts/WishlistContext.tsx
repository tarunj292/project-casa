import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';

// Wishlist item interface
export interface WishlistItem {
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

// Wishlist data interface
export interface WishlistData {
  _id?: string;
  user: string;
  items: WishlistItem[];
  totalItems: number;
  updatedAt?: string;
}

// Wishlist context interface
interface WishlistContextType {
  wishlist: WishlistData;
  loading: boolean;
  error: string | null;
  
  // Wishlist operations
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string, priority?: string, notes?: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  
  // Helper functions
  getItemCount: () => number;
  isInWishlist: (productId: string) => boolean;
  getWishlistItem: (productId: string) => WishlistItem | undefined;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Default empty wishlist
const defaultWishlist: WishlistData = {
  user: '',
  items: [],
  totalItems: 0
};

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userData } = useUser();
  const [wishlist, setWishlist] = useState<WishlistData>(defaultWishlist);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API base URL
  const API_BASE = 'http://localhost:5002/api/wishlist';

  // Get phone number (with fallback)
  const getPhoneNumber = () => userData.phoneNumber || '+919876543210';

  // Fetch wishlist from backend
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const phoneNumber = getPhoneNumber();
      console.log('💖 Fetching wishlist for phone:', phoneNumber);
      
      const response = await fetch(`${API_BASE}?phone=${encodeURIComponent(phoneNumber)}`);
      const result = await response.json();
      
      console.log('💖 Wishlist API response:', result);
      
      if (result.success) {
        setWishlist({
          _id: result.data._id,
          user: result.data.user,
          items: result.data.items || [],
          totalItems: result.data.totalItems || 0,
          updatedAt: result.data.updatedAt
        });
        console.log('✅ Wishlist loaded:', result.data.items?.length || 0, 'items');
      } else {
        setError(result.error || 'Failed to fetch wishlist');
        console.error('❌ Failed to fetch wishlist:', result.error);
      }
    } catch (error) {
      console.error('❌ Error fetching wishlist:', error);
      setError('Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (productId: string, priority: string = 'medium', notes?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const phoneNumber = getPhoneNumber();
      console.log(`💖 Adding product ${productId} to wishlist`);
      
      const response = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          productId,
          priority,
          notes: notes || `Added on ${new Date().toLocaleDateString()}`
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh wishlist to get updated data
        await fetchWishlist();
        console.log('✅ Product added to wishlist');
      } else {
        setError(result.error || 'Failed to add to wishlist');
        console.error('❌ Failed to add to wishlist:', result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Error adding to wishlist:', error);
      setError('Failed to add to wishlist');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const phoneNumber = getPhoneNumber();
      console.log(`💖 Removing product ${productId} from wishlist`);
      
      const response = await fetch(`${API_BASE}/items`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          productId
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh wishlist to get updated data
        await fetchWishlist();
        console.log('✅ Product removed from wishlist');
      } else {
        setError(result.error || 'Failed to remove from wishlist');
        console.error('❌ Failed to remove from wishlist:', result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Error removing from wishlist:', error);
      setError('Failed to remove from wishlist');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const phoneNumber = getPhoneNumber();
      console.log('💖 Clearing wishlist');
      
      const response = await fetch(`${API_BASE}/clear`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setWishlist(defaultWishlist);
        console.log('✅ Wishlist cleared');
      } else {
        setError(result.error || 'Failed to clear wishlist');
        console.error('❌ Failed to clear wishlist:', result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Error clearing wishlist:', error);
      setError('Failed to clear wishlist');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getItemCount = () => wishlist.totalItems;
  
  const isInWishlist = (productId: string) => {
    return wishlist.items.some(item => item.product._id === productId);
  };
  
  const getWishlistItem = (productId: string) => {
    return wishlist.items.find(item => item.product._id === productId);
  };

  // Load wishlist when user changes
  useEffect(() => {
    if (userData.phoneNumber) {
      fetchWishlist();
    }
  }, [userData.phoneNumber]);

  const value: WishlistContextType = {
    wishlist,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    getItemCount,
    isInWishlist,
    getWishlistItem
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
