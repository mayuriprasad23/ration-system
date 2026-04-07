const express = require('express');
const router = express.Router();

const { getAdminDashboard, getShopkeeperDashboard, getUserDashboard, searchUserByAadhaar, distributeRation } = require('../controllers/dashboardController');

router.get('/admin', getAdminDashboard);
router.get('/shopkeeper/:shop_id', getShopkeeperDashboard);
router.get('/user/:user_id', getUserDashboard);

router.post('/shopkeeper/search', searchUserByAadhaar);
router.post('/shopkeeper/distribute', distributeRation);

module.exports = router;
