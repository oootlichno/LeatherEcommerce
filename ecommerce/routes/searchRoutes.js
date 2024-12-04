const express = require("express");
const db = require("../dbSetup");
const router = express.Router();

router.get("/", async (req, res) => {
    const { query } = req.query;
  
    try {
      if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
      }
  
      const products = await db("products")
        .where("name", "like", `%${query}%`)
        .select("id", "name", "price", "description");
  
      if (products.length === 0) {
        return res.status(200).json({ suggestions: [], products: [] });
      }
  
      const suggestions = products.map((product) => product.name);
      res.status(200).json({ suggestions, products });
    } catch (error) {
      console.error("Error searching products:", error.message);
      res.status(500).json({ error: "Failed to search products" });
    }
  });
  module.exports = router;

