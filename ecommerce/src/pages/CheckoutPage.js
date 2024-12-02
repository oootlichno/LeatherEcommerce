import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);


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
      <CheckoutForm navigate={navigate} token={token} />
    </Elements>
  );
};

const CheckoutForm = ({ navigate, token }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [isAddressLoaded, setIsAddressLoaded] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  useEffect(() => {
    const fetchAddress = async () => {
      try {

        const response = await fetch("http://localhost:5001/users/account", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const { user } = await response.json();
          console.log("User Account Data Retrieved:", user);

          if (user) {
            setShippingAddress((prev) => ({
              ...prev,
              name: user.name || "",
              street: user.address?.street || "",
              city: user.address?.city || "",
              state: user.address?.state || "",
              zip: user.address?.zip || "",
              country: user.address?.country || "",
            }));
          }
        } else {
          console.error("Address fetch failed:", response.status);
        }
      } catch (error) {
        console.error("Error fetching account data:", error.message);
      } finally {
        setIsAddressLoaded(true);
      }
    };

    fetchAddress();
  }, [token]);

  useEffect(() => {
    const fetchCart = async () => {
      console.log("Fetching cart data...");

      try {
        const response = await fetch("http://localhost:5001/cart", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const { cart } = await response.json();
          console.log("Cart data fetched successfully:", cart);
          setCartItems(cart);
        } else {
          console.error("Failed to fetch cart data. Status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching cart data:", error.message);
      } finally {
        setIsCartLoaded(true);
      }
    };

    fetchCart();
  }, [token]);

  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    setShippingAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Cart items before submission:", cartItems);
  
    if (!stripe || !elements) return;
  
    if (cartItems.length === 0) {
      console.error("Cart is empty. Cannot proceed with payment.");
      setPaymentError("Your cart is empty.");
      return;
    }
  
    setIsProcessing(true);
  
    try {
      const totalAmount = Math.round(
        cartItems.reduce((total, item) => total + item.price * item.quantity, 0) * 100
      );
      console.log("Total amount to charge (in cents):", totalAmount);
  
      const response = await fetch("http://localhost:5001/payments/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: totalAmount, 
          shippingAddress,
          products: cartItems,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to create payment intent: ${response.status}`);
      }
  
      const { clientSecret, orderId } = await response.json();
  
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: shippingAddress.name,
            address: {
              line1: shippingAddress.street,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postal_code: shippingAddress.zip,
              country: shippingAddress.country,
            },
          },
        },
      });
  
      if (paymentResult.error) {
        setPaymentError(paymentResult.error.message);
      } else if (paymentResult.paymentIntent.status === "succeeded") {
        console.log("Payment successful, Order ID:", orderId);
  
        // Clear the cart in the backend
        await fetch("http://localhost:5001/cart", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setCartItems([]); 
  
        setPaymentSuccess(true);
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
      {paymentSuccess ? (
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
          {!isAddressLoaded ? (
            <p>Loading address...</p>
          ) : !isCartLoaded ? (
            <p>Loading cart...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={shippingAddress.name}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Street</label>
                <input
                  type="text"
                  name="street"
                  value={shippingAddress.street}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>ZIP</label>
                <input
                  type="text"
                  name="zip"
                  value={shippingAddress.zip}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleAddressChange}
                  required
                />
              </div>

              <CardElement />
              <button type="submit" disabled={!stripe || isProcessing}>
                {isProcessing ? "Processing..." : "Pay Now"}
              </button>
            </form>
          )}
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
