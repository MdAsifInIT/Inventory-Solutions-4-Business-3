const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getCart,
  mergeCart,
  updateItem,
  removeItem,
  clearCart,
} = require("../controllers/cartController");

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.post("/merge", mergeCart);
router.patch("/items/:itemId", updateItem);
router.delete("/items/:itemId", removeItem);
router.delete("/clear", clearCart);

module.exports = router;
