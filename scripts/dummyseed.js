const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:yourpassword@localhost:5432/yourdb",
});

const categoryNames = [
  "Strings", "Percussion", "Woodwind", "Brass", "Keyboards",
  "Electronic", "Folk", "Classical", "Modern", "Experimental"
];

const brands = ["Yamaha", "Fender", "Casio", "Roland", "Korg", "Gibson"];
const instrumentTypes = ["Guitar", "Drum", "Violin", "Piano", "Flute", "Trumpet", "Synth", "Harmonium", "Tabla", "Cello"];
const placeholderImg = "https://via.placeholder.com/400x300?text=Instrument";

(async () => {
  try {
    // Clear old data
    await pool.query("DELETE FROM items");
    await pool.query("DELETE FROM categories");

    // Insert categories
    const categoryMap = {};
    for (let name of categoryNames) {
      const description = `${name} instruments category`;
      const result = await pool.query(
        `INSERT INTO categories (name, description, image_url) VALUES ($1, $2, $3) RETURNING id`,
        [name, description, placeholderImg]
      );
      categoryMap[name] = result.rows[0].id;
    }

    // Generate 50 dummy items
    for (let i = 1; i <= 50; i++) {
      const category = categoryNames[i % categoryNames.length];
      const item = {
        name: `${category} ${instrumentTypes[i % instrumentTypes.length]} ${i}`,
        brand: brands[i % brands.length],
        price: (Math.random() * 500 + 50).toFixed(2),
        quantity: Math.floor(Math.random() * 20 + 1),
        description: `This is a ${instrumentTypes[i % instrumentTypes.length]} from ${category} category.`,
        image_url: placeholderImg,
        category_id: categoryMap[category],
      };

      await pool.query(
        `INSERT INTO items (name, brand, price, quantity, description, image_url, category_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          item.name,
          item.brand,
          item.price,
          item.quantity,
          item.description,
          item.image_url,
          item.category_id
        ]
      );
    }

    console.log("✅ Seeded 10 categories and 50 items.");
  } catch (err) {
    console.error("❌ Error seeding data:", err);
  } finally {
    await pool.end();
  }
})();
