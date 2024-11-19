import React from "react";
import { Link } from "react-router-dom";
import logo from "../style/img/logo.png";
import product1 from "../style/img/leather.png"; 
import Footer from "../components/Footer"; 

const LeatherPage = () => {
  return (
    <div>
    <div className="header">
      <div className="logo">
        <Link to="/product">
          <img src={logo} alt="logo" />
        </Link>
      </div>
      <div className="nav">
        <Link to="/" className="nav-link">Home</Link>
      </div>
    </div>

      <div>
        <h2>SHOP BY PRODUCT</h2>
      </div>

      <div className="products">
        <div className="product">
        <Link to="/">

          <img src={product1} alt="Product 1" />
          <p className="product-name">Premium Leather Roll</p>
          <p className="product-price">$79.99</p>
          </Link>
        </div>
        <div className="product">
          <img src={product1} alt="Product 2" />
          <p className="product-name">Vegetable Tanned Leather</p>
          <p className="product-price">$59.99</p>
        </div>
        <div className="product">
          <img src={product1} alt="Product 3" />
          <p className="product-name">Embossed Leather Sheet</p>
          <p className="product-price">$34.99</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LeatherPage;
