const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserStatus, makeAdmin } = require('../controllers/miscControllers');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, getAllUsers);
router.patch('/:id/status', protect, adminOnly, updateUserStatus);
router.patch('/:id/make-admin', protect, adminOnly, makeAdmin);

module.exports = router;
