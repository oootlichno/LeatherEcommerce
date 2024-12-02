const express = require("express");
const db = require("../dbSetup");
const router = express.Router();

// Categories route
router.get("/categories", async (req, res) => {
    try {
      const categories = await db("categories").select("*");
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve categories" });
    }
  });

  router.get("/categories/:id", async (req, res) => {
    const { id } = req.params; 
    try {
      
      const category = await db("categories").where({ id }).first();
      if (category) {
        res.status(200).json(category);
      } else {
        res.status(404).json({ error: `Category with ID ${id} not found` });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve categories" });
    }
  });


  
  // Products route
  router.get("/", async (req, res) => {
    const { categoryId } = req.query;
    try {
      const products = categoryId
        ? await db("products").where({ category_id: categoryId }).select("*")
        : await db("products").select("*");
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve products" });
    }
  });
  
  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const product = await db("products").where({ id }).first();
      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json({ error: `Product with ID ${id} not found` });      }
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve product" });
    }
  });

module.exports = router;