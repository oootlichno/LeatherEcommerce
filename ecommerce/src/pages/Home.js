import React from "react";
import { Link } from "react-router-dom";
import leather from "../style/img/leather.png";
import handtools from "../style/img/handtools.png";
import molds from "../style/img/molds.png";
//import logo from "../style/img/logo.png";
//import CartComponent from "../components/CartComponent";

const HomePage = ({ token, setToken, cartItems, setCartItems }) => {
  /* const handleLogout = () => {
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
  }, [token, setCartItems]); */ 

  return (
    <div>
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