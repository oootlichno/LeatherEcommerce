import React, { useEffect, useState } from "react";
import axios from "axios";

const AccountPage = ({ token }) => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data } = await axios.get("http://localhost:5001/account", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data.user);
      setOrders(data.orders);
    };

    fetchUserData();
  }, [token]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>Account</h1>
      <p>Name: {user.username}</p>
      <p>Email: {user.email}</p>
      <p>Address: {user.address}</p>
      <h2>Order History</h2>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>Order #{order.id} - ${order.total}</li>
        ))}
      </ul>
    </div>
  );
};

export default AccountPage;