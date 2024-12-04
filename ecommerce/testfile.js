.custom-search-bar {
    position: relative;
    width: 600px; /* Set a fixed width or use percentage-based width */
  }
  
  .search-input {
    width: 100%;
    padding: 10px 40px; /* Adjust padding to fit the icon */
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
  }
  
  .search-dropdown {
    position: absolute;
    top: 100%; /* Position dropdown below the input */
    left: 0;
    width: 100%; /* Match the width of the search bar */
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #ddd;
    border-radius: 4px;
    display: flex; /* Align content inside the dropdown */
    padding: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }
  
  .suggestions {
    flex: 1; /* Take 50% of the space */
    padding-right: 10px;
  }
  
  .products {
    flex: 1; /* Take 50% of the space */
    padding-left: 10px;
    border-left: 1px solid #ddd; /* Add a subtle separator */
  }
  
  .suggestions ul, .products ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .suggestions li, .products li {
    padding: 5px 0;
    cursor: pointer;
  }
  
  .products img {
    width: 40px; /* Small product thumbnail */
    height: 40px;
    object-fit: cover;
    margin-right: 10px;
    border-radius: 4px;
    vertical-align: middle;
  }
