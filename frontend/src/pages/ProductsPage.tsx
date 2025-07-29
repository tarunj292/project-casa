import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Heart, ShoppingBag, Filter, SlidersHorizontal } from 'lucide-react';

interface Product {
  id: string;
  brand: string;
  name: string;
  price: number;
  discount_price: number;
  discount_percent: number;
  Size: string[];
  category: string;
  image?: string;
}

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const category = searchParams.get('category') || '';
  const gender = searchParams.get('gender') || 'man';

  useEffect(() => {
    fetchProducts();
  }, [category, gender]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch from backend API
      const response = await fetch('http://localhost:5002/api/products/men-category');
      const allProducts = await response.json();
      
      // Filter products based on category
      let filteredProducts = [];
      
      if (category === 'oversized-t-shirt') {
        filteredProducts = allProducts.filter((product: any) => product.category === 'Oversized T-Shirt');
      } else if (category === 'shirts') {
        filteredProducts = allProducts.filter((product: any) => product.category === 'Shirts');
      } else if (category === 'jeans') {
        filteredProducts = allProducts.filter((product: any) => product.category === 'Jeans');
      } else if (category === 'cargos') {
        filteredProducts = allProducts.filter((product: any) => product.category === 'Cargos & Parachutes');
      }
      
      // Add images and transform data
      const productsWithImages = filteredProducts.map((product: any, index: number) => {
        const imageNumber = index + 1;
        const localImagePath = `/images/products/${category}/${imageNumber}.png`;
        
        return {
          id: `${category}-${index + 1}`,
          brand: product.brand,
          name: product.name,
          price: product.price,
          discount_price: product.discount_price,
          discount_percent: product.discount_percent,
          Size: product.Size,
          category: product.category,
          image: localImagePath
        };
      });
      
      setProducts(productsWithImages);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <button onClick={handleBack} className="p-2">
          <ArrowLeft size={24} />
        </button>
        
        <h1 className="text-xl font-bold uppercase tracking-wider">
          {category.replace('-', ' ')}
        </h1>
        
        <div className="flex items-center space-x-4">
          <Search size={24} />
          <Heart size={24} />
          <ShoppingBag size={24} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg">
            <SlidersHorizontal size={16} />
            <span className="text-sm">Filter</span>
          </button>
          
          <button className="flex items-center space-x-2 bg-blue-600 px-3 py-2 rounded-lg">
            <span className="text-sm">Subcategory</span>
          </button>
          
          <button className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg">
            <span className="text-sm">Brand</span>
          </button>
          
          <button className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg">
            <span className="text-sm">Occasion</span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4 pb-20">
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              className="bg-gray-800 rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
            >
              {/* Product Image */}
              <div className="relative aspect-[3/4] bg-gray-700">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to pexels images if local image fails
                    const fallbackImages = [
                      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
                      'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
                      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
                      'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=400'
                    ];
                    const randomIndex = Math.floor(Math.random() * fallbackImages.length);
                    e.currentTarget.src = fallbackImages[randomIndex];
                  }}
                />
                
                {/* Heart Icon */}
                <button className="absolute top-3 right-3 p-2 bg-black bg-opacity-50 rounded-full">
                  <Heart size={16} className="text-white" />
                </button>
                
                {/* Try & Buy Badge */}
                <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                  TRY & BUY
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3">
                <h3 className="font-bold text-sm mb-1">{product.brand}</h3>
                <p className="text-gray-400 text-xs mb-2 line-clamp-2">{product.name}</p>
                
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm">₹{product.discount_price}</span>
                  <span className="text-gray-500 text-xs line-through">₹{product.price}</span>
                  <span className="text-green-400 text-xs">{product.discount_percent}% off</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;












