const asyncHandler = require('express-async-handler');
const { Cart, Review, Category, Brand, Coupon, Order } = require('../models/index');
const Product = require('../models/Product');
const User = require('../models/User');

// ─── CART ─────────────────────────────────────────────────────────────────────
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product',
    'name images price discountPrice stock isActive'
  );
  res.json({ success: true, data: cart || { items: [] } });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (product.stock < quantity) {
    res.status(400);
    throw new Error('Insufficient stock');
  }

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [{ product: productId, quantity, price }] });
  } else {
    const existingItem = cart.items.find((item) => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + quantity, product.stock);
      existingItem.price = price;
    } else {
      cart.items.push({ product: productId, quantity, price });
    }
    await cart.save();
  }

  await cart.populate('items.product', 'name images price discountPrice stock');
  res.json({ success: true, message: 'Added to cart', data: cart });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) { res.status(404); throw new Error('Cart not found'); }

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) { res.status(404); throw new Error('Item not in cart'); }

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.product', 'name images price discountPrice stock');
  res.json({ success: true, data: cart });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) { res.status(404); throw new Error('Cart not found'); }
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();
  res.json({ success: true, message: 'Item removed from cart' });
});

const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.json({ success: true, message: 'Cart cleared' });
});

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment } = req.body;

  const product = await Product.findById(productId);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const existingReview = await Review.findOne({ user: req.user._id, product: productId });
  if (existingReview) { res.status(400); throw new Error('You have already reviewed this product'); }

  const review = await Review.create({ user: req.user._id, product: productId, rating, title, comment });

  // Update product rating
  const reviews = await Review.find({ product: productId });
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await Product.findByIdAndUpdate(productId, { rating: avgRating.toFixed(1), numReviews: reviews.length });

  await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, message: 'Review submitted', data: review });
});

const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name avatar')
    .sort('-createdAt');
  res.json({ success: true, data: reviews });
});

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('name');
  res.json({ success: true, data: categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) { res.status(404); throw new Error('Category not found'); }
  res.json({ success: true, data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Category deleted' });
});

// ─── BRANDS ───────────────────────────────────────────────────────────────────
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({ isActive: true }).sort('name');
  res.json({ success: true, data: brands });
});

const createBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.create(req.body);
  res.status(201).json({ success: true, data: brand });
});

const updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!brand) { res.status(404); throw new Error('Brand not found'); }
  res.json({ success: true, data: brand });
});

const deleteBrand = asyncHandler(async (req, res) => {
  await Brand.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Brand deleted' });
});

// ─── COUPONS ──────────────────────────────────────────────────────────────────
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.json({ success: true, data: coupons });
});

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
  res.json({ success: true, data: coupon });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
});

const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon) { res.status(404); throw new Error('Invalid coupon code'); }
  if (coupon.expiresAt < new Date()) { res.status(400); throw new Error('Coupon has expired'); }
  if (orderAmount < coupon.minOrderAmount) {
    res.status(400);
    throw new Error(`Minimum order amount is ৳${coupon.minOrderAmount}`);
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (orderAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
  } else {
    discountAmount = coupon.discountValue;
  }

  res.json({ success: true, data: { coupon, discountAmount } });
});

// ─── USERS (Admin) ────────────────────────────────────────────────────────────
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments();
  const users = await User.find().sort('-createdAt').skip(skip).limit(Number(limit));
  res.json({ success: true, data: { users, total, pages: Math.ceil(total / limit) } });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, data: user });
});

const makeAdmin = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: 'admin' }, { new: true });
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, message: 'User promoted to admin', data: user });
});

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalRevenue, monthRevenue, totalOrders, pendingOrders,
    totalProducts, totalUsers, recentOrders, topProducts
  ] = await Promise.all([
    Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]),
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: 'pending' }),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'user' }),
    Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
    Product.find({ isActive: true }).sort('-sold').limit(5).populate('category', 'name'),
  ]);

  // Monthly revenue chart (last 6 months)
  const monthlySales = await Order.aggregate([
    { $match: { isPaid: true, createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 6)) } } },
    { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    success: true,
    data: {
      totalRevenue: totalRevenue[0]?.total || 0,
      monthRevenue: monthRevenue[0]?.total || 0,
      totalOrders,
      pendingOrders,
      totalProducts,
      totalUsers,
      recentOrders,
      topProducts,
      monthlySales,
    },
  });
});

module.exports = {
  getCart, addToCart, updateCartItem, removeFromCart, clearCart,
  createReview, getProductReviews,
  getCategories, createCategory, updateCategory, deleteCategory,
  getBrands, createBrand, updateBrand, deleteBrand,
  getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon,
  getAllUsers, updateUserStatus, makeAdmin,
  getDashboardStats,
};
