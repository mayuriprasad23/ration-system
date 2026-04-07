const db = require('../config/db');

// Helper to promisify db.query
const query = (sql, params = []) => new Promise((resolve, reject) => {
  db.query(sql, params, (err, results) => {
    if (err) reject(err);
    else resolve(results);
  });
});

// ADMIN DASHBOARD
exports.getAdminDashboard = async (req, res) => {
  try {
    const [userRows] = await query("SELECT COUNT(*) as count FROM users");
    const [shopRows] = await query("SELECT COUNT(*) as count FROM shops");
    const [stockRows] = await query("SELECT COALESCE(SUM(rice + wheat), 0) as totalStock, COALESCE(SUM(rice), 0) as totalRice, COALESCE(SUM(wheat), 0) as totalWheat FROM stock");
    const [txRows] = await query("SELECT COUNT(*) as count FROM transactions");
    const [distRows] = await query("SELECT COALESCE(SUM(rice + wheat), 0) as distributed FROM transactions");

    // Low stock alerts (shops where rice < 100 OR wheat < 100)
    const lowStockShops = await query("SELECT s.shop_id, sh.name FROM stock s LEFT JOIN shops sh ON s.shop_id = sh.id WHERE s.rice < 100 OR s.wheat < 100");

    // Recent distributions
    const recentTx = await query("SELECT t.id, u.name as beneficiaryName, u.aadhaar, sh.name as shopName, t.date, t.rice, t.wheat FROM transactions t LEFT JOIN users u ON t.user_id = u.id LEFT JOIN shops sh ON t.shop_id = sh.id ORDER BY t.date DESC LIMIT 10");

    res.json({
      beneficiaryCount: userRows.count,
      shopCount: shopRows.count,
      totalStock: stockRows.totalStock,
      totalRice: stockRows.totalRice,
      totalWheat: stockRows.totalWheat,
      totalTransactions: txRows.count,
      distributedStock: distRows.distributed,
      lowStockAlerts: lowStockShops.length,
      recentDistributions: recentTx
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL BENEFICIARIES
exports.getAllBeneficiaries = async (req, res) => {
  try {
    const users = await query("SELECT id, name, aadhaar, ration_card_number, ration_category, family_members, mobile_number, city, is_verified FROM users WHERE role = 'user'");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL SHOPS
exports.getAllShops = async (req, res) => {
  try {
    const shops = await query("SELECT s.*, st.rice, st.wheat FROM shops s LEFT JOIN stock st ON s.id = st.shop_id");
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD SHOP
exports.addShop = async (req, res) => {
  const { name, location } = req.body;
  try {
    const result = await query("INSERT INTO shops (name, location) VALUES (?, ?)", [name, location]);
    await query("INSERT INTO stock (shop_id, rice, wheat) VALUES (?, 0, 0)", [result.insertId]);
    res.json({ message: "Shop added successfully", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE STOCK
exports.updateStock = async (req, res) => {
  const { shop_id, rice, wheat } = req.body;
  try {
    await query("UPDATE stock SET rice = ?, wheat = ? WHERE shop_id = ?", [rice, wheat, shop_id]);
    res.json({ message: "Stock updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL STOCK
exports.getAllStock = async (req, res) => {
  try {
    const stock = await query("SELECT st.*, sh.name as shopName, sh.location FROM stock st LEFT JOIN shops sh ON st.shop_id = sh.id");
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL TRANSACTIONS (Reports)
exports.getAllTransactions = async (req, res) => {
  try {
    const txs = await query("SELECT t.*, u.name as beneficiaryName, u.aadhaar, sh.name as shopName FROM transactions t LEFT JOIN users u ON t.user_id = u.id LEFT JOIN shops sh ON t.shop_id = sh.id ORDER BY t.date DESC");
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SHOPKEEPER DASHBOARD
exports.getShopkeeperDashboard = async (req, res) => {
  const shop_id = req.params.shop_id || 1;
  try {
    const stockRows = await query("SELECT rice, wheat FROM stock WHERE shop_id = ?", [shop_id]);
    const currentStock = stockRows[0] || { rice: 0, wheat: 0 };
    const dailyTx = await query("SELECT t.*, u.name as userName FROM transactions t LEFT JOIN users u ON t.user_id = u.id WHERE t.shop_id = ? AND DATE(t.date) = CURDATE()", [shop_id]);
    res.json({ currentStock, dailyTransactions: dailyTx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// USER DASHBOARD
exports.getUserDashboard = async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const userRows = await query("SELECT * FROM users WHERE id = ?", [user_id]);
    const user = userRows[0];
    if (!user) return res.status(404).send("User not found");

    let entitlement = { rice: 0, wheat: 0 };
    if (user.ration_category === 'AAY') {
      entitlement = { rice: 35, wheat: 0 };
    } else if (user.ration_category === 'PHH') {
      entitlement = { rice: 5 * (user.family_members || 1), wheat: 2 * (user.family_members || 1) };
    }

    const txHistory = await query("SELECT t.*, s.name as shopName FROM transactions t LEFT JOIN shops s ON t.shop_id = s.id WHERE user_id = ? ORDER BY date DESC", [user_id]);

    res.json({
      user: { name: user.name, aadhaar: user.aadhaar, ration_card_number: user.ration_card_number, category: user.ration_category, family_members: user.family_members },
      entitlement,
      transactionHistory: txHistory
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SEARCH USER BY AADHAAR OR RATION CARD
exports.searchUserByAadhaar = async (req, res) => {
  const { aadhaar, ration_card } = req.body;
  try {
    let rows;
    if (aadhaar) {
      rows = await query("SELECT id, name, aadhaar, ration_card_number, ration_category, family_members FROM users WHERE aadhaar = ?", [aadhaar]);
    } else if (ration_card) {
      rows = await query("SELECT id, name, aadhaar, ration_card_number, ration_category, family_members FROM users WHERE ration_card_number = ?", [ration_card]);
    } else {
      return res.status(400).send("Provide aadhaar or ration_card");
    }
    if (!rows[0]) return res.status(404).send("User not found");
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DISTRIBUTE RATION
exports.distributeRation = async (req, res) => {
  const { user_id, shop_id, rice, wheat } = req.body;
  try {
    await query("INSERT INTO transactions (user_id, shop_id, rice, wheat) VALUES (?, ?, ?, ?)", [user_id, shop_id, rice, wheat]);
    await query("UPDATE stock SET rice = rice - ?, wheat = wheat - ? WHERE shop_id = ?", [rice, wheat, shop_id]);
    res.send("Ration distributed successfully");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
