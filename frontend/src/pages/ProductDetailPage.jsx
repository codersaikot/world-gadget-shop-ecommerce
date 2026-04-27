import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct } from '../store/slices/otherSlices';
import { addToCart } from '../store/slices/otherSlices';
import { toggleWishlist } from '../store/slices/authSlice';
import { formatCurrency, formatDate, getProductImage } from '../utils/helpers';
import StarRating from '../components/common/StarRating';
import Spinner from '../components/common/Spinner';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiHeart, FiShoppingCart, FiStar, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProduct: product, loading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const inWishlist = user?.wishlist?.some((wid) => (wid?._id || wid) === id);

  useEffect(() => {
    dispatch(fetchProduct(id));
    api.get(`/reviews/${id}`).then((r) => setReviews(r.data.data));
  }, [id]);

  if (loading) return <Spinner center />;
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>;

  const hasDiscount = product.discountPrice > 0;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const discount = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const handleAddToCart = () => {
    if (!user) { toast.error('Please login to add to cart'); return; }
    dispatch(addToCart({ productId: product._id, quantity: qty }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', { productId: id, ...reviewForm });
      setReviews((prev) => [res.data.data, ...prev]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link> /
        <Link to="/products" className="hover:text-blue-600 mx-1">Products</Link> /
        <span className="text-gray-800 ml-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
            <img src={product.images?.[activeImg]?.url || getProductImage(product)} alt={product.name}
              className="w-full h-full object-cover" />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-blue-500' : 'border-transparent'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && <p className="text-blue-600 text-sm font-medium uppercase tracking-wide mb-1">{product.brand.name}</p>}
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating value={product.rating} readOnly />
            <span className="text-gray-500 text-sm">({product.numReviews} reviews)</span>
            <span className="text-sm text-gray-400">|</span>
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-blue-700">{formatCurrency(displayPrice)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatCurrency(product.price)}</span>
                <span className="bg-red-100 text-red-700 text-sm font-semibold px-2 py-0.5 rounded-full">{discount}% OFF</span>
              </>
            )}
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">{product.shortDescription || product.description?.slice(0, 200)}</p>

          {/* Qty + Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-fit">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2.5 hover:bg-gray-50 text-lg font-medium">−</button>
              <span className="px-4 py-2.5 font-semibold min-w-[2.5rem] text-center">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-4 py-2.5 hover:bg-gray-50 text-lg font-medium">+</button>
            </div>
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              <FiShoppingCart /> Add to Cart
            </button>
            <button onClick={() => { if (!user) { toast.error('Login to use wishlist'); return; } dispatch(toggleWishlist(id)); }}
              className={`p-2.5 rounded-lg border transition-colors ${inWishlist ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-300 hover:border-red-300 text-gray-500 hover:text-red-500'}`}>
              <FiHeart className={inWishlist ? 'fill-current' : ''} />
            </button>
          </div>

          {/* Guarantees */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-xl text-xs text-gray-600">
            <div className="flex items-center gap-1.5"><FiTruck className="text-blue-600" /> Free Delivery</div>
            <div className="flex items-center gap-1.5"><FiShield className="text-blue-600" /> Warranty</div>
            <div className="flex items-center gap-1.5"><FiRefreshCw className="text-blue-600" /> Easy Return</div>
          </div>

          {/* Specs */}
          {product.specifications?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Key Specifications</h3>
              <div className="grid grid-cols-2 gap-2">
                {product.specifications.map((spec, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500">{spec.key}</p>
                    <p className="text-sm font-medium text-gray-800">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-display font-bold mb-4">Product Description</h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
      </div>

      {/* Reviews */}
      <div className="card p-6">
        <h2 className="text-xl font-display font-bold mb-6">Customer Reviews</h2>

        {user && (
          <form onSubmit={handleSubmitReview} className="border rounded-xl p-4 mb-8 bg-blue-50/50">
            <h3 className="font-semibold mb-3">Write a Review</h3>
            <div className="mb-3">
              <label className="text-sm text-gray-600 mb-1 block">Your Rating</label>
              <StarRating value={reviewForm.rating} onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
            </div>
            <input type="text" placeholder="Review title (optional)" className="input-field mb-3"
              value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} />
            <textarea rows={3} placeholder="Write your review..." className="input-field mb-3 resize-none" required
              value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} />
            <button type="submit" disabled={submittingReview} className="btn-primary text-sm">
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {rev.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{rev.user?.name}</p>
                      <span className="text-xs text-gray-400">{formatDate(rev.createdAt)}</span>
                    </div>
                    <StarRating value={rev.rating} readOnly size="sm" />
                    {rev.title && <p className="font-medium text-sm mt-1">{rev.title}</p>}
                    <p className="text-gray-600 text-sm mt-1">{rev.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
