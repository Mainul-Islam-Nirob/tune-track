exports.category_list = (req, res) => {
  res.send("NOT IMPLEMENTED: Category list");
};

exports.category_create_get = (req, res) => {
  res.render("categories/form", { title: "Add New Category" });
};

exports.category_create_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Create category POST");
};
