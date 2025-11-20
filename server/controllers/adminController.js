const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        // 1. KPI Cards
        const totalRevenue = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const activeRentals = await Order.countDocuments({ 
            status: { $in: ['Confirmed', 'Shipped'] } 
        });

        const totalProducts = await Product.countDocuments();
        
        const lowStockProducts = await Product.countDocuments({ 
            totalStock: { $lt: 5 } 
        });

        // 2. Revenue Chart (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const revenueChart = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    status: { $ne: 'Cancelled' }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 3. Order Status Distribution
        const statusDistribution = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // 4. Top Performing Products
        const topProducts = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    name: { $first: '$items.name' },
                    rentals: { $sum: '$items.quantity' },
                    revenue: { $sum: '$items.price' }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            success: true,
            data: {
                kpi: {
                    revenue: totalRevenue[0]?.total || 0,
                    activeRentals,
                    totalProducts,
                    lowStock: lowStockProducts
                },
                charts: {
                    revenue: revenueChart,
                    status: statusDistribution
                },
                topProducts
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get All Customers
// @route   GET /api/admin/customers
// @access  Private/Admin
exports.getCustomers = async (req, res) => {
    try {
        const customers = await User.find({ role: { $ne: 'Admin' } })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: customers });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
