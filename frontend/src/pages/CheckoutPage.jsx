import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder, clearOrderSuccess } from '../store/slices/otherSlices';
import { fetchCart } from '../store/slices/otherSlices';
import { formatCurrency, calcCartTotal } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';
import { FiMapPin, FiCreditCard, FiTag } from 'react-icons/fi';

const paymentMethods = [
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
  { id: 'bkash', label: 'bKash', icon: '🟢', desc: 'Mobile banking' },
  { id: 'nagad', label: 'Nagad', icon: '🟠', desc: 'Mobile banking' },
  { id: 'stripe', label: 'Card Payment', icon: '💳', desc: 'Visa/MasterCard' },
];

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const { loading, success, currentOrder } = useSelector((s) => s.orders);
  const { user } = useSelector((s) => s.auth);

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: user?.name || '', phone: user?.phone || '',
    street: '', city: 'Dhaka', district: 'Dhaka', postalCode: '',
  });

  const subtotal = calcCartTotal(items);
  const shipping = subtotal > 1000 ? 0 : 60;
  const discount = couponData?.discountAmount || 0;
  const total = subtotal + shipping - discount;

  useEffect(() => { dispatch(fetchCart()); }, []);

  useEffect(() => {
    if (success && currentOrder) {
      dispatch(clearOrderSuccess());
      navigate(`/order-success/${currentOrder._id}`);
    }
  }, [success, currentOrder]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await api.post('/coupons/validate', { code: couponCode, orderAmount: subtotal });
      setCouponData(res.data.data);
      toast.success(`Coupon applied! Saving ${formatCurrency(res.data.data.discountAmount)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponData(null);
    } finally { setCouponLoading(false); }
  };

  const handlePlaceOrder = () => {
    if (!address.fullName || !address.phone || !address.street || !address.city) {
      toast.error('Please fill in all required address fields');
      return;
    }
    dispatch(createOrder({ shippingAddress: address, paymentMethod, couponCode: couponData ? couponCode : '', }));
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-display font-bold mb-6">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {['Shipping', 'Payment', 'Review'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-medium ${step === i + 1 ? 'text-blue-600' : 'text-gray-400'}`}>{s}</span>
            {i < 2 && <div className={`h-px w-8 ${step > i + 1 ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><FiMapPin /> Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input className="input-field" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input className="input-field" placeholder="01XXXXXXXXX" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input className="input-field" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input className="input-field" placeholder="House, Road, Area" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input className="input-field" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                  <input className="input-field" value={address.district} onChange={(e) => setAddress({ ...address, district: e.target.value })} />
                </div>
              </div>
              <button onClick={() => setStep(2)} className="btn-primary mt-6">Continue to Payment →</button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><FiCreditCard /> Payment Method</h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {paymentMethods.map((pm) => (
                  <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === pm.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <span className="text-2xl">{pm.icon}</span>
                    <p className="font-semibold text-sm mt-1">{pm.label}</p>
                    <p className="text-xs text-gray-500">{pm.desc}</p>
                  </button>
                ))}
              </div>

              {/* Coupon */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"><FiTag /> Coupon Code</label>
                <div className="flex gap-2">
                  <input className="input-field flex-1" placeholder="Enter coupon code" value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                  <button onClick={applyCoupon} disabled={couponLoading} className="btn-primary text-sm px-4">
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {couponData && (
                  <div className="mt-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    ✅ Coupon applied! You save {formatCurrency(couponData.discountAmount)}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">Try: WELCOME10, FLAT500, GADGET20</p>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary">← Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">Review Order →</button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg mb-4">Review Order</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 text-sm">
                    <img src={item.product?.images?.[0]?.url || 'https://placehold.co/60x60?text=P'} alt=""
                      className="w-12 h-12 rounded-lg object-cover bg-gray-50" />
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{item.product?.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 text-sm space-y-1 mb-4">
                <div className="flex justify-between text-gray-500"><span>Delivery to:</span><span className="font-medium text-gray-800">{address.city}, {address.district}</span></div>
                <div className="flex justify-between text-gray-500"><span>Payment:</span><span className="font-medium text-gray-800">{paymentMethods.find((p) => p.id === paymentMethod)?.label}</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary">← Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading ? <><Spinner size="sm" /> Placing Order...</> : 'Place Order 🎉'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:w-72 shrink-0">
          <div className="card p-5 sticky top-24">
            <h3 className="font-display font-bold mb-4">Order Total</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Items ({items.length})</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>}
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Total</span><span className="text-blue-700">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
