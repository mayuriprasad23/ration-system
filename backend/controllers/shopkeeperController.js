const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper to promisify db.query
const query = (sql, params = []) => new Promise((resolve, reject) => {
  db.query(sql, params, (err, results) => {
    if (err) reject(err);
    else resolve(results);
  });
});

// REGISTER SHOPKEEPER
exports.registerShopkeeper = async (req, res) => {
  const { name, aadhaar, password, shop_id } = req.body;

  if (!aadhaar || aadhaar.length !== 12 || !/^\d+$/.test(aadhaar)) {
    return res.status(400).send("Aadhaar must be exactly 12 digits.");
  }
  if (!password || password.length < 6) {
    return res.status(400).send("Password must be at least 6 characters.");
  }
  if (!name) {
    return res.status(400).send("Name is required.");
  }

  try {
    // If shop_id provided, verify the shop exists
    let assignedShopId = shop_id;
    if (shop_id) {
      const shopRows = await query("SELECT id FROM shops WHERE id = ?", [shop_id]);
      if (shopRows.length === 0) {
        return res.status(400).send("Shop not found. Please enter a valid Shop ID.");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `INSERT INTO users (name, aadhaar, password, role, shop_id) VALUES (?, ?, ?, 'shopkeeper', ?)`;

    db.query(insertQuery, [name, aadhaar, hashedPassword, assignedShopId || null], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).send("Aadhaar is already registered.");
        }
        return res.status(500).send("Registration failed: " + err.message);
      }
      res.send("Shopkeeper Registered Successfully ✅");
    });
  } catch (err) {
    res.status(500).send("Registration failed: " + err.message);
  }
};

// SHOPKEEPER LOGIN
exports.loginShopkeeper = async (req, res) => {
  const { aadhaar, password } = req.body;

  try {
    const rows = await query("SELECT * FROM users WHERE aadhaar = ? AND role = 'shopkeeper'", [aadhaar]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Shopkeeper not found. Make sure you are registered as a shopkeeper." });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, aadhaar: user.aadhaar, shop_id: user.shop_id },
      "secret123",
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        aadhaar: user.aadhaar,
        shop_id: user.shop_id
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// GET AVAILABLE SHOPS (for shopkeeper registration)
exports.getAvailableShops = async (req, res) => {
  try {
    const shops = await query("SELECT id, name, location FROM shops");
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
