import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency, PRODUCT_IMAGE_FALLBACK, handleProductImageError } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiStar } from 'react-icons/fi';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, _t: Date.now() };
      if (search) params.search = search;
      const res = await api.get('/products', {
        params,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const toggleFeatured = async (product) => {
    try {
      await api.put(`/products/${product._id}`, { isFeatured: !product.isFeatured });
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isFeatured: !p.isFeatured } : p));
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">{pagination?.total || 0} total products</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2 w-fit">
          <FiPlus /> Add Product
        </Link>
      </div>

      <div className="card mb-4">
        <div className="p-4 border-b">
          <div className="relative max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search products..." className="input-field pl-9 text-sm"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        {loading ? <div className="p-8"><Spinner center /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">Product</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Price</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Stock</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Rating</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Featured</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No products found</td></tr>
                ) : products.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0]?.url || PRODUCT_IMAGE_FALLBACK}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                          loading="lazy"
                          onError={handleProductImageError}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate max-w-[180px]">{product.name}</p>
                          <p className="text-gray-400 text-xs">{product.category?.name} · {product.brand?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-blue-700">{formatCurrency(product.discountPrice || product.price)}</p>
                      {product.discountPrice > 0 && <p className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : product.stock < 10 ? 'text-orange-500' : 'text-green-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-yellow-500">
                        <FiStar className="fill-current text-xs" /> {product.rating?.toFixed(1)}
                        <span className="text-gray-400 text-xs">({product.numReviews})</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleFeatured(product)}
                        className={`w-10 h-5 rounded-full transition-colors ${product.isFeatured ? 'bg-blue-600' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${product.isFeatured ? 'translate-x-5' : ''}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/products/edit/${product._id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <FiEdit2 />
                        </Link>
                        <button onClick={() => handleDelete(product._id)} disabled={deleting === product._id}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          {deleting === product._id ? <span className="text-xs">...</span> : <FiTrash2 />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
            <span className="text-gray-500">Page {page} of {pagination.pages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.pages} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
