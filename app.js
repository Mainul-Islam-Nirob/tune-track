const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const indexRoutes = require("./routes/index");
const categoryRoutes = require("./routes/categories");
// const itemRoutes = require("./routes/items");


dotenv.config();
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRoutes);
app.use("/categories", categoryRoutes);
// app.use("/items", itemRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TuneTrack running on http://localhost:${PORT}`);
});
