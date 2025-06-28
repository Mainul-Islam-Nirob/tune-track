const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");
const upload = require("../middleware/upload");

// List all items
router.get("/", itemController.item_list);
// Create new item
router.get("/new", itemController.item_create_get);
router.post("/new", upload.single("image"), itemController.item_create_post);
//view single item
router.get("/:id", itemController.item_detail);
// Edit form
router.get("/:id/edit", itemController.item_edit_get);
// Update form handler
router.post("/:id", upload.single("image"), itemController.item_edit_post);

module.exports = router;
