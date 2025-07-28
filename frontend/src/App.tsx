import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavShell from './components/NavShell';
import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import TrendsPage from './pages/TrendsPage';
import BagPage from './pages/BagPage';
import ProductPage from './pages/ProductPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import SwipeProductsPage from './pages/SwipeProductsPage';
import AllBrandsPage from './pages/AllBrandsPage';



function App() {
  return (
    <div className="mobile-container">
      <Router>
        <div className="min-h-screen bg-gray-900 text-white mobile-scroll">
          <Routes>
  <Route path="/" element={<NavShell />}>
    <Route index element={<HomePage />} />
    <Route path="collection" element={<CollectionPage />} />
    <Route path="trends" element={<TrendsPage />} />
    <Route path="bag" element={<BagPage />} />
    <Route path="swipe" element={<SwipeProductsPage />} />
  </Route>
  
  {/* ✅ Add new route here */}
  <Route path="/brands" element={<AllBrandsPage />} />

  <Route path="/product/:id" element={<ProductPage />} />
  <Route path="/profile" element={<ProfilePage />} />
  <Route path="/search" element={<SearchPage />} />
  <Route path="/wishlist" element={<WishlistPage />} />
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/order-success" element={<OrderSuccessPage />} />
</Routes>

        </div>
      </Router>
    </div>
  );
}

export default App;