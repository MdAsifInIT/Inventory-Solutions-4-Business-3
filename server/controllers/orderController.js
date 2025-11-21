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

  // Skip transactions for non-replica set MongoDB (development mode)
  const useTransaction = false;
  
  try {

    // 1. Validate Stock & Check Availability
    for (const item of items) {
      const product = await Product.findById(item.product);
        
      if (!product) {
        throw new Error(`Product not found: ${item.name}`);
      }

      // Check for overlapping reservations
      const reservationQuery = {
        product: item.product,
        status: "Active",
        $or: [
          {
            startDate: { $lt: new Date(item.endDate) },
            endDate: { $gt: new Date(item.startDate) },
          },
        ],
      };

      const overlappingReservations = await Reservation.find(reservationQuery);

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

    const createdOrder = await order.save();

    // 3. Create Reservation Records & Inventory Ledger Entries (atomically)
    for (const item of items) {
      // Create reservation
      const reservationData = {
        product: item.product,
        order: createdOrder._id,
        user: req.user._id,
        startDate: item.startDate,
        endDate: item.endDate,
        quantity: item.quantity,
      };

      await Reservation.create(reservationData);

      // Create inventory ledger entry (append-only, negative delta for rental out)
      const ledgerData = {
        product: item.product,
        delta: -item.quantity, // Negative because items are rented out
        reason: "Rental Out",
        referenceType: "Order",
        referenceId: createdOrder._id.toString(),
        timestamp: new Date(),
      };

      await InventoryLedger.create(ledgerData);
    }

    res.status(201).json({ success: true, data: createdOrder });
  } catch (error) {
    next(error);
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

// @desc    Scan order QR code (for pickup/return)
// @route   POST /api/orders/:id/scan
// @access  Private (Admin/Staff only)
exports.scanOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // Only Admin/Staff can scan orders
    if (req.user.role !== "Admin" && req.user.role !== "Staff") {
      return res.status(403).json({ 
        success: false, 
        error: "Only admin/staff can scan orders" 
      });
    }

    // Determine action based on order status
    let message = "";
    let newStatus = order.status;

    switch (order.status.toLowerCase()) {
      case "pending":
      case "confirmed":
        // Mark as picked up
        newStatus = "Active";
        message = `Order picked up by ${order.user.name}`;
        break;
      case "active":
        // Mark as returned
        newStatus = "Completed";
        message = `Order returned by ${order.user.name}`;
        
        // Update reservations to completed
        await Reservation.updateMany(
          { order: order._id },
          { status: "Completed" }
        );
        break;
      case "completed":
        message = "Order already completed";
        break;
      case "cancelled":
        return res.status(400).json({ 
          success: false, 
          error: "Cannot scan cancelled order" 
        });
      default:
        message = "Order scanned successfully";
    }

    // Update order status if changed
    if (newStatus !== order.status) {
      order.status = newStatus;
      await order.save();
    }

    res.json({ 
      success: true, 
      message,
      data: {
        orderId: order._id,
        status: order.status,
        customer: order.user.name,
        items: order.items.length
      }
    });
  } catch (error) {
    next(error);
  }
};

