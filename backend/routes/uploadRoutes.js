const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinary');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/uploadMiddleware');

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )

const ensureCloudinary = (res) => {
  if (isCloudinaryConfigured()) {
    return true
  }

  res.status(500).json({
    success: false,
    message: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env.',
  })

  return false
}

const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'world-gadget-shop/products',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          return reject(error)
        }

        resolve(result)
      }
    )

    uploadStream.end(buffer)
  })

router.post('/', protect, adminOnly, uploadSingle, handleUploadError, asyncHandler(async (req, res) => {
  if (!ensureCloudinary(res)) {
    return
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image file using the "image" field.',
    })
  }

  const result = await uploadBufferToCloudinary(req.file.buffer)

  res.json({
    success: true,
    url: result.secure_url,
    public_id: result.public_id,
  })
}))

router.post('/multiple', protect, adminOnly, uploadMultiple, handleUploadError, asyncHandler(async (req, res) => {
  if (!ensureCloudinary(res)) {
    return
  }

  if (!req.files?.length) {
    return res.status(400).json({
      success: false,
      message: 'Please upload at least one image file using the "images" field.',
    })
  }

  const images = await Promise.all(
    req.files.map(async (file) => {
      const result = await uploadBufferToCloudinary(file.buffer)
      return {
        url: result.secure_url,
        public_id: result.public_id,
      }
    })
  )

  res.json({
    success: true,
    images,
  })
}))

module.exports = router;
