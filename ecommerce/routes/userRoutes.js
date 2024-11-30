const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticate } = require("./authMiddleware");
const db = require("../dbSetup");
const router = express.Router();

// Users Endpoint
router.get("/", async (req, res) => {
    try {
      const users = await db("users").select("id", "username", "email", "password", "name");
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users." });
    }
  });
  
  router.get("/address", authenticate, async (req, res) => {
    console.log("Middleware passed. User ID:", req.userId); 
    try {
      const address = await db("addresses").where({ user_id: req.userId }).first();
      console.log("Address Retrieved:", address); 
      if (!address) {
        console.error("No address found for User ID:", req.userId);
        return res.status(404).json({ error: "No address found." });
      }
      res.json(address);
    } catch (error) {
      console.error("Error fetching address:", error.message);
      res.status(500).json({ error: "Failed to fetch address." });
    }
  });
  
  router.put("/address", authenticate, async (req, res) => {
    const { street, city, state, zip, country } = req.body;
  
    if (!street || !city || !state || !zip || !country) {
      return res.status(400).json({ error: "All address fields are required." });
    }
  
    try {
      const existingAddress = await db("addresses").where({ user_id: req.userId }).first();
  
      if (existingAddress) {
        await db("addresses")
          .where({ user_id: req.userId })
          .update({ street, city, state, zip, country });
        console.log("Updated existing address for user ID:", req.userId);
      } else {
        await db("addresses").insert({
          user_id: req.userId,
          street,
          city,
          state,
          zip,
          country,
        });
        console.log("Added new address for user ID:", req.userId);
      }
  
      res.status(200).json({ message: "Address saved successfully." });
    } catch (error) {
      console.error("Error saving address:", error.message);
      res.status(500).json({ error: "Failed to save address." });
    }
  });
  

  
  // Account route
  router.get("/account", authenticate, async (req, res) => {
    try {
      const user = await db("users").where({ id: req.userId }).select("username", "email", "name").first();
  
      const address = await db("addresses")
        .where({ user_id: req.userId })
        .select("street", "city", "state", "zip", "country")
        .first();
  
        const orders = await db("orders")
        .where({ user_id: req.userId })
        .select("id", "total_price as total");
  
      if (user) {
        res.status(200).json({
          user: {
            ...user,
            address: address
              ? {
                  street: address.street,
                  city: address.city,
                  state: address.state,
                  zip: address.zip,
                  country: address.country,
                }
              : null,
          },
          orders,
        });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("Failed to fetch account data:", error.message);
      res.status(500).json({ error: "Failed to fetch account data." });
    }
  });

module.exports = router;