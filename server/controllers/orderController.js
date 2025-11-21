const Order = require("../models/Order");
const Reservation = require("../models/Reservation");
const Product = require("../models/Product");
const InventoryLedger = require("../models/InventoryLedger");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  const { items, shippingAddress, totalAmount, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, error: "No order items" });
  }

  const session = await Order.startSession();

  try {
    session.startTransaction();

    // 1. Validate Stock & Create Reservations
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        throw new Error(`Product not found: ${item.name}`);
      }

      // Check for overlapping reservations
      const overlappingReservations = await Reservation.find({
        product: item.product,
        status: "Active",
        $or: [
          {
            startDate: { $lt: new Date(item.endDate) },
            endDate: { $gt: new Date(item.startDate) },
          },
        ],
      }).session(session);

      const reservedQuantity = overlappingReservations.reduce(
        (acc, res) => acc + res.quantity,
        0
      );
      const availableStock = product.totalStock - reservedQuantity;

      if (availableStock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.name} on selected dates`
        );
      }
    }

    // 2. Create Order
    const order = new Order({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    const createdOrder = await order.save({ session });

    // 3. Create Reservation Records & Inventory Ledger Entries
    for (const item of items) {
      // Create reservation
      await Reservation.create(
        [
          {
            product: item.product,
            order: createdOrder._id,
            user: req.user._id,
            startDate: item.startDate,
            endDate: item.endDate,
            quantity: item.quantity,
          },
        ],
        { session }
      );

      // Create inventory ledger entry (append-only, negative delta for rental out)
      await InventoryLedger.create(
        [
          {
            product: item.product,
            delta: -item.quantity, // Negative because items are rented out
            reason: "Rental Out",
            referenceType: "Order",
            referenceId: createdOrder._id.toString(),
            timestamp: new Date(),
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();

    res.status(201).json({ success: true, data: createdOrder });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (order) {
      // Check if user is owner or admin
      if (
        order.user._id.toString() !== req.user._id.toString() &&
        req.user.role !== "Admin"
      ) {
        return res
          .status(401)
          .json({ success: false, error: "Not authorized" });
      }
      res.json({ success: true, data: order });
    } else {
      res.status(404).json({ success: false, error: "Order not found" });
    }
  } catch (error) {
    next(error);
  }
};
