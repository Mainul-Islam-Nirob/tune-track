const pool = require("../models/db");
exports.category_list = async(req, res) => {
  const { rows } = await pool.query("SELECT * FROM categories ORDER BY name");
  res.render("categories/index", {
    title: "All Categories",
    categories: rows,
  });
};

exports.category_create_get = (req, res) => {
  res.render("categories/form", { title: "Add New Category" });
};

exports.category_create_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Create category POST");
};
