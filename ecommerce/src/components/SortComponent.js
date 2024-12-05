import React, { useState } from "react";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "bestSelling", label: "Best selling" },
  { value: "alphabeticalAZ", label: "Alphabetically, A-Z" },
  { value: "alphabeticalZA", label: "Alphabetically, Z-A" },
  { value: "priceLowHigh", label: "Price, low to high" },
  { value: "priceHighLow", label: "Price, high to low" },
  { value: "dateOldNew", label: "Date, old to new" },
  { value: "dateNewOld", label: "Date, new to old" },
];

const SortComponent = ({ onSortChange }) => {
  const [selectedSort, setSelectedSort] = useState("featured");

  const handleSortChange = (event) => {
    const selectedOption = event.target.value;
    setSelectedSort(selectedOption);
    if (onSortChange) {
      onSortChange(selectedOption);
    }
  };

  return (
    <div className="sort-container">
      <label htmlFor="sort">Sort by:</label>
      <select
        id="sort"
        value={selectedSort}
        onChange={handleSortChange}
        className="sort-dropdown"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortComponent;