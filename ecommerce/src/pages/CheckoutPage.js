import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51Nf3pGJ6VhgbPvzwp1dOsUkZ49wGOOTYg6A62hJuSil9Bu9yxJAPn7eiOELHliBbwJmxYkatvcpIDkAxRRQETKHL00AyU4bEqG");

const CheckoutPage = ({ token }) => {
  const navigate = useNavigate();

  if (!token) {
    return (
      <div className="checkout-container">
        <h2>Please Log in to Checkout</h2>
        <p>
          To complete your purchase, you need to{" "}
          <Link to="/login">Log in</Link> or{" "}
          <Link to="/register">Create an Account</Link>.
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm navigate={navigate} />
    </Elements>
  );
};

const CheckoutForm = ({ shippingAddress, navigate }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false); // NEW STATE
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      if (!stripe || !elements) return;
  
      setIsProcessing(true);
  
      try {
        const response = await fetch("http://localhost:5001/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: 5000, // Replace with actual amount in cents
            shipping: shippingAddress, // Optional
          }),
        });
  
        const { clientSecret } = await response.json();
  
        const paymentResult = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: shippingAddress?.name || "Unknown User",
              address: shippingAddress || {}, // Ensure address is passed if available
            },
          },
        });
  
        if (paymentResult.error) {
          setPaymentError(paymentResult.error.message);
        } else if (paymentResult.paymentIntent.status === "succeeded") {
          setPaymentSuccess(true); // SET SUCCESS
          console.log("Payment successful!", paymentResult);
        }
      } catch (error) {
        setPaymentError("Payment failed. Please try again.");
        console.error("Payment error:", error.message);
      } finally {
        setIsProcessing(false);
      }
    };
  
    return (
      <div className="checkout-form">
        <h1>Checkout</h1>
        {paymentSuccess ? ( // CHECK FOR SUCCESS
          <div className="success-message">
            <h3>Thank you for your payment!</h3>
            <p>Your payment was successful, and your order is being processed.</p>
            <Link to="/" className="back-home-button">
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            <h3>Shipping Address:</h3>
            {shippingAddress ? (
              <div className="shipping-address">
                <p>{shippingAddress.name}</p>
                <p>{shippingAddress.street}</p>
                <p>
                  {shippingAddress.city}, {shippingAddress.state}{" "}
                  {shippingAddress.zip}
                </p>
                <p>{shippingAddress.country}</p>
              </div>
            ) : (
              <p>No shipping address provided</p>
            )}
  
            <form onSubmit={handleSubmit}>
              <CardElement />
              <button type="submit" disabled={!stripe || isProcessing}>
                {isProcessing ? "Processing..." : "Pay Now"}
              </button>
            </form>
            {paymentError && <p className="error-message">{paymentError}</p>}
          </>
        )}
  
        {!paymentSuccess && (
          <button className="back-to-cart-button" onClick={() => navigate("/cart")}>
            Back to Cart
          </button>
        )}
      </div>
    );
  };
  export default CheckoutPage; 