const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verification.controller');

router.post('/verify', verificationController.verify);

module.exports = router;
