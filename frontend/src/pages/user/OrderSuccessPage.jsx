// ─── OrderSuccessPage ─────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiHome } from 'react-icons/fi';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { StatusBadge } from '../../components/common/index';

export function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data.data)).catch(() => {});
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <FiCheckCircle className="w-10 h-10 text-green-500" />
      </div>
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
      <p className="text-gray-500 mb-6">Thank you for shopping with World Gadget Shop.</p>

      {order && (
        <div className="card p-6 text-left mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="font-bold text-blue-700 text-lg">{order.orderNumber}</p>
            </div>
            <StatusBadge status={order.orderStatus} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-500">Date</p><p className="font-medium">{formatDate(order.createdAt)}</p></div>
            <div><p className="text-gray-500">Payment</p><p className="font-medium capitalize">{order.paymentMethod}</p></div>
            <div><p className="text-gray-500">Items</p><p className="font-medium">{order.items?.length} item(s)</p></div>
            <div><p className="text-gray-500">Total</p><p className="font-bold text-blue-700">{formatCurrency(order.totalPrice)}</p></div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/my-orders" className="btn-primary flex items-center justify-center gap-2">
          <FiPackage className="w-4 h-4" /> Track Order
        </Link>
        <Link to="/" className="btn-secondary flex items-center justify-center gap-2">
          <FiHome className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}
export default OrderSuccessPage;
