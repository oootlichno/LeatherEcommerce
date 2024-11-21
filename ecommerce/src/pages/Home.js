import React from "react";
import { Link } from "react-router-dom";
import leather from "../style/img/leather.png";
import handtools from "../style/img/handtools.png";
import molds from "../style/img/molds.png";
import logo from "../style/img/logo.png";
import CartComponent from "../components/CartComponent"; 

const HomePage = ({ token, setToken, cartItems }) => { 
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

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
         {/*  <Link to="/" className="nav-link">
            Home
          </Link> */}
          {token ? (
            <>
              <Link to="/account" className="nav-link">
                Account
              </Link>
              <button
                onClick={handleLogout}
                className="nav-link logout-button"
              >
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-link">
              Log in
            </Link>
          )}
        </div>
      </div>
      {/* End of Header Section */}

      <div>
        <h2>SHOP BY CATEGORY</h2>
      </div>

      <div className="categories">
        <div className="category">
          <Link to="/leather">
            <img src={leather} alt="Leather" />
            <p>Leather</p>
          </Link>
        </div>
        <div className="category">
          <Link to="/handtools">
            <img src={handtools} alt="Hand Tools" />
            <p>Hand Tools</p>
          </Link>
        </div>
        <div className="category">
          <Link to="/molds">
            <img src={molds} alt="Molds" />
            <p>Molds</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;