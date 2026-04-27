import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../store/slices/otherSlices';
import { formatCurrency, calcCartTotal } from '../utils/helpers';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => { if (user) dispatch(fetchCart()); }, [user]);

  const subtotal = calcCartTotal(items);
  const shipping = subtotal > 1000 ? 0 : 60;
  const total = subtotal + shipping;

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-5xl mb-4">🛒</p>
      <h2 className="text-2xl font-bold mb-2">Please Login</h2>
      <p className="text-gray-500 mb-6">Login to view your cart</p>
      <Link to="/login" className="btn-primary">Login Now</Link>
    </div>
  );

  if (loading) return <Spinner center />;

  if (items.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <EmptyState icon={FiShoppingCart} title="Your cart is empty"
        description="Add some amazing gadgets to your cart and they'll appear here"
        actionLabel="Browse Products" actionTo="/products" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Shopping Cart ({items.length})</h1>
        <button onClick={() => dispatch(clearCart())} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
          <FiTrash2 className="text-xs" /> Clear all
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cart Items */}
        <div className="flex-1 space-y-3">
          {items.map((item) => {
            const p = item.product;
            if (!p) return null;
            return (
              <div key={item._id} className="card p-4 flex gap-4">
                <Link to={`/products/${p._id}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                  <img src={p.images?.[0]?.url || 'https://placehold.co/100x100?text=Product'} alt={p.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${p._id}`} className="font-medium text-gray-800 hover:text-blue-600 line-clamp-2 text-sm">{p.name}</Link>
                  <p className="text-blue-700 font-bold mt-1">{formatCurrency(item.price)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => dispatch(updateCartItem({ productId: p._id, quantity: item.quantity - 1 }))}
                        disabled={item.quantity <= 1} className="p-1.5 hover:bg-gray-50 disabled:opacity-40 text-sm">
                        <FiMinus />
                      </button>
                      <span className="px-3 text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => dispatch(updateCartItem({ productId: p._id, quantity: item.quantity + 1 }))}
                        disabled={item.quantity >= p.stock} className="p-1.5 hover:bg-gray-50 disabled:opacity-40 text-sm">
                        <FiPlus />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-800 text-sm">{formatCurrency(item.price * item.quantity)}</span>
                      <button onClick={() => dispatch(removeFromCart(p._id))} className="text-red-400 hover:text-red-600 p-1">
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:w-72 shrink-0">
          <div className="card p-5 sticky top-24">
            <h2 className="font-display font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({items.length} items)</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                  {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                </span>
              </div>
              {subtotal <= 1000 && subtotal > 0 && (
                <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                  Add {formatCurrency(1000 - subtotal)} more for free shipping!
                </p>
              )}
              <div className="border-t pt-3 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-blue-700">{formatCurrency(total)}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-4">
              Proceed to Checkout →
            </button>
            <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-blue-600 mt-3">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
