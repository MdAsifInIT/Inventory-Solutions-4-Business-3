const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrderById,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const { check, validationResult } = require("express-validator");

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router
  .route("/")
  .post(
    protect,
    [
      check("items")
        .isArray({ min: 1 })
        .withMessage("Order must have at least one item"),
      check("items.*.product").isMongoId().withMessage("Invalid product ID"),
      check("items.*.quantity")
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1"),
      check("items.*.startDate").isISO8601().withMessage("Invalid start date"),
      check("items.*.endDate").isISO8601().withMessage("Invalid end date"),
      check("shippingAddress.fullName")
        .notEmpty()
        .withMessage("Full name is required"),
      check("shippingAddress.addressLine1")
        .notEmpty()
        .withMessage("Address is required"),
      check("shippingAddress.city").notEmpty().withMessage("City is required"),
      check("shippingAddress.state")
        .notEmpty()
        .withMessage("State is required"),
      check("shippingAddress.zipCode")
        .notEmpty()
        .withMessage("ZIP code is required"),
      check("shippingAddress.phone")
        .notEmpty()
        .withMessage("Phone is required"),
      check("totalAmount")
        .isFloat({ min: 0 })
        .withMessage("Invalid total amount"),
      check("paymentMethod")
        .isIn(["COD", "Online"])
        .withMessage("Invalid payment method"),
      validate,
    ],
    createOrder
  );

router.route("/myorders").get(protect, getMyOrders);

router.route("/:id").get(protect, getOrderById);

module.exports = router;
