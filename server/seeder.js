const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const seedUsers = async () => {
    try {
        // Clear existing users
        await User.deleteMany();

        const users = [
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: 'Admin'
            },
            {
                name: 'Staff User',
                email: 'staff@example.com',
                password: 'password123',
                role: 'Staff'
            },
            {
                name: 'Regular User',
                email: 'user@example.com',
                password: 'password123',
                role: 'Viewer'
            }
        ];

        await User.create(users);

        console.log('Users Seeded Successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedUsers();
