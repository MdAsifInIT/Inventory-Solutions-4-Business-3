const mongoose = require('mongoose');

const inventoryLedgerSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    delta: {
        type: Number,
        required: [true, 'Please add a quantity change (delta)']
    },
    reason: {
        type: String,
        required: [true, 'Please add a reason for the stock change'],
        enum: ['Initial Stock', 'Purchase', 'Rental Return', 'Rental Out', 'Damage', 'Correction', 'Lost']
    },
    referenceType: {
        type: String,
        enum: ['Order', 'Admin', 'System'],
        default: 'Admin'
    },
    referenceId: {
        type: String // Can be Order ID or User ID
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('InventoryLedger', inventoryLedgerSchema);
