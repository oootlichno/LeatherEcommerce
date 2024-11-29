import React, { useState, useEffect, useCallback } from "react";
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
import ThankYouPage from "./pages/ThankYouPage";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [cart, setCart] = useState([]);

  const fetchCart = useCallback(async () => {
    if (!token) {
      setCart([]); 
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { cart: backendCart } = await response.json();
        setCart(backendCart || []); 
      } else {
        console.error("Failed to fetch cart data.");
        setCart([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error.message);
      setCart([]);
    }
  }, [token]); 

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

  const clearCart = async () => {
    try {
      await fetch("http://localhost:5001/cart", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCart([]); 
    } catch (error) {
      console.error("Error clearing cart:", error.message);
    }
  };

  useEffect(() => {
    fetchCart(); 
  }, [fetchCart]); 

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
                cartItems={cart}
                setCartItems={setCart}
              />
            }
          />
          <Route path="/leather" element={<LeatherPage cartItems={cart} />} />
          <Route path="/handtools" element={<HandToolsPage cartItems={cart} />} />
          <Route path="/molds" element={<MoldsPage cartItems={cart} />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route
            path="/product/:id"
            element={
              <ProductPage
                addToCart={addToCart}
                cartItems={cart}
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
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                token={token}
                clearCart={clearCart} 
              />
            }
          />
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;