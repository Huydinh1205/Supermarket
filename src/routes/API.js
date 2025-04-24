const express = require("express");
const router = express.Router();
const db = require("../db");
const pool = require("../db");
const multer = require("multer");

// Storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ------------------ PRODUCT ROUTES ------------------

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

// Get a single product by ID
router.get("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT 
        p.*,
        c.Name AS categoryname,
        w.Name AS warehousename
      FROM Product p
      LEFT JOIN Category c ON p.CategoryID = c.CategoryID
      LEFT JOIN Warehouse w ON c.WarehouseID = w.WarehouseID
      WHERE p.ProductID = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching product by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Create new product
router.post("/products", upload.single("image"), async (req, res) => {
  const { name, price, remaining, categoryid } = req.body;
  const imageurl = `http://localhost:5000/uploads/${req.file.filename}`;

  try {
    await pool.query(
      `INSERT INTO Product 
       (Name, Price, Remaining, CategoryID, ImageURL, CreatedAt, Sold) 
       VALUES ($1, $2, $3, $4, $5, NOW(), 0)`,
      [name, price, remaining || 0, categoryid || null, imageurl]
    );
    res.status(201).json({ message: "Product created successfully" });
  } catch (err) {
    console.error("Error inserting product:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// ------------------ OTHER ROUTES ------------------

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

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM Category");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all warehouses
router.get("/warehouses", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM Warehouse");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching warehouses:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Get all orders
router.get("/orders", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM OrderDetails");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
