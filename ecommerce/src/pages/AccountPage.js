import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";


const AccountPage = ({ token, setToken }) => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get("http://localhost:5001/users/account", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(data.user);
        setOrders(data.orders);
      } catch (error) {
        console.error("Failed to fetch account data:", error.message);
        alert("Failed to fetch account data. Please try logging in again.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token]);

  if (loading) return <div className="loading">Loading...</div>;

  if (!user) {
    return (
      <>
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>Please log in to access your account.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="account-container">
        <div className="account-box">
          <h1 className="account-title">Account Details</h1>
          <div className="account-details">
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            {user.address ? (
              <div>
                <p>
                  <strong>Street:</strong> {user.address.street}
                </p>
                <p>
                  <strong>City:</strong> {user.address.city}
                </p>
                <p>
                  <strong>State:</strong> {user.address.state}
                </p>
                <p>
                  <strong>ZIP:</strong> {user.address.zip}
                </p>
                <p>
                  <strong>Country:</strong> {user.address.country}
                </p>
              </div>
            ) : (
              <p>
                <strong>Address:</strong> No address provided
              </p>
            )}
          </div>
          <h2 className="order-history-title">Order History</h2>
          <ul className="order-list">
            {orders.length > 0 ? (
              orders.map((order) => (
                <li key={order.id} className="order-item">
                  <span>
                    <strong>Order #{order.id}</strong>
                  </span>
                  <span>${order.total.toFixed(2)}</span>
                </li>
              ))
            ) : (
              <p>No orders found.</p>
            )}
          </ul>

          {/* ADDED: Link to Cart */}
          <div className="cart-link">
            <p>
              Need to continue shopping? Check out your{" "}
              <Link to="/cart">Shopping Cart</Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountPage;