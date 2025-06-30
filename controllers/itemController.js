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
    const selectedCategoryId = req.query.category_id || null;
    res.render("items/form", {
      title: "Add New Instrument",
      item: {category_id: selectedCategoryId },
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

//item details
exports.item_detail = async (req, res) => {
  const itemId = req.params.id;

  try {
    const result = await pool.query(
      `SELECT items.*, categories.name AS category_name
       FROM items
       LEFT JOIN categories ON items.category_id = categories.id
       WHERE items.id = $1`,
      [itemId]
    );

    const item = result.rows[0];

    if (!item) {
      return res.status(404).send("Item not found");
    }

    res.render("items/detail", {
      title: item.name,
      item,
    });
  } catch (err) {
    console.error("Error fetching item:", err);
    res.status(500).send("Server error");
  }
};

//item edit form
exports.item_edit_get = async (req, res) => {
  const id = req.params.id;

  try {
    const itemResult = await pool.query("SELECT * FROM items WHERE id = $1", [id]);
    const categoriesResult = await pool.query("SELECT * FROM categories");

    const item = itemResult.rows[0];
    if (!item) return res.status(404).send("Item not found");

    res.render("items/edit", {
      title: "Edit Instrument",
      item,
      categories: categoriesResult.rows,
      errors: [],
      isEditing: true
    });
  } catch (err) {
    console.error("Error fetching item:", err);
    res.status(500).send("Server error");
  }
};

//item update
exports.item_edit_post = [
  // Validate & sanitize fields
  body("name").trim().notEmpty().withMessage("Name is required").escape(),
  body("brand").trim().escape(),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a number"),
  body("quantity").isInt({ min: 0 }).withMessage("Quantity must be an integer"),
  body("category_id").notEmpty().withMessage("Category is required"),

  async (req, res) => {
    const errors = validationResult(req);
    const id = req.params.id;
    const { name, brand, price, quantity, description, category_id } = req.body;
    const image_url = req.file ? req.file.path : null;

    const itemData = {
      id,
      name,
      brand,
      price,
      quantity,
      description,
      category_id,
    };

    try {
      if (!errors.isEmpty()) {
        const categoriesResult = await pool.query("SELECT * FROM categories");
        return res.render("items/edit", {
          title: "Edit Instrument",
          item: itemData,
          categories: categoriesResult.rows,
          errors: errors.array(),
          isEditing: true
        });
      }

      if (image_url) {
        await pool.query(
          `UPDATE items SET name=$1, brand=$2, price=$3, quantity=$4, description=$5, category_id=$6, image_url=$7 WHERE id=$8`,
          [name, brand, price, quantity, description, category_id, image_url, id]
        );
      } else {
        await pool.query(
          `UPDATE items SET name=$1, brand=$2, price=$3, quantity=$4, description=$5, category_id=$6 WHERE id=$7`,
          [name, brand, price, quantity, description, category_id, id]
        );
      }

      res.redirect("/items/" + id);
    } catch (err) {
      console.error("Error updating item:", err);
      res.status(500).send("Server error");
    }
  }
];

//delete item
exports.item_delete_post = async (req, res) => {
  const id = req.params.id;
  const { adminPassword } = req.body;

  if (adminPassword !== process.env.ADMIN_SECRET) {
    return res.status(403).send("Forbidden: Invalid password.");
  }

  try {
    await pool.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect("/items");
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).send("Server error");
  }
};
