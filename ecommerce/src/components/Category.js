import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import productImage from "../style/img/leather.png";

const Category = () => {
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5001/products/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data); 
      } catch (err) {
        setError(err.message); 
      } finally {
        setLoading(false); 
      }
    };

    fetchCategories(); 
  }, []);

  if (loading) return <div>Loading...</div>; 
  if (error) return <div>Error: {error}</div>; 

  return (
    <div>
      <div className="categories">
        {categories.map((category) => (
          <div key={category.id} className="category">
            <Link to={`/category/${category.id}`}>
              <img
                src={category.image_url || productImage}
                alt={category.name}
                className="category-image"
              />
              <h2>{category.name}</h2>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;








