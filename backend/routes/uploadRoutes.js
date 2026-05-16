const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinary');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/uploadMiddleware');

const CLOUDINARY_FOLDER = 'world-gadget-shop/products';
const UPLOAD_MULTIPLE_PATH = '/api/upload/multiple';

const logUploadFailure = (req, error, extra = {}) => {
  console.error('Upload request failed', {
    path: req.originalUrl || UPLOAD_MULTIPLE_PATH,
    method: req.method,
    origin: req.get('origin') || null,
    hasAuthorizationHeader: Boolean(req.get('authorization')),
    fileCount: Array.isArray(req.files) ? req.files.length : req.file ? 1 : 0,
    fileFieldNames: Array.isArray(req.files)
      ? req.files.map((file) => file.fieldname)
      : req.file
        ? [req.file.fieldname]
        : [],
    errorMessage: error.message,
    errorName: error.name,
    errorCode: error.code || error.http_code || null,
    ...extra,
  });
};

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

const ensureCloudinary = (res) => {
  if (isCloudinaryConfigured()) {
    return true;
  }

  res.status(500).json({
    success: false,
    message: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env.',
  });

  return false;
};

const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });

router.post('/', protect, adminOnly, uploadSingle, handleUploadError, asyncHandler(async (req, res) => {
  if (!ensureCloudinary(res)) {
    return;
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image file using the "image" field.',
    });
  }

  let result;

  try {
    result = await uploadBufferToCloudinary(req.file.buffer);
  } catch (error) {
    logUploadFailure(req, error, { mode: 'single' });
    res.status(502);
    throw new Error('Image upload to Cloudinary failed');
  }

  res.json({
    success: true,
    url: result.secure_url,
    public_id: result.public_id,
  });
}));

router.post('/multiple', protect, adminOnly, uploadMultiple, handleUploadError, asyncHandler(async (req, res) => {
  if (!ensureCloudinary(res)) {
    return;
  }

  if (!req.files?.length) {
    return res.status(400).json({
      success: false,
      message: 'Please upload at least one image file using the "images" field.',
    });
  }

  let images;

  try {
    images = await Promise.all(
      req.files.map(async (file) => {
        const result = await uploadBufferToCloudinary(file.buffer);
        return {
          url: result.secure_url,
          public_id: result.public_id,
        };
      })
    );
  } catch (error) {
    logUploadFailure(req, error, {
      mode: 'multiple',
      expectedFieldName: 'images',
      targetFolder: CLOUDINARY_FOLDER,
    });
    res.status(502);
    throw new Error('One or more images failed to upload');
  }

  res.json({
    success: true,
    images,
  });
}));

module.exports = router;
