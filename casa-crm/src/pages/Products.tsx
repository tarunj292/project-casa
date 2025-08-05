import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Star, Heart, ShoppingBag } from 'lucide-react';
import axios from 'axios'

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Electronics', 'Clothing', 'Sports', 'Beauty', 'Home'];

  interface Category {
    _id: string;
    name: string;
    parentCategory: string | null;
    __v: number;
  }
  
  interface Brand {
    _id: string;
    name: string;
    logo_url: string;
    social_links: string[];
    crm_user_ids: string[];
    is_active: boolean;
    created_at: string;
    __v: number;
  }
  
 interface Product {
  _id: string;
  name: string;
  description: string;
  images: string[];
  price: number; // Will be parsed from $numberDecimal string
  currency: string;
  sizes: string[];
  fits: string[];
  tags: string[];
  stock: number;
  is_active: boolean;
  geo_tags: string[];
  gender: 'male' | 'female' | 'unisex';
  brand: Brand;
  category: Category[];
  created_at: string;
  updated_at: string;
  __v: number;
}

  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5002/api/products/brand/68821e323a949edfc6376e5d');
        setProducts(response.data);
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const getPrice = (price: any): string => {
    if (!price) return 'N/A';
    if (typeof price === 'object' && price.$numberDecimal) return price.$numberDecimal;
    return price.toString(); // fallback
  };

  // const filteredProducts = products.filter(product => {
  //   const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //                        product.brand.toLowerCase().includes(searchQuery.toLowerCase());
  //   const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
  //   return matchesSearch && matchesCategory;
  // });

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
        <p className="text-slate-300">Manage your product catalog</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products, brands..."
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      {/* Categories */}
      <div className="flex space-x-3 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-3 rounded-2xl font-medium whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Add Product Button */}
      <Link 
        to="/products/add"
        className="w-full bg-green-500 text-white py-4 rounded-2xl font-semibold hover:bg-green-600 transition-colors shadow-lg flex items-center justify-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span>Add New Product</span>
      </Link>

      {/* Products Grid */}
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-20 h-20 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{product.name}</h3>
                    <p className="text-slate-600 text-sm">{product.brand.name}</p>
                  </div>
                  <button className="text-slate-400 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-slate-700">{product.currency}</span>
                  </div>
                  <span className="text-slate-400">•</span>
                  <span className="text-sm text-slate-600">{product.gender} sold</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-slate-800">{getPrice(product.price)}</span>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2">
                    <ShoppingBag className="w-4 h-4" />
                    <span className="text-sm font-medium">View</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
          <p className="text-slate-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default Products;