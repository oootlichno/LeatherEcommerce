import React, { useState } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import lookingGlass from "../style/img/looking_glass.png";
import productImage from "../style/img/leather.png";


const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [products, setProducts] = useState([]);

  const debouncedSearch = debounce(async (value) => {
    try {
      const res = await axios.get("http://localhost:5001/products/search", {
        params: { query: value },
      });
      setSuggestions(res.data.suggestions || []);
      setProducts(res.data.products || []);
    } catch (error) {
      console.error("Error fetching search results:", error.message);
    }
  }, 300);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim()) {
      debouncedSearch(value);
    } else {
      setSuggestions([]);
      setProducts([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setSuggestions([]);
    setProducts([]);
  };

  const handleProductClick = (productId) => {
    window.location.href = `/products/${productId}`;
  };

  return (
    <div className="custom-search-bar">
      <div className="icon-container">
        <img src={lookingGlass} alt="Search Icon" className="search-icon" />
      </div>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search for products..."
        className="search-input"
      />

      {query && (
        <div className="search-dropdown">
          {suggestions.length > 0 && (
            <div className="suggestions">
              <strong>Suggestions</strong>
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {products.length > 0 && (
            <div className="products">
              <strong>Products</strong>
              <ul>
                {products.map((product) => (
                  <li
                    key={product.id}
                    className="product-item"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <img
                      src={product.image_url || productImage}
                      alt={product.name}
                      className="product-thumbnail"
                    />
                    <div className="product-info">
                      <strong>{product.name}</strong> - ${product.price.toFixed(
                        2
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;