import React from "react";
import leather from "../style/img/leather.png";
import handtools from "../style/img/handtools.png";
import molds from "../style/img/molds.png";
import logo from "../style/img/logo.png";

const HomePage = () => {
  return (
    <div>
      <div className="header">
        <div className="logo">
          <img src={logo} alt="logo" />
        </div>
      </div>

      <div >
      <h2>SHOP BY CATEGORY</h2>
      </div>
      
      <div className="categories">
        <div className="category">
          <img src={leather} alt="Leather" />
          <p>Leather</p>
        </div>
        <div className="category">
          <img src={handtools} alt="Hand Tools" />
          <p>Hand Tools</p>
        </div>
        <div className="category">
          <img src={molds} alt="Molds" />
          <p>Molds</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
