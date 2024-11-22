import React from "react";
import { Link } from "react-router-dom"; 

const ThankYouPage = () => {
  return (
    <div className="thank-you-container">
      <h1>Thank You for Your Purchase!</h1>
      <p>Your order has been placed successfully.</p>
      <Link to="/" className="back-to-home">
        Back to Home
      </Link>
    </div>
  );
};

export default ThankYouPage;