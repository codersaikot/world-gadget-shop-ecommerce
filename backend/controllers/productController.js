const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    uploadStream.end(buffer);
  });
};

// @desc    Get all products with filters, search, pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    sort = '-createdAt',
    page = 1,
    limit = 12,
    featured,
  } = req.query;

  const query = { isActive: true };

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Category filter
  if (category) query.category = category;

  // Brand filter
  if (brand) query.brand = brand;

  // Price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Rating filter
  if (rating) query.rating = { $gte: Number(rating) };

  // Featured
  if (featured === 'true') query.isFeatured = true;

  const total = await Product.countDocuments(query);
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const products = await Product.find(query)
    .populate('category', 'name slug')
    .populate('brand', 'name logo')
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .lean();

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('brand', 'name logo');

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, data: product });
});

// @desc    Create product
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
  console.log('Create product request received');
  console.log('req.file:', req.file ? 'Present' : 'Not present');
  if (req.file) {
    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? 'Present' : 'Not present'
    });
  }
  console.log('req.body:', req.body);

  let imageUrl = '';
  let publicId = '';

  // Handle file upload if present
  if (req.file) {
    try {
      console.log('Attempting Cloudinary upload...');
      // Upload to Cloudinary using upload_stream for Buffer data
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder: 'world-gadget-shop/products',
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' }
        ]
      });

      imageUrl = result.secure_url;
      publicId = result.public_id;
      console.log('Cloudinary upload successful:', { imageUrl, publicId });
    } catch (error) {
      console.error('Cloudinary upload error details:', {
        message: error.message,
        http_code: error.http_code,
        name: error.name,
        stack: error.stack
      });
      res.status(500);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  // Prepare product data
  const productData = {
    ...req.body,
    images: imageUrl ? [{ url: imageUrl, public_id: publicId }] : [],
  };

  // Parse JSON fields if they come as strings
  if (typeof productData.specifications === 'string') {
    productData.specifications = JSON.parse(productData.specifications);
  }
  if (typeof productData.tags === 'string') {
    productData.tags = productData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  }

  const product = await Product.create(productData);
  await product.populate('category', 'name slug');
  await product.populate('brand', 'name logo');

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
  console.log('Update product request received for ID:', req.params.id);
  console.log('req.file:', req.file ? 'Present' : 'Not present');
  if (req.file) {
    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? 'Present' : 'Not present'
    });
  }
  console.log('req.body:', req.body);

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let imageUrl = '';
  let publicId = '';

  // Handle file upload if present
  if (req.file) {
    try {
      console.log('Attempting Cloudinary upload for update...');
      // Delete old image from Cloudinary if exists
      if (product.images && product.images.length > 0 && product.images[0].public_id) {
        await cloudinary.uploader.destroy(product.images[0].public_id);
      }

      // Upload new image to Cloudinary using upload_stream for Buffer data
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder: 'world-gadget-shop/products',
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' }
        ]
      });

      imageUrl = result.secure_url;
      publicId = result.public_id;
      console.log('Cloudinary upload successful for update:', { imageUrl, publicId });
    } catch (error) {
      console.error('Cloudinary upload error details for update:', {
        message: error.message,
        http_code: error.http_code,
        name: error.name,
        stack: error.stack
      });
      res.status(500);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  // Prepare update data
  const updateData = { ...req.body };

  // Parse JSON fields if they come as strings
  if (typeof updateData.specifications === 'string') {
    updateData.specifications = JSON.parse(updateData.specifications);
  }
  if (typeof updateData.tags === 'string') {
    updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  }

  // Update images if new image was uploaded
  if (imageUrl) {
    updateData.images = [{ url: imageUrl, public_id: publicId }];
  }

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('category', 'name slug')
    .populate('brand', 'name logo');

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: updatedProduct
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Soft delete
  product.isActive = false;
  await product.save();

  res.json({ success: true, message: 'Product deleted successfully' });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate('category', 'name')
    .populate('brand', 'name logo')
    .limit(8)
    .lean();

  res.json({ success: true, data: products });
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getFeaturedProducts };
