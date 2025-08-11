import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';

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

  useEffect(() => {
    // This hook runs whenever the URL changes (e.g., ?minPrice=499)
    const params = new URLSearchParams(location.search);
    const minPrice = params.get('minPrice');
    const maxPrice = params.get('maxPrice');

    const fetchProducts = async () => {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      if (minPrice) {
        queryParams.append('min', minPrice);
      }
      if (maxPrice) {
        queryParams.append('max', maxPrice);
      }

      try {
        const res = await fetch(`http://localhost:5002/api/products/price?${queryParams.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search]); // The dependency array ensures this runs on URL changes

  return (
    <div className="p-4">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 mb-4 text-white hover:text-blue-400 transition-colors"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {loading ? (
        <h1 className="text-white text-center text-lg mt-32">Loading products...</h1>
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
        <h1 className="text-white text-center text-lg mt-32">No products found.</h1>
      )}
    </div>
  );
};

export default ProductList;