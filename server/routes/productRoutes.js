const express = require("express");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect, authorize } = require("../middleware/authMiddleware");
const { check, validationResult } = require("express-validator");

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const productValidation = [
  check("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ max: 100 }),
  check("sku").trim().notEmpty().withMessage("SKU is required"),
  check("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 1000 }),
  check("category").isMongoId().withMessage("Invalid category ID"),
  check("totalStock")
    .isInt({ min: 0 })
    .withMessage("Total stock must be a positive number"),
  check("pricing.day")
    .isFloat({ min: 0 })
    .withMessage("Daily price must be a positive number"),
  check("pricing.week")
    .isFloat({ min: 0 })
    .withMessage("Weekly price must be a positive number"),
  check("pricing.month")
    .isFloat({ min: 0 })
    .withMessage("Monthly price must be a positive number"),
  validate,
];

router
  .route("/")
  .get(getProducts)
  .post(protect, authorize("Admin", "Staff"), productValidation, createProduct);

router
  .route("/:id")
  .get(getProduct)
  .put(protect, authorize("Admin", "Staff"), productValidation, updateProduct)
  .delete(protect, authorize("Admin"), deleteProduct);

module.exports = router;
