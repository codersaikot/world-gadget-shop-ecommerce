import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMe, toggleWishlist } from '../../store/slices/authSlice';
import { addToCart } from '../../store/slices/otherSlices';
import { EmptyState, Spinner, PriceDisplay } from '../../components/common/index';
import { getImageUrl, truncate } from '../../utils/helpers';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchMe()).finally(() => setLoading(false));
  }, [dispatch]);

  const wishlistItems = user?.wishlist || [];

  const handleRemove = (productId) => dispatch(toggleWishlist(productId));

  const handleAddToCart = (product) => {
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="page-title mb-8">My Wishlist <span className="text-gray-400 font-normal text-xl">({wishlistItems.length})</span></h1>

      {wishlistItems.length === 0 ? (
        <EmptyState icon="❤️" title="Your wishlist is empty" description="Save products you love and find them here later." action={{ to: '/products', label: 'Browse Products' }} />
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlistItems.map((product) => {
            if (!product?._id) return null;
            return (
              <div key={product._id} className="card overflow-hidden product-card">
                <div
                  className="aspect-square bg-gray-50 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  <img
                    src={getImageUrl(product.images?.[0]?.url)}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = 'https://placehold.co/300x300/e2e8f0/94a3b8?text=No+Image'; }}
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">{truncate(product.name, 50)}</p>
                  <PriceDisplay price={product.price} discountPrice={product.discountPrice} size="sm" />
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleAddToCart(product)} className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                      <FiShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                    <button onClick={() => handleRemove(product._id)} className="p-2 border border-gray-200 hover:border-red-300 hover:text-red-500 rounded-lg transition-all text-gray-400">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
