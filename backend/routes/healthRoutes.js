/**
 * Health Routes
 */

const express = require('express');
const router = express.Router();
const { getHealth, getPublicStats } = require('../controllers/healthController');

router.get('/', getHealth);
router.get('/stats', getPublicStats);

module.exports = router;

