import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';

// Product interface remains the same
interface Product {
  _id: string;
  name: string;
  description?: string;
  images: string[];
  price: { $numberDecimal: string };
  currency: string;
  brand?: { name: string };
  sizes?: string[];
  fits?: string[];
  tags?: string[];
  stock?: number;
  gender?: string;
  category?: string[];
  created_at?: string;
  updated_at?: string;
}

const ProductList: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Products"); // State for the page title

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const minPrice = params.get('minPrice');
    const maxPrice = params.get('maxPrice');
    const gender = params.get('gender');
    // NEW: Read the search query parameter from the URL
    const searchQuery = params.get('search');

    const fetchProducts = async () => {
      setLoading(true);
      let data = [];

      try {
        // NEW: Conditional logic to decide which API to call
        if (searchQuery) {
          // If there's a search query, use the search endpoint
          setTitle(`Results for "${searchQuery}"`);
          const res = await fetch(`http://localhost:5002/api/products/search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: searchQuery }),
          });
          if (!res.ok) throw new Error('Search request failed');
          data = await res.json();
        } else {
          // Otherwise, use the existing price/gender filter endpoint
          setTitle("Filtered Products");
          const queryParams = new URLSearchParams();
          if (minPrice) queryParams.append('min', minPrice);
          if (maxPrice) queryParams.append('max', maxPrice);
          if (gender) queryParams.append('gender', gender);
          
          const res = await fetch(`http://localhost:5002/api/products/price?${queryParams.toString()}`);
          if (!res.ok) throw new Error('Failed to fetch filtered products');
          data = await res.json();
        }
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]); // Clear products on error
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search]); // Re-runs whenever the URL query changes

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      <div className="flex items-center mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-white text-xl font-bold mx-auto pr-10">
          {title}
        </h1>
      </div>

      {loading ? (
        <p className="text-white text-center text-lg mt-32">Loading products...</p>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="bg-gray-800 p-3 rounded-lg flex flex-col items-center text-center hover:bg-gray-700 transition-colors"
            >
              {product.images && product.images[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full aspect-[3/4] object-cover mb-2 rounded"
                />
              )}
              <h2 className="text-sm font-semibold text-white truncate w-full">
                {product.name}
              </h2>
              <p className="text-xs text-gray-400">
                ₹{product.price.$numberDecimal}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-white text-center text-lg mt-32">No products found.</p>
      )}
    </div>
  );
};

export default ProductList;
