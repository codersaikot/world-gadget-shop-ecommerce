import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiTag,
  FiGift, FiLogOut, FiMenu, FiX, FiChevronRight, FiLayers
} from 'react-icons/fi';
import { MdElectricalServices } from 'react-icons/md';

const navLinks = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, exact: true },
  { to: '/admin/products', label: 'Products', icon: FiPackage },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/categories', label: 'Categories', icon: FiLayers },
  { to: '/admin/brands', label: 'Brands', icon: FiTag },
  { to: '/admin/coupons', label: 'Coupons', icon: FiGift },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const isActive = (to, exact) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const handleLogout = () => { dispatch(logout()); navigate('/'); };

  const Sidebar = () => (
    <aside className="w-60 bg-gray-900 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-2">
          {imageError ? (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MdElectricalServices className="text-white text-lg" />
            </div>
          ) : (
            <img
              src="/wgs-logo.png"
              alt="World Gadget Shop"
              className="h-12 w-auto object-contain rounded-md"
              onError={() => setImageError(true)}
            />
          )}
          <div>
            <p className="text-white font-bold text-sm font-display">World Gadget</p>
            <p className="text-blue-400 text-xs">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navLinks.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive(to, exact)
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Icon className="text-base shrink-0" />
            {label}
            {isActive(to, exact) && <FiChevronRight className="ml-auto text-xs" />}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <Link to="/" className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white text-sm rounded-lg hover:bg-gray-800">
          <FiGrid /> View Store
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 text-sm rounded-lg hover:bg-gray-800 w-full mt-1">
          <FiLogOut /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block"><Sidebar /></div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full"><Sidebar /></div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-14 flex items-center gap-4 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
            <FiMenu className="text-xl" />
          </button>
          <h1 className="font-semibold text-gray-800">
            {navLinks.find(l => isActive(l.to, l.exact))?.label || 'Admin'}
          </h1>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
