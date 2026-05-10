import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { fetchCart } from '../../store/slices/otherSlices';
import { calcCartCount, debounce } from '../../utils/helpers';
import {
  FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX,
  FiLogOut, FiPackage, FiSettings, FiGrid, FiChevronDown
} from 'react-icons/fi';
import { MdElectricalServices } from 'react-icons/md';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.cart);
  const cartCount = calcCartCount(items);

  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) dispatch(fetchCart());
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleSearch = debounce((val) => {
    if (val.trim()) navigate(`/products?search=${encodeURIComponent(val.trim())}`);
  }, 500);

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white border-b border-gray-100'}`}>
      {/* Top bar */}
      <div className="bg-blue-700 text-white text-xs text-center py-1.5 hidden sm:block">
        🎉 Free shipping on orders above ৳1,000 &nbsp;|&nbsp; Use code <strong>WELCOME10</strong> for 10% off!
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            {imageError ? (
              <>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MdElectricalServices className="text-white text-lg" />
                </div>
                <span className="font-display font-bold text-gray-900 text-lg leading-tight hidden sm:block">
                  World<br className="hidden" /><span className="text-blue-600">Gadget</span>
                </span>
              </>
            ) : (
              <img
                src="/logo.png"
                alt="World Gadget Shop"
                className="h-16 w-auto object-contain"
                onError={() => setImageError(true)}
              />
            )}
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search gadgets, brands..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                value={search}
                onChange={(e) => { setSearch(e.target.value); handleSearch(e.target.value); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && search.trim()) {
                    navigate(`/products?search=${encodeURIComponent(search.trim())}`);
                  }
                }}
              />
            </div>
          </div>

          {/* Desktop Nav Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/wishlist" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FiHeart className="text-xl text-gray-600" />
              {user?.wishlist?.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {user.wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FiShoppingCart className="text-xl text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-full pl-2 pr-3 py-1.5 transition-colors"
                >
                  <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
                  <FiChevronDown className={`text-gray-400 text-xs transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in z-50">
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium">
                        <FiGrid /> Admin Panel
                      </Link>
                    )}
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <FiUser /> My Profile
                    </Link>
                    <Link to="/my-orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <FiPackage /> My Orders
                    </Link>
                    <hr className="my-1" />
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                      <FiLogOut /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600 px-3 py-2">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden ml-auto">
            <Link to="/cart" className="relative p-2">
              <FiShoppingCart className="text-xl text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
              {menuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Category nav */}
        <nav className="hidden md:flex items-center gap-6 pb-2 text-sm font-medium text-gray-600">
          <Link to="/products" className="hover:text-blue-600 transition-colors">All Products</Link>
          <Link to="/products?category=smartphones" className="hover:text-blue-600 transition-colors">Smartphones</Link>
          <Link to="/products?category=laptops" className="hover:text-blue-600 transition-colors">Laptops</Link>
          <Link to="/products?category=headphones" className="hover:text-blue-600 transition-colors">Headphones</Link>
          <Link to="/products?category=smartwatches" className="hover:text-blue-600 transition-colors">Smartwatches</Link>
          <Link to="/products?category=tablets" className="hover:text-blue-600 transition-colors">Tablets</Link>
          <Link to="/products?featured=true" className="text-orange-500 hover:text-orange-600 transition-colors">🔥 Featured</Link>
        </nav>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            {user ? (
              <>
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-2">
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-blue-600 bg-blue-50 font-medium text-sm">
                    <FiGrid /> Admin Panel
                  </Link>
                )}
                <Link to="/profile" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm"><FiUser /> Profile</Link>
                <Link to="/my-orders" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm"><FiPackage /> My Orders</Link>
                <Link to="/wishlist" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm"><FiHeart /> Wishlist</Link>
                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 text-sm w-full">
                  <FiLogOut /> Logout
                </button>
              </>
            ) : (
              <div className="flex gap-3 py-2">
                <Link to="/login" className="flex-1 btn-secondary text-center text-sm py-2">Login</Link>
                <Link to="/register" className="flex-1 btn-primary text-center text-sm py-2">Sign Up</Link>
              </div>
            )}
            <hr className="my-2" />
            <Link to="/products" className="block px-3 py-2 text-sm hover:bg-gray-50 rounded-lg">All Products</Link>
            <Link to="/products?category=smartphones" className="block px-3 py-2 text-sm hover:bg-gray-50 rounded-lg">Smartphones</Link>
            <Link to="/products?category=laptops" className="block px-3 py-2 text-sm hover:bg-gray-50 rounded-lg">Laptops</Link>
            <Link to="/products?category=headphones" className="block px-3 py-2 text-sm hover:bg-gray-50 rounded-lg">Headphones</Link>
          </div>
        </div>
      )}
    </header>
  );
}
