const pool = require("../models/db");
const { body, validationResult } = require("express-validator");

exports.category_list = async(req, res) => {
  const { rows } = await pool.query("SELECT * FROM categories ORDER BY name");
  res.render("categories/index", {
    title: "All Categories",
    categories: rows,
  });
};

// GET form stays the same
exports.category_create_get = (req, res) => {
  res.render("categories/form", {
    title: "Add New Category",
    category: {},
    errors: [],
  });
};

// POST with image upload
exports.category_create_post = [
  // validate text fields only (not image here)
  body("name").trim().notEmpty().withMessage("Name is required").escape(),
  body("description").trim().escape(),

  async (req, res) => {
    const errors = validationResult(req);
    const { name, description } = req.body;

    const image_url = req.file ? req.file.path : null; // Cloudinary gives the full URL

    if (!errors.isEmpty()) {
      return res.render("categories/form", {
        title: "Add New Category",
        category: { name, description },
        errors: errors.array(),
      });
    }

    try {
      await pool.query(
        "INSERT INTO categories (name, description, image_url) VALUES ($1, $2, $3)",
        [name, description, image_url]
      );
      res.redirect("/categories");
    } catch (err) {
      console.error("Error saving category:", err);
      res.status(500).send("Server error");
    }
  },
];
