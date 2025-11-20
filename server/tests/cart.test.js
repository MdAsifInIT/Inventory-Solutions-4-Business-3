const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const User = require("../models/User");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Cart = require("../models/Cart");

const createUserAndToken = async () => {
  const user = await User.create({
    name: "Test User",
    email: `user${Date.now()}@example.com`,
    password: "password123",
  });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  return { user, token };
};

const seedProduct = async () => {
  const category = await Category.create({
    name: `Category-${Date.now()}`,
    description: "Test category",
  });

  const product = await Product.create({
    name: `Product-${Date.now()}`,
    sku: `SKU-${Date.now()}`,
    description: "Test product",
    category: category._id,
    totalStock: 10,
    pricing: { day: 100, week: 500, month: 1500 },
  });

  return product;
};

const buildItem = (product, overrides = {}) => {
  const startDate = new Date();
  const endDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  return {
    product: product._id.toString(),
    quantity: 1,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    ...overrides,
  };
};

describe("Cart API", () => {
  it("rejects unauthenticated access", async () => {
    const res = await request(app).get("/api/cart");
    expect(res.status).toBe(401);
  });

  it("merges items and returns aggregated cart", async () => {
    const { token } = await createUserAndToken();
    const product = await seedProduct();

    const payload = {
      deviceId: "device-123",
      items: [buildItem(product), buildItem(product)],
    };

    const mergeRes = await request(app)
      .post("/api/cart/merge")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(mergeRes.status).toBe(200);
    expect(mergeRes.body.success).toBe(true);
    expect(mergeRes.body.data.items).toHaveLength(1);
    expect(mergeRes.body.data.items[0].quantity).toBe(2);

    const getRes = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.items[0].quantity).toBe(2);
  });

  it("updates and removes cart lines", async () => {
    const { token, user } = await createUserAndToken();
    const product = await seedProduct();

    await request(app)
      .post("/api/cart/merge")
      .set("Authorization", `Bearer ${token}`)
      .send({
        deviceId: "device-xyz",
        items: [buildItem(product)],
      });

    const cart = await Cart.findOne({ user: user._id });
    const lineId = cart.items[0]._id.toString();

    const updateRes = await request(app)
      .patch(`/api/cart/items/${lineId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 3 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.items[0].quantity).toBe(3);

    const deleteRes = await request(app)
      .delete(`/api/cart/items/${lineId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.data.items).toHaveLength(0);
  });
});
