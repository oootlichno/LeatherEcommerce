import React, { useEffect, useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../style/img/logo.png";
import CartComponent from "../components/CartComponent";
import productImage from "../style/img/leather.png";

const CartPage = ({ cartItems, removeFromCart, token, setToken }) => {
  const navigate = useNavigate();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  const [isSyncing, setIsSyncing] = useState(false); 

  const syncCartWithBackend = useCallback(async () => {
    if (!token || isSyncing) return; 

    console.log("syncCartWithBackend called");

    try {
      setIsSyncing(true); 
      for (const item of cartItems) {
        console.log("Syncing cart item:", item);
        const response = await fetch("http://localhost:5001/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: item.id,
            price: item.price,
            quantity: item.quantity,
          }),
        });

        if (!response.ok) {
          console.error(`Failed to sync item ${item.id} to the backend`);
        } else {
          console.log(`Item ${item.id} synced successfully`);
        }
      }
      console.log("Cart synced with backend successfully");
    } catch (error) {
      console.error("Error syncing cart with backend:", error.message);
    } finally {
      setIsSyncing(false); 
    }
  }, [cartItems, token, isSyncing]);

  const handleCheckout = async () => {
    if (!token) {
      alert("Please log in to make a purchase or create an account.");
      navigate("/login");
    } else {
      await syncCartWithBackend();
      navigate("/checkout");
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    if (token) {
      syncCartWithBackend(); 
    }
  }, [token, syncCartWithBackend]); 

  return (
    <div>
      {/* Header Section */}
      <div className="header">
        <div className="cart-container">
          <CartComponent cartItems={cartItems} />
        </div>
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="logo" />
          </Link>
        </div>
        <div className="nav">
          <Link to="/" className="nav-link">Home</Link>
          {token ? (
            <>
              <Link to="/account" className="nav-link">Account</Link>
              <button
                onClick={handleLogout}
                className="nav-link logout-button"
              >
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-link">Log in</Link>
          )}
        </div>
      </div>
      {/* End of Header Section */}

      <div className="cart-page">
        <h1>Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your Cart is empty</p>
            <p>
              <Link to="/login">Log in</Link> or{" "}
              <Link to="/register">Create an account</Link>.
            </p>
          </div>
        ) : (
          <div>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.image_url || productImage} alt={item.name} />
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p>${item.price.toFixed(2)}</p>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
            <h3 className="subtotal">
              Subtotal ({itemCount} items): ${totalPrice}
            </h3>
            <button className="checkout-button" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;