import React, { useState } from "react";
import { Link } from "react-router-dom";
import productImage from "../style/img/leather.png"; 


const ProductPage = () => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  return (
    <div className="product-page">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumbs">
        <Link to="/">Home</Link> &gt; <Link to="/leather">Leather</Link> &gt; Economy Veg-Tan Double Shoulder Special
      </div>

      <div className="product-container">
        {/* Image Gallery */}
        <div className="image-gallery">
          <img src={productImage} alt="Economy Veg-Tan Double Shoulder Special" className="main-image" />
          <div className="thumbnail-gallery">
            {/* Add thumbnails */}
            {[...Array(6)].map((_, index) => (
              <img key={index} src={productImage} alt={`Thumbnail ${index}`} className="thumbnail" />
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="product-details">
          <h1>Economy Veg-Tan Double Shoulder Special</h1>
          <p className="byline">by LeatherUp</p>
          <p className="price">$59.99</p>
          <h3>Description</h3>
          <p>
            These veg-tanned shoulders won’t last long at this special price. These are imported shoulders and may have some imperfections such as discoloration and some holes. 
            They will accept dye, finish, and oils nicely. Let these be your next choice for belts, saddle bags, holsters, and scabbards. 
            <strong>Note: These shoulders may contain natural characteristics like visible marks, brands, or holes.</strong>
          </p>

          <h3>Specifications</h3>
          <ul>
            <li>Weight/Thickness: 2 to 3 oz. (0.8 to 1.2 mm)</li>
            <li>Weight/Thickness: 4 to 6 oz. (1.6 to 2.4 mm)</li>
            <li>Weight/Thickness: 7 to 9 oz. (2.8 to 3.6 mm)</li>
            <li>Average Size: 7 to 11 sq ft (0.65 to 1.3 sq meters)</li>
            <li>Tannage: Veg-Tan</li>
            <li>Color: Natural</li>
          </ul>

          {/* Quantity and Add to Cart */}
          <div className="quantity-cart">
            <div className="quantity-selector">
              <button onClick={handleDecrement}>-</button>
              <span>{quantity}</span>
              <button onClick={handleIncrement}>+</button>
            </div>
            <button className="add-to-cart">Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;