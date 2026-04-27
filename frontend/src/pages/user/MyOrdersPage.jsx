import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../store/slices/otherSlices';
import { formatCurrency, formatDate, getOrderStatusColor } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { FiPackage } from 'react-icons/fi';

export default function MyOrdersPage() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchMyOrders()); }, []);

  if (loading) return <Spinner center />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-display font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <EmptyState icon={FiPackage} title="No orders yet" description="Your orders will appear here after you make a purchase" actionLabel="Start Shopping" actionTo="/products" />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <p className="font-bold text-blue-700">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${getOrderStatusColor(order.orderStatus)} capitalize`}>{order.orderStatus}</span>
                  <Link to={`/orders/${order._id}`} className="text-sm text-blue-600 hover:underline font-medium">Track →</Link>
                </div>
              </div>
              <div className="flex gap-2 mb-3 overflow-x-auto">
                {order.items?.slice(0, 3).map((item, i) => (
                  <img key={i} src={item.image || 'https://placehold.co/50x50?text=P'} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-50 shrink-0" />
                ))}
                {order.items?.length > 3 && (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 shrink-0">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{order.items?.length} item(s) · {order.paymentMethod?.toUpperCase()}</span>
                <span className="font-bold text-gray-800">{formatCurrency(order.totalPrice)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
