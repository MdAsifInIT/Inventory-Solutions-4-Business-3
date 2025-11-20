const express = require('express');
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getCategories)
    .post(protect, authorize('Admin'), createCategory);

module.exports = router;
