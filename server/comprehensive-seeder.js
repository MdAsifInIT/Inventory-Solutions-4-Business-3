const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();

    // Create Users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'Admin'
      },
      {
        name: 'Staff User',
        email: 'staff@test.com',
        password: 'password123',
        role: 'Staff'
      },
      {
        name: 'Customer User',
        email: 'customer@test.com',
        password: 'password123',
        role: 'Customer'
      }
    ];

    await User.create(users);
    console.log('✓ Users created');

    // Create Categories
    const categories = [
      { name: 'Cameras', description: 'Professional cameras and equipment' },
      { name: 'Laptops', description: 'High-performance laptops' },
      { name: 'Audio', description: 'Audio equipment and accessories' },
      { name: 'Lighting', description: 'Professional lighting equipment' }
    ];

    const createdCategories = await Category.create(categories);
    console.log('✓ Categories created');

    // Create Products
    const products = [
      {
        name: 'Canon EOS R5',
        description: 'Professional mirrorless camera with 45MP full-frame sensor',
        category: createdCategories[0]._id,
        pricing: { day: 500, week: 3000, month: 10000 },
        totalStock: 5,
        images: ['https://images.unsplash.com/photo-1606980707216-b6dd5e2a2117?w=400']
      },
      {
        name: 'MacBook Pro 16"',
        description: 'M3 Max chip with 64GB RAM, perfect for video editing',
        category: createdCategories[1]._id,
        pricing: { day: 800, week: 5000, month: 18000 },
        totalStock: 3,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400']
      },
      {
        name: 'Sony A7 III',
        description: 'Full-frame mirrorless camera with excellent low-light performance',
        category: createdCategories[0]._id,
        pricing: { day: 400, week: 2500, month: 8500 },
        totalStock: 8,
        images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400']
      },
      {
        name: 'Rode NTG4+',
        description: 'Professional shotgun microphone with digital switching',
        category: createdCategories[2]._id,
        pricing: { day: 100, week: 600, month: 2000 },
        totalStock: 10,
        images: ['https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400']
      },
      {
        name: 'Aputure 300d II',
        description: 'Powerful LED light with wireless control',
        category: createdCategories[3]._id,
        pricing: { day: 200, week: 1200, month: 4000 },
        totalStock: 6,
        images: ['https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400']
      },
      {
        name: 'DJI Ronin RS3',
        description: 'Professional 3-axis gimbal stabilizer',
        category: createdCategories[0]._id,
        pricing: { day: 300, week: 1800, month: 6000 },
        totalStock: 4,
        images: ['https://images.unsplash.com/photo-1579567761406-4684ee0c75b6?w=400']
      },
      {
        name: 'Shure SM7B',
        description: 'Professional broadcast microphone',
        category: createdCategories[2]._id,
        pricing: { day: 80, week: 500, month: 1800 },
        totalStock: 12,
        images: ['https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=400']
      },
      {
        name: 'Dell XPS 15',
        description: 'Powerful laptop with 4K display',
        category: createdCategories[1]._id,
        pricing: { day: 300, week: 1800, month: 6000 },
        totalStock: 0,
        images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400']
      }
    ];

    await Product.create(products);
    console.log('✓ Products created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin@test.com / password123');
    console.log('Staff: staff@test.com / password123');
    console.log('Customer: customer@test.com / password123');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
};

seedData();
