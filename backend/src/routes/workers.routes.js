const express = require('express');
const router = express.Router();
const { updateWorker, getWorkers, getWorkerHistory, updateWorkerLocation } = require('../controllers/workers.controller');

// @route   POST /api/workers/:uid
// @desc    Update specific worker data
router.post('/:uid', (req, res) => updateWorker(req, res));

// @route   GET /api/workers
// @desc    Smart Matching & AI Recommendation
router.get('/', (req, res) => getWorkers(req, res));

// @route   GET /api/workers/:uid/history
// @desc    Get worker location history
router.get('/:uid/history', (req, res) => getWorkerHistory(req, res));

// @route   PATCH /api/workers/:uid/location
// @desc    Update worker's real-time location
router.patch('/:uid/location', (req, res) => updateWorkerLocation(req, res));

module.exports = router;
