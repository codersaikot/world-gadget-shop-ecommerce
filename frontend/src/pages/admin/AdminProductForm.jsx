import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import ImageUpload from '../../components/common/ImageUpload';
import { FiPlus, FiTrash2, FiArrowLeft } from 'react-icons/fi';

const defaultForm = {
  name: '', description: '', shortDescription: '',
  price: '', discountPrice: '', stock: '',
  category: '', brand: '',
  imageFile: null, // For file upload
  specifications: [{ key: '', value: '' }],
  tags: '',
  isFeatured: false, isActive: true,
};

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(defaultForm);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data));
    api.get('/brands').then(r => setBrands(r.data.data));
    if (isEdit) {
      api.get(`/products/${id}`).then(r => {
        const p = r.data.data;
        setForm({
          ...p,
          category: p.category?._id || '',
          brand: p.brand?._id || '',
          tags: p.tags?.join(', ') || '',
          imageFile: null, // Reset file input
          specifications: p.specifications?.length ? p.specifications : [{ key: '', value: '' }],
        });
        setFetchLoading(false);
      });
    }
  }, [id]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleImageSelect = (file) => {
    set('imageFile', file);
  };

  const setSpec = (i, field, val) => {
    const specs = [...form.specifications];
    specs[i] = { ...specs[i], [field]: val };
    set('specifications', specs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();

      // Add basic fields
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('shortDescription', form.shortDescription || '');
      formData.append('price', form.price);
      formData.append('discountPrice', form.discountPrice || '0');
      formData.append('stock', form.stock);
      formData.append('category', form.category);
      formData.append('brand', form.brand || '');
      formData.append('tags', form.tags);
      formData.append('isFeatured', form.isFeatured.toString());
      formData.append('isActive', form.isActive.toString());

      // Add specifications as JSON string
      formData.append('specifications', JSON.stringify(
        form.specifications.filter(s => s.key && s.value)
      ));

      // Add image file if selected
      if (form.imageFile) {
        formData.append('image', form.imageFile);
        console.log('Image file appended to FormData:', form.imageFile.name, form.imageFile.size, 'bytes');
      }

      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(key, ': File -', value.name, value.size, 'bytes');
        } else {
          console.log(key, ':', value);
        }
      }

      const config = {
        // Let axios set Content-Type automatically for FormData
      };

      console.log('Sending request to:', isEdit ? `/products/${id}` : '/products');

      if (isEdit) {
        await api.put(`/products/${id}`, formData, config);
        toast.success('Product updated!');
      } else {
        await api.post('/products', formData, config);
        toast.success('Product created!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally { setLoading(false); }
  };

  if (fetchLoading) return <Spinner center />;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/products')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <FiArrowLeft />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input required className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Samsung Galaxy S24 Ultra" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <input className="input-field" value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} placeholder="One-line summary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Description *</label>
            <textarea required rows={4} className="input-field resize-none" value={form.description}
              onChange={e => set('description', e.target.value)} placeholder="Detailed product description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select required className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select className="input-field" value={form.brand} onChange={e => set('brand', e.target.value)}>
                <option value="">Select brand</option>
                {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Pricing & Stock</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (৳) *</label>
              <input required type="number" min="0" className="input-field" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (৳)</label>
              <input type="number" min="0" className="input-field" value={form.discountPrice} onChange={e => set('discountPrice', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
              <input required type="number" min="0" className="input-field" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="0" />
            </div>
          </div>
        </div>

        {/* Product Image */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Product Image</h2>
          <ImageUpload
            onImageSelect={handleImageSelect}
            currentImage={isEdit && form.images?.[0]?.url ? form.images[0].url : null}
            label="Product Image"
            required={!isEdit} // Required only for new products
          />
        </div>

        {/* Specifications */}
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Specifications</h2>
          {form.specifications.map((spec, i) => (
            <div key={i} className="grid grid-cols-5 gap-2 items-center">
              <input className="input-field col-span-2" placeholder="Key (e.g. RAM)" value={spec.key}
                onChange={e => setSpec(i, 'key', e.target.value)} />
              <input className="input-field col-span-2" placeholder="Value (e.g. 8GB)" value={spec.value}
                onChange={e => setSpec(i, 'value', e.target.value)} />
              {form.specifications.length > 1 && (
                <button type="button" onClick={() => set('specifications', form.specifications.filter((_, j) => j !== i))}
                  className="text-red-400 hover:text-red-600 p-1 justify-self-center"><FiTrash2 /></button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => set('specifications', [...form.specifications, { key: '', value: '' }])}
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
            <FiPlus /> Add Specification
          </button>
        </div>

        {/* Tags & Options */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Tags & Options</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input className="input-field" placeholder="flagship, 5g, android" value={form.tags} onChange={e => set('tags', e.target.value)} />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-blue-600" checked={form.isFeatured}
                onChange={e => set('isFeatured', e.target.checked)} />
              <span className="text-sm font-medium">Featured Product</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-blue-600" checked={form.isActive}
                onChange={e => set('isActive', e.target.checked)} />
              <span className="text-sm font-medium">Active (Visible)</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pb-4">
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <><Spinner size="sm" /> Saving...</> : `${isEdit ? 'Update' : 'Create'} Product`}
          </button>
        </div>
      </form>
    </div>
  );
}
