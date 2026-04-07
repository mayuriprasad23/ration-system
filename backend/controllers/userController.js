const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// REGISTER
exports.registerUser = async (req, res) => {
  const { name, aadhaar, ration_card_number, password, ration_category, family_members, mobile_number, city } = req.body;

  // Validate Aadhaar (must be 12 digits)
  if (!aadhaar || aadhaar.length !== 12 || !/^\d+$/.test(aadhaar)) {
    return res.status(400).send("Aadhaar must be exactly 12 digits.");
  }

  // Validate Password (min 6 chars)
  if (!password || password.length < 6) {
    return res.status(400).send("Password must be at least 6 characters.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = "user"; // Default role

    const query = `INSERT INTO users (name, aadhaar, password, role, ration_card_number, ration_category, family_members, mobile_number, city)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [name, aadhaar, hashedPassword, role, ration_card_number, ration_category, family_members, mobile_number, city], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).send("Aadhaar is already registered.");
        }
        return res.status(500).send(err);
      }

      res.send("User Registered Successfully ✅");
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

// LOGIN
exports.loginUser = (req, res) => {
  const { aadhaar, password } = req.body;

  const query = `SELECT * FROM users WHERE aadhaar = ?`;

  db.query(query, [aadhaar], async (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name, aadhaar: user.aadhaar, ration_category: user.ration_category }, "secret123", {
      expiresIn: "1h"
    });

    res.json({ message: "Login successful", token, user: { id: user.id, name: user.name, role: user.role, aadhaar: user.aadhaar } });
  });
};

// GET USERS
exports.getUsers = (req, res) => {
  db.query('SELECT * FROM users', (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { aadhaar, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).send("Password must be at least 6 characters.");
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = `UPDATE users SET password = ? WHERE aadhaar = ?`;
    
    db.query(query, [hashedPassword, aadhaar], (err, result) => {
      if (err) return res.status(500).send(err);
      
      if (result.affectedRows === 0) {
        return res.status(404).send("User with this Aadhaar not found");
      }
      res.send("Password reset successfully");
    });
  } catch (err) {
    res.status(500).send(err);
  }
};