const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [100, "Name can not be more than 100 characters"],
    },
    slug: String,
    sku: {
      type: String,
      required: [true, "Please add a SKU"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [1000, "Description can not be more than 1000 characters"],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: true,
    },
    images: {
      type: [String],
      default: [], // Array of image URLs
    },
    totalStock: {
      // Total physical stock (including rented out)
      type: Number,
      required: true,
      default: 0,
    },
    pricing: {
      day: { type: Number, required: true },
      week: { type: Number, required: true },
      month: { type: Number, required: true },
    },
    deposit: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Archived", "Draft"],
      default: "Active",
    },
    isDiscountable: {
      type: Boolean,
      default: true,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create product slug from the name
productSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Cascade delete: delete ledger entries when product is deleted?
// Usually we want to keep ledger, but for now let's just keep it simple.

module.exports = mongoose.model("Product", productSchema);
