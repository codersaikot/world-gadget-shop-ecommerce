import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder } from '../store/slices/otherSlices';
import { formatCurrency, formatDate } from '../utils/helpers';
import Spinner from '../components/common/Spinner';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrder(id)); }, [id]);

  if (loading) return <Spinner center />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-4xl">✅</span>
      </div>
      <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
      <p className="text-gray-500 mb-1">Thank you for your purchase.</p>
      {order && <p className="text-sm font-medium text-blue-600 mb-6">Order #{order.orderNumber}</p>}

      {order && (
        <div className="card p-5 text-left mb-6">
          <h3 className="font-semibold mb-3">Order Details</h3>
          <div className="space-y-2 mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <img src={item.image || 'https://placehold.co/50x50?text=P'} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-50" />
                <div className="flex-1"><p className="font-medium">{item.name}</p><p className="text-gray-500">×{item.quantity}</p></div>
                <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Payment Method:</span><span className="font-medium uppercase">{order.paymentMethod}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Order Date:</span><span className="font-medium">{formatDate(order.createdAt)}</span></div>
            <div className="flex justify-between font-bold mt-2 text-base"><span>Total Paid</span><span className="text-blue-700">{formatCurrency(order.totalPrice)}</span></div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to={`/orders/${id}`} className="btn-primary">Track My Order</Link>
        <Link to="/products" className="btn-secondary">Continue Shopping</Link>
      </div>
    </div>
  );
}
