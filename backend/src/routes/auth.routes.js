const express = require('express');
const router = express.Router();
const { signup, login, updateProfile, getDemoUser } = require('../controllers/auth.controller');
const { signupSchema } = require('../validators/auth.validator');
const authenticate = require('../middlewares/auth.middleware');

// @route   POST /api/auth/signup
// @desc    Register a new user
router.post('/signup', async (req, res) => {
    const { error } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    return signup(req, res);
});

// @route   POST /api/auth/login
// @desc    Login
router.post('/login', (req, res) => login(req, res));

// @route   PUT /api/auth/profile/:uid
// @desc    Update user profile (Protected: caller can only update their own profile)
router.put('/profile/:uid', authenticate, (req, res) => updateProfile(req, res));

// @route   GET /api/auth/demo-user/:role
// @desc    Get a real user from Firestore for dev testing bypass (Disabled in production)
router.get('/demo-user/:role', (req, res) => getDemoUser(req, res));

module.exports = router;
