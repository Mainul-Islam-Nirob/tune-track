const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.argv[2],
});

const categories = [
  { name: "Guitar", description: "A variety of acoustic and electric guitars.", image_url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e" },
  { name: "Drum", description: "Percussion instruments including full drum sets.", image_url: "https://images.unsplash.com/photo-1610595428892-1a099a8b7c27" },
  { name: "Cajon", description: "Box-shaped percussion instruments for rhythm lovers.", image_url: "https://images.unsplash.com/photo-1585238341988-6a8ce33a003f" },
  { name: "Keyboard and Piano", description: "Digital keyboards, grand pianos, and more.", image_url: "https://images.unsplash.com/photo-1544776523-6e1a1b0b87b2" },
  { name: "Ukulele", description: "Compact string instruments for bright tunes.", image_url: "https://images.unsplash.com/photo-1525186402429-b4ff38bedec6" },
  { name: "Violin", description: "Classic violins for all skill levels.", image_url: "https://images.unsplash.com/photo-1519567241046-7c89e1eac6f8" },
  { name: "Accessories", description: "Everything from guitar picks to drum sticks.", image_url: "https://images.unsplash.com/photo-1582735682342-dfefb2631731" },
  { name: "Amplifier", description: "Amplifiers for electric guitars and bass.", image_url: "https://images.unsplash.com/photo-1598387840931-4a8260d2057c" },
  { name: "Traditional Instruments", description: "Explore folk and cultural instruments.", image_url: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Tabla.jpg" }
];

const items = [];

// Generate items for each category
categories.forEach((category, index) => {
  const categoryId = index + 1;
  const numberOfItems = Math.floor(Math.random() * 3) + 8; // 8 to 10 items

  for (let i = 1; i <= numberOfItems; i++) {
    items.push({
      name: `${category.name} Model ${i}`,
      description: `Premium ${category.name.toLowerCase()} Model ${i} with excellent build and sound quality.`,
      brand: ["Yamaha", "Fender", "Casio", "Roland", "Pearl", "Ibanez", "Gibson"][Math.floor(Math.random() * 7)],
      price: (Math.random() * 40000 + 5000).toFixed(2), // Price between 5000 and 45000 Taka
      quantity: Math.floor(Math.random() * 20) + 1,
      category: category.name,
      image_url: category.image_url,
    });
  }
});

(async () => {
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        brand VARCHAR(100),
        price DECIMAL(10, 2),
        quantity INTEGER DEFAULT 0,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        image_url TEXT
      );
    `);

    // Clear existing data
    await pool.query("DELETE FROM items");
    await pool.query("DELETE FROM categories");

    // Insert categories
    const categoryMap = {};
    for (const category of categories) {
      const result = await pool.query(
        `INSERT INTO categories (name, description, image_url) VALUES ($1, $2, $3) RETURNING id`,
        [category.name, category.description, category.image_url]
      );
      categoryMap[category.name] = result.rows[0].id;
    }

    // Insert items
    for (const item of items) {
      await pool.query(
        `INSERT INTO items (name, description, brand, price, quantity, category_id, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          item.name,
          item.description,
          item.brand,
          item.price,
          item.quantity,
          categoryMap[item.category],
          item.image_url
        ]
      );
    }

    console.log("✅ Database created and populated successfully.");
  } catch (err) {
    console.error("❌ Error populating database:", err);
  } finally {
    await pool.end();
  }
})();
