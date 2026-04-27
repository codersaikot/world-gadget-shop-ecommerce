import { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const emptyForm = { name: '', description: '', logo: '' };

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const res = await api.get('/brands');
    setBrands(res.data.data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModal(true); };
  const openEdit = (b) => { setForm({ name: b.name, description: b.description || '', logo: b.logo || '' }); setEditId(b._id); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) { await api.put(`/brands/${editId}`, form); toast.success('Brand updated!'); }
      else { await api.post('/brands', form); toast.success('Brand created!'); }
      setModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this brand?')) return;
    await api.delete(`/brands/${id}`); toast.success('Deleted'); fetch();
  };

  if (loading) return <Spinner center />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Brands ({brands.length})</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FiPlus /> Add Brand</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map(b => (
          <div key={b._id} className="card p-4 flex items-center gap-3">
            {b.logo ? <img src={b.logo} alt="" className="w-10 h-10 object-contain" /> : <div className="w-10 h-10 bg-gray-100 rounded-lg" />}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800">{b.name}</p>
              <p className="text-xs text-gray-500 truncate">{b.description}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => openEdit(b)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 /></button>
              <button onClick={() => handleDelete(b._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 /></button>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Brand' : 'Add Brand'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input required className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><input className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Logo URL</label><input className="input-field" value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })} /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
