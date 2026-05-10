import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/otherSlices';
import { toggleWishlist } from '../../store/slices/authSlice';
import { formatCurrency, getProductImage, handleProductImageError } from '../../utils/helpers';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const inWishlist = user?.wishlist?.some(
    (id) => (id?._id || id) === product._id
  );

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to add to cart'); return; }
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to use wishlist'); return; }
    dispatch(toggleWishlist(product._id));
  };

  const hasDiscount = product.discountPrice > 0;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const discount = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Link to={`/products/${product._id}`} className="block">
      <div className="product-card card overflow-hidden group">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="w-full h-full object-cover bg-gray-100 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={handleProductImageError}
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 font-semibold text-sm px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}
          <button
            onClick={handleWishlist}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
              inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100'
            }`}
          >
            <FiHeart className={`text-sm ${inWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          {product.brand && (
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{product.brand?.name}</p>
          )}
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1.5 leading-snug">{product.name}</h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1,2,3,4,5].map((s) => (
                <FiStar key={s} className={`text-xs ${s <= Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
              ))}
            </div>
            <span className="text-xs text-gray-400">({product.numReviews})</span>
          </div>

          {/* Price + Cart */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-blue-700 text-base">{formatCurrency(displayPrice)}</span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through ml-1.5">{formatCurrency(product.price)}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-full flex items-center justify-center transition-colors shrink-0"
            >
              <FiShoppingCart className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
