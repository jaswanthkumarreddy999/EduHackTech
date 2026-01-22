// server/modules/auth/auth.routes.js
const express = require('express');
const router = express.Router();

// Import the functions we just created
const { register, loginWithOtp, checkEmail, sendOtp } = require('./auth.controller');

// Define the routes
router.post('/register', register);
router.post('/login-otp', loginWithOtp);
router.post('/check-email', checkEmail);
router.post('/send-otp', sendOtp);

module.exports = router;