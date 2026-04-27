import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiCreditCard, FiTag, FiCheck } from 'react-icons/fi';
import { createOrder } from '../store/slices/otherSlices';
import { clearOrderSuccess } from '../store/slices/otherSlices';
import { formatCurrency, calcCartTotals } from '../utils/helpers';
import { getImageUrl } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
  { id: 'bkash', label: 'bKash', icon: '📱', desc: 'Mobile banking' },
  { id: 'nagad', label: 'Nagad', icon: '📲', desc: 'Digital wallet' },
  { id: 'stripe', label: 'Card / Online', icon: '💳', desc: 'Visa, Mastercard' },
];

const DISTRICTS = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh', 'Comilla', 'Narayanganj'];

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const { loading, success, currentOrder } = useSelector((s) => s.orders);

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: 'Dhaka',
    district: 'Dhaka',
    postalCode: '',
  });

  const { subtotal, shipping } = calcCartTotals(items);
  const discountAmount = couponData?.discountAmount || 0;
  const total = subtotal + shipping - discountAmount;

  useEffect(() => {
    if (success && currentOrder) {
      dispatch(clearOrderSuccess());
      navigate(`/order-success/${currentOrder._id}`);
    }
  }, [success, currentOrder, navigate, dispatch]);

  useEffect(() => {
    // Load default address
    if (user?.addresses?.length > 0) {
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setAddress({ fullName: def.fullName, phone: def.phone, street: def.street, city: def.city, district: def.district, postalCode: def.postalCode || '' });
    }
  }, [user]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await api.post('/coupons/validate', { code: couponCode, orderAmount: subtotal });
      setCouponData(res.data.data);
      toast.success(`Coupon applied! You save ${formatCurrency(res.data.data.discountAmount)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponData(null);
    } finally { setCouponLoading(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address.fullName || !address.phone || !address.street) {
      toast.error('Please fill all required address fields');
      return;
    }
    dispatch(createOrder({ shippingAddress: address, paymentMethod, couponCode: couponCode || undefined }));
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="page-title mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Address + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <FiMapPin className="w-5 h-5 text-blue-600" /> Shipping Address
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input required value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} className="input-field" placeholder="Receiver's full name" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input required value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className="input-field" placeholder="01XXXXXXXXX" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input required value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} className="input-field" placeholder="House, road, area" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <select value={address.district} onChange={(e) => setAddress({ ...address, district: e.target.value })} className="input-field">
                    {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} className="input-field" placeholder="1200" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <FiCreditCard className="w-5 h-5 text-blue-600" /> Payment Method
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === m.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="sr-only" />
                    <span className="text-xl">{m.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{m.label}</div>
                      <div className="text-xs text-gray-500">{m.desc}</div>
                    </div>
                    {paymentMethod === m.id && <FiCheck className="w-4 h-4 text-blue-600 ml-auto" />}
                  </label>
                ))}
              </div>
              {paymentMethod !== 'cod' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  💡 This is a demo. Payment will be mocked for non-COD methods.
                </div>
              )}
            </div>

            {/* Coupon */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiTag className="w-5 h-5 text-blue-600" /> Coupon Code
              </h2>
              <div className="flex gap-3">
                <input
                  type="text" value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponData(null); }}
                  placeholder="Enter coupon code (e.g. WELCOME10)"
                  className="input-field flex-1 font-mono uppercase"
                />
                <button type="button" onClick={applyCoupon} disabled={couponLoading} className="btn-secondary whitespace-nowrap px-5">
                  {couponLoading ? 'Checking...' : 'Apply'}
                </button>
              </div>
              {couponData && (
                <div className="mt-3 flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-4 py-2 text-sm">
                  <FiCheck className="w-4 h-4" />
                  Coupon applied! Saving {formatCurrency(discountAmount)}
                </div>
              )}
            </div>
          </div>

          {/* Right - Order Summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h2 className="font-semibold text-lg text-gray-900 mb-5">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 mb-5">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <img
                      src={getImageUrl(item.product?.images?.[0]?.url)}
                      alt={item.product?.name}
                      className="w-12 h-12 object-contain rounded-lg bg-gray-50 border border-gray-100 p-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 font-medium line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600">FREE</span> : formatCurrency(shipping)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span><span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-blue-700">{formatCurrency(total)}</span>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-5">
                {loading ? 'Placing Order...' : `Place Order • ${formatCurrency(total)}`}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                By placing your order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
