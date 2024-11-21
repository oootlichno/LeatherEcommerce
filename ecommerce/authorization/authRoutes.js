const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../tests/dbSetup"); 

const router = express.Router();
const JWT_SECRET = "oootlichno_Ksu_123456789"; 

router.post("/register", async (req, res) => {
  const { username, password, email, address } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [userId] = await db("users").insert({
      username,
      password: hashedPassword,
      email,
      address,
    });
    res.status(201).json({ message: "User created", userId });
  } catch (error) {
    res.status(500).json({ error: "Failed to register user" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db("users").where({ email }).first();
    if (!user) return res.status(404).json({ error: "User not found" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, userId: user.id });
  } catch (error) {
    res.status(500).json({ error: "Failed to log in" });
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