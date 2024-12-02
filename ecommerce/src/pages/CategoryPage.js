import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import productImage from "../style/img/leather.png";

const CategoryPage = ({ cartItems, token, setToken }) => {
  const { categoryId } = useParams(); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/products?categoryId=${categoryId}`
        );
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
  }, [categoryId]); 

  if (loading) return <div>Loading...</div>; 
  if (error) return <div>Error: {error}</div>; 

  return (
    <div>
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

export default CategoryPage;