const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", { title: "TuneTrack Inventory" });
});

module.exports = router;
