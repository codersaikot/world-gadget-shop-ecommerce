import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { formatCurrency, formatDate, getOrderStatusColor } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { FiSearch, FiEye } from 'react-icons/fi';

const ALL_STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/orders', { params });
      setOrders(res.data.data.orders);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleUpdateStatus = async () => {
    if (!newStatus || !selectedOrder) return;
    setUpdating(true);
    try {
      await api.patch(`/orders/${selectedOrder._id}/status`, { status: newStatus });
      toast.success('Order status updated!');
      setSelectedOrder(null);
      fetchOrders();
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(false); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{total} total orders</p>
        </div>
        <select className="input-field w-auto text-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {ALL_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="p-8"><Spinner center /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">Order #</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Customer</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Payment</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No orders found</td></tr>
                ) : orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-blue-700">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.user?.name}</p>
                      <p className="text-gray-400 text-xs">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(order.totalPrice)}</td>
                    <td className="px-4 py-3 uppercase text-gray-600">{order.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <span className={`badge capitalize ${getOrderStatusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setSelectedOrder(order); setNewStatus(order.orderStatus); }}
                        className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg text-xs font-medium">
                        <FiEye /> Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
            <span className="text-gray-500">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= pages} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order ${selectedOrder?.orderNumber}`} size="lg">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-xs mb-1">Customer</p>
                <p className="font-medium">{selectedOrder.user?.name}</p>
                <p className="text-gray-600">{selectedOrder.user?.email}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-xs mb-1">Shipping To</p>
                <p className="font-medium">{selectedOrder.shippingAddress?.fullName}</p>
                <p className="text-gray-600">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.district}</p>
                <p className="text-gray-600">{selectedOrder.shippingAddress?.phone}</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 font-medium text-sm">Items ({selectedOrder.items?.length})</div>
              <div className="divide-y">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <img src={item.image || 'https://placehold.co/40x40?text=P'} alt="" className="w-9 h-9 rounded object-cover bg-gray-100" />
                    <p className="flex-1 font-medium line-clamp-1">{item.name}</p>
                    <span className="text-gray-500">×{item.quantity}</span>
                    <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 px-3 py-2 flex justify-between text-sm font-bold">
                <span>Total</span><span className="text-blue-700">{formatCurrency(selectedOrder.totalPrice)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
              <div className="flex gap-2">
                <select className="input-field flex-1" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {ALL_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                <button onClick={handleUpdateStatus} disabled={updating || newStatus === selectedOrder.orderStatus}
                  className="btn-primary text-sm px-4 disabled:opacity-50">
                  {updating ? '...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
