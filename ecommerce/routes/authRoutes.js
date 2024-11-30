const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../dbSetup");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Register route
router.post("/register", async (req, res) => {
  const { username, email, password, name, address } = req.body;

  try {
    const existingUser = await db("users").where({ email }).orWhere({ username }).first();
    if (existingUser) {
      return res.status(400).json({ error: "Email or username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userId] = await db("users").insert({ username, email, password: hashedPassword, name });

    if (address) {
      await db("addresses").insert({
        user_id: userId,
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
      });
    }

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Failed to register user." });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db("users").where({ email }).first();
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ error: "Failed to log in." });
  }
});

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { router, authenticate };