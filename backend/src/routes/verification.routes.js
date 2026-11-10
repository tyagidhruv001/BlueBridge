const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verification.controller');
const authenticate = require('../middlewares/auth.middleware');

// @route   POST /api/verification/verify
// @desc    Forensic AI ID Verification (Protected)
router.post('/verify', authenticate, verificationController.verify);

module.exports = router;
