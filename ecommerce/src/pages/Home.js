import React from "react";
import leather from "../style/img/leather.png";
import handtools from "../style/img/handtools.png";
import molds from "../style/img/molds.png";



const HomePage = () => {
  return (
    <div>
      <h1>Ecommerce Leather selling</h1>
      <div>
        <h2>SHOP BY CATEGORY</h2>
        <div className="categories">
          <div className="category">
            <img src={leather} alt="category_picture" />
            <p>Leather</p>
          </div>

          <div className="category">
            <img src={handtools} alt="category_picture" />
            <p>Hand Tools</p>
          </div>

          <div className="category">
            <img src={molds} alt="category_picture" />
            <p>Molds</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
