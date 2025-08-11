import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, ShoppingBag } from 'lucide-react';
import axios from 'axios';

const Products = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);

  // These interfaces were used to help with type checking, but are not necessary for the functionality.
  // We'll keep them here for reference.
  // interface Category {
  //   _id: string;
  //   name: string;
  //   parentCategory: string | null;
  //   __v: number;
  // }
  
  // interface Brand {
  //   _id: string;
  //   name: string;
  //   logo_url: string;
  //   social_links: string[];
  //   crm_user_ids: string[];
  //   is_active: boolean;
  //   created_at: string;
  //   __v: number;
  // }
  
  // interface Product {
  //   _id: string;
  //   name: string;
  //   description: string;
  //   images: string[];
  //   price: any; 
  //   currency: string;
  //   sizes: string[];
  //   fits: string[];
  //   tags: string[];
  //   stock: number;
  //   is_active: boolean;
  //   geo_tags: string[];
  //   gender: 'male' | 'female' | 'unisex';
  //   brand: Brand;
  //   category: Category[];
  //   created_at: string;
  //   updated_at: string;
  //   __v: number;
  // }

  useEffect(() => {
    const fetchProductsAndBrands = async () => {
      try {
        // First, fetch all brands to get a valid brand ID
        const brandsResponse = await axios.get('http://localhost:5002/api/brands');
        const brands = brandsResponse.data;

        let response;
        if (brands.length === 0) {
          console.log('No brands found, fetching all products');
          // Fallback: fetch all products if no brands found
          response = await axios.get('http://localhost:5002/api/products');
        } else {
          // Use the first brand's ID to fetch products
          const firstBrandId = brands[0]._id;
          console.log('Using brand ID:', firstBrandId);
          response = await axios.get(`http://localhost:5002/api/products/brand/${firstBrandId}`);
        }
        const fetchedProducts = response.data;
        setProducts(fetchedProducts);

        // Dynamically create category list from fetched products
        const allCategories = new Set(['All']);
        fetchedProducts.forEach(product => {
          if (product.category && Array.isArray(product.category)) {
            product.category.forEach(cat => {
              allCategories.add(cat.name);
            });
          }
        });
        setCategories(Array.from(allCategories));

        console.log('Fetched products:', fetchedProducts);
        console.log('Categories found:', Array.from(allCategories));

        // Debug: Log the first product's category structure
        if (fetchedProducts.length > 0) {
          console.log('First product category structure:', fetchedProducts[0].category);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProductsAndBrands();
  }, []);

  const getPrice = (price) => {
    if (!price) return 'N/A';
    if (typeof price === 'object' && price.$numberDecimal) return price.$numberDecimal;
    return price.toString();
  };

  const filteredProducts = products.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const brandMatch = product.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const categoryMatch =
      selectedCategory === 'All' ||
      product.category.some(cat => cat.name === selectedCategory);

    return (nameMatch || brandMatch) && categoryMatch;
  });

  // Debug logging
  console.log('Selected category:', selectedCategory);
  console.log('Total products:', products.length);
  console.log('Filtered products:', filteredProducts.length);

  // Debug: Log products that match the category
  if (selectedCategory !== 'All') {
    const categoryMatches = products.filter(product =>
      product.category.some(cat => cat.name === selectedCategory)
    );
    console.log(`Products matching category "${selectedCategory}":`, categoryMatches);
  }

  return (
    <div className="px-4 py-6 space-y-6 bg-slate-900 min-h-screen text-white">
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
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black"
        />
      </div>

      {/* Categories */}
      <div className="flex space-x-3 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              console.log('Category clicked:', category);
              setSelectedCategory(category);
            }}
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
          <div key={product._id} className="bg-white rounded-3xl p-6 shadow-lg text-black">
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
                  <button onClick={() => navigate('/products/add', { state: { product }})} className="text-slate-400 hover:text-blue-500 transition-colors">
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-sm text-slate-600 mb-3">{product.description}</p>
                
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mb-3">
                  <span className="bg-slate-100 px-2 py-1 rounded-full">Size: {product.sizes.join(', ')}</span>
                  <span className="bg-slate-100 px-2 py-1 rounded-full">Fit: {product.fits.join(', ')}</span>
                  <span className="bg-slate-100 px-2 py-1 rounded-full">Gender: {product.gender}</span>
                  <span className="bg-slate-100 px-2 py-1 rounded-full">Stock: {product.stock}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-slate-800">Rs. {getPrice(product.price)}</span>
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