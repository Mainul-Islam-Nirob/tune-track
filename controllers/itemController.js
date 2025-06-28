const pool = require("../models/db");

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
