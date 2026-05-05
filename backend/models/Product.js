const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: { type: String, unique: true, lowercase: true },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    shortDescription: { type: String, maxlength: 500 },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String },
      },
    ],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    specifications: [
      {
        key: String,
        value: String,
      },
    ],
    tags: [String],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const generateSlug = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .replace(/-{2,}/g, '-');

// Generate slug from name
productSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = `${generateSlug(this.name)}-${Date.now()}`;
  }
  next();
});

productSchema.pre('insertMany', function (next, docs) {
  docs.forEach((doc) => {
    if ((!doc.slug || !doc.slug.toString().trim()) && doc.name) {
      doc.slug = `${generateSlug(doc.name)}-${Date.now()}`;
    }
  });
  next();
});

// Virtual for discount percentage
productSchema.virtual('discountPercent').get(function () {
  if (this.discountPrice && this.price > this.discountPrice) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
