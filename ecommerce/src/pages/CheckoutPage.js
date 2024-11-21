import React from "react";
import { Link, useNavigate } from "react-router-dom";

const CheckoutPage = ({ token }) => {
  const navigate = useNavigate();

  if (!token) {
    return (
      <div className="checkout-container">
        <h2>Please Log in to Checkout</h2>
        <p>
          To complete your purchase, you need to{" "}
          <Link to="/login">Log in</Link> or{" "}
          <Link to="/register">Create an Account</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      <p>This is the checkout page. Implement your logic here!</p>
      <button className="back-to-cart-button" onClick={() => navigate("/cart")}>
        Back to Cart
      </button>
    </div>
  );
};

export default CheckoutPage;