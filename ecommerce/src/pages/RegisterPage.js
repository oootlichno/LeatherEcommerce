import React, { useState } from "react";
import axios from "axios";

const RegisterPage = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5001/register", form);
      alert("Account created! Please log in.");
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Failed to create account.");
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-box">
        <h2>Create Account</h2>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />
        </div>
        <h3>Address</h3>
        <div className="form-group">
          <label>Street</label>
          <input
            type="text"
            placeholder="Enter your street"
            onChange={(e) =>
              setForm({
                ...form,
                address: { ...form.address, street: e.target.value },
              })
            }
            required
          />
        </div>
        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            placeholder="Enter your city"
            onChange={(e) =>
              setForm({
                ...form,
                address: { ...form.address, city: e.target.value },
              })
            }
            required
          />
        </div>
        <div className="form-group">
          <label>State</label>
          <input
            type="text"
            placeholder="Enter your state"
            onChange={(e) =>
              setForm({
                ...form,
                address: { ...form.address, state: e.target.value },
              })
            }
            required
          />
        </div>
        <div className="form-group">
          <label>ZIP</label>
          <input
            type="text"
            placeholder="Enter your zip code"
            onChange={(e) =>
              setForm({
                ...form,
                address: { ...form.address, zip: e.target.value },
              })
            }
            required
          />
        </div>
        <div className="form-group">
          <label>Country</label>
          <input
            type="text"
            placeholder="Enter your country"
            onChange={(e) =>
              setForm({
                ...form,
                address: { ...form.address, country: e.target.value },
              })
            }
            required
          />
        </div>
        <button type="submit" className="register-button">
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;