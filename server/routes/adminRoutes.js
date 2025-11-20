const express = require('express');
const { getDashboardStats, getCustomers } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected and admin-only
router.use(protect);
router.use(authorize('Admin', 'Staff'));

router.get('/stats', getDashboardStats);
router.get('/customers', getCustomers);

module.exports = router;
