import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiMapPin, FiCreditCard } from 'react-icons/fi';
import { fetchOrder } from '../../store/slices/otherSlices';
import { Spinner, StatusBadge } from '../../components/common/index';
import { formatCurrency, formatDate, getImageUrl } from '../../utils/helpers';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrder(id)); }, [id, dispatch]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found</div>;

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <Link to="/my-orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm transition-colors">
        <FiArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">{order.orderNumber}</h1>
          <p className="text-gray-500 text-sm mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.orderStatus} />
      </div>

      {/* Tracking Timeline */}
      {order.orderStatus !== 'cancelled' && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-6">Order Tracking</h2>
          <div className="relative">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${currentStep === -1 ? 0 : (currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between relative">
              {STATUS_STEPS.map((step, idx) => {
                const done = currentStep >= idx;
                const active = currentStep === idx;
                return (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold z-10 transition-all ${done ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'} ${active ? 'ring-4 ring-blue-100' : ''}`}>
                      {done ? '✓' : idx + 1}
                    </div>
                    <span className={`text-xs mt-2 capitalize font-medium ${done ? 'text-blue-700' : 'text-gray-400'}`}>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {order.statusHistory?.length > 0 && (
            <div className="mt-6 space-y-2">
              {[...order.statusHistory].reverse().map((h, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-gray-400 whitespace-nowrap">{formatDate(h.updatedAt)}</span>
                  <span className="capitalize font-medium text-gray-700">{h.status}</span>
                  {h.note && <span className="text-gray-500">— {h.note}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="card p-6 md:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">Items ({order.items?.length})</h2>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item._id} className="flex gap-4 items-center">
                <img src={getImageUrl(item.image)} alt={item.name} className="w-16 h-16 rounded-xl object-contain bg-gray-50 p-2 border border-gray-100" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                </div>
                <span className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(order.itemsPrice)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : formatCurrency(order.shippingPrice)}</span></div>
            {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(order.discountAmount)}</span></div>}
            <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2"><span>Total</span><span className="text-blue-700">{formatCurrency(order.totalPrice)}</span></div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiMapPin className="w-4 h-4 text-blue-600" /> Shipping Address</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-semibold text-gray-900">{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.phone}</p>
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.district}</p>
          </div>
        </div>

        {/* Payment */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiCreditCard className="w-4 h-4 text-blue-600" /> Payment</h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-medium capitalize">{order.paymentMethod}</span></div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>{order.isPaid ? 'Paid' : 'Pending'}</span>
            </div>
            {order.paidAt && <div className="flex justify-between"><span className="text-gray-500">Paid At</span><span>{formatDate(order.paidAt)}</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
