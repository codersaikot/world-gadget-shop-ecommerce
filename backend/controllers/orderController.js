const asyncHandler = require('express-async-handler');
const { Order, Cart, Coupon } = require('../models/index');
const Product = require('../models/Product');

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, couponCode, notes } = req.body;

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // Validate stock
  for (const item of cart.items) {
    if (!item.product || item.product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${item.product?.name || 'a product'}`);
    }
  }

  let itemsPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discountAmount = 0;

  // Apply coupon
  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon) {
      if (coupon.expiresAt < new Date()) {
        res.status(400);
        throw new Error('Coupon has expired');
      }
      if (itemsPrice < coupon.minOrderAmount) {
        res.status(400);
        throw new Error(`Minimum order amount is ৳${coupon.minOrderAmount}`);
      }

      if (coupon.discountType === 'percentage') {
        discountAmount = (itemsPrice * coupon.discountValue) / 100;
        if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      } else {
        discountAmount = coupon.discountValue;
      }
    }
  }

  const shippingPrice = itemsPrice > 1000 ? 0 : 60; // Free shipping over ৳1000
  const taxPrice = 0; // No tax for Bangladesh local
  const totalPrice = itemsPrice + shippingPrice + taxPrice - discountAmount;

  // Build order items
  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.images[0]?.url || '',
    price: item.price,
    quantity: item.quantity,
  }));

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountAmount,
    totalPrice,
    coupon: coupon?._id,
    notes,
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
  });

  // Update product stock and sold count
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity, sold: item.quantity },
    });
  }

  // Update coupon usage
  if (coupon) {
    await Coupon.findByIdAndUpdate(coupon._id, {
      $inc: { usedCount: 1 },
      $push: { usedBy: req.user._id },
    });
  }

  // Clear cart
  await Cart.findOneAndDelete({ user: req.user._id });

  await order.populate('user', 'name email');

  res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
});

// @desc    Get my orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const total = await Order.countDocuments({ user: req.user._id });
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit))
    .populate('items.product', 'name images');

  res.json({
    success: true,
    data: { orders, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.product', 'name images slug');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Only allow owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, data: order });
});

// @desc    Update order status (Admin)
// @route   PATCH /api/orders/:id/status
// @access  Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.orderStatus = status;
  order.statusHistory.push({ status, note: note || `Status changed to ${status}` });

  if (status === 'delivered') {
    order.deliveredAt = new Date();
    if (order.paymentMethod === 'cod') {
      order.isPaid = true;
      order.paidAt = new Date();
    }
  }

  await order.save();

  res.json({ success: true, message: 'Order status updated', data: order });
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = status ? { orderStatus: status } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit))
    .populate('user', 'name email')
    .lean();

  res.json({
    success: true,
    data: { orders, total, pages: Math.ceil(total / limit) },
  });
});

module.exports = { createOrder, getMyOrders, getOrder, updateOrderStatus, getAllOrders };
