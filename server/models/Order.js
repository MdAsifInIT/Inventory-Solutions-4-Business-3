const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String, // Snapshot
        quantity: Number,
        startDate: Date,
        endDate: Date,
        price: Number // Total price for this item
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        fullName: String,
        addressLine1: String,
        city: String,
        state: String,
        zipCode: String,
        phone: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Shipped', 'Returned', 'Cancelled'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Online'],
        default: 'COD'
    },
    // Payment Details
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String
}, { timestamps: true });

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 }); // Get user orders sorted by date
orderSchema.index({ status: 1 }); // Filter by status

module.exports = mongoose.model('Order', orderSchema);
