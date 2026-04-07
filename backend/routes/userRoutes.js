const express = require('express');
const router = express.Router();

const { registerUser, registerAdmin, loginUser, resetPassword } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/register-admin', registerAdmin);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);

module.exports = router;