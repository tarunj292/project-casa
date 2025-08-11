import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { CartProvider } from "./contexts/CartContext";
import NavShell from "./components/NavShell";
import HomePage from "./pages/HomePage";
import CollectionPage from "./pages/CollectionPage";
import TrendsPage from "./pages/TrendsPage";
import BagPage from "./pages/BagPage";
import ProductPage from "./pages/ProductPage";
import ProfilePage from "./pages/ProfilePage";
import ManageAccountPage from "./pages/ManageAccountPage";
import SearchPage from "./pages/SearchPage";
import ChatPage from "./pages/ChatPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import SwipeProductsPage from "./pages/SwipeProductsPage";
import AllBrandsPage from "./pages/AllBrandsPage";
import BrandPage from "./pages/BrandPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProductList from "./pages/ProductList";
import ProductsPage from "./pages/ProductsPage";
import CuratedListPage from "./pages/CuratedListPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import "./index.css";
import LocationPage from "./pages/LocationPage";

function App() {
  return (
    <div className="mobile-container">
      <UserProvider>
        <CartProvider>
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
                <Route path="/brands" element={<AllBrandsPage />} />
                <Route path="/brands/:brandId" element={<BrandPage />} />
                <Route path="/location" element={<LocationPage />} />
                <Route path="/products" element={<ProductList />} />
                
                {/* 👇 FINAL FIX: Add this line */}
                <Route path="/product-list" element={<ProductList />} />

                <Route
                  path="/products/:categoryId"
                  element={<ProductsPage />}
                />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/curatedList" element={<CuratedListPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/my-orders" element={<MyOrdersPage />} />
                <Route
                  path="/manage-account"
                  element={<ManageAccountPage />}
                />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/chat" element={<ChatPage />} />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </UserProvider>
    </div>
  );
}

export default App;