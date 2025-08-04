import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Star, Heart, ShoppingBag } from 'lucide-react';

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Electronics', 'Clothing', 'Sports', 'Beauty', 'Home'];
  
  const products = [
    { 
      id: 1, 
      name: 'Wireless Headphones', 
      brand: 'TechSound', 
      price: '$129.99', 
      rating: 4.8, 
      image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=300',
      category: 'Electronics',
      sales: 234
    },
    { 
      id: 2, 
      name: 'Designer Sneakers', 
      brand: 'UrbanStep', 
      price: '$89.99', 
      rating: 4.6, 
      image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=300',
      category: 'Sports',
      sales: 189
    },
    { 
      id: 3, 
      name: 'Minimalist Watch', 
      brand: 'TimeCore', 
      price: '$199.99', 
      rating: 4.9, 
      image: 'https://images.pexels.com/photos/277390/pexels-photo-277390.jpeg?auto=compress&cs=tinysrgb&w=300',
      category: 'Electronics',
      sales: 156
    },
    { 
      id: 4, 
      name: 'Organic Face Cream', 
      brand: 'PureGlow', 
      price: '$45.99', 
      rating: 4.7, 
      image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=300',
      category: 'Beauty',
      sales: 298
    },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-20 h-20 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{product.name}</h3>
                    <p className="text-slate-600 text-sm">{product.brand}</p>
                  </div>
                  <button className="text-slate-400 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-slate-700">{product.rating}</span>
                  </div>
                  <span className="text-slate-400">•</span>
                  <span className="text-sm text-slate-600">{product.sales} sold</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-slate-800">{product.price}</span>
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

      {filteredProducts.length === 0 && (
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