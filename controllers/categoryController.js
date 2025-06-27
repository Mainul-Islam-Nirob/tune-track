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

//Category Detail
exports.category_detail = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const categoryQuery = await pool.query("SELECT * FROM categories WHERE id = $1", [categoryId]);
    const itemsQuery = await pool.query("SELECT * FROM items WHERE category_id = $1", [categoryId]);

    const category = categoryQuery.rows[0];
    const items = itemsQuery.rows;

    if (!category) {
      return res.status(404).send("Category not found");
    }

    res.render("categories/detail", {
      title: category.name,
      category,
      items,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

//Category Edit Form
exports.category_edit_get = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const result = await pool.query("SELECT * FROM categories WHERE id = $1", [categoryId]);
    const category = result.rows[0];

    if (!category) {
      return res.status(404).send("Category not found");
    }

    res.render("categories/edit", {
      title: `Edit Category - ${category.name}`,
      category,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

//Category update post
exports.category_update_post = [
 // 🧼 Validate and sanitize input
  body("name").trim().notEmpty().withMessage("Name is required").escape(),
  body("description").trim().escape(),

  async (req, res) => {
    const categoryId = req.params.id;
    const errors = validationResult(req);
    const { name, description } = req.body;

    const newImageUrl = req.file ? req.file.path : null;

    try {
      // 🔍 Get existing category
      const existingResult = await pool.query("SELECT * FROM categories WHERE id = $1", [categoryId]);
      const existingCategory = existingResult.rows[0];

      if (!existingCategory) {
        return res.status(404).send("Category not found");
      }

      // 🧾 If validation errors
      if (!errors.isEmpty()) {
        return res.render("categories/form", {
          title: "Edit Category",
          category: { id: categoryId, name, description, image_url: existingCategory.image_url },
          errors: errors.array(),
        });
      }

      // 🔁 Use existing image if new one not uploaded
      const image_url = newImageUrl || existingCategory.image_url;

      // 💾 Update database
      await pool.query(
        `UPDATE categories
         SET name = $1, description = $2, image_url = $3
         WHERE id = $4`,
        [name, description, image_url, categoryId]
      );

      res.redirect(`/categories/${categoryId}`);
    } catch (err) {
      console.error("Error updating category:", err);
      res.status(500).send("Server error");
    }
  }
];







