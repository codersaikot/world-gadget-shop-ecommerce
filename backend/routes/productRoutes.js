const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getFeaturedProducts } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadSingle, handleUploadError } = require('../middleware/uploadMiddleware');

router.get('/featured', getFeaturedProducts);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, adminOnly, uploadSingle, handleUploadError, createProduct);
router.put('/:id', protect, adminOnly, uploadSingle, handleUploadError, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
