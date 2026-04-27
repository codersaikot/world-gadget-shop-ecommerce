import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { removeFromCart, updateCartItem } from '../store/slices/otherSlices';
import { EmptyState, PriceDisplay } from '../components/common/index';
import { formatCurrency, calcCartTotals, getImageUrl } from '../utils/helpers';

export default function CartPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.cart);
  const { subtotal, shipping, total } = calcCartTotals(items);

  const updateQty = (productId, qty) => {
    if (qty === 0) dispatch(removeFromCart(productId));
    else dispatch(updateCartItem({ productId, quantity: qty }));
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="page-title mb-8">Shopping Cart</h1>
        <EmptyState icon="🛒" title="Your cart is empty" description="Add some amazing gadgets to get started!" action={{ to: '/products', label: 'Start Shopping' }} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="page-title mb-8">Shopping Cart <span className="text-gray-400 font-normal text-xl">({items.length} items)</span></h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            return (
              <div key={item._id} className="card p-4 flex gap-4 animate-fade-in">
                <Link to={`/products/${product._id}`} className="flex-shrink-0">
                  <img
                    src={getImageUrl(product.images?.[0]?.url)}
                    alt={product.name}
                    className="w-24 h-24 object-contain rounded-xl bg-gray-50 p-2"
                    onError={(e) => { e.target.src = 'https://placehold.co/100x100/e2e8f0/94a3b8?text=IMG'; }}
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/products/${product._id}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 text-sm">
                    {product.name}
                  </Link>

                  <div className="mt-2">
                    <PriceDisplay price={product.price} discountPrice={product.discountPrice} size="sm" />
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQty(product._id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <FiMinus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQty(product._id, item.quantity + 1)} disabled={item.quantity >= product.stock} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-40">
                        <FiPlus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                      <button onClick={() => dispatch(removeFromCart(product._id))} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-lg text-gray-900 mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : formatCurrency(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">Free shipping on orders over ৳1,000</p>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-blue-700">{formatCurrency(total)}</span>
              </div>
            </div>

            <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 mt-6 py-3">
              Proceed to Checkout <FiArrowRight className="w-4 h-4" />
            </Link>

            <Link to="/products" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 mt-4 transition-colors">
              <FiShoppingBag className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
