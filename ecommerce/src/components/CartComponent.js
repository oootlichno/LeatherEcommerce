import React from "react";
import { Link } from "react-router-dom";
import cartIcon from "../style/img/shopping-cart.png";

const CartComponent = ({ cartItems = [] }) => {
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="cart-container">
      <Link to="/cart" className="cart-link">
        <img src={cartIcon} alt="Shopping Cart" className="cart-icon" />
        <span>Cart ({itemCount})</span>
      </Link>
    </div>
  );
};

export default CartComponent;