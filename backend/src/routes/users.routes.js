const express = require('express');
const router = express.Router();
const { saveUser, getUser } = require('../controllers/users.controller');
const authenticate = require('../middlewares/auth.middleware');
const { requireSelf } = require('../middlewares/ownership.middleware');

// @route   POST /api/users
// @desc    Create or Update user profile (Customer & Worker)
router.post('/', authenticate, (req, res) => saveUser(req, res));

// @route   GET /api/users/:uid
// @desc    Get user profile (Protected: user can only access their own profile)
router.get('/:uid', authenticate, requireSelf('uid'), (req, res) => getUser(req, res));

module.exports = router;
