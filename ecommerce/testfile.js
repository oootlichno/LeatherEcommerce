import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import USStatesDropdown from "../components/USAstates";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const TAX_RATE_TEXAS = 0.082;

const CheckoutPage = ({ token }) => {
  const navigate = useNavigate();

  if (!token) {
    return (
      <div className="checkout-container">
        <h2>Please Log in to Checkout</h2>
        <p>
          To complete your purchase, you need to <Link to="/login">Log in</Link>{" "}
          or <Link to="/register">Create an Account</Link>.
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
    email: "", // Added email field for notification
  });
  const [isAddressLoaded, setIsAddressLoaded] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [totalAfterTax, setTotalAfterTax] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [isShippingLoaded, setIsShippingLoaded] = useState(false);

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
          if (user) {
            setShippingAddress((prev) => ({
              ...prev,
              name: user.name || "",
              street: user.address?.street || "",
              city: user.address?.city || "",
              state: user.address?.state || "",
              zip: user.address?.zip || "",
              country: user.address?.country || "",
              email: user.email || "", 
            }));
          }
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
          setCartItems(cart);
          const total = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          setTotalPrice(total);
        }
      } catch (error) {
        console.error("Error fetching cart data:", error.message);
      } finally {
        setIsCartLoaded(true);
      }
    };

    fetchCart();
  }, [token]);

  useEffect(() => {
    if (shippingAddress.state === "Texas") {
      const tax = totalPrice * TAX_RATE_TEXAS;
      setTaxAmount(tax);
      setTotalAfterTax(totalPrice + tax);
    } else {
      setTaxAmount(0);
      setTotalAfterTax(totalPrice);
    }
  }, [shippingAddress.state, totalPrice]);

  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    setShippingAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    if (cartItems.length === 0) {
      setPaymentError("Your cart is empty.");
      return;
    }

    setIsProcessing(true);

    try {
      const totalAmount = Math.round(totalAfterTax * 100);

      // Step 1: Create a payment intent
      const response = await fetch(
        "http://localhost:5001/payments/create-payment-intent",
        {
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
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create payment intent: ${response.status}`);
      }

      const { clientSecret } = await response.json();

      // Step 2: Confirm payment
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
        // Step 3: Send Email Notification
        const emailResponse = await fetch("http://localhost:5001/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerEmail: shippingAddress.email,
            adminEmail: "your_admin_email@example.com",
            orderDetails: {
              customerName: shippingAddress.name,
              products: cartItems,
              total: totalAfterTax.toFixed(2),
            },
          }),
        });

        if (!emailResponse.ok) {
          console.error("Failed to send email notifications");
        } else {
          console.log("Email notifications sent successfully");
        }

        // Step 4: Clear the cart and show success message
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