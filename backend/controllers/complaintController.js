const db = require('../config/db');

// Helper to promisify db.query
const query = (sql, params = []) => new Promise((resolve, reject) => {
  db.query(sql, params, (err, results) => {
    if (err) reject(err);
    else resolve(results);
  });
});

// SUBMIT COMPLAINT
exports.submitComplaint = async (req, res) => {
  const { user_id, role, title, description } = req.body;

  if (!title || !description || !user_id || !role) {
    return res.status(400).send("All fields are required.");
  }

  try {
    const insertQuery = `INSERT INTO complaints (user_id, role, title, description) VALUES (?, ?, ?, ?)`;
    await query(insertQuery, [user_id, role, title, description]);
    res.send("Complaint submitted successfully.");
  } catch (err) {
    res.status(500).send("Failed to submit complaint: " + err.message);
  }
};

// GET ALL COMPLAINTS (Admin only)
exports.getComplaints = async (req, res) => {
  try {
    const getQuery = `
      SELECT c.*, u.name as user_name 
      FROM complaints c 
      JOIN users u ON c.user_id = u.id 
      ORDER BY c.created_at DESC
    `;
    const complaints = await query(getQuery);
    res.json(complaints);
  } catch (err) {
    res.status(500).send("Failed to retrieve complaints: " + err.message);
  }
};

// GET USER/SHOPKEEPER COMPLAINTS
exports.getMyComplaints = async (req, res) => {
  const { user_id } = req.params;
  
  try {
    const complaints = await query("SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC", [user_id]);
    res.json(complaints);
  } catch (err) {
    res.status(500).send("Failed to retrieve complaints: " + err.message);
  }
};

// UPDATE COMPLAINT STATUS (Admin)
exports.updateComplaintStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).send("Status is required");

  try {
    await query("UPDATE complaints SET status = ? WHERE id = ?", [status, id]);
    res.send("Complaint status updated successfully.");
  } catch (err) {
    res.status(500).send("Failed to update status: " + err.message);
  }
};
