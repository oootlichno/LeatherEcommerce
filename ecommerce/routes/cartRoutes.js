const express = require("express");
const { authenticate } = require("./authMiddleware");
const db  = require("../dbSetup");
const router = express.Router();

// GET Cart Items
router.get("/", authenticate, async (req, res) => {
  try {
    const cartItems = await db("cart").where({ user_id: req.userId }).select("product_id as productId", "price", "quantity");
    if (cartItems.length === 0) return res.status(404).json({ cart: [] });
    res.status(200).json({ cart: cartItems });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cart items" });
  }
});

// ADD/UPDATE Cart Item
router.post("/", authenticate, async (req, res) => {
  const { productId, price, quantity } = req.body;
  if (!productId || !price || !quantity) return res.status(400).json({ error: "All fields are required." });

  try {
    const existingItem = await db("cart").where({ user_id: req.userId, product_id: productId }).first();
    if (existingItem) {
      await db("cart").where({ user_id: req.userId, product_id: productId }).update({ quantity, updated_at: new Date() });
    } else {
      await db("cart").insert({ user_id: req.userId, product_id: productId, price, quantity, created_at: new Date(), updated_at: new Date() });
    }
    res.status(200).json({ message: "Cart updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// DELETE Cart Items
router.delete("/", authenticate, async (req, res) => {
  try {
    await db("cart").where({ user_id: req.userId }).del();
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

module.exports = router;
