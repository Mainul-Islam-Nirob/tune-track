const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const upload = require("../middleware/upload");

router.get("/", categoryController.category_list);
router.get("/new", categoryController.category_create_get);
router.post("/new", upload.single("image"), categoryController.category_create_post);
router.get("/:id", categoryController.category_detail);
// Show edit form
router.get("/:id/edit", categoryController.category_edit_get);
//update category
router.post("/:id/update", upload.single("image"), categoryController.category_update_post);
// Show warning before deletion
router.get("/:id/delete", categoryController.category_delete_get); 
// Handle deletion  
router.post("/:id/delete", categoryController.category_delete_post); 


module.exports = router;
