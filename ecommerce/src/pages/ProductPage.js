import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import logo from "../style/img/logo.png";
import productImage from "../style/img/leather.png";

const ProductPage = () => {
  const { id } = useParams(); 
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/products/${id}`); 
        if (!response.ok) {
          throw new Error("Failed to fetch product data");
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Header Section */}
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
      {/* End of Header Section */}

      <div className="product-page">
        <div className="breadcrumbs">
          <Link to="/">Home</Link> &gt; <Link to="/leather">Leather</Link> &gt; {product.name}
        </div>

        <div className="product-container">
          <div className="image-gallery">
            <img
              src={product.image_url || productImage}
              alt={product.name}
              className="main-image"
            />
            <div className="thumbnail-gallery">
              {product.images?.map((img, index) => (
                <img key={index} src={img} alt={`Thumbnail ${index}`} className="thumbnail" />
              ))}
            </div>
          </div>

          <div className="product-details">
            <h1>{product.name}</h1>
            <p className="byline">by {product.brand || "LeatherUp"}</p>
            <p className="price">${product.price.toFixed(2)}</p>
            <h3>Description</h3>
            <p>{product.description}</p>

            <h3>Specifications</h3>
            <ul>
              {product.specifications?.map((spec, index) => (
                <li key={index}>{spec}</li>
              ))}
            </ul>

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
    </div>
  );
};

export default ProductPage;

