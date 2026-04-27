const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/miscControllers');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, getDashboardStats);

module.exports = router;
