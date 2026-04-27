import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder } from '../store/slices/otherSlices';
import { formatCurrency, formatDateTime, getOrderStatusColor } from '../utils/helpers';
import Spinner from '../components/common/Spinner';

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrder(id)); }, [id]);

  if (loading) return <Spinner center />;
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found</div>;

  const currentStep = statusSteps.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Order Tracking</h1>
        <span className={`badge text-sm px-3 py-1 ${getOrderStatusColor(order.orderStatus)}`}>
          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
        </span>
      </div>

      <div className="card p-5 mb-6">
        <p className="text-sm text-gray-500 mb-1">Order Number</p>
        <p className="text-xl font-bold text-blue-700">{order.orderNumber}</p>
      </div>

      {/* Progress Tracker */}
      {!isCancelled && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold mb-6">Delivery Status</h2>
          <div className="relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 mx-8">
              <div className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }} />
            </div>
            <div className="relative flex justify-between">
              {statusSteps.map((status, i) => {
                const icons = ['📋', '✅', '⚙️', '🚚', '🎉'];
                const labels = ['Ordered', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
                const done = i <= currentStep;
                return (
                  <div key={status} className="flex flex-col items-center gap-2 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 transition-all ${done ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>
                      {done ? (i < currentStep ? '✓' : icons[i]) : icons[i]}
                    </div>
                    <span className={`text-xs font-medium text-center ${done ? 'text-blue-600' : 'text-gray-400'}`}>{labels[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Status History */}
      <div className="card p-5 mb-6">
        <h2 className="font-semibold mb-4">Status History</h2>
        <div className="space-y-3">
          {order.statusHistory?.slice().reverse().map((h, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <div>
                <p className="font-medium capitalize">{h.status}</p>
                <p className="text-gray-500 text-xs">{h.note}</p>
                <p className="text-gray-400 text-xs">{formatDateTime(h.updatedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="card p-5 mb-6">
        <h2 className="font-semibold mb-4">Order Items</h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <img src={item.image || 'https://placehold.co/50x50?text=P'} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-50" />
              <div className="flex-1"><p className="font-medium">{item.name}</p><p className="text-gray-500">×{item.quantity}</p></div>
              <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-3 flex justify-between font-bold">
          <span>Total</span><span className="text-blue-700">{formatCurrency(order.totalPrice)}</span>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="card p-5">
        <h2 className="font-semibold mb-3">Shipping Address</h2>
        <p className="font-medium">{order.shippingAddress?.fullName}</p>
        <p className="text-sm text-gray-600">{order.shippingAddress?.phone}</p>
        <p className="text-sm text-gray-600">{order.shippingAddress?.street}</p>
        <p className="text-sm text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.district}</p>
      </div>

      <div className="mt-6 text-center">
        <Link to="/my-orders" className="btn-secondary">← All Orders</Link>
      </div>
    </div>
  );
}
