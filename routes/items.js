const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");

// List all items
router.get("/", itemController.item_list);

module.exports = router;
