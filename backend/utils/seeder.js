const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');
const { Category, Brand, Coupon } = require('../models/index');

const generateSlug = (text) =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .replace(/-{2,}/g, '-');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected for seeding...');
};

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Product.deleteMany({});
  await Category.deleteMany({});
  await Brand.deleteMany({});
  await Coupon.deleteMany({});
  console.log('Cleared existing data');

  // Create Admin
  const admin = await User.create({
    name: 'World Gadget Admin',
    email: process.env.ADMIN_EMAIL || 'admin@worldgadgetshop.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
    role: 'admin',
  });

  // Create sample user
  await User.create({
    name: 'Test User',
    email: 'user@test.com',
    password: 'User@12345',
    role: 'user',
  });

  console.log('Users created');

  // Create Categories
  const categories = await Category.insertMany(
    [
      { name: 'Smartphones', description: 'Latest smartphones and mobile phones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400' },
      { name: 'Laptops', description: 'Laptops and notebooks', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400' },
      { name: 'Headphones', description: 'Headphones, earbuds and audio accessories', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
      { name: 'Smartwatches', description: 'Smartwatches and fitness trackers', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
      { name: 'Tablets', description: 'Tablets and iPads', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400' },
      { name: 'Accessories', description: 'Gadget accessories and peripherals', image: 'https://images.unsplash.com/photo-1625467096740-1f0f06a91e13?w=400' },
    ].map((category) => ({
      ...category,
      slug: generateSlug(category.name),
    }))
  );

  // Create Brands
  const brands = await Brand.insertMany(
    [
      { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
      { name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
      { name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg' },
      { name: 'Xiaomi', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg' },
      { name: 'OnePlus', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/OnePlus_logo.svg/2560px-OnePlus_logo.svg.png' },
      { name: 'Dell', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg' },
    ].map((brand) => ({
      ...brand,
      slug: generateSlug(brand.name),
    }))
  );

  console.log('Categories and brands created');

  // Create Products
  const products = [
    {
      name: 'Samsung Galaxy S24 Ultra',
      description: 'The most powerful Galaxy smartphone ever. With the integrated S Pen, 200MP camera, and Snapdragon 8 Gen 3 processor, this is the ultimate Android flagship.',
      shortDescription: 'Ultimate Android flagship with 200MP camera and S Pen',
      price: 145000,
      discountPrice: 135000,
      stock: 25,
      category: categories[0]._id,
      brand: brands[1]._id,
      images: [
        { url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600' },
        { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600' },
      ],
      rating: 4.8,
      numReviews: 124,
      isFeatured: true,
      specifications: [
        { key: 'Display', value: '6.8" Dynamic AMOLED 2X' },
        { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
        { key: 'RAM', value: '12GB' },
        { key: 'Storage', value: '256GB' },
        { key: 'Battery', value: '5000mAh' },
        { key: 'Camera', value: '200MP + 12MP + 10MP + 10MP' },
      ],
      tags: ['flagship', 'android', '5g', 'spen'],
    },
    {
      name: 'iPhone 15 Pro Max',
      description: 'Apple iPhone 15 Pro Max with A17 Pro chip, titanium design, and the most advanced camera system ever in an iPhone.',
      shortDescription: 'Titanium design with A17 Pro and 5x telephoto camera',
      price: 175000,
      discountPrice: 165000,
      stock: 15,
      category: categories[0]._id,
      brand: brands[0]._id,
      images: [
        { url: 'https://images.unsplash.com/photo-1696446702183-079d84e3f30b?w=600' },
        { url: 'https://images.unsplash.com/photo-1695048133142-1a20484429be?w=600' },
      ],
      rating: 4.9,
      numReviews: 256,
      isFeatured: true,
      specifications: [
        { key: 'Display', value: '6.7" Super Retina XDR' },
        { key: 'Processor', value: 'A17 Pro' },
        { key: 'RAM', value: '8GB' },
        { key: 'Storage', value: '256GB' },
        { key: 'Battery', value: '4422mAh' },
        { key: 'Camera', value: '48MP + 12MP + 12MP' },
      ],
      tags: ['flagship', 'ios', '5g', 'titanium'],
    },
    {
      name: 'MacBook Pro 14" M3',
      description: 'MacBook Pro with M3 chip delivers extraordinary performance for demanding workflows. With a stunning Liquid Retina XDR display.',
      shortDescription: 'M3 chip, Liquid Retina XDR, up to 22hrs battery',
      price: 245000,
      discountPrice: 230000,
      stock: 10,
      category: categories[1]._id,
      brand: brands[0]._id,
      images: [
        { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600' },
        { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600' },
      ],
      rating: 4.9,
      numReviews: 89,
      isFeatured: true,
      specifications: [
        { key: 'Display', value: '14.2" Liquid Retina XDR' },
        { key: 'Processor', value: 'Apple M3' },
        { key: 'RAM', value: '18GB' },
        { key: 'Storage', value: '512GB SSD' },
        { key: 'Battery', value: 'Up to 22 hours' },
      ],
      tags: ['laptop', 'apple', 'professional', 'm3'],
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Industry-leading noise canceling with two processors and eight microphones. 30-hour battery life with quick charge.',
      shortDescription: 'Best-in-class ANC headphones with 30hr battery',
      price: 38000,
      discountPrice: 32000,
      stock: 40,
      category: categories[2]._id,
      brand: brands[2]._id,
      images: [
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
        { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600' },
      ],
      rating: 4.7,
      numReviews: 312,
      isFeatured: true,
      specifications: [
        { key: 'Driver', value: '30mm' },
        { key: 'Frequency', value: '4Hz–40,000Hz' },
        { key: 'Battery', value: '30 hours' },
        { key: 'Connectivity', value: 'Bluetooth 5.2' },
        { key: 'Weight', value: '250g' },
      ],
      tags: ['headphones', 'anc', 'wireless', 'premium'],
    },
    {
      name: 'Apple Watch Series 9',
      description: 'Apple Watch Series 9 with the new S9 chip, brighter display, and innovative double tap gesture.',
      shortDescription: 'S9 chip, double tap gesture, 18hr battery',
      price: 55000,
      discountPrice: 48000,
      stock: 30,
      category: categories[3]._id,
      brand: brands[0]._id,
      images: [
        { url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600' },
      ],
      rating: 4.8,
      numReviews: 178,
      isFeatured: false,
      specifications: [
        { key: 'Display', value: '41mm or 45mm Always-On Retina' },
        { key: 'Chip', value: 'S9 SiP' },
        { key: 'Battery', value: '18 hours' },
        { key: 'Water Resistance', value: '50 meters' },
      ],
      tags: ['smartwatch', 'apple', 'fitness', 'health'],
    },
    {
      name: 'Xiaomi Redmi Note 13 Pro',
      description: 'Xiaomi Redmi Note 13 Pro with 200MP camera, 120Hz AMOLED display, and 67W fast charging at an incredible price.',
      shortDescription: '200MP camera, 120Hz AMOLED, 67W fast charge',
      price: 28000,
      discountPrice: 24000,
      stock: 60,
      category: categories[0]._id,
      brand: brands[3]._id,
      images: [
        { url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600' },
      ],
      rating: 4.5,
      numReviews: 445,
      isFeatured: true,
      specifications: [
        { key: 'Display', value: '6.67" AMOLED 120Hz' },
        { key: 'Processor', value: 'MediaTek Dimensity 7200 Ultra' },
        { key: 'RAM', value: '8GB' },
        { key: 'Storage', value: '256GB' },
        { key: 'Battery', value: '5100mAh + 67W' },
        { key: 'Camera', value: '200MP + 8MP + 2MP' },
      ],
      tags: ['midrange', 'android', '5g', 'value'],
    },
    {
      name: 'Dell XPS 15',
      description: 'Dell XPS 15 with Intel Core i7-13700H, NVIDIA GeForce RTX 4060, and a stunning OLED touchscreen display.',
      shortDescription: 'Intel i7, RTX 4060, 15.6" OLED, professional laptop',
      price: 185000,
      discountPrice: 172000,
      stock: 8,
      category: categories[1]._id,
      brand: brands[5]._id,
      images: [
        { url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600' },
      ],
      rating: 4.6,
      numReviews: 67,
      isFeatured: false,
      specifications: [
        { key: 'Display', value: '15.6" OLED 3.5K Touch' },
        { key: 'Processor', value: 'Intel Core i7-13700H' },
        { key: 'GPU', value: 'NVIDIA RTX 4060 8GB' },
        { key: 'RAM', value: '16GB DDR5' },
        { key: 'Storage', value: '512GB NVMe SSD' },
      ],
      tags: ['laptop', 'dell', 'gaming', 'professional', 'oled'],
    },
    {
      name: 'iPad Pro 12.9" M2',
      description: 'The ultimate iPad experience with the M2 chip, mini-LED Liquid Retina XDR display, and support for Apple Pencil 2.',
      shortDescription: 'M2 chip, mini-LED XDR, 12.9" powerhouse tablet',
      price: 132000,
      discountPrice: 120000,
      stock: 18,
      category: categories[4]._id,
      brand: brands[0]._id,
      images: [
        { url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600' },
      ],
      rating: 4.8,
      numReviews: 93,
      isFeatured: false,
      specifications: [
        { key: 'Display', value: '12.9" Liquid Retina XDR' },
        { key: 'Processor', value: 'Apple M2' },
        { key: 'RAM', value: '8GB' },
        { key: 'Storage', value: '128GB' },
        { key: 'Battery', value: 'Up to 10 hours' },
      ],
      tags: ['tablet', 'apple', 'ipad', 'creative'],
    },
    {
      name: 'Google Pixel 8 Pro',
      description: 'Google Pixel 8 Pro with Tensor G3 chip, advanced AI features, and the best computational photography in a smartphone.',
      shortDescription: 'Tensor G3, AI magic eraser, 6.7" display',
      price: 98000,
      discountPrice: 88000,
      stock: 22,
      category: categories[0]._id,
      brand: brands[3]._id,
      images: [
        { url: 'https://images.unsplash.com/photo-1592286927505-1def25e85d1f?w=600' },
      ],
      rating: 4.7,
      numReviews: 201,
      isFeatured: true,
      specifications: [
        { key: 'Display', value: '6.7" OLED QHD+' },
        { key: 'Processor', value: 'Google Tensor G3' },
        { key: 'RAM', value: '12GB' },
        { key: 'Storage', value: '512GB' },
        { key: 'Battery', value: '5050mAh' },
        { key: 'Camera', value: '50MP + 48MP + 48MP' },
      ],
      tags: ['flagship', 'android', 'ai', 'photography'],
    },
    {
      name: 'OnePlus 12',
      description: 'OnePlus 12 with Snapdragon 8 Gen 3 leading version, 100W SUPERVOOC charging, and fluid Oxygen OS experience.',
      shortDescription: '100W charging, Snapdragon 8 Gen 3, 120Hz fluid display',
      price: 68000,
      discountPrice: 60000,
      stock: 35,
      category: categories[0]._id,
      brand: brands[4]._id,
      images: [
        { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600' },
      ],
      rating: 4.6,
      numReviews: 156,
      isFeatured: false,
      specifications: [
        { key: 'Display', value: '6.7" AMOLED 120Hz' },
        { key: 'Processor', value: 'Snapdragon 8 Gen 3 Leading' },
        { key: 'RAM', value: '12GB' },
        { key: 'Storage', value: '256GB' },
        { key: 'Battery', value: '5400mAh + 100W' },
        { key: 'Camera', value: '50MP + 48MP + 48MP' },
      ],
      tags: ['flagship', 'android', 'fast-charging', 'performance'],
    },
    {
      name: 'ASUS ROG Ally X',
      description: 'ASUS ROG Ally X gaming handheld with custom APU, 24GB RAM, and impressive battery for AAA gaming on the go.',
      shortDescription: 'Gaming handheld, 24GB RAM, Steam Deck competitor',
      price: 75000,
      discountPrice: 68000,
      stock: 12,
      category: categories[1]._id,
      brand: brands[3]._id,
      images: [
        { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600' },
      ],
      rating: 4.5,
      numReviews: 78,
      isFeatured: true,
      specifications: [
        { key: 'Display', value: '7" IPS 1080p' },
        { key: 'Processor', value: 'Custom APU' },
        { key: 'RAM', value: '24GB LPDDR5X' },
        { key: 'Storage', value: '1TB SSD' },
        { key: 'Battery', value: '10100mAh' },
      ],
      tags: ['gaming', 'handheld', 'portable', 'aaa-gaming'],
    },
    {
      name: 'Samsung Galaxy Buds3 Pro',
      description: 'Samsung Galaxy Buds3 Pro with premium ANC, IPX7 water resistance, and seamless Galaxy ecosystem integration.',
      shortDescription: 'Premium ANC earbuds, IPX7 water resistant, Galaxy sync',
      price: 16500,
      discountPrice: 13500,
      stock: 50,
      category: categories[2]._id,
      brand: brands[1]._id,
      images: [
        { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600' },
      ],
      rating: 4.6,
      numReviews: 234,
      isFeatured: false,
      specifications: [
        { key: 'Driver', value: '11mm Woofer + 6.5mm Tweeter' },
        { key: 'ANC', value: 'Active Noise Cancellation' },
        { key: 'Battery', value: '6 hours (26 with case)' },
        { key: 'Water Resistance', value: 'IPX7' },
      ],
      tags: ['earbuds', 'samsung', 'wireless', 'anc'],
    },
    {
      name: 'Canon EOS R6',
      description: 'Canon EOS R6 professional mirrorless camera with 20MP sensor, 4K 60fps video, and professional RF lens ecosystem.',
      shortDescription: '20MP full-frame, 4K 60fps, professional mirrorless',
      price: 285000,
      discountPrice: 265000,
      stock: 5,
      category: categories[5]._id,
      brand: brands[2]._id,
      images: [
        { url: 'https://images.unsplash.com/photo-1600335895917-f47e46e36b58?w=600' },
      ],
      rating: 4.9,
      numReviews: 45,
      isFeatured: true,
      specifications: [
        { key: 'Sensor', value: 'Full-frame 20MP CMOS' },
        { key: 'Video', value: '4K 60fps' },
        { key: 'Shutter Speed', value: '1/8000 sec' },
        { key: 'AF Points', value: '1053' },
        { key: 'Battery', value: 'LP-E6NH' },
      ],
      tags: ['camera', 'professional', 'mirrorless', '4k'],
    },
    {
      name: 'Samsung 4K UHD Monitor 32"',
      description: '32" Samsung UHD monitor with 4K resolution, 144Hz refresh rate, quantum dot technology for professional and gaming use.',
      shortDescription: '32" 4K, 144Hz, Quantum Dot, USB-C',
      price: 78000,
      discountPrice: 69000,
      stock: 8,
      category: categories[5]._id,
      brand: brands[1]._id,
      images: [
        { url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600' },
      ],
      rating: 4.7,
      numReviews: 112,
      isFeatured: false,
      specifications: [
        { key: 'Display', value: '32" VA Quantum Dot' },
        { key: 'Resolution', value: '3840 x 2160 (4K)' },
        { key: 'Refresh Rate', value: '144Hz' },
        { key: 'Response Time', value: '1ms' },
        { key: 'USB-C', value: '90W Power Delivery' },
      ],
      tags: ['monitor', '4k', 'gaming', 'professional', 'usb-c'],
    },
    {
      name: 'Anker PowerCore 26800mAh',
      description: 'Anker PowerCore 26800mAh with dual USB ports, 100W USB-C, and can charge MacBook and multiple devices simultaneously.',
      shortDescription: 'Huge capacity, dual USB + USB-C, 100W output',
      price: 8500,
      discountPrice: 6800,
      stock: 85,
      category: categories[5]._id,
      brand: brands[3]._id,
      images: [
        { url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600' },
      ],
      rating: 4.8,
      numReviews: 567,
      isFeatured: false,
      specifications: [
        { key: 'Capacity', value: '26800mAh (97Wh)' },
        { key: 'Output Ports', value: 'USB-C (100W) + 2x USB-A' },
        { key: 'Weight', value: '550g' },
        { key: 'Features', value: 'LED Display, Multi-Protocol Support' },
      ],
      tags: ['powerbank', 'portable', 'charging', 'travel'],
    },
  ];

  const productsWithSlugs = products.map((product, index) => ({
    ...product,
    slug: product.slug || `${generateSlug(product.name)}-${Date.now()}-${index + 1}`,
  }));

  await Product.insertMany(productsWithSlugs);
  console.log('Products created');

  // Create Coupons
  await Coupon.insertMany([
    {
      code: 'WELCOME10',
      description: '10% off for new users',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 1000,
      maxDiscount: 500,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'FLAT500',
      description: '৳500 off on orders above ৳5000',
      discountType: 'fixed',
      discountValue: 500,
      minOrderAmount: 5000,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'GADGET20',
      description: '20% off on all gadgets',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 2000,
      maxDiscount: 2000,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('📧 Admin: admin@worldgadgetshop.com | Password: Admin@12345');
  console.log('📧 User: user@test.com | Password: User@12345');
  process.exit(0);
};

seedData().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
