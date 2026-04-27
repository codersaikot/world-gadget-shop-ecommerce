import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedProducts } from '../store/slices/otherSlices';
import ProductCard from '../components/common/ProductCard';
import SkeletonCard from '../components/common/SkeletonCard';
import { FiArrowRight, FiShield, FiTruck, FiRefreshCw, FiHeadphones } from 'react-icons/fi';

const categories = [
  { name: 'Smartphones', icon: '📱', slug: 'smartphones', bg: 'from-blue-500 to-blue-700' },
  { name: 'Laptops', icon: '💻', slug: 'laptops', bg: 'from-purple-500 to-purple-700' },
  { name: 'Headphones', icon: '🎧', slug: 'headphones', bg: 'from-pink-500 to-rose-600' },
  { name: 'Smartwatches', icon: '⌚', slug: 'smartwatches', bg: 'from-green-500 to-emerald-600' },
  { name: 'Tablets', icon: '📱', slug: 'tablets', bg: 'from-orange-500 to-amber-600' },
  { name: 'Accessories', icon: '🔌', slug: 'accessories', bg: 'from-teal-500 to-cyan-600' },
];

const features = [
  { icon: FiTruck, title: 'Free Delivery', desc: 'On orders above ৳1,000' },
  { icon: FiShield, title: 'Warranty', desc: 'Official warranty on all products' },
  { icon: FiRefreshCw, title: 'Easy Returns', desc: '7-day hassle-free return' },
  { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated customer support' },
];

export default function HomePage() {
  const dispatch = useDispatch();
  const { featured, loading } = useSelector((s) => s.products);

  useEffect(() => { dispatch(fetchFeaturedProducts()); }, [dispatch]);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block bg-blue-700/60 border border-blue-500/40 text-blue-200 text-sm px-4 py-1.5 rounded-full mb-4">
              🇧🇩 Bangladesh's #1 Gadget Store
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-4">
              World<br /><span className="text-blue-300">Gadget</span> Shop
            </h1>
            <p className="text-blue-100 text-lg mb-8 max-w-lg">
              Discover the latest smartphones, laptops, headphones & accessories at unbeatable prices with genuine warranty.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link to="/products" className="bg-white text-blue-800 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors inline-flex items-center gap-2">
                Shop Now <FiArrowRight />
              </Link>
              <Link to="/products?featured=true" className="border border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
                🔥 Featured Deals
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500" alt="Gadgets"
              className="w-72 sm:w-80 rounded-3xl shadow-2xl object-cover aspect-square" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="text-blue-600 text-lg" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-gray-900">Shop by Category</h2>
          <Link to="/products" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
            View all <FiArrowRight className="text-xs" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link key={cat.slug} to={`/products?categoryName=${cat.slug}`}
              className={`bg-gradient-to-br ${cat.bg} rounded-2xl p-4 text-white text-center hover:scale-105 transition-transform duration-200 shadow-sm`}>
              <div className="text-3xl mb-2">{cat.icon}</div>
              <p className="text-xs font-semibold leading-tight">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900">🔥 Featured Products</h2>
            <p className="text-gray-500 text-sm mt-0.5">Handpicked best deals for you</p>
          </div>
          <Link to="/products?featured=true" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
            View all <FiArrowRight className="text-xs" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : featured.map((p) => <ProductCard key={p._id} product={p} />)
          }
        </div>
      </section>

      {/* Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-gradient-to-r from-orange-500 to-rose-600 rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">Special Offer! 🎉</h2>
            <p className="text-orange-100 mb-4">Use code <strong className="bg-white/20 px-2 py-0.5 rounded">GADGET20</strong> for 20% off all gadgets</p>
            <Link to="/products" className="inline-block bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors">
              Shop Now →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
