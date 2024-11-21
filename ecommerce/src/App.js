import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import LeatherPage from "./pages/Leather_category";
import HandToolsPage from "./pages/Handtools_category";
import MoldsPage from "./pages/Mold_category";
import ProductPage from "./pages/ProductPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import AccountPage from "./pages/AccountPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [cart, setCart] = useState([]); 

  const addToCart = (product, quantity) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const handleSetToken = (newToken) => {
    setToken(newToken);
  };

  const isAuthenticated = !!token;

  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                token={token}
                setToken={handleSetToken}
                cartItems={cart} // Pass cartItems to Home
              />
            }
          />
          <Route path="/leather" element={<LeatherPage />} />
          <Route path="/handtools" element={<HandToolsPage />} />
          <Route path="/molds" element={<MoldsPage />} />
          <Route
            path="/product/:id"
            element={
              <ProductPage
                addToCart={addToCart}
                cartItems={cart} 
                token={token} 
                setToken={handleSetToken} 
              />
            }
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/login"
            element={<LoginPage setToken={handleSetToken} />}
          />
          {isAuthenticated ? (
            <Route
              path="/account"
              element={
                <AccountPage token={token} setToken={handleSetToken} />
              }
            />
          ) : (
            <Route path="/account" element={<Navigate to="/login" replace />} />
          )}
          <Route
            path="/cart"
            element={
              <CartPage
                cartItems={cart}
                removeFromCart={removeFromCart}
                token={token}
                setToken={handleSetToken} 
              />
            }
          />
          <Route
            path="/checkout"
            element={<CheckoutPage token={token} />} 
          />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;