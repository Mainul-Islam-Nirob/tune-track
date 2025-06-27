const express = require("express");
const router = express.Router();
const pool = require("../models/db");

// Home route with category list
router.get("/", async (req, res) => {
  try {
    const { rows: categories } = await pool.query("SELECT * FROM categories ORDER BY name ASC");
    res.render("index", { title: "TuneTrack | Home", categories });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
