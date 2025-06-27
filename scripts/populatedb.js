const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Dummy data
const categories = [
  {
    name: "Strings",
    description: "Instruments that produce sound from vibrating strings.",
    image_url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d"
  },
  {
    name: "Percussion",
    description: "Rhythmic instruments played by striking.",
    image_url: "https://images.unsplash.com/photo-1606011316812-16741aa45b9c"
  },
  {
    name: "Keyboards",
    description: "Instruments played with a keyboard layout.",
    image_url: "https://images.unsplash.com/photo-1525186402429-b4ff38bedec6"
  }
];

const items = [
  {
    name: "Acoustic Guitar",
    description: "Six-string acoustic guitar with mahogany finish.",
    brand: "Yamaha",
    price: 159.99,
    quantity: 10,
    category: "Strings",
    image_url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e"
  },
  {
    name: "Electric Guitar",
    description: "Dual pickup electric guitar, great for rock.",
    brand: "Fender",
    price: 299.99,
    quantity: 5,
    category: "Strings",
    image_url: "https://images.unsplash.com/photo-1582735682342-dfefb2631731"
  },
  {
    name: "Tabla",
    description: "Classical Indian percussion instrument.",
    brand: "Hiren Roy",
    price: 99.99,
    quantity: 8,
    category: "Percussion",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Tabla.jpg"
  },
  {
    name: "Drum Set",
    description: "Full-size drum kit for professionals.",
    brand: "Pearl",
    price: 549.99,
    quantity: 3,
    category: "Percussion",
    image_url: "https://images.unsplash.com/photo-1610595428892-1a099a8b7c27"
  },
  {
    name: "Digital Piano",
    description: "88-key digital piano with weighted keys.",
    brand: "Casio",
    price: 399.99,
    quantity: 4,
    category: "Keyboards",
    image_url: "https://images.unsplash.com/photo-1544776523-6e1a1b0b87b2"
  },
  {
    name: "MIDI Controller",
    description: "Compact MIDI keyboard for music production.",
    brand: "Akai",
    price: 129.99,
    quantity: 6,
    category: "Keyboards",
    image_url: "https://images.unsplash.com/photo-1583912268182-2386bb8dd2b7"
  }
];

(async () => {
  try {
    // 1. Create categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT
      )
    `);

    // 2. Create items table
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
      )
    `);

    // 3. Clear existing data
    await pool.query("DELETE FROM items");
    await pool.query("DELETE FROM categories");

    // 4. Insert categories and map name to ID
    const categoryMap = {};
    for (const category of categories) {
      const result = await pool.query(
        `INSERT INTO categories (name, description, image_url)
         VALUES ($1, $2, $3) RETURNING id`,
        [category.name, category.description, category.image_url]
      );
      categoryMap[category.name] = result.rows[0].id;
    }

    // 5. Insert items
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

    console.log("✅ Database setup and seeding completed.");
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  } finally {
    await pool.end();
  }
})();
