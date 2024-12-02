import React, { useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import productImage from "../style/img/leather.png";

const CartPage = ({ cartItems, removeFromCart, token, setToken }) => {
  const navigate = useNavigate();
  const syncRef = useRef(false); 
  const cartItemsRef = useRef(cartItems); 

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  const syncCartWithBackend = useCallback(async () => {
    if (!token) return;

    console.log("syncCartWithBackend called");

    try {
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
      syncRef.current = false; 
    }
  }, [cartItems, token]);

  const handleCheckout = async () => {
    if (!token) {
      alert("Please log in to make a purchase or create an account.");
      navigate("/login");
    } else {
      await syncCartWithBackend();
      navigate("/checkout");
    }
  };

  useEffect(() => {
    if (token && !syncRef.current) {
      syncRef.current = true;

      if (cartItemsRef.current !== cartItems) {
        cartItemsRef.current = cartItems;
        syncCartWithBackend();
      }
    }
  }, [token, cartItems, syncCartWithBackend]);

  return (
    <div>
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