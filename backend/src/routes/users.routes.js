const express = require('express');
const router = express.Router();
const { saveUser, getUser } = require('../controllers/users.controller');

// @route   POST /api/users
// @desc    Create or Update user profile (Customer & Worker)
router.post('/', (req, res) => saveUser(req, res));

// @route   GET /api/users/:uid
// @desc    Get user profile
router.get('/:uid', (req, res) => getUser(req, res));

module.exports = router;
