const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const upload = require("../middleware/upload");

router.get("/", categoryController.category_list);
router.get("/new", categoryController.category_create_get);
router.post("/new", upload.single("image"), categoryController.category_create_post);
router.get("/:id", categoryController.category_detail);


module.exports = router;
