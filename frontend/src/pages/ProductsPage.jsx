import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../store/slices/otherSlices';
import ProductCard from '../components/common/ProductCard';
import SkeletonCard from '../components/common/SkeletonCard';
import Pagination from '../components/common/Pagination';
import { FiFilter, FiX, FiSearch, FiSliders } from 'react-icons/fi';
import api from '../utils/api';
import { debounce } from '../utils/helpers';

export default function ProductsPage() {
  const dispatch = useDispatch();
  const { products, pagination, loading } = useSelector((s) => s.products);
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || '-createdAt',
    featured: searchParams.get('featured') || '',
    page: Number(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.data));
    api.get('/brands').then((r) => setBrands(r.data.data));
  }, []);

  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    dispatch(fetchProducts(params));
    setSearchParams(params);
  }, [filters]);

  const handleFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const debouncedSearch = useCallback(
    debounce((val) => handleFilter('search', val), 500),
    []
  );

  const clearFilters = () => setFilters({
    search: '', category: '', brand: '', minPrice: '', maxPrice: '',
    rating: '', sort: '-createdAt', featured: '', page: 1,
  });

  const activeFilterCount = [filters.category, filters.brand, filters.minPrice, filters.maxPrice, filters.rating, filters.featured]
    .filter(Boolean).length;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Category</h3>
        <div className="space-y-1.5">
          <button onClick={() => handleFilter('category', '')}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!filters.category ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
            All Categories
          </button>
          {categories.map((c) => (
            <button key={c._id} onClick={() => handleFilter('category', c._id)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${filters.category === c._id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Brand</h3>
        <div className="space-y-1.5">
          <button onClick={() => handleFilter('brand', '')}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!filters.brand ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
            All Brands
          </button>
          {brands.map((b) => (
            <button key={b._id} onClick={() => handleFilter('brand', b._id)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${filters.brand === b._id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Price Range (৳)</h3>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" className="input-field text-sm" value={filters.minPrice}
            onChange={(e) => handleFilter('minPrice', e.target.value)} />
          <input type="number" placeholder="Max" className="input-field text-sm" value={filters.maxPrice}
            onChange={(e) => handleFilter('maxPrice', e.target.value)} />
        </div>
      </div>

      {/* Min Rating */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Min Rating</h3>
        <div className="space-y-1.5">
          {[0, 4, 3, 2].map((r) => (
            <button key={r} onClick={() => handleFilter('rating', r || '')}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${(filters.rating == r || (!filters.rating && !r)) ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
              {r === 0 ? 'All Ratings' : `${r}★ & above`}
            </button>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="w-full btn-secondary text-sm text-red-600 border-red-200 hover:bg-red-50">
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search products..." className="input-field pl-9"
            defaultValue={filters.search}
            onChange={(e) => debouncedSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors lg:hidden">
            <FiSliders />
            Filters {activeFilterCount > 0 && <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
          </button>
          <select className="input-field text-sm w-auto" value={filters.sort} onChange={(e) => handleFilter('sort', e.target.value)}>
            <option value="-createdAt">Newest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="-rating">Highest Rated</option>
            <option value="-sold">Best Selling</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="w-56 shrink-0 hidden lg:block">
          <div className="card p-4 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2"><FiFilter /> Filters</h2>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Clear</button>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {filterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                <h2 className="font-semibold">Filters</h2>
                <button onClick={() => setFilterOpen(false)}><FiX /></button>
              </div>
              <div className="p-4"><FilterPanel /></div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {loading ? 'Loading...' : `${pagination?.total || 0} products found`}
            </p>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search term</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {pagination && (
            <Pagination
              currentPage={filters.page}
              totalPages={pagination.pages}
              onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
            />
          )}
        </div>
      </div>
    </div>
  );
}
