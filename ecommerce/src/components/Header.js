import React, { useEffect } from "react";
import CartComponent from "./CartComponent";
import logo from "../style/img/logo.png";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";



const Header = ({ token, setToken, cartItems, setCartItems }) => {
    const handleLogout = () => {
      setToken(null);
      localStorage.removeItem("token");
    };
  
    useEffect(() => {
      const fetchCart = async () => {
        if (!token) {
          setCartItems([]); 
          return;
        }
  
        try {
          const response = await fetch("http://localhost:5001/cart", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          if (response.ok) {
            const { cart } = await response.json();
            setCartItems(cart); 
          } else {
            setCartItems([]); 
          }
        } catch (error) {
          console.error("Error fetching cart data:", error.message);
          setCartItems([]); 
        }
      };
  
      fetchCart(); 
    }, [token, setCartItems]);

    
    return (
<div className="header">
<div className="logo">
   <Link to="/">
     <img src={logo} alt="logo" />
   </Link>
 </div>
 <div className="search-bar-container">
  <SearchBar />
</div>

 
 <div className="nav">
  {/*  <Link to="/" className="nav-link">Home</Link> */}
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
 <div className="cart-container">
   <CartComponent cartItems={cartItems} /> 
 </div>
</div>

    )
};


export default Header;



