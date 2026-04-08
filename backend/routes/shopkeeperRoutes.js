const express = require('express');
const router = express.Router();

const {
  registerShopkeeper,
  loginShopkeeper,
  getAvailableShops
} = require('../controllers/shopkeeperController');

router.post('/register', registerShopkeeper);
router.post('/login', loginShopkeeper);
router.get('/shops', getAvailableShops);

module.exports = router;
