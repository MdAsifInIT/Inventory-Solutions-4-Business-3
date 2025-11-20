const express = require("express");
const {
  register,
  login,
  logout,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/limiter");
const { check, validationResult } = require("express-validator");

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.post(
  "/register",
  [
    authLimiter,
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be 6 or more characters").isLength({
      min: 6,
    }),
    validate,
  ],
  register
);

router.post(
  "/login",
  [
    authLimiter,
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
    validate,
  ],
  login
);

router.get("/logout", logout);
router.get("/me", protect, getMe);

module.exports = router;
