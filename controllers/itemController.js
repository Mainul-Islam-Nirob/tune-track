const pool = require("../models/db");
const { body, validationResult } = require("express-validator");

exports.item_list = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT items.*, categories.name AS category_name
      FROM items
      LEFT JOIN categories ON items.category_id = categories.id
      ORDER BY items.name
    `);

    res.render("items/index", {
      title: "All Instruments",
      items: result.rows,
    });
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).send("Server error");
  }
};


// GET: Show form to add new instrument
exports.item_create_get = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY name");
    res.render("items/form", {
      title: "Add New Instrument",
      item: {},
      categories: result.rows,
      errors: [],
    });
  } catch (err) {
    console.error("Error loading form:", err);
    res.status(500).send("Server error");
  }
};

// POST: Handle instrument creation
exports.item_create_post = [
  body("name").trim().notEmpty().withMessage("Name is required").escape(),
  body("brand").trim().escape(),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a number"),
  body("quantity").isInt({ min: 0 }).withMessage("Quantity must be a number"),
  body("description").trim().escape(),
  body("category_id").notEmpty().withMessage("Please select a category"),

  async (req, res) => {
    const errors = validationResult(req);
    const { name, brand, price, quantity, description, category_id } = req.body;
    const image_url = req.file ? req.file.path : null; // Cloudinary

    try {
      const categoryRes = await pool.query("SELECT * FROM categories ORDER BY name");

      if (!errors.isEmpty()) {
        return res.render("items/form", {
          title: "Add New Instrument",
          item: req.body,
          categories: categoryRes.rows,
          errors: errors.array(),
        });
      }

      await pool.query(
        `INSERT INTO items (name, brand, price, quantity, description, category_id, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [name, brand, price, quantity, description, category_id, image_url]
      );

      res.redirect("/items");
    } catch (err) {
      console.error("Error saving item:", err);
      res.status(500).send("Server error");
    }
  },
];
