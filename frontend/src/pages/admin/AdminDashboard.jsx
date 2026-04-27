import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  FiTrendingUp, FiShoppingBag, FiUsers, FiPackage,
  FiAlertCircle, FiArrowRight
} from 'react-icons/fi';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => {
      setStats(r.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner center />;
  if (!stats) return <div className="text-center py-20 text-gray-500">Failed to load dashboard</div>;

  const chartData = stats.monthlySales?.map(m => ({
    name: MONTH_NAMES[m._id.month - 1],
    revenue: m.revenue,
    orders: m.orders,
  })) || [];

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), sub: `${formatCurrency(stats.monthRevenue)} this month`, icon: FiTrendingUp, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Orders', value: stats.totalOrders, sub: `${stats.pendingOrders} pending`, icon: FiShoppingBag, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Customers', value: stats.totalUsers, sub: 'Registered users', icon: FiUsers, color: 'from-green-500 to-green-600', bg: 'bg-green-50' },
    { label: 'Total Products', value: stats.totalProducts, sub: 'Active products', icon: FiPackage, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">{label}</p>
              <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}>
                <Icon className="text-white text-lg" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue (Last 6 Months)</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `৳${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Orders (Last 6 Months)</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#7c3aed" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Bottom Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <FiArrowRight className="text-xs" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentOrders?.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No orders yet</p>}
            {stats.recentOrders?.map(order => (
              <div key={order._id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-blue-700">{order.orderNumber}</p>
                  <p className="text-gray-400 text-xs">{order.user?.name} · {formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(order.totalPrice)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                    order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{order.orderStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Best Sellers</h3>
            <Link to="/admin/products" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <FiArrowRight className="text-xs" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.topProducts?.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No products yet</p>}
            {stats.topProducts?.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <img src={p.images?.[0]?.url || 'https://placehold.co/40x40?text=P'} alt=""
                  className="w-9 h-9 rounded-lg object-cover bg-gray-50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-1">{p.name}</p>
                  <p className="text-gray-400 text-xs">{p.category?.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold">{formatCurrency(p.price)}</p>
                  <p className="text-gray-400 text-xs">{p.sold} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
