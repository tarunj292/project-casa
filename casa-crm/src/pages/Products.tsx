// src/pages/products.tsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Star, Edit, ShoppingBag, Upload } from 'lucide-react'; // Added Upload icon
import axios from 'axios';
import { useBrand } from '../contexts/BrandContext';
import ImportProductsModal from '../components/importProductModal'; // Import the new modal component

const Products = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { brand } = useBrand();

  const categories = [
    'All',
    'Cargos & Parachutes',
    'Jeans',
    'T-Shirts',
    'Oversized T-shirt',
  ];

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
    price: any; // Using `any` for `price` to handle the $numberDecimal object
    currency: string;
    sizes: string[];
    fits: string[];
    tags: string[];
    stock: number;
    is_active: boolean;
    geo_tags: string[];
    gender: 'Male' | 'Female' | 'Unisex'; // Corrected capitalization based on your `AddProduct.tsx`
    brand: Brand;
    category: Category[];
    created_at: string;
    updated_at: string;
    __v: number;
  }

  const [products, setProducts] = useState<Product[]>([]);
  // New state for showing the import modal
  const [showImportModal, setShowImportModal] = useState(false);

  // Function to fetch products, moved outside of useEffect to be reusable
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`http://localhost:5002/api/products/brand/${brand?._id}`);
      setProducts(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    // Only fetch products if the brand is available
    if (brand?._id) {
        fetchProducts();
    }
  }, [brand]);

  // Handler for successful import
  const handleImportSuccess = (message: string) => {
    alert(message);
    // After a successful import, re-fetch the product list to show the new items
    if (brand?._id) {
        fetchProducts();
    }
    setShowImportModal(false); // Close the modal
  };

  const getPrice = (price: any): string => {
    if (!price) return 'N/A';
    if (typeof price === 'object' && price.$numberDecimal) return price.$numberDecimal;
    return price.toString(); // fallback
  };

  const filteredProducts = products.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const brandMatch = product.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  
    const categoryMatch =
      selectedCategory === 'All' ||
      product.category.some(cat => cat.name.toLowerCase() === selectedCategory.toLowerCase());
  
    return (nameMatch || brandMatch) && categoryMatch;
  });

  return (
    <div className="min-h-screen bg-slate-800 px-4 py-6 space-y-6">
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

      {/* Action Buttons: Import & Add Product */}
      <div className="flex space-x-4">
        {/* New "Import from Excel" button */}
        <button
          onClick={() => setShowImportModal(true)}
          className="flex-1 bg-white text-slate-600 py-4 rounded-2xl font-semibold hover:bg-slate-100 transition-colors shadow-lg flex items-center justify-center space-x-2"
        >
          <Upload className="w-5 h-5" />
          <span>Import from Excel</span>
        </button>
        {/* Your existing "Add New Product" button, with styling adjusted to fit */}
        <Link 
          to="/products/add"
          className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-semibold hover:bg-green-600 transition-colors shadow-lg flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
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
                      <p className="text-slate-600 text-sm">{product.brand?.name}</p>
                    </div>
                    <button onClick={() => navigate('/products/add', { state: { product }})}className="text-slate-400 hover:text-red-500 transition-colors">
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm text-slate-600">{product.description}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-sm text-slate-600">Gender: {product.gender}</span>
                  </div>
                  
                  <div className="text-sm text-slate-600 whitespace-pre-wrap">
                    {`Size: ${product.sizes.join(', ')} 
Fits: ${product.fits.join(', ')}
Tags: ${product.tags.join(', ')}
Stock: ${product.stock}
Geo-tags: ${product.geo_tags.join(', ')}`}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
            <p className="text-slate-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* The modal component, conditionally rendered */}
      {showImportModal && (
        <ImportProductsModal
          onClose={() => setShowImportModal(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
};

export default Products;