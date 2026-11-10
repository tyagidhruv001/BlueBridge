const express = require('express');
const router = express.Router();
const { updateWorker, getWorkers, getWorkerHistory, updateWorkerLocation, getWorkerById } = require('../controllers/workers.controller');
const authenticate = require('../middlewares/auth.middleware');
const { requireSelf } = require('../middlewares/ownership.middleware');

// @route   POST /api/workers/:uid
// @desc    Update specific worker data (Protected: worker only)
router.post('/:uid', authenticate, requireSelf('uid'), (req, res) => updateWorker(req, res));

// @route   GET /api/workers/:uid
// @desc    Get detailed worker profile (Public)
router.get('/:uid', (req, res) => getWorkerById(req, res));

// @route   GET /api/workers
// @desc    Smart Matching & AI Recommendation (Public)
router.get('/', (req, res) => getWorkers(req, res));

// @route   GET /api/workers/:uid/history
// @desc    Get worker location history (Protected: self or admin)
router.get('/:uid/history', authenticate, requireSelf('uid'), (req, res) => getWorkerHistory(req, res));

// @route   PATCH /api/workers/:uid/location
// @desc    Update worker's real-time location (Protected: self only)
router.patch('/:uid/location', authenticate, requireSelf('uid'), (req, res) => updateWorkerLocation(req, res));

module.exports = router;
