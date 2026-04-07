const db = require('../config/db');

// ADMIN DASHBOARD
exports.getAdminDashboard = async (req, res) => {
  try {
    const userCount = await new Promise((resolve) => db.query("SELECT COUNT(*) as count FROM users", (err, res) => resolve(res[0].count)));
    const shopCount = await new Promise((resolve) => db.query("SELECT COUNT(*) as count FROM shops", (err, res) => resolve(res[0].count)));
    
    // Total stock
    const stock = await new Promise((resolve) => db.query("SELECT SUM(rice) as totalRice, SUM(wheat) as totalWheat FROM stock", (err, res) => resolve(res[0])));
    
    // Total transactions
    const totalTx = await new Promise((resolve) => db.query("SELECT COUNT(*) as count FROM transactions", (err, res) => resolve(res[0].count)));

    // Recent transactions
    const recentTx = await new Promise((resolve) => db.query("SELECT t.*, u.name as userName, s.name as shopName FROM transactions t LEFT JOIN users u ON t.user_id = u.id LEFT JOIN shops s ON t.shop_id = s.id ORDER BY t.date DESC LIMIT 5", (err, res) => resolve(res)));

    res.json({
      userCount, shopCount, totalRice: stock.totalRice || 0, totalWheat: stock.totalWheat || 0, totalTransactions: totalTx, recentTransactions: recentTx
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

// SHOPKEEPER DASHBOARD
exports.getShopkeeperDashboard = async (req, res) => {
  const shop_id = req.params.shop_id || 1; // defaulting for demo purposes if not tied to user tightly yet

  try {
    const currentStock = await new Promise((resolve) => db.query("SELECT rice, wheat FROM stock WHERE shop_id = ?", [shop_id], (err, res) => resolve(res[0] || {rice: 0, wheat: 0})));
    
    // Daily transactions for this shop
    const dailyTx = await new Promise((resolve) => db.query("SELECT * FROM transactions WHERE shop_id = ? AND DATE(date) = CURDATE()", [shop_id], (err, res) => resolve(res)));

    res.json({
      currentStock,
      dailyTransactions: dailyTx
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

// USER DASHBOARD
exports.getUserDashboard = async (req, res) => {
  const user_id = req.params.user_id;

  try {
    // Get user details
    const user = await new Promise((resolve) => db.query("SELECT * FROM users WHERE id = ?", [user_id], (err, res) => resolve(res[0])));
    if (!user) return res.status(404).send("User not found");

    // Entitlement (Dummy logic: AAY gets 35kg rice, PHH gets 5kg per member)
    let entitlement = { rice: 0, wheat: 0 };
    if (user.ration_category === 'AAY') {
      entitlement = { rice: 35, wheat: 0 };
    } else if (user.ration_category === 'PHH') {
      entitlement = { rice: 5 * user.family_members, wheat: 2 * user.family_members };
    }

    const txHistory = await new Promise((resolve) => db.query("SELECT t.*, s.name as shopName FROM transactions t LEFT JOIN shops s ON t.shop_id = s.id WHERE user_id = ? ORDER BY date DESC", [user_id], (err, res) => resolve(res)));

    res.json({
      user: {
        name: user.name,
        aadhaar: user.aadhaar,
        ration_card_number: user.ration_card_number,
        category: user.ration_category,
        family_members: user.family_members
      },
      entitlement,
      transactionHistory: txHistory
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

// SEARCH USER BY AADHAAR (For Shopkeeper)
exports.searchUserByAadhaar = async (req, res) => {
  const { aadhaar } = req.body;
  try {
    const user = await new Promise((resolve) => db.query("SELECT id, name, aadhaar, ration_card_number, ration_category, family_members FROM users WHERE aadhaar = ?", [aadhaar], (err, res) => resolve(res[0])));
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch(err) {
    res.status(500).send(err);
  }
};

// DISTRIBUTE RATION (For Shopkeeper)
exports.distributeRation = async (req, res) => {
  const { user_id, shop_id, rice, wheat } = req.body;
  try {
    const query = "INSERT INTO transactions (user_id, shop_id, rice, wheat) VALUES (?, ?, ?, ?)";
    await new Promise((resolve, reject) => db.query(query, [user_id, shop_id, rice, wheat], (err, res) => err ? reject(err) : resolve(res)));
    
    // Deduct stock
    await new Promise((resolve, reject) => db.query("UPDATE stock SET rice = rice - ?, wheat = wheat - ? WHERE shop_id = ?", [rice, wheat, shop_id], (err, res) => err ? reject(err) : resolve(res)));
    
    res.send("Ration distributed successfully");
  } catch(err) {
    res.status(500).send(err);
  }
};
