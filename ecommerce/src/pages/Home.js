import React from "react";
import { Link } from "react-router-dom";
import leather from "../style/img/leather.png";
import handtools from "../style/img/handtools.png";
import molds from "../style/img/molds.png";
import logo from "../style/img/logo.png";

const HomePage = () => {
  return (
    <div>
      <div className="header">
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="logo" />
          </Link>
        </div>
        <div className="nav">
          <Link to="/" className="nav-link">Home</Link>
        </div>
      </div>

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
