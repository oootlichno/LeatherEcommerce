import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../style/img/logo.png";
import CartComponent from "../components/CartComponent"; // ADDED
import productImage from "../style/img/leather.png";

const LeatherPage = ({ cartItems, token, setToken }) => { // ADDED cartItems, token, setToken
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5001/products?category=leather");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Header Section */}
      <div className="header">
        <div className="cart-container">
          <CartComponent cartItems={cartItems} /> {/* ADDED */}
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

      <div>
        <h2>SHOP BY PRODUCT</h2>
      </div>

      <div className="products">
        {products.map((product) => (
          <div className="product" key={product.id}>
            <Link to={`/product/${product.id}`}>
              <img src={product.image_url || productImage} alt={product.name} />
              <p className="product-name">{product.name}</p>
              <p className="product-price">${product.price.toFixed(2)}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeatherPage;