const express = require("express");
const router = express.Router();
const db = require("../db"); // Adjust path based on where your db config is

// Get all products
router.get("/products", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM Product");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all employees
router.get("/employees", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM Employee");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all customers
router.get("/customers", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM Customer");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add more endpoints here as needed...

module.exports = router;
