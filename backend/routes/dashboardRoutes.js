const express = require('express');
const router = express.Router();

const {
  getAdminDashboard,
  getAllBeneficiaries,
  getAllShops,
  addShop,
  updateStock,
  getAllStock,
  getAllTransactions,
  getShopkeeperDashboard,
  getUserDashboard,
  searchUserByAadhaar,
  distributeRation
} = require('../controllers/dashboardController');

// Admin
router.get('/admin', getAdminDashboard);
router.get('/admin/beneficiaries', getAllBeneficiaries);
router.get('/admin/shops', getAllShops);
router.post('/admin/shops', addShop);
router.get('/admin/stock', getAllStock);
router.post('/admin/stock', updateStock);
router.get('/admin/reports', getAllTransactions);

// Shopkeeper
router.get('/shopkeeper/:shop_id', getShopkeeperDashboard);
router.post('/shopkeeper/search', searchUserByAadhaar);
router.post('/shopkeeper/distribute', distributeRation);

// User
router.get('/user/:user_id', getUserDashboard);

module.exports = router;
