import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { addToCart } from '../../store/slices/otherSlices';
import { toggleWishlist } from '../../store/slices/authSlice';
import { formatCurrency, getImageUrl, truncate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const inWishlist = user?.wishlist?.some(
    (id) => (id?._id || id) === product._id
  );

  const discount = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

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

  return (
    <Link to={`/products/${product._id}`} className="product-card card group block overflow-hidden">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <img
          src={getImageUrl(product.images?.[0]?.url)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="badge bg-red-500 text-white text-xs font-bold">-{discount}%</span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-gray-600 text-white text-xs">Out of Stock</span>
          )}
          {product.isFeatured && (
            <span className="badge bg-blue-600 text-white text-xs">Featured</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow transition-all ${
            inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100'
          }`}
        >
          <FiHeart size={14} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        {/* Add to cart overlay */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-sm font-medium py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200 flex items-center justify-center gap-2 disabled:bg-gray-400"
        >
          <FiShoppingCart size={15} />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        {product.brand && (
          <p className="text-xs text-blue-600 font-medium mb-1">{product.brand?.name}</p>
        )}
        <h3 className="text-sm font-semibold text-gray-800 leading-snug mb-1.5 group-hover:text-blue-600 transition-colors">
          {truncate(product.name, 50)}
        </h3>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <FiStar
                  key={s}
                  size={12}
                  className={s <= Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.numReviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-gray-900">
            {formatCurrency(product.discountPrice > 0 ? product.discountPrice : product.price)}
          </span>
          {discount > 0 && (
            <span className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</span>
          )}
        </div>

        {/* Stock */}
        <p className={`text-xs mt-1 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
          {product.stock > 0 ? `${product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}` : 'Out of Stock'}
        </p>
      </div>
    </Link>
  );
}
