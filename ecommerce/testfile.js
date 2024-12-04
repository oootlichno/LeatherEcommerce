import React, { useState } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import lookingGlass from "../style/img/looking_glass.png";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [products, setProducts] = useState([]);

  const debouncedSearch = debounce(async (value) => {
    try {
      const res = await axios.get(`http://localhost:5001/products/search`, {
        params: { query: value },
      });
      setSuggestions(res.data.suggestions);
      setProducts(res.data.products);
    } catch (error) {
      console.error("Error fetching search results:", error);
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

  const handleBlur = () => {
    setTimeout(() => {
      setSuggestions([]);
      setProducts([]);
    }, 200); 
  };

  const handleSuggestionClick = (suggestions) => {
    setQuery(suggestions);
    setSuggestions([]);
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
        onBlur={handleBlur}
        placeholder="Search for products..."
        className="search-input"
      />

      {query && (
        <div className="search-results">
          {suggestions.length > 0 && (
            <div className="suggestions">
              <strong>Suggestions</strong>
              <ul>
                {suggestions.map((suggestions, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestions)}
                    className="suggestion-item"
                  >
                    {suggestions}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {products.length > 0 && (
            <div className="products">
              <strong>Products</strong>
              <ul>
                {products.map((products) => (
                  <li key={products.id} className="product-item">
                    <strong>{products.name}</strong> - ${products.price.toFixed(2)}
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
