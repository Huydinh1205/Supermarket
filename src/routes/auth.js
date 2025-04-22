// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");

// Signup
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username, hashedPassword]
    );

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
