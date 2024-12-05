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
  const { categoryId, sortBy } = req.query;

  try {
    let query = db("products");

    if (categoryId) {
      query = query.where({ category_id: categoryId });
    }

    if (sortBy) {
      switch (sortBy) {
        case "alphabeticalAZ":
          query = query.orderBy("name", "asc");
          break;
        case "alphabeticalZA":
          query = query.orderBy("name", "desc");
          break;
        case "priceLowHigh":
          query = query.orderBy("price", "asc");
          break;
        case "priceHighLow":
          query = query.orderBy("price", "desc");
          break;
        case "dateOldNew":
          query = query.orderBy("created_at", "asc");
          break;
        case "dateNewOld":
          query = query.orderBy("created_at", "desc");
          break;
        default:
          query = query.orderBy("id", "asc"); 
      }
    }

    const products = await query.select("*");
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
      res.status(404).json({ error: `Product with ID ${id} not found` });
    }
  } catch (error) {
    console.error("Error retrieving product:", error.message);
    res.status(500).json({ error: "Failed to retrieve product" });
  }
});

module.exports = router;