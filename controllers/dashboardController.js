const pool = require("../models/db");

exports.index = async (req, res) => {
  try {
    const totalItems = await pool.query("SELECT COUNT(*) FROM items");
    const totalCategories = await pool.query("SELECT COUNT(*) FROM categories");
    const totalQuantity = await pool.query("SELECT SUM(quantity) FROM items");
    const avgPrice = await pool.query("SELECT ROUND(AVG(price), 2) FROM items");

    res.render("dashboard", {
      title: "Admin Dashboard",
      stats: {
        items: totalItems.rows[0].count,
        categories: totalCategories.rows[0].count,
        quantity: totalQuantity.rows[0].sum || 0,
        averagePrice: avgPrice.rows[0].round || 0,
      }
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).send("Server error");
  }
};
