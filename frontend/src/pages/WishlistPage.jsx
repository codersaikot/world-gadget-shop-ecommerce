import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe, toggleWishlist } from '../store/slices/authSlice';
import { addToCart } from '../store/slices/otherSlices';
import { formatCurrency, getProductImage } from '../utils/helpers';
import EmptyState from '../components/common/EmptyState';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  useEffect(() => { if (user) dispatch(fetchMe()); }, [user?._id]);

  const wishlist = user?.wishlist || [];

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-5xl mb-4">❤️</p>
      <h2 className="text-2xl font-bold mb-2">Please Login</h2>
      <p className="text-gray-500 mb-6">Login to view your wishlist</p>
      <Link to="/login" className="btn-primary">Login Now</Link>
    </div>
  );

  if (wishlist.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <EmptyState icon={FiHeart} title="Your wishlist is empty"
        description="Save products you love by clicking the heart icon"
        actionLabel="Explore Products" actionTo="/products" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-display font-bold mb-6">My Wishlist ({wishlist.length})</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlist.map((product) => {
          if (!product?._id) return null;
          const price = product.discountPrice > 0 ? product.discountPrice : product.price;
          return (
            <div key={product._id} className="card overflow-hidden group">
              <Link to={`/products/${product._id}`} className="block aspect-square overflow-hidden bg-gray-50">
                <img src={getProductImage(product)} alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </Link>
              <div className="p-3">
                <Link to={`/products/${product._id}`} className="text-sm font-medium text-gray-800 hover:text-blue-600 line-clamp-2">{product.name}</Link>
                <p className="text-blue-700 font-bold mt-1 text-sm">{formatCurrency(price)}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => dispatch(addToCart({ productId: product._id, quantity: 1 }))}
                    className="flex-1 btn-primary text-xs py-1.5 flex items-center justify-center gap-1">
                    <FiShoppingCart className="text-xs" /> Add to Cart
                  </button>
                  <button onClick={() => dispatch(toggleWishlist(product._id))}
                    className="p-1.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <FiTrash2 className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
