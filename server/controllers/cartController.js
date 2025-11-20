const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Reservation = require("../models/Reservation");

const normalizeDate = (value) => new Date(value);
const buildKey = (item) =>
  `${item.product}:${normalizeDate(
    item.startDate
  ).toISOString()}:${normalizeDate(item.endDate).toISOString()}`;

const validateLine = async (line) => {
  const product = await Product.findById(line.product);
  if (!product) {
    throw new Error(`Product not found: ${line.product}`);
  }
  if (new Date(line.endDate) <= new Date(line.startDate)) {
    throw new Error("End date must be after start date");
  }
  if (line.quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  const overlappingReservations = await Reservation.find({
    product: line.product,
    status: "Active",
    $or: [
      {
        startDate: { $lt: new Date(line.endDate) },
        endDate: { $gt: new Date(line.startDate) },
      },
    ],
  });

  const reservedQuantity = overlappingReservations.reduce(
    (sum, res) => sum + res.quantity,
    0
  );

  if (product.totalStock - reservedQuantity < line.quantity) {
    throw new Error(`Insufficient stock for ${product.name}`);
  }
};

const mergeItems = async (existingItems, incomingItems, deviceId) => {
  const merged = new Map();

  for (const item of [...existingItems, ...incomingItems]) {
    const key = buildKey(item);
    const current = merged.get(key);
    if (current) {
      current.quantity += item.quantity;
    } else {
      merged.set(key, {
        ...item,
        startDate: normalizeDate(item.startDate),
        endDate: normalizeDate(item.endDate),
        sourceDevice: deviceId || item.sourceDevice,
      });
    }
  }

  const result = Array.from(merged.values());
  for (const line of result) {
    await validateLine(line);
  }
  return result;
};

exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name pricing images"
    );
    res.json({ success: true, data: cart || { items: [] } });
  } catch (error) {
    next(error);
  }
};

exports.mergeCart = async (req, res, next) => {
  try {
    const incomingItems = req.body.items || [];
    const deviceId = req.body.deviceId;
    const cart =
      (await Cart.findOne({ user: req.user._id })) ||
      (await Cart.create({ user: req.user._id, items: [] }));

    cart.items = await mergeItems(cart.items, incomingItems, deviceId);
    await cart.save();

    const populated = await cart.populate(
      "items.product",
      "name pricing images"
    );
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity, startDate, endDate } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }

    if (quantity !== undefined) item.quantity = quantity;
    if (startDate) item.startDate = normalizeDate(startDate);
    if (endDate) item.endDate = normalizeDate(endDate);

    await validateLine(item);

    await cart.save();
    const populated = await cart.populate(
      "items.product",
      "name pricing images"
    );
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.removeItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }

    cart.items.id(itemId)?.deleteOne();
    await cart.save();
    const populated = await cart.populate(
      "items.product",
      "name pricing images"
    );
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }

    cart.items = [];
    await cart.save();
    const populated = await cart.populate(
      "items.product",
      "name pricing images"
    );
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};
