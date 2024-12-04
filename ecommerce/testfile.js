.search-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%; /* Matches the width of the search bar */
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #ddd;
    border-radius: 4px;
    display: flex; /* Use flexbox for side-by-side layout */
    padding: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }
  
  .suggestions, .products {
    flex: 1; /* Each column takes equal space */
    display: flex;
    flex-direction: column; /* Stack content vertically */
    padding: 0 10px;
  }
  
  .products {
    border-left: 1px solid #ddd; /* Subtle separator between columns */
  }
  
  .suggestions strong, .products strong {
    margin-bottom: 10px; /* Add spacing below the title */
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
    width: 40px; /* Thumbnail size */
    height: 40px;
    object-fit: cover;
    margin-right: 10px;
    border-radius: 4px;
    vertical-align: middle;
  }
